"use client";

import { useEffect, useState } from "react";
import { fetchWithAuth } from "@/lib/api-client/auth-client";
import { API_BASE_URL, API_ENDPOINTS } from "@/lib/constants/api";

interface Snapshot {
  quantity: number | null;
  price: number | null;
}

/**
 * State + persistence for the Auto-Accept tab.
 *
 * Both thresholds are optional: null means "don't gate on this axis". A
 * restaurant that only sets a quantity limit still gets auto-accept for
 * qualifying orders. Save uses PATCH on the restaurant detail endpoint —
 * `autoAccept` is derived (true iff either threshold is set).
 */
export const useAutoAcceptState = (restaurantId: string) => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const [maxQuantity, setMaxQuantity] = useState<number | null>(null);
  const [maxPrice, setMaxPrice] = useState<number | null>(null);
  const [snapshot, setSnapshot] = useState<Snapshot | null>(null);

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetchWithAuth(
        `${API_BASE_URL}${API_ENDPOINTS.RESTAURANT_DETAILS(restaurantId)}`,
      );
      if (!res.ok) throw new Error("Failed to load restaurant details");
      const data = await res.json();
      const qty: number | null = data.maxAutoAcceptQuantity ?? null;
      const price: number | null = data.maxAutoAcceptPrice ?? null;
      setMaxQuantity(qty);
      setMaxPrice(price);
      setSnapshot({ quantity: qty, price });
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to load auto-accept settings");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [restaurantId]);

  const hasChanges =
    snapshot != null &&
    (snapshot.quantity !== maxQuantity || snapshot.price !== maxPrice);

  const save = async () => {
    setSaving(true);
    setError(null);
    setSuccess(null);
    try {
      const res = await fetchWithAuth(
        `${API_BASE_URL}${API_ENDPOINTS.RESTAURANT_DETAILS(restaurantId)}`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            maxAutoAcceptQuantity: maxQuantity,
            maxAutoAcceptPrice: maxPrice,
            autoAccept: maxQuantity !== null || maxPrice !== null,
          }),
        },
      );
      if (!res.ok) throw new Error("Failed to update auto-accept settings");
      setSnapshot({ quantity: maxQuantity, price: maxPrice });
      setSuccess("Auto-accept saved.");
      setTimeout(() => setSuccess(null), 3000);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to save");
    } finally {
      setSaving(false);
    }
  };

  return {
    loading,
    saving,
    error,
    success,
    hasChanges,

    maxQuantity,
    maxPrice,

    setMaxQuantity,
    setMaxPrice,

    save,
  };
};
