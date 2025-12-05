import { useEffect, useRef } from "react";
import { GOOGLE_MAPS_CONFIG } from "@/lib/constants/google-maps";
import { loadGoogleMapsScript } from "@/lib/utils/google-maps-loader";

interface AddressAutocompleteProps {
  onPlaceSelect: (place: google.maps.places.PlaceResult) => void;
  error?: string;
  hasValidAddress?: boolean;
}

export default function AddressAutocomplete({
  onPlaceSelect,
  error,
  hasValidAddress,
}: AddressAutocompleteProps) {
  const autocompleteRef = useRef<google.maps.places.Autocomplete | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const initAutocomplete = () => {
      if (!inputRef.current || !window.google?.maps?.places) {
        console.error("Google Maps Places not available");
        return;
      }

      autocompleteRef.current = new google.maps.places.Autocomplete(
        inputRef.current,
        {
          componentRestrictions: {
            country: GOOGLE_MAPS_CONFIG.COUNTRY_RESTRICTION,
          },
          fields: GOOGLE_MAPS_CONFIG.FIELDS,
        }
      );

      autocompleteRef.current.addListener("place_changed", () => {
        const place = autocompleteRef.current?.getPlace();
        if (place) {
          onPlaceSelect(place);
        }
      });
    };

    loadGoogleMapsScript().then(initAutocomplete);

    return () => {
      if (autocompleteRef.current) {
        google.maps.event.clearInstanceListeners(autocompleteRef.current);
      }
    };
  }, [onPlaceSelect]);

  return (
    <div className="mb-3">
      <label className="block text-xs font-semibold mb-2 text-base-content">
        Search Address
      </label>
      <input
        ref={inputRef}
        type="text"
        placeholder="Start typing to autofill..."
        className={`w-full px-3 py-2 text-sm bg-base-200/50 border rounded-lg focus:ring-2 focus:ring-dark-pink focus:border-transparent transition-all ${
          error ? "border-error" : "border-base-300"
        }`}
      />
      {error && <p className="mt-1 text-xs text-error">{error}</p>}
      {hasValidAddress && !error && (
        <p className="mt-1 text-xs text-success">✓ Address validated</p>
      )}
    </div>
  );
}
