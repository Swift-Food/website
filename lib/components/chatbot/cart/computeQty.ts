"use client";

import type { IntentBlockItem, IntentBlockPart, MealSessionPart } from "../types";
import type { CartState } from "./useCart";

/**
 * Per-category target = headcount × 1.0 (one serving per person per
 * meal-category — research-backed default, no magic weights).
 *
 * This module owns the math that converts a meal's intents + cart
 * state into per-item display quantities. Math runs in SERVINGS space,
 * then converts to PACKS at the end via feedsPerUnit + cateringQuantityUnit.
 *
 * Headcount is distributed by floor + remainder so the per-category
 * sum equals headcount exactly:
 *   50 ppl across 3 intents = 17, 17, 16 (not 17, 17, 17 = 51).
 *
 * Manual user overrides + LLM-emitted intent.count are "explicit
 * claims" — they consume a slice of the category target. Non-explicit
 * items split the remainder evenly. Stable sort by (intentId, itemId)
 * keeps the +1-remainder allocation deterministic across re-renders.
 */

export interface CategoryViewEntry {
  item: IntentBlockItem;
  intent: { intentId: string; count: number | null };
  /** How many items are currently displayed in this entry's intent's
   *  pick (post-removal/swap). Cached so distribution math doesn't
   *  re-derive it per item. */
  itemsInPick: number;
  /** User's per-item qty override from cart state, if any. */
  overrideQty: number | undefined;
}

/**
 * Walk one meal session's intent blocks, materialise each entry's
 * displayed items + cart state, and return a flat list filtered to
 * `category`. Used by both `effectiveQty` and warning/snapshot helpers
 * so they all see the same picture.
 */
export function buildCategoryView(
  category: string | null,
  mealSession: MealSessionPart,
  cart: CartState,
  resolveSelectedRestaurantId: (intentId: string) => string | null,
): CategoryViewEntry[] {
  const view: CategoryViewEntry[] = [];
  for (const block of mealSession.intentBlocks) {
    if (block.intent.category !== category) continue;
    const selectedRestaurantId =
      resolveSelectedRestaurantId(block.intentId) ??
      block.restaurantPicks[0]?.restaurant.id ??
      null;
    if (!selectedRestaurantId) continue;
    const pick = block.restaurantPicks.find(
      (rp) => rp.restaurant.id === selectedRestaurantId,
    );
    if (!pick) continue;
    const cartIntent = cart[block.intentId];
    const removedSet = new Set(cartIntent?.removedItemIds ?? []);
    const liveItems: IntentBlockItem[] = [
      ...pick.items.filter((it) => !removedSet.has(it.id)),
      ...Object.values(cartIntent?.swappedIn ?? {}),
    ];
    const itemsInPick = liveItems.length;
    for (const item of liveItems) {
      view.push({
        item,
        intent: { intentId: block.intentId, count: block.intent.count },
        itemsInPick,
        overrideQty: cartIntent?.qtyOverrides[item.id],
      });
    }
  }
  return view;
}

/**
 * Returns the qty (in PACKS) for `targetItem` under the running-
 * redistribution model. See module doc for the algorithm.
 */
export function effectiveQty(args: {
  targetItem: IntentBlockItem;
  targetIntent: { intentId: string; count: number | null };
  itemsInTargetPick: number;
  /** Every visible item from every intent in the SAME mealCategory. */
  categoryView: CategoryViewEntry[];
  headcount: number;
}): number {
  const { targetItem, targetIntent, itemsInTargetPick, categoryView, headcount } = args;

  // 1) Direct override wins above everything.
  const targetEntry = categoryView.find(
    (e) => e.item.id === targetItem.id && e.intent.intentId === targetIntent.intentId,
  );
  if (targetEntry?.overrideQty !== undefined) return targetEntry.overrideQty;

  // 2) LLM hard count — split evenly across this intent's items-in-pick.
  if (targetIntent.count != null) {
    const sharePerItem = Math.ceil(
      targetIntent.count / Math.max(1, itemsInTargetPick),
    );
    return packsFromServings(sharePerItem * targetItem.feedsPerUnit, targetItem);
  }

  // 3) Default share — floor + remainder distribution. Compute claims
  //    in servings (so an override of 5 packs of a feeds-4 bundle counts
  //    as 20 servings, not 5).
  const targetServings = Math.max(0, headcount);
  let explicitClaimsServings = 0;
  const nonExplicit: CategoryViewEntry[] = [];

  for (const entry of categoryView) {
    if (entry.overrideQty !== undefined) {
      explicitClaimsServings += entry.overrideQty * entry.item.feedsPerUnit;
      continue;
    }
    if (entry.intent.count != null) {
      // Each item in an LLM-counted intent claims (count / itemsInPick) packs.
      const perItemPacks = Math.ceil(
        entry.intent.count / Math.max(1, entry.itemsInPick),
      );
      explicitClaimsServings += perItemPacks * entry.item.feedsPerUnit;
      continue;
    }
    nonExplicit.push(entry);
  }

  if (nonExplicit.length === 0) return 0;

  // Stable sort so +1-remainder allocation is deterministic across
  // re-renders. Tiebreak (intentId, itemId) — both are UUIDs/UUID-ish.
  nonExplicit.sort((a, b) => {
    if (a.intent.intentId !== b.intent.intentId) {
      return a.intent.intentId.localeCompare(b.intent.intentId);
    }
    return a.item.id.localeCompare(b.item.id);
  });

  const remainderServings = Math.max(0, targetServings - explicitClaimsServings);
  const base = Math.floor(remainderServings / nonExplicit.length);
  const extras = remainderServings - base * nonExplicit.length;

  const idx = nonExplicit.findIndex(
    (e) =>
      e.item.id === targetItem.id &&
      e.intent.intentId === targetIntent.intentId,
  );
  if (idx === -1) return 0;

  const myServings = base + (idx < extras ? 1 : 0);
  return packsFromServings(myServings, targetItem);
}

function packsFromServings(servings: number, item: IntentBlockItem): number {
  if (servings <= 0) return 0;
  const fpu = Math.max(1, item.feedsPerUnit);
  const cqu = Math.max(1, item.cateringQuantityUnit);
  return Math.ceil(servings / fpu) * cqu;
}

/**
 * @deprecated Kept for legacy call sites (will be removed once all
 * call sites migrate to effectiveQty). Behaves like the old
 * computeDefaultQty: divides headcount across category siblings + the
 * pick's items, rounds to packs. Doesn't account for overrides or LLM
 * counts elsewhere in the category — use effectiveQty for that.
 */
export function computeDefaultQty(
  headcount: number,
  intentsInSameCategory: number,
  itemsInPick: number,
  feedsPerUnit: number,
  cateringQuantityUnit: number,
): number {
  if (headcount <= 0) return 0;
  const fpu = Math.max(1, feedsPerUnit);
  const cqu = Math.max(1, cateringQuantityUnit);
  const intents = Math.max(1, intentsInSameCategory);
  const items = Math.max(1, itemsInPick);
  const sharePerItem = Math.ceil(headcount / intents / items);
  return Math.ceil(sharePerItem / fpu) * cqu;
}
