/**
 * EarningsSummary Component
 * Displays restaurant earnings and pricing breakdown
 */

import { formatCurrency, formatDate } from "../utils/format.utils";
import { getStatusConfig } from "../utils/order-status.utils";

interface EarningsSummaryProps {
  status: string;
  restaurantTotalCost: number;
  promotionDiscount?: number;
  orderItemTotalPrice?: number;
  orderItemPromotionDiscount?: number;
  finalTotal: number;
  eventDate: string;
}

export function EarningsSummary({
  status,
  restaurantTotalCost,
  promotionDiscount,
  orderItemTotalPrice,
  orderItemPromotionDiscount,
  finalTotal,
  eventDate,
}: EarningsSummaryProps) {
  const statusConfig = getStatusConfig(status);

  return (
    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-3 mb-4">
      <div className="flex flex-row gap-5 justify-center items-center">
        <span
          className={`px-3 sm:px-4 py-1.5 sm:py-2 rounded-full text-xs sm:text-sm font-semibold border inline-block text-center ${statusConfig.color}`}
        >
          {statusConfig.label}
        </span>
      </div>

      <div className="sm:text-right">
        <div className="mb-1">
          <p className="text-xs text-gray-600 font-medium">Your Earnings</p>
          <p className="font-bold text-xl sm:text-2xl text-green-600">
            {formatCurrency(restaurantTotalCost)}
          </p>
        </div>

        {/* Show pricing breakdown */}
        <div className="mb-2 space-y-1">
          {promotionDiscount && Number(promotionDiscount) > 0 ? (
            <>
              <p className="text-sm text-gray-600">
                Subtotal: {formatCurrency(orderItemTotalPrice || 0)}
              </p>
              <p className="text-sm text-green-600 font-medium">
                Promotion Savings: -{formatCurrency(orderItemPromotionDiscount || 0)}
              </p>
              <p className="text-sm text-gray-900 font-semibold">
                Customer Paid:{" "}
                {formatCurrency(
                  (orderItemTotalPrice || 0) - (orderItemPromotionDiscount || 0)
                )}
              </p>
            </>
          ) : (
            <p className="text-sm text-gray-600">
              Customer Paid: {formatCurrency(finalTotal)}
            </p>
          )}
        </div>

        <p className="text-xs text-gray-500">Event: {formatDate(eventDate)}</p>
      </div>
    </div>
  );
}
