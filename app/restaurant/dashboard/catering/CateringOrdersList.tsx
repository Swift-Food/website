"use client";

import { useState, useEffect, useMemo } from "react";
import { AlertCircle } from "lucide-react";
import { CateringOrderStatus } from "@/types/catering.types";
import { restaurantApi } from "@/services/api/restaurant.api";
import { CateringOrderCard } from "./CateringOrderCard";
import { CateringOrderResponse } from "@/types/api";

interface CateringOrdersListProps {
  orders: CateringOrderResponse[];
  restaurantId: string;
  restaurantUserId: string;
  token: string;
  onRefresh: () => void;
  hasMultipleBranches: boolean;
  selectedAccountId: string | null;
}

/**
 * Filter orders to only include restaurants that match the given restaurantId
 */
function filterOrdersForRestaurant(
  orders: CateringOrderResponse[],
  restaurantId: string
): CateringOrderResponse[] {
  return orders.filter((order) => {
    // Check if this restaurant has items in the order
    const restaurants = order.restaurants || order.orderItems || [];
    return restaurants.some((item: any) => item.restaurantId === restaurantId);
  });
}

/**
 * Determine the effective status for an order from this restaurant's perspective
 */
function getOrderStatusForRestaurant(
  order: CateringOrderResponse,
  restaurantId: string
): string {
  // If this restaurant has reviewed the order, update status
  if (
    order.restaurantReviews?.includes(restaurantId) &&
    order.status === "admin_reviewed"
  ) {
    return CateringOrderStatus.RESTAURANT_REVIEWED;
  }
  return order.status;
}

export const CateringOrdersList = ({
  orders,
  restaurantId,
  restaurantUserId,
  token,
  onRefresh,
  hasMultipleBranches,
  selectedAccountId,
}: CateringOrdersListProps) => {
  const [reviewing, setReviewing] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [claiming, setClaiming] = useState<string | null>(null);
  const [activeStatusTab, setActiveStatusTab] = useState<string>(
    selectedAccountId === null ? "unassigned" : "admin_reviewed"
  );
  const [selectedAccounts, setSelectedAccounts] = useState<
    Record<string, string>
  >({});
  const [availableAccounts, setAvailableAccounts] = useState<
    Record<string, any>
  >({});
  const [loadingAccounts, setLoadingAccounts] = useState(true);

  // Filter orders to only those with items for this restaurant
  const filteredOrders = useMemo(
    () => filterOrdersForRestaurant(orders, restaurantId),
    [orders, restaurantId]
  );

  // Process orders to adjust status based on restaurant reviews
  const processedOrders = useMemo(
    () =>
      filteredOrders.map((order) => ({
        ...order,
        effectiveStatus: getOrderStatusForRestaurant(order, restaurantId),
      })),
    [filteredOrders, restaurantId]
  );

  useEffect(() => {
    const fetchAccounts = async () => {
      setLoadingAccounts(true);
      const accounts = await restaurantApi.getPaymentAccounts(restaurantUserId);
      setAvailableAccounts(accounts || {});

      if (accounts && Object.keys(accounts).length > 0) {
        const defaultAccountId = Object.keys(accounts)[0];
        const defaultSelections: Record<string, string> = {};
        // Set default account for each order
        processedOrders.forEach((order) => {
          defaultSelections[order.id] = defaultAccountId;
        });
        setSelectedAccounts(defaultSelections);
      }

      setLoadingAccounts(false);
    };

    fetchAccounts();
  }, [restaurantUserId, processedOrders.length]);

  useEffect(() => {
    if (
      hasMultipleBranches &&
      selectedAccountId !== null &&
      activeStatusTab === "admin_reviewed"
    ) {
      setActiveStatusTab("restaurant_reviewed");
    }
  }, [hasMultipleBranches, selectedAccountId, activeStatusTab]);

  useEffect(() => {
    if (selectedAccountId === null && activeStatusTab !== "unassigned") {
      setActiveStatusTab("unassigned");
    }
  }, [selectedAccountId]);

  // Review entire catering order (not individual meal sessions)
  const handleReview = async (orderId: string, accepted: boolean) => {
    setReviewing(orderId);
    setError("");

    try {
      const accountId = selectedAccounts[orderId];

      // Always use reviewCateringOrder for whole order review
      await restaurantApi.reviewCateringOrder(
        orderId,
        restaurantId,
        accepted,
        token,
        accountId
      );
      await onRefresh();
    } catch (err: any) {
      setError(err.message || "Failed to review order");
    } finally {
      setReviewing(null);
    }
  };

  const handleClaim = async (orderId: string) => {
    setClaiming(orderId);
    setError("");

    try {
      const selectedAccountId = selectedAccounts[orderId];

      if (!selectedAccountId) {
        throw new Error("Please select an account first");
      }

      await restaurantApi.claimCateringOrder(
        orderId,
        restaurantId,
        selectedAccountId
      );

      await onRefresh();
    } catch (err: any) {
      console.error("Claim error:", err); // Add logging
      setError(err.message || "Failed to claim order");
    } finally {
      setClaiming(null);
    }
  };

  // Group orders by their effective status
  type ProcessedOrder = CateringOrderResponse & { effectiveStatus: string };
  const ordersByStatus = processedOrders.reduce((acc, order) => {
    const status = order.effectiveStatus;
    if (!acc[status]) acc[status] = [];
    acc[status].push(order);
    return acc;
  }, {} as Record<string, ProcessedOrder[]>);

  const unassignedOrders = processedOrders.filter(
    (order) => order.isUnassigned === true
  );
  const showOnlyPendingReview =
    hasMultipleBranches && selectedAccountId === null;
  const hidePendingReview = hasMultipleBranches && selectedAccountId !== null;

  const allStatusTabs = [
    ...(selectedAccountId === null
      ? [
          {
            key: "unassigned",
            label: "Unassigned",
            count: unassignedOrders.length,
          },
        ]
      : []),
    {
      key: "admin_reviewed",
      label: "Pending Review",
      count: ordersByStatus["admin_reviewed"]?.length || 0,
    },
    {
      key: "restaurant_reviewed",
      label: "Awaiting Payment",
      count:
        (ordersByStatus["restaurant_reviewed"]?.length || 0) +
        (ordersByStatus["payment_link_sent"]?.length || 0),
    },
    {
      key: "confirmed",
      label: "Confirmed",
      count:
        (ordersByStatus["paid"]?.length || 0) +
        (ordersByStatus["confirmed"]?.length || 0),
    },
    {
      key: "completed",
      label: "Completed",
      count: ordersByStatus["completed"]?.length || 0,
    },
  ];

  const statusTabs = showOnlyPendingReview
    ? allStatusTabs.filter(
        (tab) => tab.key === "admin_reviewed" || tab.key === "unassigned"
      )
    : hidePendingReview
    ? allStatusTabs.filter((tab) => tab.key !== "admin_reviewed")
    : allStatusTabs;

  const getActiveOrders = (): ProcessedOrder[] => {
    if (activeStatusTab === "unassigned") {
      return unassignedOrders;
    }
    if (activeStatusTab === "confirmed") {
      return [
        ...(ordersByStatus["paid"] || []),
        ...(ordersByStatus["confirmed"] || []),
      ];
    }
    if (activeStatusTab === "restaurant_reviewed") {
      return [
        ...(ordersByStatus["restaurant_reviewed"] || []),
        ...(ordersByStatus["payment_link_sent"] || []),
      ];
    }
    return ordersByStatus[activeStatusTab] || [];
  };

  const activeOrders = getActiveOrders();

  if (orders.length === 0) {
    return (
      <div className="text-center py-12 text-gray-500">
        <p className="text-lg">No Event orders yet</p>
        <p className="text-sm mt-2">
          Your confirmed Event orders will appear here
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg flex items-start text-red-700">
          <AlertCircle size={18} className="mr-2 flex-shrink-0 mt-0.5" />
          <span className="text-sm">{error}</span>
        </div>
      )}

      {/* Tabs */}
      <div className="border-b border-gray-200 overflow-x-auto">
        <nav className="flex space-x-4 sm:space-x-8 min-w-max px-4 sm:px-0">
          {statusTabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveStatusTab(tab.key)}
              className={`py-3 sm:py-4 px-1 border-b-2 font-medium text-xs sm:text-sm transition-colors whitespace-nowrap ${
                activeStatusTab === tab.key
                  ? "border-blue-600 text-blue-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              {tab.label}
              {tab.count > 0 && (
                <span
                  className={`ml-1 sm:ml-2 py-0.5 px-1.5 sm:px-2 rounded-full text-xs ${
                    activeStatusTab === tab.key
                      ? "bg-blue-100 text-blue-600"
                      : "bg-gray-100 text-gray-600"
                  }`}
                >
                  {tab.count}
                </span>
              )}
            </button>
          ))}
        </nav>
      </div>

      {/* Orders */}
      {activeOrders.length === 0 ? (
        <div className="text-center py-12 text-gray-500">
          <p className="text-lg">No orders in this category</p>
        </div>
      ) : (
        <div className="space-y-4">
          {activeOrders.map((order) => (
            <CateringOrderCard
              key={order.id}
              order={order}
              restaurantId={restaurantId}
              onReview={handleReview}
              reviewing={reviewing}
              onClaim={handleClaim}
              claiming={claiming}
              availableAccounts={availableAccounts}
              selectedAccounts={selectedAccounts}
              onAccountSelect={(orderId, accountId) =>
                setSelectedAccounts((prev) => ({
                  ...prev,
                  [orderId]: accountId,
                }))
              }
              loadingAccounts={loadingAccounts}
              token={token}
            />
          ))}
        </div>
      )}
    </div>
  );
};
