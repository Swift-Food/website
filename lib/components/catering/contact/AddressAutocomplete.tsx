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
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const autocompleteServiceRef = useRef<google.maps.places.AutocompleteService | null>(null);
  const placesServiceRef = useRef<google.maps.places.PlacesService | null>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const [query, setQuery] = useState("");
  const [predictions, setPredictions] = useState<google.maps.places.AutocompletePrediction[]>([]);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    loadGoogleMapsScript().then(() => {
      if (!window.google?.maps?.places) return;
      autocompleteServiceRef.current = new google.maps.places.AutocompleteService();
      const div = document.createElement("div");
      placesServiceRef.current = new google.maps.places.PlacesService(div);
    });
  }, []);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
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

  const handleClear = () => {
    setQuery("");
    setPredictions([]);
    setOpen(false);
    if (onClearAddress) onClearAddress();
  };

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
    <div className="col-span-full" ref={containerRef}>
      <label className="block text-[10px] font-bold text-base-content/60 uppercase tracking-widest mb-1.5">
        Search Address<span className="text-dark-pink ml-0.5">*</span>
      </label>
      <div className="relative">
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Start typing an address..."
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
        {open && predictions.length > 0 && (
          <div className="absolute top-full left-0 right-0 mt-1 rounded-lg border border-base-200 bg-white shadow-lg overflow-hidden z-50">
            {predictions.map((p) => (
              <button
                key={p.place_id}
                type="button"
                onMouseDown={(e) => { e.preventDefault(); handleSelect(p); }}
                className="flex w-full items-start gap-2 px-3 py-2.5 text-left hover:bg-base-100 transition-colors"
              >
                <svg className="h-3.5 w-3.5 flex-shrink-0 text-base-content/40 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a2 2 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0zM15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                <div className="min-w-0">
                  <p className="text-sm font-medium text-base-content truncate">
                    {p.structured_formatting.main_text}
                  </p>
                  <p className="text-xs text-base-content/50 truncate">
                    {p.structured_formatting.secondary_text}
                  </p>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
      {error && <p className="mt-1 text-xs text-error">{error}</p>}
      {hasValidAddress && !error && (
        <p className="mt-1 text-xs text-success">Address selected</p>
      )}
      {!hasValidAddress && !error && (
        <p className="mt-1 text-xs text-base-content/60">
          Please select an address from the dropdown
        </p>
      )}
    </div>
  );
}
