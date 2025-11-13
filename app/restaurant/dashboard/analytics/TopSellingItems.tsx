// components/restaurant-dashboard/analytics/TopSellingItems.tsx
"use client";

import { TopSellingItem } from "@/types/restaurant.types";

interface TopSellingItemsProps {
  items: TopSellingItem[];
}

export const TopSellingItems = ({ items }: TopSellingItemsProps) => {
  const formatCurrency = (amount: number) => `£${amount.toFixed(2)}`;

  if (!items || items.length === 0) {
    return null;
  }

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-6">
      <h4 className="font-semibold text-gray-900 mb-4">
        Top Selling Items (Today)
      </h4>
      <div className="space-y-3">
        {items.map((item, idx) => (
          <div
            key={idx}
            className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
          >
            <div className="flex-1">
              <p className="font-medium text-gray-900">{item.name}</p>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-xs text-gray-500">
                  Qty: {item.quantitySold}
                </span>
                <span className="text-xs px-2 py-0.5 bg-blue-100 text-blue-700 rounded-full">
                  {item.orderType}
                </span>
              </div>
            </div>
            <div className="text-right">
              <p className="font-semibold text-gray-900">
                {formatCurrency(item.revenue)}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};