"use client";

import { useEffect, useRef, useState } from "react";
import { MapPin } from "lucide-react";
import { AuthField } from "./AuthField";
import { AuthSubmitButton } from "./AuthSubmitButton";
import { loadGoogleMapsScript } from "@/lib/utils/google-maps-loader";
import {
  AUTOCOMPLETE_OPTIONS,
  parsePlaceResult,
  type ParsedPlace,
} from "@/lib/utils/parse-place-result";
import {
  CreateCustomerAddress,
  CustomerAddress,
} from "@/types/api/customer-address.api.types";

interface AddressFormProps {
  /** Present when editing; absent when adding. */
  address?: CustomerAddress;
  saving: boolean;
  onSubmit: (values: Partial<CreateCustomerAddress>) => void;
  onCancel: () => void;
  onError: (message: string) => void;
}

const currentLine = (address: CustomerAddress): string =>
  [address.addressLine1, address.city, address.zipcode].filter(Boolean).join(", ");

/**
 * Add or edit one saved address.
 *
 * The street, city and postcode are never typed: they arrive from Google Places
 * together with the coordinates that make an address usable for delivery-range
 * checks. Editing them means re-picking, so the two can never drift apart. Name
 * and line 2 are free text, since neither affects the location.
 */
export const AddressForm = ({
  address,
  saving,
  onSubmit,
  onCancel,
  onError,
}: AddressFormProps) => {
  const isEdit = !!address;

  // What the customer calls it. Prefilled from whatever Google names the
  // place, but theirs to change - it is the only name they ever see.
  const [label, setLabel] = useState(address?.label ?? address?.name ?? "");
  const [line2, setLine2] = useState(address?.addressLine2 ?? "");
  const [picked, setPicked] = useState<ParsedPlace | null>(null);

  const inputRef = useRef<HTMLInputElement>(null);
  const autocompleteRef = useRef<google.maps.places.Autocomplete | null>(null);

  useEffect(() => {
    let cancelled = false;

    void loadGoogleMapsScript().then(() => {
      if (cancelled || !inputRef.current || !window.google?.maps?.places) return;
      autocompleteRef.current = new google.maps.places.Autocomplete(
        inputRef.current,
        AUTOCOMPLETE_OPTIONS
      );
      autocompleteRef.current.addListener("place_changed", () => {
        const parsed = parsePlaceResult(autocompleteRef.current?.getPlace());
        setPicked(parsed);
        if (!parsed) {
          onError("Pick an address from the list so we get its exact location.");
          return;
        }
        onError("");
        setLabel((current) => current || parsed.placeName || parsed.addressLine1);
      });
    });

    return () => {
      cancelled = true;
      autocompleteRef.current = null;
    };
    // Bound once per mount; the callbacks are stable enough for a one-shot bind.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Adding needs a place before there is anything to save. Editing already has
  // one, so a name or line-2 change is enough on its own.
  const canSubmit = isEdit || !!picked;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSubmit) return;

    onSubmit({
      label: label.trim() || picked?.addressLine1 || address?.addressLine1 || "",
      // Google's own name for the place, kept for reference and never shown.
      ...(picked ? { name: picked.placeName || picked.addressLine1 } : {}),
      addressLine2: line2.trim() || undefined,
      ...(picked
        ? {
            addressLine1: picked.addressLine1,
            city: picked.city,
            zipcode: picked.zipcode,
            placeId: picked.placeId,
            location: picked.location,
          }
        : {}),
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8 pt-4">
      <div className="space-y-2">
        <label
          htmlFor="address-search"
          className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1 flex items-center gap-2"
        >
          <MapPin size={12} />
          {isEdit ? "Replace the address" : "Search for the address"}
        </label>
        <input
          id="address-search"
          ref={inputRef}
          type="text"
          placeholder={
            isEdit ? "Search to change it, or leave it as it is" : "Start typing, then pick from the list"
          }
          className="w-full bg-white border-transparent border-b-2 border-b-gray-100 px-0 py-4 outline-none focus:outline-none focus:border-b-primary transition-colors text-black font-medium"
        />
        <p className="text-xs text-gray-400 ml-1">
          {picked
            ? [picked.addressLine1, picked.city, picked.zipcode].filter(Boolean).join(", ")
            : address
              ? currentLine(address)
              : ""}
        </p>
      </div>

      <AuthField
        label="Address Line 2"
        type="text"
        autoComplete="address-line2"
        value={line2}
        onChange={(e) => setLine2(e.target.value)}
        placeholder="Flat, suite, floor (optional)"
      />

      <AuthField
        label="Name this address"
        type="text"
        value={label}
        onChange={(e) => setLabel(e.target.value)}
        placeholder="Home, Head office, The studio"
      />

      <AuthSubmitButton
        label={isEdit ? "Save Changes" : "Save Address"}
        pendingLabel="Saving…"
        pending={saving}
        disabled={!canSubmit}
      />

      <button
        type="button"
        onClick={onCancel}
        className="w-full text-center font-mono text-[10px] font-bold tracking-[0.12em] uppercase text-gray-400 hover:text-primary transition-colors"
      >
        Cancel
      </button>
    </form>
  );
};
