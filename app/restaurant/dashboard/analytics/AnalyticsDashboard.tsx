// components/restaurant-dashboard/analytics/AnalyticsDashboard.tsx
"use client";

import { useState, useEffect } from "react";
import {
  AlertCircle,
  Loader,
  DollarSign,
  CheckCircle,
  Clock,
  TrendingUp,
  TrendingDown,
  Minus,
  Calendar,
  Package,
  Users,
} from "lucide-react";
import { restaurantApi } from "@/app/api/restaurantApi";
import { AnalyticsDashboard as AnalyticsData } from "@/types/restaurant.types";

interface AnalyticsDashboardProps {
  restaurantId: string;
  token: string;
  selectedAccountId: string | null;
}

export const AnalyticsDashboard = ({
  restaurantId,
  token,
  selectedAccountId,
}: AnalyticsDashboardProps) => {
  const [loading, setLoading] = useState(true);
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [error, setError] = useState("");
  const [viewMode, setViewMode] = useState<"overview" | "detailed">("overview");

  useEffect(() => {
    fetchAnalytics();
  }, [restaurantId, token, selectedAccountId]);

  const fetchAnalytics = async () => {
    setLoading(true);
    setError("");
    try {
      const data = await restaurantApi.getAnalyticsDashboard(restaurantId, token);
      setAnalytics(data);
    } catch (err: any) {
      console.error("Analytics fetch error:", err);
      setError(err.message || "Failed to load analytics");
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number) => `£${amount.toFixed(2)}`;
  
  const formatGrowth = (growth: number) => {
    const sign = growth >= 0 ? "+" : "";
    return `${sign}${growth.toFixed(1)}%`;
  };

  const getGrowthColor = (growth: number) => {
    if (growth > 0) return "text-green-600";
    if (growth < 0) return "text-red-600";
    return "text-gray-600";
  };

  const getGrowthIcon = (growth: number) => {
    if (growth > 0) return <TrendingUp size={16} />;
    if (growth < 0) return <TrendingDown size={16} />;
    return <Minus size={16} />;
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg p-8 text-center">
        <Loader size={32} className="animate-spin text-blue-600 mx-auto mb-4" />
        <p className="text-gray-600">Loading analytics...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-6">
        <div className="flex items-center text-red-700">
          <AlertCircle size={20} className="mr-2" />
          <span>{error}</span>
        </div>
      </div>
    );
  }

  if (!analytics) {
    return (
      <div className="bg-gray-50 rounded-lg p-8 text-center">
        <p className="text-gray-600">No analytics data available yet.</p>
        <p className="text-sm text-gray-500 mt-2">
          Analytics will appear once you start receiving orders.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* View Mode Toggle */}
      <div className="flex justify-end">
        <div className="inline-flex rounded-lg border border-gray-300 bg-white p-1">
          <button
            onClick={() => setViewMode("overview")}
            className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
              viewMode === "overview"
                ? "bg-blue-600 text-white"
                : "text-gray-700 hover:bg-gray-100"
            }`}
          >
            Overview
          </button>
          <button
            onClick={() => setViewMode("detailed")}
            className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
              viewMode === "detailed"
                ? "bg-blue-600 text-white"
                : "text-gray-700 hover:bg-gray-100"
            }`}
          >
            Detailed
          </button>
        </div>
      </div>

      {viewMode === "overview" ? (
        <>
          {/* Today's Performance */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <Calendar size={20} className="mr-2" />
              Today's Performance
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Total Earnings Today */}
              <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-lg p-6 text-white shadow-lg">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium opacity-90">Total Earnings</span>
                  <DollarSign size={24} />
                </div>
                <p className="text-3xl font-bold mb-1">
                  {formatCurrency(analytics.today.totalRestaurantEarnings || 0)}
                </p>
                <p className="text-sm opacity-90">
                  Revenue: {formatCurrency(analytics.today.totalRevenue || 0)}
                </p>
                <div className="mt-3 pt-3 border-t border-green-400 border-opacity-30">
                  <div className="flex justify-between text-xs opacity-90">
                    <span>Corporate:</span>
                    <span className="font-semibold">
                      {formatCurrency(analytics.today.corporateRestaurantEarnings || 0)}
                    </span>
                  </div>
                  <div className="flex justify-between text-xs opacity-90 mt-1">
                    <span>Catering:</span>
                    <span className="font-semibold">
                      {formatCurrency(analytics.today.cateringRestaurantEarnings || 0)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Orders Today */}
              <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg p-6 text-white shadow-lg">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium opacity-90">Orders Today</span>
                  <CheckCircle size={24} />
                </div>
                <p className="text-3xl font-bold mb-1">
                  {analytics.today.totalOrdersCount || 0}
                </p>
                <p className="text-sm opacity-90">
                  Corporate: {analytics.today.corporateOrdersCount || 0} | Catering:{" "}
                  {analytics.today.cateringOrdersCount || 0}
                </p>
                <div className="mt-3 pt-3 border-t border-blue-400 border-opacity-30">
                  <div className="flex justify-between text-xs opacity-90">
                    <span>Corporate Revenue:</span>
                    <span className="font-semibold">
                      {formatCurrency(analytics.today.corporateTotalRevenue || 0)}
                    </span>
                  </div>
                  <div className="flex justify-between text-xs opacity-90 mt-1">
                    <span>Catering Revenue:</span>
                    <span className="font-semibold">
                      {formatCurrency(analytics.today.cateringTotalRevenue || 0)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Items Sold Today */}
              <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg p-6 text-white shadow-lg">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium opacity-90">Items Sold</span>
                  <Package size={24} />
                </div>
                <p className="text-3xl font-bold mb-1">
                  {analytics.today.totalItems || 0}
                </p>
                <p className="text-sm opacity-90">Across all orders</p>
                <div className="mt-3 pt-3 border-t border-purple-400 border-opacity-30">
                  <div className="flex justify-between text-xs opacity-90">
                    <span>Corporate Items:</span>
                    <span className="font-semibold">
                      {analytics.today.corporateTotalItems || 0}
                    </span>
                  </div>
                  <div className="flex justify-between text-xs opacity-90 mt-1">
                    <span>Catering Items:</span>
                    <span className="font-semibold">
                      {analytics.today.cateringTotalItems || 0}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Monthly Performance Comparison */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <TrendingUp size={20} className="mr-2" />
              Monthly Performance (vs Last Month)
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Total Earnings */}
              <div className="bg-white border-2 border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm font-medium text-gray-700">Total Earnings</span>
                  <div
                    className={`flex items-center gap-1 text-sm font-bold ${getGrowthColor(
                      analytics.growth.earnings
                    )}`}
                  >
                    {getGrowthIcon(analytics.growth.earnings)}
                    {formatGrowth(analytics.growth.earnings)}
                  </div>
                </div>
                <p className="text-3xl font-bold text-gray-900 mb-2">
                  {formatCurrency(analytics.thisMonth.totalRestaurantEarnings || 0)}
                </p>
                <div className="space-y-1">
                  <div className="flex justify-between text-xs text-gray-600">
                    <span>Last month:</span>
                    <span className="font-medium">
                      {formatCurrency(analytics.lastMonth.totalRestaurantEarnings || 0)}
                    </span>
                  </div>
                  <div className="flex justify-between text-xs text-gray-600 pt-2 border-t">
                    <span>This Month Revenue:</span>
                    <span className="font-medium text-blue-600">
                      {formatCurrency(analytics.thisMonth.totalRevenue || 0)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Total Orders */}
              <div className="bg-white border-2 border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm font-medium text-gray-700">Total Orders</span>
                  <div
                    className={`flex items-center gap-1 text-sm font-bold ${getGrowthColor(
                      analytics.growth.orders
                    )}`}
                  >
                    {getGrowthIcon(analytics.growth.orders)}
                    {formatGrowth(analytics.growth.orders)}
                  </div>
                </div>
                <p className="text-3xl font-bold text-gray-900 mb-2">
                  {analytics.thisMonth.totalOrdersCount || 0}
                </p>
                <div className="space-y-1">
                  <div className="flex justify-between text-xs text-gray-600">
                    <span>Last month:</span>
                    <span className="font-medium">
                      {analytics.lastMonth.totalOrdersCount || 0}
                    </span>
                  </div>
                  <div className="flex justify-between text-xs text-gray-600 pt-2 border-t">
                    <span>Corporate:</span>
                    <span className="font-medium">
                      {analytics.thisMonth.corporateOrdersCount || 0}
                    </span>
                  </div>
                  <div className="flex justify-between text-xs text-gray-600">
                    <span>Catering:</span>
                    <span className="font-medium">
                      {analytics.thisMonth.cateringOrdersCount || 0}
                    </span>
                  </div>
                </div>
              </div>

              {/* Total Revenue */}
              <div className="bg-white border-2 border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm font-medium text-gray-700">Total Revenue</span>
                  <div
                    className={`flex items-center gap-1 text-sm font-bold ${getGrowthColor(
                      analytics.growth.revenue
                    )}`}
                  >
                    {getGrowthIcon(analytics.growth.revenue)}
                    {formatGrowth(analytics.growth.revenue)}
                  </div>
                </div>
                <p className="text-3xl font-bold text-gray-900 mb-2">
                  {formatCurrency(analytics.thisMonth.totalRevenue || 0)}
                </p>
                <div className="space-y-1">
                  <div className="flex justify-between text-xs text-gray-600">
                    <span>Last month:</span>
                    <span className="font-medium">
                      {formatCurrency(analytics.lastMonth.totalRevenue || 0)}
                    </span>
                  </div>
                  <div className="flex justify-between text-xs text-gray-600 pt-2 border-t">
                    <span>Items Sold:</span>
                    <span className="font-medium">
                      {analytics.thisMonth.totalItems || 0}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Order Type Breakdown */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              This Month by Order Type
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Corporate Orders Breakdown */}
              <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
                <div className="flex items-center justify-between mb-4">
                  <h4 className="font-semibold text-gray-900 flex items-center">
                    <Users size={18} className="mr-2 text-blue-600" />
                    Corporate Orders
                  </h4>
                  <span className="text-2xl font-bold text-blue-600">
                    {analytics.thisMonth.corporateOrdersCount || 0}
                  </span>
                </div>
                <div className="space-y-3">
                  <div className="flex justify-between items-center p-3 bg-blue-50 rounded-lg">
                    <span className="text-sm text-gray-700">Total Revenue</span>
                    <span className="font-semibold text-gray-900">
                      {formatCurrency(analytics.thisMonth.corporateTotalRevenue || 0)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg">
                    <span className="text-sm text-gray-700">Your Earnings</span>
                    <span className="font-semibold text-green-600">
                      {formatCurrency(analytics.thisMonth.corporateRestaurantEarnings || 0)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                    <span className="text-sm text-gray-700">Avg Order Value</span>
                    <span className="font-semibold text-gray-900">
                      {formatCurrency(analytics.thisMonth.corporateAverageOrderValue || 0)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center pt-3 border-t border-gray-200">
                    <span className="text-xs text-gray-600">Items Sold</span>
                    <span className="font-medium text-gray-900">
                      {analytics.thisMonth.corporateTotalItems || 0}
                    </span>
                  </div>
                </div>
              </div>

              {/* Catering Orders Breakdown */}
              <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
                <div className="flex items-center justify-between mb-4">
                  <h4 className="font-semibold text-gray-900 flex items-center">
                    <Package size={18} className="mr-2 text-purple-600" />
                    Catering Orders
                  </h4>
                  <span className="text-2xl font-bold text-purple-600">
                    {analytics.thisMonth.cateringOrdersCount || 0}
                  </span>
                </div>
                <div className="space-y-3">
                  <div className="flex justify-between items-center p-3 bg-purple-50 rounded-lg">
                    <span className="text-sm text-gray-700">Total Revenue</span>
                    <span className="font-semibold text-gray-900">
                      {formatCurrency(analytics.thisMonth.cateringTotalRevenue || 0)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg">
                    <span className="text-sm text-gray-700">Your Earnings</span>
                    <span className="font-semibold text-green-600">
                      {formatCurrency(analytics.thisMonth.cateringRestaurantEarnings || 0)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                    <span className="text-sm text-gray-700">Avg Order Value</span>
                    <span className="font-semibold text-gray-900">
                      {formatCurrency(analytics.thisMonth.cateringAverageOrderValue || 0)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center pt-3 border-t border-gray-200">
                    <span className="text-xs text-gray-600">Items Sold</span>
                    <span className="font-medium text-gray-900">
                      {analytics.thisMonth.cateringTotalItems || 0}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </>
      ) : (
        <>
          {/* Detailed View */}
          {/* Top Selling Items */}
          {analytics.today.topSellingItems && analytics.today.topSellingItems.length > 0 && (
            <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
              <h4 className="font-semibold text-gray-900 mb-4 flex items-center">
                <TrendingUp size={18} className="mr-2 text-blue-600" />
                Top Selling Items (Today)
              </h4>
              <div className="space-y-3">
                {analytics.today.topSellingItems.map((item, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="flex items-center justify-center w-6 h-6 bg-blue-600 text-white rounded-full text-xs font-bold">
                          {idx + 1}
                        </span>
                        <p className="font-medium text-gray-900">{item.name}</p>
                      </div>
                      <div className="flex items-center gap-3 mt-2 ml-8">
                        <span className="text-xs text-gray-600 bg-white px-2 py-1 rounded">
                          Qty: <span className="font-semibold">{item.quantitySold}</span>
                        </span>
                        <span
                          className={`text-xs px-2 py-1 rounded font-medium ${
                            item.orderType === "corporate"
                              ? "bg-blue-100 text-blue-700"
                              : item.orderType === "catering"
                              ? "bg-purple-100 text-purple-700"
                              : "bg-green-100 text-green-700"
                          }`}
                        >
                          {item.orderType}
                        </span>
                      </div>
                    </div>
                    <div className="text-right ml-4">
                      <p className="font-bold text-lg text-green-600">
                        {formatCurrency(item.revenue)}
                      </p>
                      <p className="text-xs text-gray-500">
                        {formatCurrency(item.revenue / item.quantitySold)}/item
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Peak Order Times */}
          {analytics.today.peakOrderTimes && analytics.today.peakOrderTimes.length > 0 && (
            <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
              <h4 className="font-semibold text-gray-900 mb-4 flex items-center">
                <Clock size={18} className="mr-2 text-blue-600" />
                Peak Order Times (Corporate Orders)
              </h4>
              <div className="space-y-3">
                {analytics.today.peakOrderTimes.slice(0, 5).map((time, idx) => {
                  const maxCount = Math.max(
                    ...analytics.today.peakOrderTimes!.map((t) => t.orderCount)
                  );
                  const percentage = (time.orderCount / maxCount) * 100;

                  return (
                    <div
                      key={idx}
                      className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                    >
                      <span className="text-sm font-medium text-gray-900 min-w-[120px]">
                        {String(time.hour).padStart(2, "0")}:00 -{" "}
                        {String(time.hour + 1).padStart(2, "0")}:00
                      </span>
                      <div className="flex-1 mx-4">
                        <div className="w-full h-3 bg-gray-200 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-gradient-to-r from-blue-500 to-blue-600 rounded-full transition-all duration-500"
                            style={{ width: `${percentage}%` }}
                          />
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-bold text-gray-900 min-w-[30px] text-right">
                          {time.orderCount}
                        </span>
                        <span className="text-xs text-gray-500">
                          {percentage.toFixed(0)}%
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Top Corporate Organizations */}
          {analytics.today.topCorporateOrganizations &&
            analytics.today.topCorporateOrganizations.length > 0 && (
              <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
                <h4 className="font-semibold text-gray-900 mb-4 flex items-center">
                  <Users size={18} className="mr-2 text-blue-600" />
                  Top Corporate Clients (Today)
                </h4>
                <div className="space-y-3">
                  {analytics.today.topCorporateOrganizations.map((org, idx) => (
                    <div
                      key={idx}
                      className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                    >
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className="flex items-center justify-center w-6 h-6 bg-purple-600 text-white rounded-full text-xs font-bold">
                            {idx + 1}
                          </span>
                          <p className="font-medium text-gray-900">{org.organizationName}</p>
                        </div>
                        <p className="text-xs text-gray-600 mt-2 ml-8 bg-white px-2 py-1 rounded inline-block">
                          {org.orderCount} order{org.orderCount !== 1 ? "s" : ""}
                        </p>
                      </div>
                      <div className="text-right ml-4">
                        <p className="font-bold text-lg text-green-600">
                          {formatCurrency(org.totalSpent)}
                        </p>
                        <p className="text-xs text-gray-500">
                          {formatCurrency(org.totalSpent / org.orderCount)}/order
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

          {/* Summary Statistics */}
          <div className="bg-gradient-to-br from-blue-50 to-purple-50 border border-blue-200 rounded-lg p-6">
            <h4 className="font-semibold text-gray-900 mb-4">Today's Summary</h4>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <p className="text-sm text-gray-600 mb-1">Total Revenue</p>
                <p className="text-xl font-bold text-gray-900">
                  {formatCurrency(analytics.today.totalRevenue || 0)}
                </p>
              </div>
              <div className="text-center">
                <p className="text-sm text-gray-600 mb-1">Your Earnings</p>
                <p className="text-xl font-bold text-green-600">
                  {formatCurrency(analytics.today.totalRestaurantEarnings || 0)}
                </p>
              </div>
              <div className="text-center">
                <p className="text-sm text-gray-600 mb-1">Total Orders</p>
                <p className="text-xl font-bold text-blue-600">
                  {analytics.today.totalOrdersCount || 0}
                </p>
              </div>
              <div className="text-center">
                <p className="text-sm text-gray-600 mb-1">Items Sold</p>
                <p className="text-xl font-bold text-purple-600">
                  {analytics.today.totalItems || 0}
                </p>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};