"use client";

import { useState, useEffect, useMemo } from "react";
import { AlertCircle } from "lucide-react";
import { CateringOrderStatus } from "@/types/catering.types";
import { restaurantApi } from "@/services/api/restaurant.api";
import { CateringOrderCard } from "./CateringOrderCard";
import { CateringOrderResponse } from "@/types/api";
import { flattenOrdersToDisplayItems } from "./utils/flatten-orders.utils";
import { FlattenedOrderItem } from "./types/order-card.dto";

interface CateringOrdersListProps {
  orders: CateringOrderResponse[];
  restaurantId: string;
  restaurantUserId: string;
  token: string;
  onRefresh: () => void;
  hasMultipleBranches: boolean;
  selectedAccountId: string | null;
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
    selectedAccountId === null ? "unassigned" : "admin_reviewed" // Start with unassigned if viewing all branches
  );
  const [selectedAccounts, setSelectedAccounts] = useState<
    Record<string, string>
  >({});
  const [availableAccounts, setAvailableAccounts] = useState<
    Record<string, any>
  >({});
  const [loadingAccounts, setLoadingAccounts] = useState(true);
  
  // Flatten orders into display items (handles meal sessions)
  const flattenedItems = useMemo(() =>
    flattenOrdersToDisplayItems(orders, restaurantId),
    [orders, restaurantId]
  );

  // Process flattened items to adjust status based on restaurant reviews
  const processedItems = useMemo(() =>
    flattenedItems.map(item => {
      // Check if this restaurant has reviewed the item
      if (
        item.restaurantReviews?.includes(restaurantId) &&
        item.status === "admin_reviewed"
      ) {
        return { ...item, status: CateringOrderStatus.RESTAURANT_REVIEWED };
      }
      return item;
    }),
    [flattenedItems, restaurantId]
  );

  useEffect(() => {
    const fetchAccounts = async () => {
      setLoadingAccounts(true);
      const accounts = await restaurantApi.getPaymentAccounts(restaurantUserId);
      setAvailableAccounts(accounts || {});

      if (accounts && Object.keys(accounts).length > 0) {
        const defaultAccountId = Object.keys(accounts)[0];
        const defaultSelections: Record<string, string> = {};
        // Use parentOrderId for account selection (per-order, not per-session)
        processedItems.forEach((item) => {
          defaultSelections[item.parentOrderId] = defaultAccountId;
        });
        setSelectedAccounts(defaultSelections);
      }

      setLoadingAccounts(false);
    };

    fetchAccounts();
  }, [restaurantUserId, processedItems.length]);

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

  const handleReview = async (displayId: string, accepted: boolean, isMealSession: boolean) => {
    setReviewing(displayId);
    setError("");

    try {
      // Find the item to get the parent order ID for account selection
      const item = processedItems.find(i => i.displayId === displayId);
      const accountId = item ? selectedAccounts[item.parentOrderId] : undefined;

      if (isMealSession) {
        // Review meal session
        await restaurantApi.reviewMealSession(
          displayId,
          restaurantId,
          accepted,
          token,
          accountId
        );
      } else {
        // Review order (legacy flow)
        await restaurantApi.reviewCateringOrder(
          displayId,
          restaurantId,
          accepted,
          token,
          accountId
        );
      }
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

  const itemsByStatus = processedItems.reduce((acc, item) => {
    const status = item.status;
    if (!acc[status]) acc[status] = [];
    acc[status].push(item);
    return acc;
  }, {} as Record<string, FlattenedOrderItem[]>);

  const unassignedItems = processedItems.filter(
    (item) => item.isUnassigned === true
  );
  const showOnlyPendingReview =
    hasMultipleBranches && selectedAccountId === null;
  const hidePendingReview = hasMultipleBranches && selectedAccountId !== null;

  const allStatusTabs = [
    ...(selectedAccountId === null
      ? [
          {
            key: "unassigned",
            label: "⚠️ Unassigned",
            count: unassignedItems.length,
          },
        ]
      : []),
    {
      key: "admin_reviewed",
      label: "Pending Review",
      count: itemsByStatus["admin_reviewed"]?.length || 0,
    },
    {
      key: "restaurant_reviewed",
      label: "Awaiting Payment",
      count:
        (itemsByStatus["restaurant_reviewed"]?.length || 0) +
        (itemsByStatus["payment_link_sent"]?.length || 0),
    },
    {
      key: "confirmed",
      label: "Confirmed",
      count:
        (itemsByStatus["paid"]?.length || 0) +
        (itemsByStatus["confirmed"]?.length || 0),
    },
    {
      key: "completed",
      label: "Completed",
      count: itemsByStatus["completed"]?.length || 0,
    },
  ];

  const statusTabs = showOnlyPendingReview
    ? allStatusTabs.filter(
        (tab) => tab.key === "admin_reviewed" || tab.key === "unassigned"
      )
    : hidePendingReview
    ? allStatusTabs.filter((tab) => tab.key !== "admin_reviewed")
    : allStatusTabs;

  const getActiveItems = (): FlattenedOrderItem[] => {
    if (activeStatusTab === "unassigned") {
      return unassignedItems;
    }
    if (activeStatusTab === "confirmed") {
      return [
        ...(itemsByStatus["paid"] || []),
        ...(itemsByStatus["confirmed"] || []),
      ];
    }
    if (activeStatusTab === "restaurant_reviewed") {
      return [
        ...(itemsByStatus["restaurant_reviewed"] || []),
        ...(itemsByStatus["payment_link_sent"] || []),
      ];
    }
    return itemsByStatus[activeStatusTab] || [];
  };

  const activeItems = getActiveItems();

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
      {activeItems.length === 0 ? (
        <div className="text-center py-12 text-gray-500">
          <p className="text-lg">No orders in this category</p>
        </div>
      ) : (
        <div className="space-y-4">
          {activeItems.map((item) => (
            <CateringOrderCard
              key={item.displayId}
              item={item}
              restaurantId={restaurantId}
              onReview={handleReview}
              reviewing={reviewing}
              onClaim={handleClaim}
              claiming={claiming}
              availableAccounts={availableAccounts}
              selectedAccounts={selectedAccounts}
              onAccountSelect={(parentOrderId, accountId) =>
                setSelectedAccounts((prev) => ({
                  ...prev,
                  [parentOrderId]: accountId,
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
