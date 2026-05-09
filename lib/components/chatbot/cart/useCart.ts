"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { IntentBlockItem, MealSessionPart } from "../types";

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
  /**
   * After a chat response, match old cart entries to the new intent
   * lineup by (phrase, category). Keeps cart state for surviving
   * intents, drops state for vanished intents, leaves new intents
   * empty (defaults will compute fresh). When an intent's count
   * changed turn-over-turn (LLM emitted a new explicit count), drop
   * its qtyOverrides — the user just verbally re-set the ratio.
   */
  reconcile: (args: {
    prevMealSessions: MealSessionPart[];
    nextMealSessions: MealSessionPart[];
  }) => void;
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

  const reconcile = useCallback(
    (args: {
      prevMealSessions: MealSessionPart[];
      nextMealSessions: MealSessionPart[];
    }) => {
      const { prevMealSessions, nextMealSessions } = args;

      // Map every prev intent's stable identity (phrase + category)
      // → its UUID + count. The validator regenerates intentIds on
      // every LLM turn, so phrase+category is the only stable signal.
      type PrevHit = { oldIntentId: string; oldQuantity: number | null };
      const prevByKey = new Map<string, PrevHit>();
      for (const ms of prevMealSessions) {
        for (const b of ms.intentBlocks) {
          prevByKey.set(matchKey(b.intent.phrase, b.intent.category), {
            oldIntentId: b.intentId,
            oldQuantity: b.intent.quantity,
          });
        }
      }

      setCart((prev) => {
        const next: CartState = {};
        for (const ms of nextMealSessions) {
          for (const b of ms.intentBlocks) {
            const matched = prevByKey.get(matchKey(b.intent.phrase, b.intent.category));
            if (!matched) continue; // brand-new intent — fresh defaults will compute
            const prevEntry = prev[matched.oldIntentId];
            if (!prevEntry) continue;
            // If the LLM just emitted a NEW quantity for this intent
            // (was null before OR a different number), the user just
            // verbally re-set their pack count — drop per-item qty
            // overrides so the new quantity actually drives display.
            // Restaurant selection + removed items + swaps stay.
            const llmReSetQuantity =
              b.intent.quantity != null && b.intent.quantity !== matched.oldQuantity;
            next[b.intentId] = llmReSetQuantity
              ? { ...prevEntry, qtyOverrides: {} }
              : prevEntry;
          }
        }
        return next;
      });
    },
    [],
  );

  return useMemo(
    () => ({
      cart,
      getSelectedRestaurantId,
      setRestaurant,
      setQty,
      removeItem,
      swap,
      reset,
      reconcile,
    }),
    [cart, getSelectedRestaurantId, setRestaurant, setQty, removeItem, swap, reset, reconcile],
  );
}

function matchKey(phrase: string, category: string | null): string {
  return `${category ?? "null"}::${phrase.trim().toLowerCase()}`;
}

function omitKey<T extends object>(obj: T, key: string): T {
  if (!(key in obj)) return obj;
  const next = { ...obj } as Record<string, unknown>;
  delete next[key];
  return next as T;
}
