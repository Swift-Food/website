"use client";

import { useState, useEffect } from "react";
import { AlertCircle } from "lucide-react";
import { CateringOrder } from "@/app/types/catering.types";
import { restaurantApi } from "@/app/api/restaurantApi";
import { CateringOrderCard } from "./CateringOrderCard";

interface CateringOrdersListProps {
  orders: CateringOrder[];
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

  useEffect(() => {
    const fetchAccounts = async () => {
      setLoadingAccounts(true);
      const accounts = await restaurantApi.getPaymentAccounts(restaurantUserId);
      setAvailableAccounts(accounts || {});

      if (accounts && Object.keys(accounts).length > 0) {
        const defaultAccountId = Object.keys(accounts)[0];
        const defaultSelections: Record<string, string> = {};
        orders.forEach((order) => {
          defaultSelections[order.id] = defaultAccountId;
        });
        setSelectedAccounts(defaultSelections);
      }

      setLoadingAccounts(false);
    };

    fetchAccounts();
  }, [restaurantUserId, orders.length]);

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

  const handleReview = async (orderId: string, accepted: boolean) => {
    setReviewing(orderId);
    setError("");

    try {
      const selectedAccountId = selectedAccounts[orderId];
      await restaurantApi.reviewCateringOrder(
        orderId,
        restaurantId,
        accepted,
        token,
        selectedAccountId
      );
      await onRefresh();
    } catch (err: any) {
      setError(err.message || "Failed to review order");
    } finally {
      setReviewing(null);
    }
  };

  const handleClaim = async (orderId: string) => {
    console.log('Claiming order:', orderId, 'with account:', selectedAccounts[orderId]); // Add logging
    
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
        selectedAccountId,
      
      );
      
      console.log('Order claimed successfully'); // Add logging
      await onRefresh();
    } catch (err: any) {
      console.error('Claim error:', err); // Add logging
      setError(err.message || "Failed to claim order");
    } finally {
      setClaiming(null);
    }
  };

  const ordersByStatus = orders.reduce((acc, order) => {
    const status = order.status;
    if (!acc[status]) acc[status] = [];
    acc[status].push(order);
    return acc;
  }, {} as Record<string, CateringOrder[]>);

  const unassignedOrders = orders.filter(order => order.isUnassigned === true);
  const showOnlyPendingReview =
    hasMultipleBranches && selectedAccountId === null;
  const hidePendingReview = hasMultipleBranches && selectedAccountId !== null;

  const allStatusTabs = [
    ...(selectedAccountId === null ? [{
      key: "unassigned",
      label: "⚠️ Unassigned",
      count: unassignedOrders.length,
    }] : []),
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
      count: [
        ...new Set([
          ...(ordersByStatus["paid"] || []),
          ...(ordersByStatus["confirmed"] || []),
        ]),
      ].length,
    },
    {
      key: "completed",
      label: "Completed",
      count: ordersByStatus["completed"]?.length || 0,
    },
  ];

  const statusTabs = showOnlyPendingReview
    ? allStatusTabs.filter((tab) => tab.key === "admin_reviewed" || tab.key === "unassigned")
    : hidePendingReview
    ? allStatusTabs.filter((tab) => tab.key !== "admin_reviewed")
    : allStatusTabs;

  const getActiveOrders = () => {
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
