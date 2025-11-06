// components/restaurant-dashboard/analytics/OrderTypeBreakdown.tsx
"use client";

import { MonthlyAnalytics } from "@/types/restaurant.types";

interface OrderTypeBreakdownProps {
  title: string;
  analytics: MonthlyAnalytics;
  type: "corporate" | "catering";
}

export const OrderTypeBreakdown = ({
  title,
  analytics,
  type,
}: OrderTypeBreakdownProps) => {
  const formatCurrency = (amount: number) => `£${amount.toFixed(2)}`;

  const orderCount =
    type === "corporate"
      ? analytics.corporateOrdersCount
      : analytics.cateringOrdersCount;
  const revenue =
    type === "corporate"
      ? analytics.corporateTotalRevenue
      : analytics.cateringTotalRevenue;
  const earnings =
    type === "corporate"
      ? analytics.corporateRestaurantEarnings
      : analytics.cateringRestaurantEarnings;
  const avgOrderValue =
    type === "corporate"
      ? analytics.corporateAverageOrderValue
      : analytics.cateringAverageOrderValue;

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-6">
      <h4 className="font-semibold text-gray-900 mb-4">{title}</h4>
      <div className="space-y-3">
        <div className="flex justify-between items-center">
          <span className="text-sm text-gray-600">Order Count</span>
          <span className="font-semibold text-gray-900">{orderCount || 0}</span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-sm text-gray-600">Revenue</span>
          <span className="font-semibold text-gray-900">
            {formatCurrency(revenue || 0)}
          </span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-sm text-gray-600">Your Earnings</span>
          <span className="font-semibold text-green-600">
            {formatCurrency(earnings || 0)}
          </span>
        </div>
        <div className="flex justify-between items-center pt-3 border-t border-gray-200">
          <span className="text-sm text-gray-600">Avg Order Value</span>
          <span className="font-semibold text-gray-900">
            {formatCurrency(avgOrderValue || 0)}
          </span>
        </div>
      </div>
    </div>
  );
};