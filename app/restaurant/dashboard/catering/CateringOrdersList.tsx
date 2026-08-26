"use client";

import { useState, useEffect, useMemo } from "react";
import { AlertCircle, List, CalendarDays } from "lucide-react";
import { CateringOrderStatus } from "@/types/catering.types";
import { restaurantApi } from "@/services/api/restaurant.api";
import { CateringOrderCard } from "./CateringOrderCard";
import { CateringOrderResponse } from "@/types/api";
import { PickupAddress } from "@/types/restaurant.types";
import {
  CateringOrdersCalendar,
  bucketForStatus,
  toDateKey,
} from "./CateringOrdersCalendar";
import { CateringOrderSummaryCard } from "./CateringOrderSummaryCard";
import { CateringOrderDetailModal } from "./CateringOrderDetailModal";

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
  const [pickupAddresses, setPickupAddresses] = useState<PickupAddress[]>([]);
  const [selectedPickupAddressIndex, setSelectedPickupAddressIndex] = useState<
    Record<string, number>
  >({});
  const [displayView, setDisplayView] = useState<"list" | "calendar">("list");
  const [selectedDate, setSelectedDate] = useState<string | null>(() =>
    toDateKey(new Date())
  );
  const [detailOrderId, setDetailOrderId] = useState<string | null>(null);

  // Backend already filters orders for this restaurant, so we use them directly
  // Process orders to adjust status based on restaurant reviews
  const processedOrders = useMemo(
    () =>
      orders.map((order) => ({
        ...order,
        effectiveStatus: getOrderStatusForRestaurant(order, restaurantId),
      })),
    [orders, restaurantId]
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
    const fetchPickupAddresses = async () => {
      try {
        const details = await restaurantApi.getRestaurantDetails(restaurantId);
        setPickupAddresses(details.pickupAddresses || []);
      } catch (err) {
        console.warn("Failed to load pickup addresses:", err);
      }
    };

    fetchPickupAddresses();
  }, [restaurantId]);

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
      const pickupIdx = selectedPickupAddressIndex[orderId] ?? (pickupAddresses.length > 0 ? 0 : undefined);

      // Always use reviewCateringOrder for whole order review
      await restaurantApi.reviewCateringOrder(
        orderId,
        restaurantId,
        accepted,
        token,
        accountId,
        pickupIdx
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
    {
      key: "cancelled",
      label: "Cancelled",
      count: ordersByStatus["cancelled"]?.length || 0,
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

  // Calendar shows every order regardless of the status tab, minus cancelled.
  const calendarOrders = useMemo(
    () =>
      processedOrders.filter(
        (order) => bucketForStatus(order.effectiveStatus) !== null
      ),
    [processedOrders]
  );

  // The calendar only needs the date and the restaurant-effective status.
  const calendarEntries = useMemo(
    () =>
      calendarOrders.map((order) => ({
        eventDate: order.eventDate,
        status: order.effectiveStatus,
      })),
    [calendarOrders]
  );

  const selectedDateOrders = useMemo(
    () =>
      selectedDate
        ? calendarOrders.filter(
            (order) => toDateKey(new Date(order.eventDate)) === selectedDate
          )
        : [],
    [calendarOrders, selectedDate]
  );

  const detailOrder = detailOrderId
    ? processedOrders.find((order) => order.id === detailOrderId) ?? null
    : null;

  const calendarDateLabel = selectedDate
    ? new Date(`${selectedDate}T00:00:00`).toLocaleDateString("en-GB", {
        weekday: "long",
        day: "numeric",
        month: "long",
        year: "numeric",
      })
    : null;

  const renderOrderCard = (order: ProcessedOrder) => (
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
      pickupAddresses={pickupAddresses}
      selectedPickupAddressIndex={selectedPickupAddressIndex[order.id] ?? 0}
      onPickupAddressSelect={(orderId, index) =>
        setSelectedPickupAddressIndex((prev) => ({
          ...prev,
          [orderId]: index,
        }))
      }
    />
  );

  if (orders.length === 0) {
    return (
      <div className="space-y-6">
        <h2 className="text-xl font-bold text-gray-900">Event Orders</h2>
        <div className="text-center py-12 text-gray-500">
          <p className="text-lg">No Event orders yet</p>
          <p className="text-sm mt-2">
            Your confirmed Event orders will appear here
          </p>
        </div>
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

      {/* Heading + display view toggle */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-xl font-bold text-gray-900">Event Orders</h2>
        <div className="inline-flex rounded-xl bg-gray-100 p-1">
          {(
          [
              { key: "list", label: "List", Icon: List },
              { key: "calendar", label: "Calendar", Icon: CalendarDays },
            ] as const
          ).map(({ key, label, Icon }) => (
            <button
              key={key}
              onClick={() => setDisplayView(key)}
              className={`flex items-center gap-1.5 rounded-lg px-4 py-1.5 text-sm font-medium transition-colors ${
                displayView === key
                  ? "bg-white text-blue-600 shadow-sm"
                  : "text-gray-500 hover:text-gray-900"
              }`}
            >
              <Icon size={15} />
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Tabs — list view only */}
      <div
        className={`border-b border-gray-200 overflow-x-auto ${
          displayView === "list" ? "" : "hidden"
        }`}
      >
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
      {displayView === "calendar" ? (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-5">
          <div className="lg:col-span-2 lg:sticky lg:top-6 lg:self-start">
            <CateringOrdersCalendar
              orders={calendarEntries}
              selectedDate={selectedDate}
              onSelectDate={setSelectedDate}
            />
          </div>

          <div className="lg:col-span-3">
            {!selectedDate ? (
              <div className="text-center py-12 text-gray-500">
                <p className="text-lg">Select a date</p>
                <p className="text-sm mt-2">
                  Click a date on the calendar to see its orders
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                <div>
                  <h3 className="text-base font-bold text-gray-900">
                    {calendarDateLabel}
                  </h3>
                  <p className="text-sm text-gray-500 mt-0.5">
                    {selectedDateOrders.length} order
                    {selectedDateOrders.length !== 1 ? "s" : ""}
                  </p>
                </div>

                {selectedDateOrders.length === 0 ? (
                  <div className="text-center py-12 text-gray-500">
                    <p className="text-lg">No orders on this date</p>
                  </div>
                ) : (
                  selectedDateOrders.map((order) => (
                    <CateringOrderSummaryCard
                      key={order.id}
                      order={order}
                      restaurantId={restaurantId}
                      onOpenDetails={setDetailOrderId}
                    />
                  ))
                )}
              </div>
            )}
          </div>
        </div>
      ) : activeOrders.length === 0 ? (
        <div className="text-center py-12 text-gray-500">
          <p className="text-lg">No orders in this category</p>
        </div>
      ) : (
        <div className="space-y-4">{activeOrders.map(renderOrderCard)}</div>
      )}

      {detailOrder && (
        <CateringOrderDetailModal
          title={`Order ${detailOrder.id.slice(0, 4).toUpperCase()}`}
          onClose={() => setDetailOrderId(null)}
        >
          {renderOrderCard(detailOrder)}
        </CateringOrderDetailModal>
      )}
    </div>
  );
};
