import type { ClientRestaurantPick, IntentBlockPart } from "./types";

/**
 * Same-restaurant cohesion bonus — added to a candidate's effective rank
 * if a prior intent has settled on the same restaurant. Mirrors the
 * historic backend value (+0.5 against integer candidate counts), tuned
 * to break near-ties without overriding clear leads.
 */
const COHESION_BONUS = 0.5;

/**
 * Choose which RestaurantPick to display by default, given the set of
 * restaurants already chosen by earlier intents in the same meal session.
 *
 * Pure: same input → same output. No React, no state.
 *
 * @example
 * // No priors → highest candidateCount wins.
 * pickDefaultIndex([{candidateCount: 3, ...}, {candidateCount: 5, ...}], new Set()) // 1
 *
 * @example
 * // Tied counts → prior-selected restaurant wins.
 * pickDefaultIndex(
 *   [{ restaurant: { id: "a", ...}, candidateCount: 5, ...},
 *    { restaurant: { id: "b", ...}, candidateCount: 5, ...}],
 *   new Set(["b"])
 * ) // 1   (b: 5 + 0.5 > a: 5)
 *
 * @example
 * // Cohesion bonus does NOT override a clear lead.
 * pickDefaultIndex(
 *   [{ restaurant: { id: "a", ...}, candidateCount: 5, ...},
 *    { restaurant: { id: "b", ...}, candidateCount: 4, ...}],
 *   new Set(["b"])
 * ) // 0   (a: 5 still > b: 4 + 0.5)
 */
export function pickDefaultIndex(
  picks: ClientRestaurantPick[],
  priorSelectedIds: ReadonlySet<string>,
): number {
  if (picks.length === 0) return 0;
  let bestIdx = 0;
  let bestScore = -Infinity;
  for (let i = 0; i < picks.length; i++) {
    const rp = picks[i];
    const score = rp.candidateCount + (priorSelectedIds.has(rp.restaurant.id) ? COHESION_BONUS : 0);
    if (score > bestScore) {
      bestScore = score;
      bestIdx = i;
    }
  }
  return bestIdx;
}

/**
 * Walk a list of intent blocks in order, resolving each block's displayed
 * restaurant id. An entry in `explicit` (intentId → restaurantId) overrides
 * the cohesion-driven default; that override then becomes a prior for the
 * next intent. Returns a complete `intentId → restaurantId` map.
 *
 * This is the single source of truth for "what restaurant is each block
 * showing right now". Components consume the map; they never recompute
 * cohesion themselves.
 *
 * Pure: same input → same output.
 *
 * @example
 * // Three blocks, no explicit overrides; cohesion threads naturally.
 * resolveSelections([
 *   { intentId: "i1", restaurantPicks: [{restaurant:{id:"a",...}, candidateCount:5}, {restaurant:{id:"b",...}, candidateCount:4}] },
 *   { intentId: "i2", restaurantPicks: [{restaurant:{id:"a",...}, candidateCount:4}, {restaurant:{id:"b",...}, candidateCount:5}] },
 * ], new Map())
 * // → Map { "i1" => "a" (5 wins), "i2" => "b" (5 + 0.5 > 4 + 0.5, because b was already picked) }
 *
 * @example
 * // i1 explicitly overridden to "b"; i2's default reflects b as a prior.
 * resolveSelections([
 *   { intentId: "i1", restaurantPicks: [{restaurant:{id:"a",...}, candidateCount:5}, {restaurant:{id:"b",...}, candidateCount:4}] },
 *   { intentId: "i2", restaurantPicks: [{restaurant:{id:"a",...}, candidateCount:5}, {restaurant:{id:"b",...}, candidateCount:4}] },
 * ], new Map([["i1", "b"]]))
 * // → Map { "i1" => "b" (explicit), "i2" => "b" (5 < 4+0.5? no; b: 4+0.5 = 4.5 still < a: 5; a wins on score) }
 *
 * @example
 * // Tied counts in i2 — cohesion bonus from i1's explicit choice breaks it.
 * resolveSelections([
 *   { intentId: "i1", restaurantPicks: [{restaurant:{id:"a",...}, candidateCount:5}, {restaurant:{id:"b",...}, candidateCount:4}] },
 *   { intentId: "i2", restaurantPicks: [{restaurant:{id:"a",...}, candidateCount:4}, {restaurant:{id:"b",...}, candidateCount:4}] },
 * ], new Map([["i1", "b"]]))
 * // → Map { "i1" => "b" (explicit), "i2" => "b" (b: 4+0.5 = 4.5 > a: 4) }
 */
export function resolveSelections(
  blocks: IntentBlockPart[],
  explicit: ReadonlyMap<string, string>,
): Map<string, string> {
  const resolved = new Map<string, string>();
  const priorIds = new Set<string>();
  for (const block of blocks) {
    const explicitId = explicit.get(block.intentId);
    const chosenId = explicitId
      ?? block.restaurantPicks[pickDefaultIndex(block.restaurantPicks, priorIds)]?.restaurant.id;
    if (chosenId !== undefined) {
      resolved.set(block.intentId, chosenId);
      priorIds.add(chosenId);
    }
  }
  return resolved;
}
