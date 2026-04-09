import { CateringPricingResult } from "@/types/catering.types";
import { useState, useRef, useEffect } from "react";
import { loadGoogleMapsScript } from "@/lib/utils/google-maps-loader";
import { GOOGLE_MAPS_CONFIG } from "@/lib/constants/google-maps";

interface PricingSummaryProps {
  pricing: CateringPricingResult | null;
  calculatingPricing: boolean;
  estimatedTotal?: number;
  compact?: boolean;
  onPlaceSelect?: (place: google.maps.places.PlaceResult) => void;
  onClearAddress?: () => void;
}

function InlineAddressInput({
  onPlaceSelect,
}: {
  onPlaceSelect: (place: google.maps.places.PlaceResult) => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const autocompleteRef = useRef<google.maps.places.Autocomplete | null>(null);

  useEffect(() => {
    loadGoogleMapsScript().then(() => {
      if (!inputRef.current || !window.google?.maps?.places) return;
      autocompleteRef.current = new google.maps.places.Autocomplete(inputRef.current, {
        componentRestrictions: { country: GOOGLE_MAPS_CONFIG.COUNTRY_RESTRICTION },
        fields: GOOGLE_MAPS_CONFIG.FIELDS,
      });
      autocompleteRef.current.addListener("place_changed", () => {
        const place = autocompleteRef.current?.getPlace();
        if (place?.geometry) onPlaceSelect(place);
      });
    });
    return () => {
      if (autocompleteRef.current) {
        google.maps.event.clearInstanceListeners(autocompleteRef.current);
      }
    };
  }, [onPlaceSelect]);

  return (
    <input
      ref={inputRef}
      type="text"
      placeholder="Enter address"
      className="text-xs text-base-content bg-base-100 border border-base-300 rounded px-2 py-1 outline-none focus:border-primary focus:ring-1 focus:ring-primary/20 placeholder:text-base-content/60 w-full"
    />
  );
}

export default function PricingSummary({
  pricing,
  calculatingPricing,
  estimatedTotal,
  compact = false,
  onPlaceSelect,
  onClearAddress,
}: PricingSummaryProps) {
  const [showDeliveryBreakdown, setShowDeliveryBreakdown] = useState(false);

  if (calculatingPricing) {
    return (
      <div className={`text-center text-base-content/60 ${compact ? "py-2 text-xs" : "py-4 text-sm"}`}>
        Calculating pricing...
      </div>
    );
  }

  if (pricing) {
    const deliveryBreakdown = pricing.deliveryFeeBreakdown ||
      (pricing as any).mealSessions?.[0]?.deliveryFeeBreakdown;
    const distanceInMiles = pricing.distanceInMiles ||
      (pricing as any).mealSessions?.[0]?.distanceInMiles;
    const backendPromos = pricing.appliedPromotions?.filter((p) => p.discount > 0) ?? [];

    return (
      <div className={`border-t border-base-300 ${compact ? "space-y-1.5 pt-3" : "space-y-2 pt-4"}`}>
        {/* Subtotal */}
        <div className={`flex justify-between text-base-content/70 ${compact ? "text-xs" : "text-sm"}`}>
          <span>Subtotal</span>
          <span>£{pricing.subtotal.toFixed(2)}</span>
        </div>

        {/* Promotion Discount */}
        {((pricing.promotionDiscount ?? 0) > 0) && (
          <div className={`flex justify-between text-green-600 font-semibold ${compact ? "text-xs" : "text-sm"}`}>
            <span>Restaurant Promotion{backendPromos.length > 1 ? "s" : ""}</span>
            <span>-£{pricing.promotionDiscount!.toFixed(2)}</span>
          </div>
        )}

        {/* Promo code discount */}
        {(pricing.promoDiscount ?? 0) > 0 && (
          <div className={`flex justify-between text-success font-medium ${compact ? "text-xs" : "text-sm"}`}>
            <span>Promo Code Discount</span>
            <span>-£{pricing.promoDiscount!.toFixed(2)}</span>
          </div>
        )}

        {/* Delivery fee */}
        <div className="space-y-1">
          <div className={`flex justify-between items-center text-base-content/70 gap-2 ${compact ? "text-xs" : "text-sm"}`}>
            <span className="whitespace-nowrap flex-shrink-0">Delivery Cost</span>
            <div className="flex items-center gap-1.5 min-w-0">
              {!distanceInMiles ? (
                onPlaceSelect ? (
                  <InlineAddressInput onPlaceSelect={onPlaceSelect} />
                ) : (
                  <span className="text-base-content/50 text-xs italic">Enter address for quote</span>
                )
              ) : (
                <>
                  {deliveryBreakdown && !compact && (
                    <button
                      onClick={() => setShowDeliveryBreakdown(!showDeliveryBreakdown)}
                      className="text-base-content/40 hover:text-base-content/70"
                      type="button"
                    >
                      <svg
                        className={`w-4 h-4 transition-transform ${showDeliveryBreakdown ? "rotate-180" : ""}`}
                        fill="none" stroke="currentColor" viewBox="0 0 24 24"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </button>
                  )}
                  <span>£{pricing.deliveryFee.toFixed(2)}</span>
                  {onClearAddress && (
                    <button
                      type="button"
                      onClick={onClearAddress}
                      className="text-base-content/40 hover:text-base-content/70 leading-none"
                      title="Change address"
                    >
                      ×
                    </button>
                  )}
                </>
              )}
            </div>
          </div>

          {showDeliveryBreakdown && (pricing as any).mealSessions && (
            <div className="pl-4 space-y-1 text-xs text-base-content/60">
              {(pricing as any).mealSessions.map((session: any, index: number) => (
                <div key={index} className="flex justify-between">
                  <span>{session.sessionName}:</span>
                  <span>£{session.deliveryFee.toFixed(2)}</span>
                </div>
              ))}
            </div>
          )}
          {deliveryBreakdown?.requiresCustomQuote && (
            <div className="mt-2 p-2 bg-warning/10 border border-warning/30 rounded text-warning-content">
              <p className="text-xs">⚠️ Delivery exceeds 6 miles. Final fee subject to review.</p>
            </div>
          )}
        </div>

        {/* Total */}
        <div className={`flex justify-between font-bold text-base-content border-t border-base-300 ${compact ? "text-sm pt-2" : "text-lg pt-3"}`}>
          <span>Total</span>
          <div className="text-right">
            {!distanceInMiles ? (
              <div>
                <p>£{pricing.subtotal.toFixed(2)}</p>
                <p className="text-xs font-normal text-base-content/50">+ delivery (address required)</p>
              </div>
            ) : (
              <>
                <p>£{pricing.total.toFixed(2)}</p>
                {(pricing.totalDiscount ?? 0) > 0 && (
                  <p className="text-xs line-through text-base-content/50">
                    £{(pricing.subtotal + pricing.deliveryFee).toFixed(2)}
                  </p>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    );
  }

  if (estimatedTotal !== undefined) {
    return (
      <div className="flex justify-between pt-4 border-t border-base-300">
        <span className="font-semibold text-base-content">Estimated Total:</span>
        <span className="font-bold text-xl text-base-content">£{estimatedTotal.toFixed(2)}</span>
      </div>
    );
  }

  return null;
}
