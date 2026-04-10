import { useAddressAutocomplete } from "@/lib/hooks/useAddressAutocomplete";

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
  const {
    inputRef,
    containerRef,
    query,
    setQuery,
    predictions,
    open,
    activeIndex,
    setActiveIndex,
    handleSelect,
    handleKeyDown,
    clear,
  } = useAddressAutocomplete(onPlaceSelect);

  const handleClear = () => {
    clear();
    if (onClearAddress) onClearAddress();
  };

  return (
    <div className="col-span-full" ref={containerRef}>
      <label className="block text-[10px] font-bold text-base-content/60 uppercase tracking-widest mb-1.5">
        Search Address<span className="text-dark-pink ml-0.5">*</span>
      </label>
      <div className="relative">
        <input
          ref={inputRef}
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Start typing an address..."
          autoComplete="new-password"
          className={`address-search-input w-full bg-gray-50 border rounded-lg px-4 py-2.5 text-sm text-base-content placeholder:text-base-content/50 focus:outline-none focus:ring-2 focus:ring-dark-pink/20 focus:border-dark-pink transition-all ${
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
            {predictions.map((p, idx) => (
              <button
                key={p.place_id}
                type="button"
                onMouseDown={(e) => { e.preventDefault(); handleSelect(p); }}
                onMouseEnter={() => setActiveIndex(idx)}
                className={`flex w-full items-start gap-2 px-3 py-2.5 text-left transition-colors ${idx === activeIndex ? "bg-base-100" : "hover:bg-base-100"}`}
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
