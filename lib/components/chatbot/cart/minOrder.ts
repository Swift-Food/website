"use client";

import type { ClientRestaurantPick, MealSessionPart } from "../types";
import type { UseCart } from "./useCart";
import { buildCategoryView, effectiveQty } from "./computeQty";

export interface MinOrderShortfall {
  restaurantId: string;
  restaurantName: string;
  required: number;
  current: number;
  missing: number;
}

/**
 * For every restaurant currently picked across all meals + intents,
 * sum the displayed item counts and compare against the restaurant's
 * minQuantity. Return one shortfall per restaurant that hasn't met
 * its minimum.
 *
 * Uses effectiveQty so warnings stay in sync with what the user sees:
 * remove items, swap, override qty — the warnings update reactively.
 *
 * The /add-to-basket endpoint also returns warnings as defense-in-
 * depth, so a missed UI render can't let an invalid order land.
 */
export function checkMinOrders(
  mealSessionParts: MealSessionPart[],
  cart: UseCart,
): MinOrderShortfall[] {
  const tally = new Map<
    string,
    { name: string; minQuantity: number; count: number }
  >();

  for (const ms of mealSessionParts) {
    const headcount = ms.guestCount ?? 1;
    const categoriesSeen = new Set<string | null>();
    for (const b of ms.intentBlocks) categoriesSeen.add(b.intent.category);

    for (const category of categoriesSeen) {
      const view = buildCategoryView(
        category,
        ms,
        cart.cart,
        cart.getSelectedRestaurantId,
      );
      for (const entry of view) {
        const qty = effectiveQty({
          targetItem: entry.item,
          targetIntent: entry.intent,
          itemsInTargetPick: entry.itemsInPick,
          categoryView: view,
          headcount,
        });
        if (qty <= 0) continue;
        // Find the restaurant that the entry belongs to. The item
        // type doesn't carry the restaurant directly — it lives on
        // the surrounding pick. Look up via the intent block + the
        // user's selected restaurant for that intent.
        const restaurant = findRestaurantForEntry(
          entry.intent.intentId,
          ms,
          cart,
        );
        if (!restaurant) continue;
        const cur = tally.get(restaurant.id) ?? {
          name: restaurant.name,
          minQuantity: restaurant.minQuantity,
          count: 0,
        };
        cur.count += qty;
        tally.set(restaurant.id, cur);
      }
    }
  }

  const out: MinOrderShortfall[] = [];
  for (const [restaurantId, t] of tally) {
    if (t.minQuantity > 0 && t.count < t.minQuantity) {
      out.push({
        restaurantId,
        restaurantName: t.name,
        required: t.minQuantity,
        current: t.count,
        missing: t.minQuantity - t.count,
      });
    }
  }
  return out;
}

function findRestaurantForEntry(
  intentId: string,
  ms: MealSessionPart,
  cart: UseCart,
): ClientRestaurantPick["restaurant"] | null {
  const block = ms.intentBlocks.find((b) => b.intentId === intentId);
  if (!block) return null;
  const selectedId =
    cart.getSelectedRestaurantId(intentId) ??
    block.restaurantPicks[0]?.restaurant.id ??
    null;
  if (!selectedId) return null;
  const pick = block.restaurantPicks.find(
    (rp) => rp.restaurant.id === selectedId,
  );
  return pick?.restaurant ?? null;
}
