"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { IntentBlockItem } from "../types";

const STORAGE_KEY_PREFIX = "swift-food-cart-";

/**
 * Per-intent cart state. Stored as plain objects so the whole tree
 * round-trips through JSON.stringify cleanly into localStorage.
 *
 * `selectedRestaurantId` defaults to `null` meaning "use the IntentBlock's
 * default pick (restaurantPicks[0])". The first time the user clicks an
 * alt chip, this becomes a real id.
 *
 * `qtyOverrides` is a sparse map: an entry only exists when the user has
 * manually changed an item's qty. Otherwise the renderer falls back to
 * computeDefaultQty.
 *
 * `removedItemIds` lists items the user explicitly removed from the
 * displayed pick. Items swapped IN (via swap) are added to `swappedIn`
 * keyed by the OLD item's id (so the slot that used to show the old
 * item now shows the replacement).
 */
export interface CartIntent {
  selectedRestaurantId: string | null;
  qtyOverrides: Record<string, number>;
  removedItemIds: string[];
  swappedIn: Record<string, IntentBlockItem & { swappedOutId: string }>;
}

export type CartState = Record<string /* intentId */, CartIntent>;

const emptyIntent = (): CartIntent => ({
  selectedRestaurantId: null,
  qtyOverrides: {},
  removedItemIds: [],
  swappedIn: {},
});

export interface UseCart {
  cart: CartState;
  /** The restaurant the user picked for an intent, or null = use default. */
  getSelectedRestaurantId: (intentId: string) => string | null;
  /** Set the selected restaurant for an intent. Resets qty/remove/swap state for the intent. */
  setRestaurant: (intentId: string, restaurantId: string) => void;
  /** Override qty for an item; pass undefined to reset to default. */
  setQty: (intentId: string, itemId: string, quantity: number | undefined) => void;
  /** Mark an item as removed from this intent. */
  removeItem: (intentId: string, itemId: string) => void;
  /** Record a swap: hide the old item, render the replacement in its slot. */
  swap: (
    intentId: string,
    oldItemId: string,
    replacement: IntentBlockItem,
  ) => void;
  /** Reset the entire cart for this session (called on Start fresh). */
  reset: () => void;
}

export function useCart(sessionId: string | null): UseCart {
  const [cart, setCart] = useState<CartState>({});
  const loadedSessionIdRef = useRef<string | null>(null);

  // Load cart from localStorage when sessionId changes (mount or new session).
  useEffect(() => {
    if (!sessionId || typeof window === "undefined") return;
    if (loadedSessionIdRef.current === sessionId) return;
    loadedSessionIdRef.current = sessionId;
    const raw = window.localStorage.getItem(STORAGE_KEY_PREFIX + sessionId);
    if (!raw) {
      setCart({});
      return;
    }
    try {
      const parsed = JSON.parse(raw) as CartState;
      setCart(parsed && typeof parsed === "object" ? parsed : {});
    } catch {
      setCart({});
    }
  }, [sessionId]);

  // Persist on every cart change. Skip writes when sessionId hasn't loaded yet.
  useEffect(() => {
    if (!sessionId || typeof window === "undefined") return;
    if (loadedSessionIdRef.current !== sessionId) return;
    window.localStorage.setItem(
      STORAGE_KEY_PREFIX + sessionId,
      JSON.stringify(cart),
    );
  }, [cart, sessionId]);

  const mutate = useCallback(
    (intentId: string, fn: (prev: CartIntent) => CartIntent) => {
      setCart((prev) => ({
        ...prev,
        [intentId]: fn(prev[intentId] ?? emptyIntent()),
      }));
    },
    [],
  );

  const getSelectedRestaurantId = useCallback(
    (intentId: string): string | null =>
      cart[intentId]?.selectedRestaurantId ?? null,
    [cart],
  );

  const setRestaurant = useCallback(
    (intentId: string, restaurantId: string) => {
      // Switching restaurant resets qty overrides + removals + swaps —
      // they were tied to the previous restaurant's items.
      mutate(intentId, () => ({
        selectedRestaurantId: restaurantId,
        qtyOverrides: {},
        removedItemIds: [],
        swappedIn: {},
      }));
    },
    [mutate],
  );

  const setQty = useCallback(
    (intentId: string, itemId: string, quantity: number | undefined) => {
      mutate(intentId, (prev) => {
        const next = { ...prev.qtyOverrides };
        if (quantity === undefined) delete next[itemId];
        else next[itemId] = quantity;
        return { ...prev, qtyOverrides: next };
      });
    },
    [mutate],
  );

  const removeItem = useCallback(
    (intentId: string, itemId: string) => {
      mutate(intentId, (prev) => ({
        ...prev,
        removedItemIds: prev.removedItemIds.includes(itemId)
          ? prev.removedItemIds
          : [...prev.removedItemIds, itemId],
        qtyOverrides: omitKey(prev.qtyOverrides, itemId),
        swappedIn: omitKey(prev.swappedIn, itemId),
      }));
    },
    [mutate],
  );

  const swap = useCallback(
    (intentId: string, oldItemId: string, replacement: IntentBlockItem) => {
      mutate(intentId, (prev) => ({
        ...prev,
        // Hide the old item via removedItemIds; render the new one in
        // its slot via swappedIn keyed by the OLD id.
        removedItemIds: prev.removedItemIds.includes(oldItemId)
          ? prev.removedItemIds
          : [...prev.removedItemIds, oldItemId],
        swappedIn: {
          ...prev.swappedIn,
          [oldItemId]: { ...replacement, swappedOutId: oldItemId },
        },
      }));
    },
    [mutate],
  );

  const reset = useCallback(() => {
    setCart({});
    if (sessionId && typeof window !== "undefined") {
      window.localStorage.removeItem(STORAGE_KEY_PREFIX + sessionId);
    }
  }, [sessionId]);

  return useMemo(
    () => ({
      cart,
      getSelectedRestaurantId,
      setRestaurant,
      setQty,
      removeItem,
      swap,
      reset,
    }),
    [cart, getSelectedRestaurantId, setRestaurant, setQty, removeItem, swap, reset],
  );
}

function omitKey<T extends object>(obj: T, key: string): T {
  if (!(key in obj)) return obj;
  const next = { ...obj } as Record<string, unknown>;
  delete next[key];
  return next as T;
}
