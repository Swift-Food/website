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
  return Object.values(groups);
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
