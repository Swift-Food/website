import { CateringPricingResult } from '@/types/catering.types';
import { useState } from 'react';

interface PricingSummaryProps {
  pricing: CateringPricingResult | null;
  calculatingPricing: boolean;
  estimatedTotal: number;
  subtotalBeforeDiscount: number;
  promotionDiscount: number;
}

export function PricingSummary({
  pricing,
  calculatingPricing,
  estimatedTotal,
  subtotalBeforeDiscount,
  promotionDiscount,
}: PricingSummaryProps) {
  const [showDeliveryBreakdown, setShowDeliveryBreakdown] = useState(false);

  if (calculatingPricing) {
    return (
      <div className="text-center py-4 text-base-content/60 text-sm">
        Calculating pricing...
      </div>
    );
  }

  if (!pricing) {
    return (
      <div className="flex justify-between pt-4 border-t border-base-300">
        <span className="font-semibold text-base-content">Estimated Total:</span>
        <span className="font-bold text-xl text-base-content">
          £{estimatedTotal.toFixed(2)}
        </span>
      </div>
    );
  }

  // Extract delivery breakdown from meal sessions if available
  const deliveryBreakdown = pricing.deliveryFeeBreakdown ||
    (pricing as any).mealSessions?.[0]?.deliveryFeeBreakdown;
  const distanceInMiles = pricing.distanceInMiles ||
    (pricing as any).mealSessions?.[0]?.distanceInMiles;

  return (
    <div className="space-y-2 pt-4 border-t border-base-300">
      {/* Subtotal */}
      <div className="flex justify-between text-sm text-base-content/70">
        <span>Subtotal</span>
        <span>£{subtotalBeforeDiscount.toFixed(2)}</span>
      </div>

      {/* Restaurant Promotion */}
      {promotionDiscount > 0 && (
        <div className="flex justify-between text-sm text-green-600 font-semibold">
          <span>Restaurant Promotion</span>
          <span>-£{promotionDiscount.toFixed(2)}</span>
        </div>
      )}

      {/* Delivery fee */}
      <div className="space-y-1">
        <div className="flex justify-between items-start text-sm text-base-content/70 gap-2">
          <div className="flex flex-col sm:flex-row sm:items-center sm:gap-2">
            <span className="whitespace-nowrap">Delivery Cost</span>
            {distanceInMiles && (
              <span className="text-xs text-base-content/50">
                ({distanceInMiles.toFixed(1)} mi)
              </span>
            )}
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            {!distanceInMiles ? (
              <span className="text-warning font-medium">TBC</span>
            ) : (
              <>
                <span>£{pricing.deliveryFee.toFixed(2)}</span>
                {deliveryBreakdown && (
                  <button
                    onClick={() => setShowDeliveryBreakdown(!showDeliveryBreakdown)}
                    className="text-xs text-primary hover:underline whitespace-nowrap"
                    type="button"
                  >
                    {showDeliveryBreakdown ? 'hide' : 'details'}
                  </button>
                )}
              </>
            )}
          </div>
        </div>

        {/* Delivery fee breakdown - Show per session */}
        {showDeliveryBreakdown && (pricing as any).mealSessions && (
          <div className="pl-4 space-y-1 text-xs text-base-content/60">
            {(pricing as any).mealSessions.map((session: any, index: number) => (
              <div key={index} className="flex justify-between">
                <span>{session.sessionName}:</span>
                <span>£{session.deliveryFee.toFixed(2)}</span>
              </div>
            ))}
            {deliveryBreakdown?.requiresCustomQuote && (
              <div className="mt-2 p-2 bg-warning/10 border border-warning/30 rounded text-warning-content">
                <p className="text-xs">
                  ⚠️ Delivery exceeds 6 miles. Final fee subject to review.
                </p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Promo code discount */}
      {(pricing.promoDiscount ?? 0) > 0 && (
        <div className="flex justify-between text-sm text-success font-medium">
          <span>Promo Code Discount</span>
          <span>-£{pricing.promoDiscount!.toFixed(2)}</span>
        </div>
      )}

      {/* Total */}
      <div className="flex justify-between text-lg font-bold text-base-content pt-3 border-t border-base-300">
        <span>Total</span>
        <div className="text-right">
          <p>£{pricing.total.toFixed(2)}</p>
          {(promotionDiscount > 0 || (pricing.promoDiscount ?? 0) > 0) && (
            <p className="text-xs line-through text-base-content/50">
              £{(subtotalBeforeDiscount + pricing.deliveryFee).toFixed(2)}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
