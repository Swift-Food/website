"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Loader, MapPin, Star, Trash2 } from "lucide-react";
import { AuthAlert } from "./AuthAlert";
import { AuthField } from "./AuthField";
import { AuthSubmitButton } from "./AuthSubmitButton";
import { customerAddressApi } from "@/services/api/customer-address.api";
import { loadGoogleMapsScript } from "@/lib/utils/google-maps-loader";
import {
  AUTOCOMPLETE_OPTIONS,
  parsePlaceResult,
  type ParsedPlace,
} from "@/lib/utils/parse-place-result";
import { CustomerAddress } from "@/types/api/customer-address.api.types";

const fullLine = (address: CustomerAddress): string =>
  [address.addressLine1, address.addressLine2, address.city, address.zipcode]
    .filter(Boolean)
    .join(", ");

const AddressRow = ({
  address,
  onMakeDefault,
  onDelete,
  busy,
}: {
  address: CustomerAddress;
  onMakeDefault: (address: CustomerAddress) => void;
  onDelete: (address: CustomerAddress) => void;
  busy: boolean;
}) => (
  <div className="flex flex-wrap items-center justify-between gap-4 py-5 border-b border-gray-100 last:border-b-0">
    <div className="min-w-0">
      <div className="flex items-center gap-3">
        <p className="font-medium text-black truncate">
          {address.name || address.addressLine1}
        </p>
        {address.isDefault && (
          <span className="shrink-0 font-mono text-[10px] font-bold tracking-[0.12em] uppercase text-primary">
            Default
          </span>
        )}
      </div>
      <p className="text-sm text-gray-400 font-light">{fullLine(address)}</p>
    </div>

    <div className="flex items-center gap-5 shrink-0">
      {!address.isDefault && (
        <button
          onClick={() => onMakeDefault(address)}
          disabled={busy}
          className="inline-flex items-center gap-1.5 font-mono text-[10px] font-bold tracking-[0.12em] uppercase text-gray-400 hover:text-primary disabled:opacity-40 transition-colors"
        >
          <Star size={12} />
          Default
        </button>
      )}
      <button
        onClick={() => onDelete(address)}
        disabled={busy}
        className="inline-flex items-center gap-1.5 font-mono text-[10px] font-bold tracking-[0.12em] uppercase text-gray-400 hover:text-red-500 disabled:opacity-40 transition-colors"
      >
        <Trash2 size={12} />
        Remove
      </button>
    </div>
  </div>
);

export const AddressBookSection = ({ userId }: { userId: string }) => {
  const [addresses, setAddresses] = useState<CustomerAddress[]>([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const [adding, setAdding] = useState(false);
  const [picked, setPicked] = useState<ParsedPlace | null>(null);
  const [name, setName] = useState("");

  const inputRef = useRef<HTMLInputElement>(null);
  const autocompleteRef = useRef<google.maps.places.Autocomplete | null>(null);

  const load = useCallback(async () => {
    try {
      setAddresses(await customerAddressApi.list(userId));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not load your addresses.");
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    void load();
  }, [load]);

  // Bound once the form is open, since the input does not exist before that.
  useEffect(() => {
    if (!adding) return;
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
          setError("Pick an address from the list so we get its exact location.");
          return;
        }
        setError("");
        setName((current) => current || parsed.addressLine1);
      });
    });

    return () => {
      cancelled = true;
      autocompleteRef.current = null;
    };
  }, [adding]);

  const resetForm = () => {
    setAdding(false);
    setPicked(null);
    setName("");
    if (inputRef.current) inputRef.current.value = "";
  };

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!picked) return;
    setError("");
    setBusy(true);
    try {
      await customerAddressApi.create({
        name: name.trim() || picked.addressLine1,
        addressLine1: picked.addressLine1,
        city: picked.city,
        zipcode: picked.zipcode,
        placeId: picked.placeId,
        location: picked.location,
        isDefault: addresses.length === 0,
      });
      resetForm();
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not save this address.");
    } finally {
      setBusy(false);
    }
  };

  const runAction = async (action: () => Promise<unknown>, fallback: string) => {
    setError("");
    setBusy(true);
    try {
      await action();
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : fallback);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="bg-white border border-gray-100 rounded-[32px] p-8 md:p-10 shadow-[0_24px_60px_rgba(0,0,0,0.03)]">
      <div className="flex items-start justify-between gap-6 mb-2">
        <h2 className="text-xs font-black uppercase tracking-widest text-black">
          Delivery addresses
        </h2>
        {!adding && (
          <button
            onClick={() => setAdding(true)}
            className="shrink-0 font-mono text-[10px] font-bold tracking-[0.12em] uppercase border-b border-primary text-primary pb-0.5 hover:text-black hover:border-black transition-colors"
          >
            Add
          </button>
        )}
      </div>
      <p className="text-sm text-gray-400 font-light mb-8">
        Pick one at checkout instead of typing it out each time.
      </p>

      {error && (
        <div className="mb-6">
          <AuthAlert tone="error" message={error} />
        </div>
      )}

      {loading && (
        <div className="py-4 flex justify-center">
          <Loader size={20} className="animate-spin text-gray-300" />
        </div>
      )}

      {!loading && !addresses.length && !adding && (
        <p className="text-sm text-gray-400 font-light">
          No saved addresses yet. We will offer to keep the next one you order to.
        </p>
      )}

      {!loading && addresses.length > 0 && (
        <div className="mb-4">
          {addresses.map((address) => (
            <AddressRow
              key={address.id}
              address={address}
              busy={busy}
              onMakeDefault={(a) =>
                runAction(
                  () => customerAddressApi.update(a.id, { isDefault: true }),
                  "Could not update this address."
                )
              }
              onDelete={(a) =>
                runAction(
                  () => customerAddressApi.remove(a.id),
                  "Could not delete this address."
                )
              }
            />
          ))}
        </div>
      )}

      {adding && (
        <form onSubmit={handleAdd} className="space-y-8 pt-4">
          <div className="space-y-2">
            <label
              htmlFor="address-search"
              className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1 flex items-center gap-2"
            >
              <MapPin size={12} />
              Search for the address
            </label>
            <input
              id="address-search"
              ref={inputRef}
              type="text"
              placeholder="Start typing, then pick from the list"
              className="w-full bg-white border-transparent border-b-2 border-b-gray-100 px-0 py-4 outline-none focus:outline-none focus:border-b-primary transition-colors text-black font-medium"
            />
            {picked && (
              <p className="text-xs text-gray-400 ml-1">
                {[picked.addressLine1, picked.city, picked.zipcode]
                  .filter(Boolean)
                  .join(", ")}
              </p>
            )}
          </div>

          <AuthField
            label="Name this address"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Head office"
          />

          <AuthSubmitButton
            label="Save Address"
            pendingLabel="Saving…"
            pending={busy}
            disabled={!picked}
          />

          <button
            type="button"
            onClick={resetForm}
            className="w-full text-center font-mono text-[10px] font-bold tracking-[0.12em] uppercase text-gray-400 hover:text-primary transition-colors"
          >
            Cancel
          </button>
        </form>
      )}
    </div>
  );
};
