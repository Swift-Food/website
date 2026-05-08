"use client";

import type { MealSessionPart } from "../types";
import type { UseCart } from "./useCart";
import { buildCategoryView, effectiveQty } from "./computeQty";

export interface CartSnapshotItem {
  name: string;
  quantity: number;
}

export interface CartSnapshotIntent {
  intentId: string;
  phrase: string;
  category: string | null;
  restaurantName: string;
  items: CartSnapshotItem[];
}

export interface CartSnapshot {
  headcount: number;
  intents: CartSnapshotIntent[];
}

/**
 * Snapshot the current frontend cart for the backend's intent-extractor
 * prompt. Computed values (qty, items in pick) come from effectiveQty so
 * the LLM sees the same numbers the user sees.
 *
 * Returns null when there's nothing meaningful to send (no meal,
 * headcount=0, or all intents empty). MVP supports the active meal
 * only — multi-meal snapshots are a separate plan.
 */
export function buildCartSnapshot(
  mealSessionParts: MealSessionPart[],
  activeMealSessionIndex: number,
  cart: UseCart,
): CartSnapshot | null {
  if (mealSessionParts.length === 0) return null;
  const ms =
    mealSessionParts.find(
      (m) => m.mealSessionIndex === activeMealSessionIndex,
    ) ?? mealSessionParts[0];
  const headcount = ms.guestCount ?? 0;
  if (headcount === 0) return null;

  // Pre-compute qty per item so each intent's snapshot is internally
  // consistent with the displayed cart.
  const qtyByItemKey = new Map<string, number>();
  const categoriesSeen = new Set<string | null>();
  for (const b of ms.intentBlocks) categoriesSeen.add(b.intent.category);
  for (const category of categoriesSeen) {
    const view = buildCategoryView(category, ms, cart.cart, cart.getSelectedRestaurantId);
    for (const entry of view) {
      const qty = effectiveQty({
        targetItem: entry.item,
        targetIntent: entry.intent,
        itemsInTargetPick: entry.itemsInPick,
        categoryView: view,
        headcount,
      });
      qtyByItemKey.set(`${entry.intent.intentId}::${entry.item.id}`, qty);
    }
  }

  const intents: CartSnapshotIntent[] = [];
  for (const block of ms.intentBlocks) {
    const selectedRestaurantId =
      cart.getSelectedRestaurantId(block.intentId) ??
      block.restaurantPicks[0]?.restaurant.id;
    if (!selectedRestaurantId) continue;
    const pick = block.restaurantPicks.find(
      (rp) => rp.restaurant.id === selectedRestaurantId,
    );
    if (!pick) continue;
    const cartIntent = cart.cart[block.intentId];
    const removedSet = new Set(cartIntent?.removedItemIds ?? []);
    const liveItems = [
      ...pick.items.filter((it) => !removedSet.has(it.id)),
      ...Object.values(cartIntent?.swappedIn ?? {}),
    ];
    const items = liveItems
      .map((it) => ({
        name: it.name,
        quantity: qtyByItemKey.get(`${block.intentId}::${it.id}`) ?? 0,
      }))
      .filter((i) => i.quantity > 0);

    if (items.length === 0) continue;
    intents.push({
      intentId: block.intentId,
      phrase: block.intent.phrase,
      category: block.intent.category,
      restaurantName: pick.restaurant.name,
      items,
    });
  }

  if (intents.length === 0) return null;
  return { headcount, intents };
}
