import type { MenuItemAddon, MenuItemAddonGroup, MenuItemAddonItem } from "@/types/catering.types";

/** Flatten AddonGroup[] from API into flat MenuItemAddon[] for internal state */
export function flattenAddonGroups(groups: MenuItemAddonGroup[]): MenuItemAddon[] {
  if (!groups) return [];
  return groups.flatMap(group =>
    (group.items || []).map(item => ({
      ...item,
      groupTitle: group.groupTitle,
      selectionType: group.selectionType,
      isRequired: group.isRequired,
      minSelections: group.minSelections,
      maxSelections: group.maxSelections,
    }))
  );
}

/** Group flat MenuItemAddon[] back into AddonGroup[] for API */
export function groupAddonsForApi(addons: MenuItemAddon[]): MenuItemAddonGroup[] {
  if (!addons || addons.length === 0) return [];
  const groups: Record<string, MenuItemAddonGroup> = {};
  for (const addon of addons) {
    const title = addon.groupTitle || "Other";
    if (!groups[title]) {
      const selType = addon.selectionType === "multiple" ? "multiple_no_repeat" : (addon.selectionType || "multiple_no_repeat");
      groups[title] = {
        groupTitle: title,
        selectionType: selType as MenuItemAddonGroup["selectionType"],
        isRequired: addon.isRequired || false,
        minSelections: addon.minSelections,
        maxSelections: addon.maxSelections,
        items: [],
      };
    }
    groups[title].items.push({
      name: addon.name,
      price: addon.price,
      allergens: addon.allergens || [],
      dietaryRestrictions: addon.dietaryRestrictions,
      isDefault: addon.isDefault,
      displayOrder: addon.displayOrder,
    });
  }
  // Enforce default rules for non-single groups
  const result = Object.values(groups);
  for (const group of result) {
    if (group.selectionType === "single") continue;
    if (group.selectionType !== "multiple_repeat" && group.minSelections != null && group.minSelections >= group.items.length) {
      // All defaults ON — customer has no choice (only for non-repeat groups)
      for (const item of group.items) item.isDefault = true;
    } else {
      // Clear defaults for non-single groups (defaults only make sense for single or all-required)
      for (const item of group.items) item.isDefault = false;
    }
  }
  return result;
}

/**
 * Auto-detect format: if API returns AddonGroup[] (has `items` property),
 * flatten to MenuItemAddon[]. If already flat, return as-is.
 */
export function ensureFlatAddons(addons: any[]): MenuItemAddon[] {
  if (!addons || addons.length === 0) return [];
  if (addons[0]?.items) return flattenAddonGroups(addons as MenuItemAddonGroup[]);
  return addons as MenuItemAddon[];
}

// Renumber displayOrder so a sort by displayOrder matches flat-array index.
// Customer-facing menu reads groups in API insertion order; the restaurant
// edit view sorts groups by firstAddon.displayOrder. Renumbering keeps both
// views consistent after a reorder.
export function renumberDisplayOrders(list: MenuItemAddon[]): MenuItemAddon[] {
  return list.map((a, i) => ({ ...a, displayOrder: i }));
}

/** Bucket addons by groupTitle and return the group order users see. */
export function groupAddonsByTitle(list: MenuItemAddon[]): {
  groupOrder: string[];
  buckets: Record<string, MenuItemAddon[]>;
} {
  const buckets: Record<string, MenuItemAddon[]> = {};
  const insertionOrder: string[] = [];
  for (const a of list) {
    const t = a.groupTitle || "Other";
    if (!buckets[t]) { buckets[t] = []; insertionOrder.push(t); }
    buckets[t].push(a);
  }
  const groupOrder = insertionOrder.slice().sort((a, b) => {
    const aOrder = buckets[a][0]?.displayOrder ?? 999;
    const bOrder = buckets[b][0]?.displayOrder ?? 999;
    return aOrder - bOrder;
  });
  return { groupOrder, buckets };
}

/** Move a whole group up (-1) or down (+1) in the displayed order. */
export function reorderAddonGroup(
  list: MenuItemAddon[],
  grpTitle: string,
  direction: -1 | 1
): MenuItemAddon[] {
  const { groupOrder, buckets } = groupAddonsByTitle(list);
  const idx = groupOrder.indexOf(grpTitle);
  const swapIdx = idx + direction;
  if (idx < 0 || swapIdx < 0 || swapIdx >= groupOrder.length) return list;
  [groupOrder[idx], groupOrder[swapIdx]] = [groupOrder[swapIdx], groupOrder[idx]];
  return renumberDisplayOrders(groupOrder.flatMap((t) => buckets[t] || []));
}

/** Move an addon up (-1) or down (+1) within its group. */
export function reorderAddonInGroup(
  list: MenuItemAddon[],
  idx: number,
  direction: -1 | 1
): MenuItemAddon[] {
  const target = list[idx];
  if (!target) return list;
  const grp = target.groupTitle || "Other";
  let swapIdx = -1;
  if (direction === -1) {
    for (let i = idx - 1; i >= 0; i--) {
      if ((list[i].groupTitle || "Other") === grp) { swapIdx = i; break; }
    }
  } else {
    for (let i = idx + 1; i < list.length; i++) {
      if ((list[i].groupTitle || "Other") === grp) { swapIdx = i; break; }
    }
  }
  if (swapIdx === -1) return list;
  const next = [...list];
  [next[idx], next[swapIdx]] = [next[swapIdx], next[idx]];
  return renumberDisplayOrders(next);
}
