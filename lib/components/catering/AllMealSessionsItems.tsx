"use client";

import { useState, useEffect } from "react";
import { useCatering } from "@/context/CateringContext";
import { MealSessionState, SelectedMenuItem } from "@/types/catering.types";
import { ChefHat, ChevronDown, ChevronUp, Calendar, Clock, Package, Store } from "lucide-react";
import { categoryService } from "@/services/api/category.api";
import { ALLERGENS } from "@/lib/constants/allergens";

interface GroupedItem {
  item: any;
  quantity: number;
  originalIndex: number;
}

interface CategoryGroup {
  items: GroupedItem[];
  subcategories: Map<string, GroupedItem[]>;
}

interface AllMealSessionsItemsProps {
  showActions?: boolean;
  onEdit?: (sessionIndex: number, itemIndex: number) => void;
  onRemove?: (sessionIndex: number, itemIndex: number) => void;
  onViewMenu?: () => void;
  isGeneratingPdf?: boolean;
}

export default function AllMealSessionsItems({
  showActions = false,
  onEdit,
  onRemove,
  onViewMenu,
  isGeneratingPdf = false,
}: AllMealSessionsItemsProps) {
  const { mealSessions } = useCatering();

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

  // Track expanded state for sessions and restaurants
  const [expandedSessions, setExpandedSessions] = useState<Set<number>>(
    new Set(mealSessions.map((_, idx) => idx)),
  );
  const [collapsedCategories, setCollapsedCategories] = useState<Set<string>>(
    new Set(),
  );
  const [expandedAllergens, setExpandedAllergens] = useState<Set<string>>(
    new Set(),
  );
  const [collapsedRestaurants, setCollapsedRestaurants] = useState<Set<string>>(
    new Set(),
  );

  const toggleSession = (sessionIndex: number) => {
    setExpandedSessions((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(sessionIndex)) {
        newSet.delete(sessionIndex);
      } else {
        newSet.add(sessionIndex);
      }
      return newSet;
    });
  };

  const toggleCategory = (categoryKey: string) => {
    setCollapsedCategories((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(categoryKey)) {
        newSet.delete(categoryKey);
      } else {
        newSet.add(categoryKey);
      }
      return newSet;
    });
  };

  const toggleAllergen = (key: string) => {
    setExpandedAllergens((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(key)) {
        newSet.delete(key);
      } else {
        newSet.add(key);
      }
      return newSet;
    });
  };

  const toggleRestaurant = (key: string) => {
    setCollapsedRestaurants((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(key)) newSet.delete(key);
      else newSet.add(key);
      return newSet;
    });
  };

  // Group items by restaurant, then by bundles/categories within each restaurant
  const groupItemsByRestaurant = (orderItems: SelectedMenuItem[]) => {
    const map = new Map<string, {
      name: string;
      image?: string;
      bundles: Map<string, { name: string; items: GroupedItem[] }>;
      categories: Map<string, CategoryGroup>;
    }>();

    orderItems.forEach((orderItem, index) => {
      const restName = (orderItem.item as any).restaurantName || orderItem.item.restaurant?.name || "Unknown Restaurant";
      const restData = orderItem.item.restaurant as any;
      const restImage = restData?.images?.[0] || restData?.image?.[0];

      if (!map.has(restName)) {
        map.set(restName, { name: restName, image: restImage, bundles: new Map(), categories: new Map() });
      }
      const restaurant = map.get(restName)!;

      const groupedItem: GroupedItem = {
        item: orderItem.item,
        quantity: orderItem.quantity,
        originalIndex: index,
      };

      if (orderItem.bundleId) {
        if (!restaurant.bundles.has(orderItem.bundleId)) {
          restaurant.bundles.set(orderItem.bundleId, { name: orderItem.bundleName || "Bundle", items: [] });
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
  };

  const formatDate = (date: string) => {
    if (!date) return "Date TBD";
    return new Date(date).toLocaleDateString("en-GB", {
      weekday: "short",
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  const formatTime = (time: string) => {
    if (!time) return "Time TBD";
    const [hours, minutes] = time.split(":");
    const hour = parseInt(hours, 10);
    const minute = parseInt(minutes, 10);
    const ampm = hour >= 12 ? "PM" : "AM";
    const hour12 = hour % 12 || 12;
    const start = `${hour12}:${String(minute).padStart(2, "0")} ${ampm}`;
    const totalEnd = hour * 60 + minute + 30;
    const endHour = Math.floor(totalEnd / 60) % 24;
    const endMinute = totalEnd % 60;
    const endAmpm = endHour >= 12 ? "PM" : "AM";
    const endHour12 = endHour % 12 || 12;
    return `${start} – ${endHour12}:${String(endMinute).padStart(2, "0")} ${endAmpm}`;
  };

  // Calculate session total
  const calculateSessionTotal = (orderItems: SelectedMenuItem[]) => {
    return orderItems.reduce((total, { item, quantity }) => {
      const price = parseFloat(item.price?.toString() || "0");
      const discountPrice = parseFloat(item.discountPrice?.toString() || "0");
      const unitPrice =
        item.isDiscount && discountPrice > 0 ? discountPrice : price;

      const addonTotal = (item.selectedAddons || []).reduce(
        (sum: number, addon: { price: number; quantity: number }) =>
          sum + (addon.price || 0) * (addon.quantity || 0),
        0,
      );

      return total + unitPrice * quantity + addonTotal;
    }, 0);
  };

  const renderItemRow = (groupedItem: GroupedItem, sessionIndex: number) => {
    const { item, quantity, originalIndex } = groupedItem;
    const price = parseFloat(item.price?.toString() || "0");
    const discountPrice = parseFloat(item.discountPrice?.toString() || "0");
    const itemPrice =
      item.isDiscount && discountPrice > 0 ? discountPrice : price;
    const BACKEND_QUANTITY_UNIT = item.cateringQuantityUnit || 7;
    const portions = quantity / BACKEND_QUANTITY_UNIT;
    const serves = item.feedsPerUnit * portions;

    const addonTotal = (item.selectedAddons || []).reduce(
      (sum: number, addon: { price: number; quantity: number }) =>
        sum + (addon.price || 0) * (addon.quantity || 0),
      0,
    );
    const subtotal = itemPrice * quantity + addonTotal;

    return (
      <div
        key={`${sessionIndex}-${originalIndex}`}
        className="bg-gray-50 rounded-lg p-3 sm:p-4 hover:bg-gray-100 transition-colors"
      >
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-2 mb-2">
          <div className="flex gap-3 flex-1">
            {item.image && (
              <img
                src={item.image}
                alt={item.menuItemName}
                className="w-14 h-14 sm:w-16 sm:h-16 rounded-lg object-cover flex-shrink-0"
              />
            )}
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-sm sm:text-base text-gray-900 mb-1">
                {item.menuItemName}
              </p>
              <p className="text-xs sm:text-sm text-gray-600">
                {portions} portion{portions !== 1 ? "s" : ""}
              </p>
              <p className="text-xs sm:text-sm text-gray-600">
                serves ~ {serves}
              </p>
              {item.selectedAddons && item.selectedAddons.length > 0 && (
                <div className="mt-1 text-xs text-gray-500">
                  {item.selectedAddons.map(
                    (
                      addon: { name: string; quantity: number },
                      idx: number,
                    ) => (
                      <span key={idx}>
                        + {addon.name}
                        {addon.quantity > 1 && ` (×${addon.quantity})`}
                        {idx < item.selectedAddons!.length - 1 ? ", " : ""}
                      </span>
                    ),
                  )}
                </div>
              )}
              {item.allergens && item.allergens.length > 0 && (
                <div className="mt-2">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleAllergen(`${sessionIndex}-${originalIndex}`);
                    }}
                    className="flex items-center gap-1 text-xs font-medium text-orange-700 hover:text-orange-800 transition-colors"
                  >
                    <span className="text-orange-600">⚠️</span>
                    <span>Allergens ({item.allergens.length})</span>
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className={`h-3 w-3 transition-transform ${
                        expandedAllergens.has(
                          `${sessionIndex}-${originalIndex}`,
                        )
                          ? "rotate-180"
                          : ""
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
                  {expandedAllergens.has(
                    `${sessionIndex}-${originalIndex}`,
                  ) && (
                    <div className="flex flex-wrap gap-1 mt-1">
                      {item.allergens.map((allergenValue: string) => {
                        const allergen = ALLERGENS.find(
                          (a) => a.value === allergenValue,
                        );
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
          <div className="flex items-center justify-between sm:justify-end gap-3 sm:gap-4">
            <p className="font-bold text-pink-600 text-sm sm:text-base whitespace-nowrap">
              £{subtotal.toFixed(2)}
            </p>
            {showActions && onEdit && onRemove && (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => onEdit(sessionIndex, originalIndex)}
                  className="px-3 py-1.5 border border-pink-500 text-pink-500 rounded-lg hover:bg-pink-50 transition-colors text-xs sm:text-sm font-medium"
                >
                  Edit
                </button>
                <button
                  onClick={() => onRemove(sessionIndex, originalIndex)}
                  className="px-3 py-1.5 border border-pink-500 text-pink-500 rounded-lg hover:bg-pink-50 transition-colors text-xs sm:text-sm font-medium"
                >
                  Remove
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  const renderCategoryGroup = (
    categoryName: string,
    categoryGroup: CategoryGroup,
    sessionIndex: number,
  ) => {
    const categoryKey = `${sessionIndex}-${categoryName}`;
    const isCollapsed = collapsedCategories.has(categoryKey);
    const totalItems =
      categoryGroup.items.length +
      Array.from(categoryGroup.subcategories.values()).reduce(
        (sum, items) => sum + items.length,
        0,
      );

    return (
      <div
        key={categoryKey}
        className="border border-gray-200 rounded-lg overflow-hidden"
      >
        <button
          onClick={() => toggleCategory(categoryKey)}
          className="w-full flex items-center justify-between px-4 py-3 bg-gray-50 hover:bg-gray-100 transition-colors"
        >
          <div className="flex items-center gap-2">
            <ChefHat className="h-4 w-4 text-pink-500" />
            <span className="font-semibold text-gray-800">{categoryName}</span>
            <span className="text-sm text-gray-500">
              ({totalItems} item{totalItems !== 1 ? "s" : ""})
            </span>
          </div>
          {isCollapsed ? (
            <ChevronDown className="h-5 w-5 text-gray-400" />
          ) : (
            <ChevronUp className="h-5 w-5 text-gray-400" />
          )}
        </button>

        {!isCollapsed && (
          <div className="p-3 space-y-2">
            {categoryGroup.items.map((groupedItem) =>
              renderItemRow(groupedItem, sessionIndex),
            )}

            {Array.from(categoryGroup.subcategories.entries()).map(
              ([subName, items]) => (
                <div key={subName}>
                  <p className="text-xs font-medium text-gray-600 mb-2 pl-2">
                    {subName}
                  </p>
                  <div className="space-y-2">
                    {items.map((groupedItem) =>
                      renderItemRow(groupedItem, sessionIndex),
                    )}
                  </div>
                </div>
              ),
            )}
          </div>
        )}
      </div>
    );
  };

  const renderBundleGroup = (
    bundleId: string,
    bundleName: string,
    items: GroupedItem[],
    sessionIndex: number,
  ) => {
    const categoryKey = `${sessionIndex}-bundle-${bundleId}`;
    const isCollapsed = collapsedCategories.has(categoryKey);

    return (
      <div
        key={categoryKey}
        className="border-2 border-dashed border-primary/30 rounded-lg overflow-hidden"
      >
        <button
          onClick={() => toggleCategory(categoryKey)}
          className="w-full flex items-center justify-between px-4 py-3 bg-primary/5 hover:bg-primary/10 transition-colors"
        >
          <div className="flex items-center gap-2">
            <Package className="h-4 w-4 text-primary" />
            <span className="font-semibold text-primary">{bundleName}</span>
            <span className="text-sm text-gray-500">
              ({items.length} item{items.length !== 1 ? "s" : ""})
            </span>
          </div>
          {isCollapsed ? (
            <ChevronDown className="h-5 w-5 text-primary/60" />
          ) : (
            <ChevronUp className="h-5 w-5 text-primary/60" />
          )}
        </button>

        {!isCollapsed && (
          <div className="p-3 space-y-2">
            {items.map((groupedItem) =>
              renderItemRow(groupedItem, sessionIndex),
            )}
          </div>
        )}
      </div>
    );
  };

  const renderMealSession = (
    session: MealSessionState,
    sessionIndex: number,
  ) => {
    const isExpanded = expandedSessions.has(sessionIndex);
    const restaurantGroups = groupItemsByRestaurant(session.orderItems);
    const sessionTotal = calculateSessionTotal(session.orderItems);
    const itemCount = session.orderItems.length;

    if (itemCount === 0) return null;

    return (
      <div
        key={sessionIndex}
        className="rounded-xl overflow-hidden bg-white shadow-sm"
      >
        {/* Session Header */}
        <button
          onClick={() => toggleSession(sessionIndex)}
          className="w-full flex items-center justify-between gap-3 p-4 sm:p-5 bg-gradient-to-r from-pink-50 to-pink-100 hover:from-pink-100 hover:to-pink-150 transition-colors"
        >
          <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 text-left">
            <h3 className="text-lg sm:text-xl font-bold text-primary">
              {session.sessionName || `Session ${sessionIndex + 1}`}
            </h3>
            <div className="flex flex-wrap items-center gap-2 sm:gap-3 text-sm text-gray-600">
              <span className="flex items-center gap-1">
                <Calendar className="h-4 w-4 text-pink-500" />
                {formatDate(session.sessionDate)}
              </span>
              <span className="flex items-center gap-1">
                <Clock className="h-4 w-4 text-pink-500" />
                {formatTime(session.eventTime)}
              </span>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-sm sm:text-base font-bold text-pink-600">
              £{sessionTotal.toFixed(2)}
            </span>
            {isExpanded ? (
              <ChevronUp className="h-5 w-5 text-pink-400 flex-shrink-0" />
            ) : (
              <ChevronDown className="h-5 w-5 text-pink-400 flex-shrink-0" />
            )}
          </div>
        </button>

        {/* Session Content */}
        {isExpanded && (
          <div className="p-4 sm:p-5 space-y-4">
            {/* Guest count and special requirements */}
            {(session.guestCount || session.specialRequirements) && (
              <div className="bg-gray-50 rounded-lg p-3 sm:p-4 space-y-2">
                {session.guestCount && (
                  <p className="text-sm text-gray-700">
                    <span className="font-medium">Guests:</span>{" "}
                    {session.guestCount} people
                  </p>
                )}
                {session.specialRequirements && (
                  <div>
                    <p className="text-xs font-semibold text-gray-700 mb-1 uppercase tracking-wide">
                      Special Requirements:
                    </p>
                    <p className="text-sm text-gray-600 whitespace-pre-wrap">
                      {session.specialRequirements}
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* Restaurant groups */}
            <div className="space-y-5">
              {Array.from(restaurantGroups.entries()).map(([restName, restaurant]) => {
                const restKey = `${sessionIndex}-rest-${restName}`;
                const isRestaurantCollapsed = collapsedRestaurants.has(restKey);
                const totalRestaurantItems = Array.from(restaurant.bundles.values()).reduce((sum, b) => sum + b.items.length, 0)
                  + Array.from(restaurant.categories.values()).reduce((sum, c) => sum + c.items.length + Array.from(c.subcategories.values()).reduce((s, items) => s + items.length, 0), 0);

                return (
                  <div key={restKey}>
                    {/* Restaurant Header */}
                    <button
                      onClick={() => toggleRestaurant(restKey)}
                      className="w-full flex items-center gap-3 mb-2 px-1 hover:bg-gray-50 rounded-lg py-1 transition-colors"
                    >
                      {restaurant.image ? (
                        <img src={restaurant.image} alt={restName} className="w-9 h-9 rounded-lg object-cover flex-shrink-0" />
                      ) : (
                        <Store className="w-5 h-5 text-gray-500 flex-shrink-0" />
                      )}
                      <span className="font-bold text-base text-gray-800">{restName}</span>
                      <span className="text-sm text-gray-400">({totalRestaurantItems})</span>
                      <div className="flex-1" />
                      {isRestaurantCollapsed ? (
                        <ChevronDown className="h-5 w-5 text-gray-400" />
                      ) : (
                        <ChevronUp className="h-5 w-5 text-gray-400" />
                      )}
                    </button>

                    {!isRestaurantCollapsed && (
                      <div className="space-y-3">
                        {/* Bundle groups for this restaurant */}
                        {Array.from(restaurant.bundles.entries()).map(
                          ([bundleId, { name, items }]) =>
                            renderBundleGroup(bundleId, name, items, sessionIndex),
                        )}

                        {/* Categories for this restaurant */}
                        {Array.from(restaurant.categories.entries()).map(
                          ([categoryName, categoryGroup]) =>
                            renderCategoryGroup(categoryName, categoryGroup, sessionIndex),
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Session Total */}
            <div className="border-t border-gray-200 pt-4 mt-4">
              <div className="flex justify-between text-gray-900 font-bold">
                <span>Session Total:</span>
                <span className="text-pink-600">
                  £{sessionTotal.toFixed(2)}
                </span>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  };

  // Filter out empty sessions
  const nonEmptySessions = mealSessions.filter(
    (session) => session.orderItems.length > 0,
  );

  if (nonEmptySessions.length === 0) {
    return null;
  }

  return (
    <div className="">
      <div className="flex items-center justify-between mb-4 sm:mb-6">
        <h2 className="text-xl sm:text-2xl font-bold text-gray-900">
          Your Order
        </h2>
        {onViewMenu && (
          <button
            onClick={onViewMenu}
            disabled={isGeneratingPdf}
            className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-primary bg-primary/10 hover:bg-primary/20 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isGeneratingPdf ? (
              <>
                <span className="loading loading-spinner loading-xs"></span>
                <span className="hidden sm:inline">Generating...</span>
                <span className="sm:hidden">...</span>
              </>
            ) : (
              <>
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
                <span className="hidden sm:inline">Download Menu</span>
                <span className="sm:hidden">PDF</span>
              </>
            )}
          </button>
        )}
      </div>

      <div className="space-y-4 sm:space-y-6">
        {nonEmptySessions.map((session) => {
          // Find the actual index in mealSessions array
          const actualIndex = mealSessions.indexOf(session);
          return renderMealSession(session, actualIndex);
        })}
      </div>
    </div>
  );
}
