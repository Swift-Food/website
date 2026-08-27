"use client";

import { useCallback, useEffect, useState } from "react";
import { Loader, Pencil, Star, Trash2 } from "lucide-react";
import { AddressForm } from "./AddressForm";
import { AuthAlert } from "./AuthAlert";
import { customerAddressApi } from "@/services/api/customer-address.api";
import {
  CreateCustomerAddress,
  CustomerAddress,
} from "@/types/api/customer-address.api.types";

const fullLine = (address: CustomerAddress): string =>
  [address.addressLine1, address.addressLine2, address.city, address.zipcode]
    .filter(Boolean)
    .join(", ");

const AddressRow = ({
  address,
  busy,
  onEdit,
  onMakeDefault,
  onDelete,
}: {
  address: CustomerAddress;
  busy: boolean;
  onEdit: (address: CustomerAddress) => void;
  onMakeDefault: (address: CustomerAddress) => void;
  onDelete: (address: CustomerAddress) => void;
}) => (
  <div className="flex flex-wrap items-center justify-between gap-4 py-5 border-b border-gray-100 last:border-b-0">
    <div className="min-w-0">
      <div className="flex items-center gap-3">
        <p className="font-medium text-black truncate">
          {address.label || address.name || address.addressLine1}
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
      <button
        onClick={() => onEdit(address)}
        disabled={busy}
        className="inline-flex items-center gap-1.5 font-mono text-[10px] font-bold tracking-[0.12em] uppercase text-gray-400 hover:text-primary disabled:opacity-40 transition-colors"
      >
        <Pencil size={12} />
        Edit
      </button>
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

  // null = closed, "new" = adding, otherwise the address being edited.
  const [editing, setEditing] = useState<CustomerAddress | "new" | null>(null);

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

  const runAction = async (action: () => Promise<unknown>, fallback: string) => {
    setError("");
    setBusy(true);
    try {
      await action();
      setEditing(null);
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : fallback);
    } finally {
      setBusy(false);
    }
  };

  const handleSubmit = (values: Partial<CreateCustomerAddress>) => {
    if (editing === "new") {
      void runAction(
        () =>
          customerAddressApi.create({
            ...(values as CreateCustomerAddress),
            isDefault: addresses.length === 0,
          }),
        "Could not save this address."
      );
      return;
    }
    if (editing) {
      const id = editing.id;
      void runAction(
        () => customerAddressApi.update(id, values),
        "Could not update this address."
      );
    }
  };

  return (
    <div className="bg-white border border-gray-100 rounded-[32px] p-8 md:p-10 shadow-[0_24px_60px_rgba(0,0,0,0.03)]">
      <div className="flex items-start justify-between gap-6 mb-8">
        <h2 className="text-xs font-black uppercase tracking-widest text-black">
          Saved addresses
        </h2>
        {!editing && (
          <button
            onClick={() => setEditing("new")}
            className="shrink-0 font-mono text-[10px] font-bold tracking-[0.12em] uppercase border-b border-primary text-primary pb-0.5 hover:text-black hover:border-black transition-colors"
          >
            Add
          </button>
        )}
      </div>

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

      {!loading && !addresses.length && !editing && (
        <p className="text-sm text-gray-400 font-light">
          No saved addresses yet. We will offer to keep the next one you order to.
        </p>
      )}

      {!loading && addresses.length > 0 && !editing && (
        <div>
          {addresses.map((address) => (
            <AddressRow
              key={address.id}
              address={address}
              busy={busy}
              onEdit={(a) => {
                setError("");
                setEditing(a);
              }}
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

      {editing && (
        <AddressForm
          // Remounts per target so the fields reset between add and edit.
          key={editing === "new" ? "new" : editing.id}
          address={editing === "new" ? undefined : editing}
          saving={busy}
          onSubmit={handleSubmit}
          onCancel={() => {
            setError("");
            setEditing(null);
          }}
          onError={setError}
        />
      )}
    </div>
  );
};
