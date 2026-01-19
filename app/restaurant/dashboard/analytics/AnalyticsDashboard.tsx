// components/restaurant-dashboard/analytics/AnalyticsDashboard.tsx
"use client";

import { useState, useEffect } from "react";
import {
  AlertCircle,
  Loader,
  TrendingUp,
  TrendingDown,
  Minus,
} from "lucide-react";
import { restaurantApi } from "@/services/api/restaurant.api";
import { AnalyticsDashboard as AnalyticsData } from "@/types/restaurant.types";

interface AnalyticsDashboardProps {
  restaurantId: string;
  token: string;
  // selectedAccountId: string | null;
}

export const AnalyticsDashboard = ({
  restaurantId,
  token,
  // selectedAccountId,
}: AnalyticsDashboardProps) => {
  const [loading, setLoading] = useState(true);
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchAnalytics();
  }, [restaurantId, token]);

  const fetchAnalytics = async () => {
    setLoading(true);
    setError("");
    try {
      const data = await restaurantApi.getAnalyticsDashboard(restaurantId);
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

    </div>
  );
};