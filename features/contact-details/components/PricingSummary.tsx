import { CateringPricingResult } from '@/types/catering.types';

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
      <div className="flex justify-between text-sm text-base-content/70">
        <span>Delivery Cost</span>
        <span>£{pricing.deliveryFee.toFixed(2)}</span>
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
