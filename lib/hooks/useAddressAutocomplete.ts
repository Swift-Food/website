import { useEffect, useRef, useState } from "react";
import { GOOGLE_MAPS_CONFIG } from "@/lib/constants/google-maps";
import { loadGoogleMapsScript } from "@/lib/utils/google-maps-loader";

export function useAddressAutocomplete(
  onPlaceSelect: (place: google.maps.places.PlaceResult) => void,
) {
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const autocompleteServiceRef = useRef<google.maps.places.AutocompleteService | null>(null);
  const placesServiceRef = useRef<google.maps.places.PlacesService | null>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const justSelectedRef = useRef(false);

  const [query, setQuery] = useState("");
  const [predictions, setPredictions] = useState<google.maps.places.AutocompletePrediction[]>([]);
  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);

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
    if (justSelectedRef.current) {
      justSelectedRef.current = false;
      return;
    }
    if (!query.trim() || !autocompleteServiceRef.current) {
      setPredictions([]);
      setActiveIndex(-1);
      setOpen(false);
      return;
    }
    debounceRef.current = setTimeout(() => {
      autocompleteServiceRef.current!.getPlacePredictions(
        { input: query, componentRestrictions: { country: GOOGLE_MAPS_CONFIG.COUNTRY_RESTRICTION } },
        (results, status) => {
          if (status === google.maps.places.PlacesServiceStatus.OK && results) {
            setPredictions(results);
            setActiveIndex(-1);
            setOpen(true);
          } else {
            setPredictions([]);
            setActiveIndex(-1);
            setOpen(false);
          }
        },
      );
    }, 250);
    return () => { if (debounceRef.current) clearTimeout(debounceRef.current); };
  }, [query]);

  const handleSelect = (prediction: google.maps.places.AutocompletePrediction) => {
    justSelectedRef.current = true;
    setOpen(false);
    setActiveIndex(-1);
    setPredictions([]);
    setQuery(prediction.description);
    placesServiceRef.current?.getDetails(
      { placeId: prediction.place_id, fields: GOOGLE_MAPS_CONFIG.FIELDS },
      (place, status) => {
        if (status === google.maps.places.PlacesServiceStatus.OK && place?.geometry) {
          onPlaceSelect(place);
        }
      },
    );
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!open || predictions.length === 0) return;
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveIndex((i) => Math.min(i + 1, predictions.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIndex((i) => Math.max(i - 1, 0));
    } else if (e.key === "Enter") {
      if (activeIndex >= 0) {
        e.preventDefault();
        handleSelect(predictions[activeIndex]);
      }
    } else if (e.key === "Escape") {
      setOpen(false);
      setActiveIndex(-1);
    }
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

  const clear = () => {
    setQuery("");
    setPredictions([]);
    setActiveIndex(-1);
    setOpen(false);
  };

  return {
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
  };
}
