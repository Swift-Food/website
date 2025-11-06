// components/restaurant-dashboard/RestaurantDashboard.tsx
"use client";

import { useState, useEffect } from "react";
import { LogOut, Loader } from "lucide-react";
import { restaurantApi } from "@/app/api/restaurantApi";
import {
  BalanceInfo,
  WithdrawalRequest,
  StripeOnboardingStatus,
  // PaymentAccounts,
} from "@/types/restaurant.types";
import { CateringOrder } from "@/app/types/catering.types";
import { PaymentAccountSelector } from "./shared/PaymentAccountSelector";
import { StripeOnboardingRequired } from "./shared/StripeOnboardingRequired";
import { BalanceCards } from "./withdrawals/BalanceCards";
import { WithdrawalForm } from "./withdrawals/WithdrawalForm";
import { WithdrawalHistory } from "./withdrawals/WithdrawalHistory";
import { CateringOrdersList } from "./catering/CateringOrdersList";
import { AnalyticsDashboard } from "./analytics/AnalyticsDashboard";

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
  const [loading, setLoading] = useState(true);
  const [stripeStatus, setStripeStatus] =
    useState<StripeOnboardingStatus | null>(null);
  const [balance, setBalance] = useState<BalanceInfo | null>(null);
  const [history, setHistory] = useState<WithdrawalRequest[]>([]);
  const [cateringOrders, setCateringOrders] = useState<CateringOrder[]>([]);
  const [activeTab, setActiveTab] = useState<
    "withdrawals" | "catering" | "analytics"
  >("withdrawals");
  const [selectedAccountId, setSelectedAccountId] = useState<string | null>(
    null
  );
  // const [error, setError] = useState("");

  const fetchData = async () => {
    setLoading(true);
    // setError("");
    try {
      const [statusData, balanceData, historyData, cateringData] =
        await Promise.all([
          restaurantApi.checkStripeStatus(restaurantUserId, selectedAccountId),
          restaurantApi.getBalance(restaurantUserId, token, selectedAccountId),
          restaurantApi.getWithdrawalHistory(
            restaurantUserId,
            token,
            selectedAccountId
          ),
          restaurantApi.getCateringOrders(restaurantId, selectedAccountId),
        ]);

      if (statusData) setStripeStatus(statusData);
      if (balanceData) setBalance(balanceData);
      setHistory(historyData || []);

      let filteredOrders = cateringData || [];
      if (selectedAccountId) {
        filteredOrders = filteredOrders.filter((order: CateringOrder) => {
          if (!order.restaurantPayoutDetails) return false;
          return Object.values(order.restaurantPayoutDetails).some(
            (details: any) => details.selectedAccountId === selectedAccountId
          );
        });
      }

      setCateringOrders(filteredOrders);
    } catch (err: any) {
      console.error("Fetch error:", err);
      // setError(err.message || "Failed to load data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [userId, token, selectedAccountId]);

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
    Object.keys(restaurantUser.paymentAccounts).length > 0;
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
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="mb-3">
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

          {/* Restaurant Analytics Button */}
          <div className="mb-3">
            <a
              href={`/restaurant/analytics/${restaurantId}`}
              className="block h-full bg-success hover:bg-success/90 text-white rounded-lg p-4 transition-all hover:shadow-lg"
            >
              <div className="flex items-center justify-between">
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

          {/* Opening Hours Button */}
          <div className="mb-3">
            <a
              href={`/restaurant/analytics/${restaurantId}`}
              className="block h-full bg-warning hover:bg-warning/90 text-white rounded-lg p-4 transition-all hover:shadow-lg"
            >
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-bold mb-1">Opening Hours</h3>
                  <p className="text-sm text-white/90">
                    Set your restaurant opening hours
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
                    onClick={() => setActiveTab("analytics")}
                    className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                      activeTab === "analytics"
                        ? "border-blue-600 text-blue-600"
                        : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                    }`}
                  >
                    Analytics
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
                </nav>
              </div>
            </div>

            {/* Tab Content */}
            {activeTab === "withdrawals" ? (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <WithdrawalForm
                  restaurantUserId={restaurantUserId}
                  token={token}
                  balance={balance}
                  onSuccess={fetchData}
                />
                <WithdrawalHistory history={history} />
              </div>
            ) : activeTab === "analytics" ? (
              <div className="bg-white rounded-lg p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-6">
                  Analytics
                </h2>
                <AnalyticsDashboard
                  restaurantId={restaurantId}
                  token={token}
                  selectedAccountId={selectedAccountId}
                />
              </div>
            ) : (
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
            )}
          </>
        )}
      </div>
    </div>
  );
};
