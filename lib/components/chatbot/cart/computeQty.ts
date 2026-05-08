/**
 * Default quantity for a single item, mirroring the backend's re-portion
 * logic (catering-menu.service.ts buildMenu re-share by mealCategory).
 *
 * The buffet model: every guest takes one serving across the items in a
 * category. So if a meal has 3 mains for 50 people, each main shares 17
 * servings; one drink for 50 people takes the full headcount.
 *
 * After the per-item share is computed, we round up to a whole pack:
 * trays, boxes, or whatever the restaurant ships in (`cateringQuantityUnit`),
 * dividing the share by `feedsPerUnit` first (one tray feeds N people).
 */
export function computeDefaultQty(
  headcount: number,
  intentsInSameCategory: number,
  feedsPerUnit: number,
  cateringQuantityUnit: number,
): number {
  if (headcount <= 0) return 0;
  const fpu = Math.max(1, feedsPerUnit);
  const cqu = Math.max(1, cateringQuantityUnit);
  const sharePerItem = Math.ceil(headcount / Math.max(1, intentsInSameCategory));
  return Math.ceil(sharePerItem / fpu) * cqu;
}
