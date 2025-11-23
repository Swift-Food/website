// components/restaurant-dashboard/RestaurantDashboard.tsx
"use client";

import { useState, useEffect } from "react";
import { LogOut, Loader } from "lucide-react";
import { useRouter } from "next/navigation";
import { restaurantApi } from "@/services/api/restaurant.api";
import { cateringService } from "@/services/api/catering.api";
import {
  BalanceInfo,
  WithdrawalRequest,
  StripeOnboardingStatus,
  // PaymentAccounts,
} from "@/types/restaurant.types";
import { CateringOrderDetails } from "@/types/catering.types";
import { PaymentAccountSelector } from "./shared/PaymentAccountSelector";
import { StripeOnboardingRequired } from "./shared/StripeOnboardingRequired";
import { BalanceCards } from "./withdrawals/BalanceCards";
import { WithdrawalForm } from "./withdrawals/WithdrawalForm";
import { WithdrawalHistory } from "./withdrawals/WithdrawalHistory";
import { CateringOrdersList } from "./catering/CateringOrdersList";
import { RefundRequest } from "@/types/refund.types";
import { refundService } from "@/services/api/refund.api";
import { RefundRequestsList } from "./refunds/refundRequestList";

interface RestaurantDashboardProps {
  userId: string;
  restaurantUserId: string;
  restaurantId: string;
  restaurant: any;
  restaurantUser: any;
  token: string;
  onLogout: () => void;
}

export const RestaurantDashboard = ({
  userId,
  restaurantUserId,
  restaurantId,
  restaurant,
  restaurantUser,
  token,
  onLogout,
}: RestaurantDashboardProps) => {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [loadingSettings, setLoadingSettings] = useState(false);
  const [stripeStatus, setStripeStatus] =
    useState<StripeOnboardingStatus | null>(null);
  const [balance, setBalance] = useState<BalanceInfo | null>(null);
  const [history, setHistory] = useState<WithdrawalRequest[]>([]);
  const [cateringOrders, setCateringOrders] = useState<CateringOrderDetails[]>(
    []
  );
  const [activeTab, setActiveTab] = useState<
    "withdrawals" | "catering" | "refunds"
  >("withdrawals");
  const [selectedAccountId, setSelectedAccountId] = useState<string | null>(
    null
  );
  const [refunds, setRefunds] = useState<RefundRequest[]>([]);

  // Auto-select account if there's only one OR set to 'legacy' for old single-account restaurants
  useEffect(() => {
    if (restaurantUser?.paymentAccounts) {
      const accounts = Object.keys(restaurantUser.paymentAccounts);
      if (accounts.length === 1 && selectedAccountId === null) {
        setSelectedAccountId(accounts[0]);
      }
    } else if (restaurantUser && selectedAccountId === null) {
      // Legacy restaurant with single stripeAccountId (no paymentAccounts map)
      setSelectedAccountId("legacy");
    }
  }, [restaurantUser, selectedAccountId]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const results = await Promise.allSettled([
        restaurantApi.checkStripeStatus(restaurantUserId, selectedAccountId),
        restaurantApi.getBalance(restaurantUserId, token, selectedAccountId),
        restaurantApi.getWithdrawalHistory(
          restaurantUserId,
          token,
          selectedAccountId
        ),
        restaurantApi.getCateringOrders(restaurantId, selectedAccountId),
        refundService.getRestaurantRefundRequests(restaurantId),
      ]);

      // Extract successful results
      const [
        statusResult,
        balanceResult,
        historyResult,
        cateringResult,
        refundsResult,
      ] = results;

      console.log(
        "status data is",
        statusResult.status === "fulfilled" ? statusResult.value : null
      );

      if (statusResult.status === "fulfilled" && statusResult.value) {
        setStripeStatus(statusResult.value);
      }

      if (balanceResult.status === "fulfilled" && balanceResult.value) {
        setBalance(balanceResult.value);
      }

      if (historyResult.status === "fulfilled") {
        setHistory(historyResult.value || []);
      }

      if (cateringResult.status === "fulfilled") {
        setCateringOrders(
          (cateringResult.value || []) as unknown as CateringOrderDetails[]
        );
      }

      if (refundsResult.status === "fulfilled") {
        setRefunds(refundsResult.value || []);
      }

      // Optional: Log any failures
      results.forEach((result, index) => {
        if (result.status === "rejected") {
          const apiNames = [
            "checkStripeStatus",
            "getBalance",
            "getWithdrawalHistory",
            "getCateringOrders",
            "getRefundRequests",
          ];
          console.error(`${apiNames[index]} failed:`, result.reason);
        }
      });
    } catch (err: any) {
      console.error("Unexpected error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [userId, token, selectedAccountId]);

  // RestaurantDashboard.tsx - Add handleProcessRefund

  // RestaurantDashboard.tsx - Fix handleProcessRefund

  const handleProcessRefund = async (
    refundId: string,
    data: {
      status: "approved" | "rejected";
      approvedAmount?: number;
      restaurantResponse?: string;
    }
  ) => {
    try {
      await refundService.processRefund(refundId, restaurantUserId, data);

      // Show success message
      if (data.status === "approved") {
        alert("Refund approved successfully");
      } else {
        alert("Refund rejected successfully");
      }

      // Refresh data
      await fetchData();
    } catch (error: any) {
      console.error("Failed to process refund:", error);
      const errorMessage =
        error.response?.data?.message ||
        "Failed to process refund. Please try again.";
      alert(errorMessage);
      throw error;
    }
  };

  const handleNavigateToSettings = async () => {
    setLoadingSettings(true);
    try {
      // Fetch full restaurant details using cateringService
      const fullRestaurantDetails = await cateringService.getRestaurant(
        restaurantId
      );

      // Store full restaurant data in sessionStorage for the settings page to use
      sessionStorage.setItem(
        "restaurantData",
        JSON.stringify(fullRestaurantDetails)
      );

      // Navigate to settings page
      router.push(`/restaurant/settings/${restaurantId}`);
    } catch (error) {
      console.error("Failed to load restaurant details:", error);
      // Navigate anyway - the settings page will fetch the data itself
      router.push(`/restaurant/settings/${restaurantId}`);
    } finally {
      setLoadingSettings(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader
            size={48}
            className="animate-spin text-blue-600 mx-auto mb-4"
          />
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!stripeStatus?.complete) {
    return (
      <div className="min-h-screen bg-gray-50 p-4">
        <div className="max-w-6xl mx-auto py-8">
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900">
              {restaurant.restaurant_name} Dashboard
            </h1>
            <button
              onClick={onLogout}
              className="flex items-center text-gray-600 hover:text-gray-900"
            >
              <LogOut size={20} className="mr-2" />
              Logout
            </button>
          </div>

          {/* Menu Management Button */}
          <div className="mb-8">
            <a
              href={`/restaurant/menu/${restaurantId}`}
              className="block h-full bg-gradient-to-r from-primary to-pink-500 hover:from-primary/90 hover:to-pink-500/90 text-white rounded-lg p-4 transition-all hover:shadow-lg"
            >
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-bold mb-1">Menu Management</h3>
                  <p className="text-sm text-white/90">
                    Edit your menu items, add allergens, and manage categories
                  </p>
                </div>
                <div className="bg-white/20 rounded-full p-3">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-6 w-6"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"
                    />
                  </svg>
                </div>
              </div>
            </a>
          </div>

          <div>
            <a
              href={`/restaurant/promotions/${restaurantId}`}
              className="block h-full bg-purple-600 hover:bg-purple-700 text-white rounded-lg p-4 transition-all hover:shadow-lg"
            >
              <div className="flex items-center justify-between h-full">
                <div>
                  <h3 className="text-lg font-bold mb-1">Promotions</h3>
                  <p className="text-sm text-white/90">
                    Create and manage discounts and special offers
                  </p>
                </div>
                <div className="bg-white/20 rounded-full p-3">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-6 w-6"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"
                    />
                  </svg>
                </div>
              </div>
            </a>
          </div>

          <PaymentAccountSelector
            paymentAccounts={restaurantUser?.paymentAccounts}
            selectedAccountId={selectedAccountId}
            onSelectAccount={setSelectedAccountId}
          />

          <StripeOnboardingRequired
            userId={restaurantUserId}
            token={token}
            onRefresh={fetchData}
            paymentAccounts={restaurantUser?.paymentAccounts}
            selectedAccountId={selectedAccountId}
          />
        </div>
      </div>
    );
  }

  const hasMultipleBranches =
    !!restaurantUser?.paymentAccounts &&
    Object.keys(restaurantUser.paymentAccounts).length > 1;
  const showAllBranches = hasMultipleBranches && selectedAccountId === null;

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-6xl mx-auto py-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            {restaurant.restaurant_name} Dashboard
          </h1>
          <button
            onClick={onLogout}
            className="flex items-center text-gray-600 hover:text-gray-900 font-medium"
          >
            <LogOut size={20} className="mr-2" />
            Logout
          </button>
        </div>
        {/* Menu Management Button */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-3">
          <div>
            <a
              href={`/restaurant/menu/${restaurantId}`}
              className="block h-full bg-gradient-to-r from-primary to-pink-500 hover:from-primary/90 hover:to-pink-500/90 text-white rounded-lg p-4 transition-all hover:shadow-lg"
            >
              <div className="flex items-center justify-between h-full">
                <div>
                  <h3 className="text-lg font-bold mb-1">Menu Management</h3>
                  <p className="text-sm text-white/90">
                    Edit your menu items, add allergens, and manage categories
                  </p>
                </div>
                <div className="bg-white/20 rounded-full p-3">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-6 w-6"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"
                    />
                  </svg>
                </div>
              </div>
            </a>
          </div>

          {/* Restaurant Analytics Button */}
          <div>
            <a
              href={`/restaurant/analytics/${restaurantId}`}
              className="block h-full bg-success hover:bg-success/90 text-white rounded-lg p-4 transition-all hover:shadow-lg"
            >
              <div className="flex items-center justify-between h-full">
                <div>
                  <h3 className="text-lg font-bold mb-1">
                    Restaurant Analytics
                  </h3>
                  <p className="text-sm text-white/90">
                    View your restaurant analytics and insights
                  </p>
                </div>
                <div className="bg-white/20 rounded-full p-3">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-6 w-6"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                    />
                  </svg>
                </div>
              </div>
            </a>
          </div>

          {/* Restaurant Settings Button */}
          <div>
            <button
              onClick={handleNavigateToSettings}
              disabled={loadingSettings}
              className="block h-full w-full bg-warning hover:bg-warning/90 disabled:bg-warning/70 disabled:cursor-not-allowed text-white rounded-lg p-4 transition-all hover:shadow-lg text-left"
            >
              <div className="flex items-center justify-between h-full">
                <div>
                  <h3 className="text-lg font-bold mb-1">
                    Restaurant Settings
                  </h3>
                  <p className="text-sm text-white/90">
                    {loadingSettings
                      ? "Loading..."
                      : "Manage your restaurant profile and settings"}
                  </p>
                </div>
                <div className="bg-white/20 rounded-full p-3">
                  {loadingSettings ? (
                    <Loader className="h-6 w-6 animate-spin" />
                  ) : (
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-6 w-6"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
                      />
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                      />
                    </svg>
                  )}
                </div>
              </div>
            </button>
          </div>
        </div>

        <div>
          <a
            href={`/restaurant/promotions/${restaurantId}`}
            className="block h-full bg-purple-600 hover:bg-purple-700 text-white rounded-lg p-4 mb-4 transition-all hover:shadow-lg"
          >
            <div className="flex items-center justify-between h-full">
              <div>
                <h3 className="text-lg font-bold mb-1">Promotions</h3>
                <p className="text-sm text-white/90">
                  Create and manage discounts and special offers
                </p>
              </div>
              <div className="bg-white/20 rounded-full p-3">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"
                  />
                </svg>
              </div>
            </div>
          </a>
        </div>
        {/* Payment Account Selector */}
        <PaymentAccountSelector
          paymentAccounts={restaurantUser?.paymentAccounts}
          selectedAccountId={selectedAccountId}
          onSelectAccount={setSelectedAccountId}
        />
        {showAllBranches ? (
          <div className="bg-white rounded-lg p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-6">
              Event Orders - Pending Review
            </h2>
            <CateringOrdersList
              orders={cateringOrders}
              restaurantId={restaurantId}
              restaurantUserId={restaurantUserId}
              token={token}
              onRefresh={fetchData}
              hasMultipleBranches={hasMultipleBranches}
              selectedAccountId={selectedAccountId}
            />
          </div>
        ) : (
          <>
            {/* Balance Cards */}
            <BalanceCards balance={balance} />

            {/* Tabs */}
            <div className="mb-8">
              <div className="border-b border-gray-200">
                <nav className="flex space-x-8">
                  <button
                    onClick={() => setActiveTab("withdrawals")}
                    className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                      activeTab === "withdrawals"
                        ? "border-blue-600 text-blue-600"
                        : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                    }`}
                  >
                    Withdrawals
                  </button>
                  <button
                    onClick={() => setActiveTab("catering")}
                    className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                      activeTab === "catering"
                        ? "border-blue-600 text-blue-600"
                        : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                    }`}
                  >
                    Event Orders
                    {cateringOrders.length > 0 && (
                      <span className="ml-2 bg-blue-100 text-blue-600 py-0.5 px-2 rounded-full text-xs">
                        {cateringOrders.length}
                      </span>
                    )}
                  </button>
                  <button
                    onClick={() => setActiveTab("refunds")}
                    className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                      activeTab === "refunds"
                        ? "border-blue-600 text-blue-600"
                        : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                    }`}
                  >
                    Refund Requests
                    {refunds.filter((r) => r.status === "pending").length >
                      0 && (
                      <span className="ml-2 bg-red-100 text-red-600 py-0.5 px-2 rounded-full text-xs">
                        {refunds.filter((r) => r.status === "pending").length}
                      </span>
                    )}
                  </button>
                </nav>
              </div>
            </div>

            {/* Tab Content */}
            {activeTab === "withdrawals" && selectedAccountId ? (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <WithdrawalForm
                  restaurantUserId={restaurantUserId}
                  balance={balance}
                  onSuccess={fetchData}
                  accountId={selectedAccountId}
                />
                <WithdrawalHistory history={history} />
              </div>
            ) : activeTab == "catering" ? (
              <div className="bg-white rounded-lg p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-6">
                  Event Orders
                </h2>
                <CateringOrdersList
                  orders={cateringOrders}
                  restaurantId={restaurantId}
                  restaurantUserId={restaurantUserId}
                  token={token}
                  onRefresh={fetchData}
                  hasMultipleBranches={hasMultipleBranches}
                  selectedAccountId={selectedAccountId}
                />
              </div>
            ) : (
              <div className="bg-white rounded-lg p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-6">
                  Refund Requests
                </h2>
                <RefundRequestsList
                  refunds={refunds}
                  onProcessRefund={handleProcessRefund}
                />
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};
