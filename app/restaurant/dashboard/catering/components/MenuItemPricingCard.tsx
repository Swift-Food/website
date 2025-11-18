/**
 * MenuItemPricingCard Component
 * Displays pricing breakdown for a single menu item
 */

import { formatCurrency } from "../utils/format.utils";
import { MenuItemPricingDto } from "../types/order-card.dto";

interface MenuItemPricingCardProps {
  pricing: MenuItemPricingDto;
  itemName: string;
  hasNewPricingData: boolean;
}

export function MenuItemPricingCard({
  pricing,
  itemName,
  hasNewPricingData,
}: MenuItemPricingCardProps) {
  return (
    <div className="flex justify-between items-center bg-gray-50 p-2 sm:p-3 rounded">
      <div className="flex-1 min-w-0">
        <p className="font-medium text-gray-900 text-sm truncate">{itemName}</p>
        <p className="text-xs text-gray-500">Qty: {pricing.quantity}</p>
      </div>

      <div className="flex flex-col gap-1.5 ml-2">
        {/* Restaurant Net Earnings (what they receive after commission) */}
        <div className="bg-green-100 border border-green-300 rounded-md px-2 py-0.5 min-h-[42px] flex flex-col justify-center">
          <p className="text-[10px] text-green-700 font-medium leading-tight">
            YOUR NET EARNINGS
          </p>
          {hasNewPricingData ? (
            <>
              <p className="text-[10px] text-green-600 leading-tight">
                Per unit: {formatCurrency(pricing.netEarningsPerUnit)}
              </p>
              <p className="text-[10px] text-green-600 leading-tight">
                Qty: {pricing.quantity}
              </p>
            </>
          ) : (
            <>
              <p className="text-[10px] text-green-600 leading-tight">
                Unit Commission: {formatCurrency(pricing.netEarningsPerUnit)}
              </p>
              <p className="text-[10px] text-green-600 leading-tight">
                Qty: {pricing.quantity}
              </p>
            </>
          )}
          <p className="text-sm font-bold text-green-800 leading-tight mt-0.5">
            {formatCurrency(pricing.netEarnings)}
          </p>
        </div>

        {/* Gross Price (before commission) */}
        <div className="bg-gray-100 border border-gray-300 rounded-md px-2 py-0.5 min-h-[42px] flex flex-col justify-center">
          <p className="text-xs text-gray-900 font-medium leading-tight">
            GROSS PRICE
          </p>
          {hasNewPricingData ? (
            <>
              <p className="text-[10px] text-gray-600 leading-tight">
                Per unit: {formatCurrency(pricing.grossPricePerUnit)}
              </p>
              {pricing.commissionRate && (
                <p className="text-[10px] text-gray-600 leading-tight">
                  Commission: {pricing.commissionRate}%
                </p>
              )}
            </>
          ) : (
            <>
              <p className="text-[10px] text-gray-600 leading-tight">
                Unit Price: {formatCurrency(pricing.grossPricePerUnit)}
              </p>
              <p className="text-[10px] text-gray-600 leading-tight">
                Qty: {pricing.quantity}
              </p>
            </>
          )}
          <p className="text-sm font-semibold text-gray-700 leading-tight mt-0.5">
            {formatCurrency(pricing.grossPrice)}
          </p>
        </div>

        {/* Customer Price (what customer paid) */}
        <div className="bg-blue-50 border border-blue-200 rounded-md px-2 py-0.5 min-h-[32px] flex flex-col justify-center">
          <p className="text-[10px] text-blue-700 font-medium leading-tight">
            Customer Paid: {formatCurrency(pricing.customerPrice)}
          </p>
        </div>
      </div>
    </div>
  );
}
