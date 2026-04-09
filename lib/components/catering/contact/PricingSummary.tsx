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
  const containerRef = useRef<HTMLDivElement>(null);
  const autocompleteServiceRef = useRef<google.maps.places.AutocompleteService | null>(null);
  const placesServiceRef = useRef<google.maps.places.PlacesService | null>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const justSelectedRef = useRef(false);

  const [query, setQuery] = useState("");
  const [predictions, setPredictions] = useState<google.maps.places.AutocompletePrediction[]>([]);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    loadGoogleMapsScript().then(() => {
      if (!window.google?.maps?.places) return;
      autocompleteServiceRef.current = new google.maps.places.AutocompleteService();
      // PlacesService needs a DOM node
      const div = document.createElement("div");
      placesServiceRef.current = new google.maps.places.PlacesService(div);
    });
  }, []);

  // Fetch predictions with debounce
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (justSelectedRef.current) {
      justSelectedRef.current = false;
      return;
    }
    if (!query.trim() || !autocompleteServiceRef.current) {
      setPredictions([]);
      setOpen(false);
      return;
    }
    debounceRef.current = setTimeout(() => {
      autocompleteServiceRef.current!.getPlacePredictions(
        { input: query, componentRestrictions: { country: GOOGLE_MAPS_CONFIG.COUNTRY_RESTRICTION } },
        (results, status) => {
          if (status === google.maps.places.PlacesServiceStatus.OK && results) {
            setPredictions(results);
            setOpen(true);
          } else {
            setPredictions([]);
            setOpen(false);
          }
        }
      );
    }, 250);
    return () => { if (debounceRef.current) clearTimeout(debounceRef.current); };
  }, [query]);

  const handleSelect = (prediction: google.maps.places.AutocompletePrediction) => {
    justSelectedRef.current = true;
    setOpen(false);
    setPredictions([]);
    setQuery(prediction.description);
    placesServiceRef.current?.getDetails(
      { placeId: prediction.place_id, fields: GOOGLE_MAPS_CONFIG.FIELDS },
      (place, status) => {
        if (status === google.maps.places.PlacesServiceStatus.OK && place?.geometry) {
          onPlaceSelect(place);
        }
      }
    );
  };

  // Close on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  return (
    <div ref={containerRef} className="relative mt-1.5 pt-1.5 border-t border-base-200">
      <div className="flex items-center gap-1.5">
        <svg className="h-3 w-3 flex-shrink-0 text-base-content/30" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a2 2 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0zM15 11a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
        <input
          ref={inputRef}
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Enter address for accurate cost"
          autoComplete="new-password"
          className="flex-1 text-xs bg-transparent outline-none placeholder:text-base-content/40 text-base-content min-w-0"
        />
      </div>
      {open && predictions.length > 0 && (
        <div className="absolute bottom-full left-0 right-0 mb-1 rounded-lg border border-base-200 bg-white shadow-lg overflow-hidden z-50">
          {predictions.map((p) => (
            <button
              key={p.place_id}
              type="button"
              onMouseDown={(e) => { e.preventDefault(); handleSelect(p); }}
              className="flex w-full items-start gap-2 px-3 py-2 text-left hover:bg-base-100 transition-colors"
            >
              <svg className="h-3 w-3 flex-shrink-0 text-base-content/40 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a2 2 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0zM15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              <div className="min-w-0">
                <p className="text-xs font-medium text-base-content truncate">
                  {p.structured_formatting.main_text}
                </p>
                <p className="text-[10px] text-base-content/50 truncate">
                  {p.structured_formatting.secondary_text}
                </p>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
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
              {!distanceInMiles && onPlaceSelect && (
                <span className="text-base-content/40 text-xs italic">(min)</span>
              )}
              {distanceInMiles && onClearAddress && (
                <button
                  type="button"
                  onClick={onClearAddress}
                  className="text-base-content/40 hover:text-base-content/70 leading-none"
                  title="Change address"
                >
                  ×
                </button>
              )}
            </div>
          </div>

          {!distanceInMiles && onPlaceSelect && (
            <InlineAddressInput onPlaceSelect={onPlaceSelect} />
          )}
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
            <p>£{pricing.total.toFixed(2)}</p>
            {(pricing.totalDiscount ?? 0) > 0 && (
              <p className="text-xs line-through font-normal text-base-content/50">
                £{(pricing.subtotal + pricing.deliveryFee).toFixed(2)}
              </p>
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
