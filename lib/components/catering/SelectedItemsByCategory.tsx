"use client";

import { useState, useMemo, useEffect } from "react";
import { Package, ArrowLeftRight, Pencil, Trash2, Store, Tag } from "lucide-react";
import { useCatering } from "@/context/CateringContext";
import { SelectedMenuItem } from "@/types/catering.types";
import { categoryService } from "@/services/api/category.api";
import { ALLERGENS } from "@/lib/constants/allergens";

interface GroupedItem {
  item: any;
  quantity: number;
  originalIndex: number;
  allergenExpanded?: boolean;
}

interface CategoryGroup {
  items: GroupedItem[];
  subcategories: Map<string, GroupedItem[]>;
}

interface SelectedItemsByCategoryProps {
  sessionIndex?: number;
  onEdit?: (index: number) => void;
  onRemove?: (index: number) => void;
  onSwapItem?: (index: number) => void;
  onRemoveBundle?: (bundleId: string) => void;
  collapsedCategories?: Set<string>;
  onToggleCategory?: (categoryName: string) => void;
  showActions?: boolean;
  onViewMenu?: () => void;
  compactLayout?: boolean;
  restaurants?: { id: string; restaurant_name: string; images: string[] }[];
  sessionPromotions?: any[];
}

export default function SelectedItemsByCategory({
  sessionIndex,
  onEdit,
  onRemove,
  onSwapItem,
  onRemoveBundle,
  collapsedCategories: externalCollapsedCategories,
  onToggleCategory: externalOnToggleCategory,
  showActions = true,
  compactLayout = false,
  restaurants,
  sessionPromotions = [],
  // onViewMenu,
}: SelectedItemsByCategoryProps) {
  const { mealSessions, activeSessionIndex } = useCatering();

  // Use provided sessionIndex or fall back to activeSessionIndex
  const currentSessionIndex = sessionIndex ?? activeSessionIndex;
  const orderItems = mealSessions[currentSessionIndex]?.orderItems || [];

  // Fetch categories for ordering
  const [categoryOrder, setCategoryOrder] = useState<string[]>([]);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const categories =
          await categoryService.getCategoriesWithSubcategories();
        setCategoryOrder(categories.map((c) => c.name));
      } catch (error) {
        console.error("Failed to fetch categories for ordering:", error);
      }
    };
    fetchCategories();
  }, []);

  // Internal collapsed state if not provided externally
  const [internalCollapsedCategories, setInternalCollapsedCategories] =
    useState<Set<string>>(new Set());

  // Track collapsed restaurant sections
  const [collapsedRestaurants, setCollapsedRestaurants] = useState<Set<string>>(new Set());

  // Track expanded allergen sections by item index
  const [expandedAllergens, setExpandedAllergens] = useState<Set<number>>(new Set());

  const collapsedCategories =
    externalCollapsedCategories ?? internalCollapsedCategories;

  const toggleAllergen = (index: number) => {
    setExpandedAllergens(prev => {
      const newSet = new Set(prev);
      if (newSet.has(index)) {
        newSet.delete(index);
      } else {
        newSet.add(index);
      }
      return newSet;
    });
  };

  const handleToggleCategory = (categoryName: string) => {
    if (externalOnToggleCategory) {
      externalOnToggleCategory(categoryName);
    } else {
      // Use internal state
      setInternalCollapsedCategories((prev) => {
        const newSet = new Set(prev);
        if (newSet.has(categoryName)) {
          newSet.delete(categoryName);
        } else {
          newSet.add(categoryName);
        }
        return newSet;
      });
    }
  };

  // Group everything by restaurant
  const restaurantGrouped = useMemo(() => {
    const map = new Map<string, {
      name: string;
      restaurantId?: string;
      image?: string;
      bundles: Map<string, { name: string; items: GroupedItem[] }>;
      categories: Map<string, CategoryGroup>;
    }>();

    orderItems.forEach((orderItem: SelectedMenuItem, index: number) => {
      const restName = (orderItem.item as any).restaurantName || orderItem.item.restaurant?.name || "Unknown Restaurant";
      // Look up restaurant image from restaurants prop first, then fall back to item data
      const restId = orderItem.item.restaurantId || orderItem.item.restaurant?.restaurantId;
      const matchedRestaurant = restaurants?.find(r => r.id === restId);
      const restImage = matchedRestaurant?.images?.[0];

      if (!map.has(restName)) {
        map.set(restName, { name: restName, restaurantId: restId, image: restImage, bundles: new Map(), categories: new Map() });
      }
      const restaurant = map.get(restName)!;

      const groupedItem: GroupedItem = {
        item: orderItem.item,
        quantity: orderItem.quantity,
        originalIndex: index,
      };

      if (orderItem.bundleId) {
        if (!restaurant.bundles.has(orderItem.bundleId)) {
          restaurant.bundles.set(orderItem.bundleId, { name: orderItem.bundleName ?? "Bundle", items: [] });
        }
        restaurant.bundles.get(orderItem.bundleId)!.items.push(groupedItem);
      } else {
        const catName = orderItem.item.categoryName || (orderItem.item as any).groupTitle || "Uncategorized";
        const subName = orderItem.item.subcategoryName || "";

        if (!restaurant.categories.has(catName)) {
          restaurant.categories.set(catName, { items: [], subcategories: new Map() });
        }
        const category = restaurant.categories.get(catName)!;

        if (subName) {
          if (!category.subcategories.has(subName)) {
            category.subcategories.set(subName, []);
          }
          category.subcategories.get(subName)!.push(groupedItem);
        } else {
          category.items.push(groupedItem);
        }
      }
    });

    // Sort categories within each restaurant
    if (categoryOrder.length > 0) {
      map.forEach((restaurant) => {
        const entries = Array.from(restaurant.categories.entries());
        entries.sort((a, b) => {
          const orderA = categoryOrder.indexOf(a[0]);
          const orderB = categoryOrder.indexOf(b[0]);
          return (orderA === -1 ? 999 : orderA) - (orderB === -1 ? 999 : orderB);
        });
        restaurant.categories = new Map(entries);
      });
    }

    return map;
  }, [orderItems, categoryOrder]);

  if (orderItems.length === 0) return null;

  const renderItemRow = (groupedItem: GroupedItem) => {
    const { item, quantity, originalIndex } = groupedItem;
    const price = parseFloat(item.price?.toString() || "0");
    const discountPrice = parseFloat(item.discountPrice?.toString() || "0");
    const itemPrice =
      item.isDiscount && discountPrice > 0 ? discountPrice : price;
    const BACKEND_QUANTITY_UNIT = item.cateringQuantityUnit || 7;
    const portions = quantity / BACKEND_QUANTITY_UNIT;

    // Calculate addon total
    const addonTotal = (item.selectedAddons || []).reduce(
      (sum: number, addon: { price: number; quantity: number }) =>
        sum + (addon.price || 0) * (addon.quantity || 0),
      0
    );
    const subtotal = itemPrice * quantity + addonTotal;
  
    const showMobile = compactLayout ? "" : " sm:hidden";
    const showDesktop = compactLayout ? " hidden" : " hidden sm:flex";
    const showDesktopBlock = compactLayout ? " hidden" : " hidden sm:block";
    const rootLayout = compactLayout
      ? "flex flex-col gap-3 p-4 bg-base-100 rounded-xl min-w-0 overflow-hidden"
      : "flex flex-col sm:flex-row sm:items-center gap-3 p-4 bg-base-100 rounded-xl min-w-0 overflow-hidden";

    return (
      <div
        key={originalIndex}
        className={rootLayout}
      >
        {/* Mobile Layout */}
        <div className={`flex gap-3${showMobile}`}>
          {/* Image */}
          {item.image && (
            <img
              src={item.image}
              alt={item.menuItemName}
              className="w-16 h-16 rounded-lg object-cover flex-shrink-0"
            />
          )}
          {/* Name + Addons */}
          <div className="flex-1 min-w-0">
            <p className="font-semibold text-gray-800 italic">
              {item.menuItemName}
            </p>
            {item.selectedAddons && item.selectedAddons.length > 0 && (
              <div className="text-sm text-gray-600 mt-1">
                {(() => {
                  // Group addons by groupTitle
                  const addonsByGroup = item.selectedAddons.reduce(
                    (
                      acc: Record<string, { name: string; quantity: number }[]>,
                      addon: {
                        groupTitle: string;
                        name: string;
                        quantity: number;
                      }
                    ) => {
                      const group = addon.groupTitle || "Options";
                      if (!acc[group]) acc[group] = [];
                      acc[group].push({
                        name: addon.name,
                        quantity: addon.quantity,
                      });
                      return acc;
                    },
                    {}
                  );
                  return Object.entries(addonsByGroup).map(
                    ([groupTitle, addons]) => (
                      <p key={groupTitle} className="text-gray-500">
                        <span className="font-medium text-gray-700">
                          {groupTitle}:
                        </span>{" "}
                        {(addons as { name: string; quantity: number }[]).map(
                          (a, i) => (
                            <span key={i}>
                              {a.name}
                              {a.quantity > 1 && ` (×${a.quantity})`}
                              {i <
                                (addons as { name: string; quantity: number }[])
                                  .length -
                                  1 && ", "}
                            </span>
                          )
                        )}
                      </p>
                    )
                  );
                })()}
              </div>
            )}
            {item.allergens && item.allergens.length > 0 && (
              <div className="mt-2">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleAllergen(originalIndex);
                  }}
                  className="flex items-center gap-1 text-xs font-medium text-orange-700 hover:text-orange-800 transition-colors"
                >
                  <span className="text-orange-600">⚠️</span>
                  <span>Allergens ({item.allergens.length})</span>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className={`h-3 w-3 transition-transform ${
                      expandedAllergens.has(originalIndex) ? "rotate-180" : ""
                    }`}
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 9l-7 7-7-7"
                    />
                  </svg>
                </button>
                {expandedAllergens.has(originalIndex) && (
                  <div className="flex flex-wrap gap-1 mt-1">
                    {item.allergens.map((allergenValue: string) => {
                      const allergen = ALLERGENS.find((a) => a.value === allergenValue);
                      return (
                        <span
                          key={allergenValue}
                          className="inline-flex items-center bg-orange-100 text-orange-800 px-2 py-0.5 rounded text-xs"
                        >
                          {allergen?.label || allergenValue}
                        </span>
                      );
                    })}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Mobile Price & Portions + Actions */}
        <div className={`flex items-center justify-between${showMobile}`}>
          <div>
            <p className="font-bold text-primary text-lg">
              £{subtotal.toFixed(2)}
            </p>
            <p className="text-sm text-gray-600">
              {portions} portion{portions !== 1 ? "s" : ""}
            </p>
          </div>
          {showActions && onEdit && onRemove && (
            <div className={`flex items-center gap-2${showMobile}`}>
              {onSwapItem && orderItems[originalIndex]?.bundleId && (
                <button
                  onClick={() => onSwapItem(originalIndex)}
                  className={`p-2 border border-amber-500 text-amber-600 rounded-lg hover:bg-amber-50 transition-colors${compactLayout ? "" : " sm:px-3 sm:py-2"}`}
                  title="Swap"
                >
                  <ArrowLeftRight className={`w-4 h-4${compactLayout ? "" : " sm:hidden"}`} />
                  <span className={compactLayout ? "hidden" : "hidden sm:inline text-sm font-medium"}>Swap</span>
                </button>
              )}
              <button
                onClick={() => onEdit(originalIndex)}
                className={`p-2 border border-primary text-primary rounded-lg hover:bg-primary/5 transition-colors${compactLayout ? "" : " sm:px-4 sm:py-2"}`}
                title="Edit"
              >
                <Pencil className={`w-4 h-4${compactLayout ? "" : " sm:hidden"}`} />
                <span className={compactLayout ? "hidden" : "hidden sm:inline text-sm font-medium"}>Edit</span>
              </button>
              <button
                onClick={() => onRemove(originalIndex)}
                className={`p-2 border border-primary text-primary rounded-lg hover:bg-primary/5 transition-colors${compactLayout ? "" : " sm:px-4 sm:py-2"}`}
                title="Remove"
              >
                <Trash2 className={`w-4 h-4${compactLayout ? "" : " sm:hidden"}`} />
                <span className={compactLayout ? "hidden" : "hidden sm:inline text-sm font-medium"}>Remove</span>
              </button>
            </div>
          )}
        </div>

        {/* Desktop Layout */}
        {/* Image */}
        {item.image && (
          <img
            src={item.image}
            alt={item.menuItemName}
            className={`${showDesktopBlock} w-16 h-16 rounded-lg object-cover flex-shrink-0`}
          />
        )}

        {/* Name + Addons */}
        <div className={`${showDesktopBlock} flex-1 min-w-0`}>
          <p className="font-semibold text-gray-800">{item.menuItemName}</p>
          {item.selectedAddons && item.selectedAddons.length > 0 && (
            <div className="text-sm text-gray-600 mt-1">
              {(() => {
                // Group addons by groupTitle
                const addonsByGroup = item.selectedAddons.reduce(
                  (
                    acc: Record<string, { name: string; quantity: number }[]>,
                    addon: {
                      groupTitle: string;
                      name: string;
                      quantity: number;
                    }
                  ) => {
                    const group = addon.groupTitle || "Options";
                    if (!acc[group]) acc[group] = [];
                    acc[group].push({
                      name: addon.name,
                      quantity: addon.quantity,
                    });
                    return acc;
                  },
                  {}
                );
                return Object.entries(addonsByGroup).map(
                  ([groupTitle, addons]) => (
                    <p key={groupTitle}>
                      <span className="font-medium">{groupTitle}:</span>{" "}
                      {(addons as { name: string; quantity: number }[]).map(
                        (a, i) => (
                          <span key={i}>
                            {a.name}
                            {a.quantity > 1 && ` (×${a.quantity})`}
                            {i <
                              (addons as { name: string; quantity: number }[])
                                .length -
                                1 && ", "}
                          </span>
                        )
                      )}
                    </p>
                  )
                );
              })()}
            </div>
          )}
          {item.allergens && item.allergens.length > 0 && (
            <div className="mt-2">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  toggleAllergen(originalIndex);
                }}
                className="flex items-center gap-1 text-xs font-medium text-orange-700 hover:text-orange-800 transition-colors"
              >
                <span>Allergens ({item.allergens.length})</span>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className={`h-3 w-3 transition-transform ${
                    expandedAllergens.has(originalIndex) ? "rotate-180" : ""
                  }`}
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 9l-7 7-7-7"
                  />
                </svg>
              </button>
              {expandedAllergens.has(originalIndex) && (
                <div className="flex flex-wrap gap-1 mt-1">
                  {item.allergens.map((allergenValue: string) => {
                    const allergen = ALLERGENS.find((a) => a.value === allergenValue);
                    return (
                      <span
                        key={allergenValue}
                        className="inline-flex items-center bg-orange-100 text-orange-800 px-2 py-0.5 rounded text-xs"
                      >
                        {allergen?.label || allergenValue}
                      </span>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Price & Portions */}
        <div className={`${showDesktop} items-center gap-4 flex-shrink-0`}>
          <p className="font-bold text-primary text-lg">
            £{subtotal.toFixed(2)}
          </p>
          <p className="text-sm text-gray-600 whitespace-nowrap">
            {portions} portion{portions !== 1 ? "s" : ""}
          </p>
        </div>

        {/* Actions */}
        {showActions && onEdit && onRemove && (
          <div className={`${showDesktop} items-center gap-2 flex-shrink-0`}>
            {onSwapItem && orderItems[originalIndex]?.bundleId && (
              <button
                onClick={() => onSwapItem(originalIndex)}
                className="px-3 py-2 border border-amber-500 text-amber-600 rounded-lg hover:bg-amber-50 transition-colors text-sm font-medium"
              >
                Swap
              </button>
            )}
            <button
              onClick={() => onEdit(originalIndex)}
              className="px-4 py-2 border border-primary text-primary rounded-lg hover:bg-primary/5 transition-colors text-sm font-medium"
            >
              Edit
            </button>
            <button
              onClick={() => onRemove(originalIndex)}
              className="px-4 py-2 border border-primary text-primary rounded-lg hover:bg-primary/5 transition-colors text-sm font-medium"
            >
              Remove
            </button>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="mb-6 overflow-hidden min-w-0">
      {/* Header */}
      {/* <div className="px-6 py-4 bg-base-100 border-b border-base-200 flex items-center justify-between">
        <h2 className="text-xl sm:text-3xl font-bold text-gray-800">Your List</h2>
        {onViewMenu && (
          <button
            onClick={onViewMenu}
            className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-primary bg-primary/10 hover:bg-primary/20 rounded-lg transition-colors"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-4 w-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
            <span className="hidden sm:inline">View Downloadable Menu</span>
            <span className="sm:hidden">PDF</span>
          </button>
        )}
      </div> */}

      <div className="space-y-5">
        {Array.from(restaurantGrouped.entries()).map(([restName, restaurant]) => {
          const isRestaurantCollapsed = collapsedRestaurants.has(restName);
          const totalRestaurantItems = Array.from(restaurant.bundles.values()).reduce((sum, b) => sum + b.items.length, 0)
            + Array.from(restaurant.categories.values()).reduce((sum, c) => sum + c.items.length + Array.from(c.subcategories.values()).reduce((s, items) => s + items.length, 0), 0);

          const restPromos = sessionPromotions.filter(
            (p) => p.restaurantId === restaurant.restaurantId
          );

          return (
          <div key={restName}>
            {/* Per-restaurant promotion banners */}
            {restPromos.length > 0 && (
              <div className="flex flex-col gap-1.5 mb-2">
                {restPromos.map((promo: any, i: number) => (
                  <div key={i} className="flex items-center gap-2 px-3 py-2 bg-green-50 border border-green-200 rounded-lg">
                    <Tag className="w-4 h-4 text-green-600 flex-shrink-0" />
                    <span className="text-xs md:text-sm font-semibold text-green-700 flex-1 truncate">
                      {promo.name || "Restaurant Promotion"} —{" "}
                      {promo.promotionType === "BUY_MORE_SAVE_MORE" && promo.discountTiers?.length
                        ? `Up to ${Math.max(...promo.discountTiers.map((t: any) => Number(t.discountPercentage)))}% OFF`
                        : promo.promotionType === "BOGO"
                        ? "Buy One Get One"
                        : `${Number(promo.discountPercentage)}% OFF`}
                    </span>
                  </div>
                ))}
              </div>
            )}
            {/* Restaurant Header */}
            <button
              onClick={() => setCollapsedRestaurants(prev => {
                const next = new Set(prev);
                if (next.has(restName)) next.delete(restName);
                else next.add(restName);
                return next;
              })}
              className="w-full flex items-center gap-3 mb-2 px-1 hover:bg-base-100 rounded-lg py-1 transition-colors"
            >
              {restaurant.image ? (
                <img src={restaurant.image} alt={restName} className="w-9 h-9 rounded-lg object-cover flex-shrink-0" />
              ) : (
                <Store className="w-5 h-5 text-gray-500 flex-shrink-0" />
              )}
              <span className="font-bold text-base text-gray-800">{restName}</span>
              <span className="text-sm text-gray-400">({totalRestaurantItems})</span>
              <div className="flex-1" />
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className={`h-5 w-5 text-gray-400 transition-transform ${isRestaurantCollapsed ? "" : "rotate-180"}`}
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>

            {!isRestaurantCollapsed && (
            <div className="space-y-4">
              {/* Bundle Groups */}
              {Array.from(restaurant.bundles.entries()).map(([bundleId, { name, items }]) => (
                <div
                  key={bundleId}
                  className="border-2 border-dashed border-primary/30 rounded-2xl overflow-hidden bg-primary/[0.02]"
                >
                  <div className="flex items-center gap-2 px-4 py-3 bg-primary/10 border-b border-primary/20">
                    <Package className="w-4 h-4 text-primary flex-shrink-0" />
                    <div className="min-w-0">
                      <span className="font-semibold text-primary text-sm">{name}</span>
                      <span className="block sm:inline sm:ml-1 text-xs text-primary/60">
                        ({items.length} item{items.length !== 1 ? "s" : ""})
                      </span>
                    </div>
                    <div className="flex-1" />
                    {onRemoveBundle && (
                      <>
                        <button
                          onClick={() => onRemoveBundle(bundleId)}
                          className={`${compactLayout ? "" : "sm:hidden"} w-7 h-7 flex items-center justify-center text-red-500 hover:text-red-700 hover:bg-red-50 rounded-full transition-colors`}
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                          </svg>
                        </button>
                        <button
                          onClick={() => onRemoveBundle(bundleId)}
                          className={`${compactLayout ? "hidden" : "hidden sm:flex"} items-center gap-1 text-xs font-medium text-red-500 hover:text-red-700 hover:bg-red-50 px-2 py-1 rounded-lg transition-colors`}
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                          </svg>
                          Remove Bundle
                        </button>
                      </>
                    )}
                  </div>
                  <div className="p-2 space-y-3">
                    {items.map(renderItemRow)}
                  </div>
                </div>
              ))}

              {/* Categories */}
              {Array.from(restaurant.categories.entries()).map(([categoryName, categoryGroup]) => {
                const isCollapsed = collapsedCategories.has(categoryName);
                const totalItems =
                  categoryGroup.items.length +
                  Array.from(categoryGroup.subcategories.values()).reduce(
                    (sum, items) => sum + items.length,
                    0
                  );

                return (
                  <div
                    key={categoryName}
                    className="border-2 border-base-200 rounded-xl overflow-hidden"
                  >
                    {/* Category Header */}
                    <button
                      onClick={() => handleToggleCategory(categoryName)}
                      className="w-full flex items-center justify-between px-4 py-3 bg-base-200 hover:bg-base-200 transition-colors"
                    >
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-gray-800">
                          {categoryName}
                        </span>
                        <span className="text-sm text-gray-500">
                          ({totalItems} item{totalItems !== 1 ? "s" : ""})
                        </span>
                      </div>
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className={`h-5 w-5 text-gray-500 transition-transform ${
                          isCollapsed ? "" : "rotate-180"
                        }`}
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M19 9l-7 7-7-7"
                        />
                      </svg>
                    </button>

                    {/* Category Content */}
                    {!isCollapsed && (
                      <div className="p-2 space-y-3 min-w-0 overflow-hidden">
                        {/* Items without subcategory */}
                        {categoryGroup.items.map(renderItemRow)}

                        {/* Subcategories (label hidden, items shown flat) */}
                        {Array.from(categoryGroup.subcategories.values()).map(
                          (items, i) => (
                            <div key={i} className="space-y-3">
                              {items.map(renderItemRow)}
                            </div>
                          )
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
            )}
          </div>
        );
        })}
      </div>
    </div>
  );
}
