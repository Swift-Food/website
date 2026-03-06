import { useEffect, useRef, useState } from "react";
import { GOOGLE_MAPS_CONFIG } from "@/lib/constants/google-maps";
import { loadGoogleMapsScript } from "@/lib/utils/google-maps-loader";

interface AddressAutocompleteProps {
  onPlaceSelect: (place: google.maps.places.PlaceResult) => void;
  onClearAddress?: () => void;
  error?: string;
  hasValidAddress?: boolean;
}

export default function AddressAutocomplete({
  onPlaceSelect,
  onClearAddress,
  error,
  hasValidAddress,
}: AddressAutocompleteProps) {
  const autocompleteRef = useRef<google.maps.places.Autocomplete | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const [inputValue, setInputValue] = useState("");

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
        },
      );

      autocompleteRef.current.addListener("place_changed", () => {
        const place = autocompleteRef.current?.getPlace();
        if (place && place.geometry) {
          onPlaceSelect(place);
          setInputValue(inputRef.current?.value || "");
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

  const handleClear = () => {
    if (inputRef.current) {
      inputRef.current.value = "";
      setInputValue("");
    }
    if (onClearAddress) {
      onClearAddress();
    }
  };

  return (
    <div className="col-span-full">
      <label className="block text-[10px] font-bold text-base-content/60 uppercase tracking-widest mb-1.5">
        Search Address<span className="text-dark-pink ml-0.5">*</span>
      </label>
      <div className="relative">
        <input
          ref={inputRef}
          type="text"
          placeholder="Start typing an address..."
          onChange={(e) => setInputValue(e.target.value)}
          className={`w-full bg-gray-50 border rounded-lg px-4 py-2.5 text-sm text-base-content placeholder:text-base-content/50 focus:outline-none focus:ring-2 focus:ring-dark-pink/20 focus:border-dark-pink transition-all ${
            error
              ? "border-error"
              : hasValidAddress
                ? "border-success"
                : "border-base-300"
          }`}
        />
        {hasValidAddress && (
          <button
            type="button"
            onClick={handleClear}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-bold uppercase tracking-widest text-dark-pink hover:opacity-80"
          >
            Change
          </button>
        )}
      </div>
      {error && <p className="mt-1 text-xs text-error">{error}</p>}
      {hasValidAddress && !error && (
        <p className="mt-1 text-xs text-success">
          Address selected from Google
        </p>
      )}
      {!hasValidAddress && !error && (
        <p className="mt-1 text-xs text-base-content/60">
          Please select an address from the dropdown
        </p>
      )}
    </div>
  );
}
