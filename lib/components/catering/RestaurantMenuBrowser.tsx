"use client";

import { useState, useMemo, useEffect, RefObject } from "react";
import { Search, X, ArrowLeft, ChevronDown, ChevronUp, Info } from "lucide-react";
import { MenuItem, Restaurant } from "./Step2MenuItems";
import { DietaryFilter } from "@/types/menuItem";
import MenuItemCard from "./MenuItemCard";

const CUISINE_FILTERS = [
  { id: "thai", label: "Thai", icon: "\u{1F35C}" },
  { id: "indian", label: "Indian", icon: "\u{1F35B}" },
  { id: "chinese", label: "Chinese", icon: "\u{1F961}" },
  { id: "mexican", label: "Mexican", icon: "\u{1F32E}" },
  { id: "italian", label: "Italian", icon: "\u{1F35D}" },
  { id: "japanese", label: "Japanese", icon: "\u{1F363}" },
  { id: "mediterranean", label: "Mediterranean", icon: "\u{1F959}" },
  { id: "american", label: "American", icon: "\u{1F354}" },
];

interface RestaurantMenuBrowserProps {
  restaurants: Restaurant[];
  allMenuItems: MenuItem[] | null;
  fetchAllMenuItems: () => void;
  onAddItem: (item: MenuItem) => void;
  onUpdateQuantity: (itemId: string, quantity: number) => void;
  onAddOrderPress: (item: MenuItem) => void;
  getItemQuantity: (itemId: string) => number;
  expandedItemId: string | null;
  setExpandedItemId: (id: string | null) => void;
  selectedDietaryFilters: DietaryFilter[];
  toggleDietaryFilter: (filter: DietaryFilter) => void;
  firstMenuItemRef: RefObject<HTMLDivElement | null>;
  sessionIndex: number;
  expandedSessionIndex: number | null;
}

export default function RestaurantMenuBrowser({
  restaurants,
  allMenuItems,
  fetchAllMenuItems,
  onAddItem,
  onUpdateQuantity,
  onAddOrderPress,
  getItemQuantity,
  expandedItemId,
  setExpandedItemId,
  selectedDietaryFilters,
  toggleDietaryFilter,
  firstMenuItemRef,
  sessionIndex,
  expandedSessionIndex,
}: RestaurantMenuBrowserProps) {
  // --- State ---
  const [selectedRestaurantId, setSelectedRestaurantId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCuisine, setSelectedCuisine] = useState<string | null>(null);
  const [collapsedGroups, setCollapsedGroups] = useState<Set<string>>(new Set());

  // Eagerly load all menu items on mount
  useEffect(() => {
    fetchAllMenuItems();
  }, [fetchAllMenuItems]);

  const isSearchActive = searchQuery.trim().length > 0;

  // --- Derived data ---

  // Filter out coming_soon restaurants
  const availableRestaurants = useMemo(
    () => restaurants.filter((r) => r.restaurantType !== "coming_soon"),
    [restaurants]
  );

  // Apply dietary filters to items
  const dietaryFilteredItems = useMemo(() => {
    if (!allMenuItems) return [];
    if (selectedDietaryFilters.length === 0) return allMenuItems;
    return allMenuItems.filter((item) => {
      if (!item.dietaryFilters || item.dietaryFilters.length === 0) return false;
      return selectedDietaryFilters.every((filter) =>
        item.dietaryFilters!.includes(filter)
      );
    });
  }, [allMenuItems, selectedDietaryFilters]);

  // --- View 1: Restaurant List ---

  // Search results grouped by restaurant
  const searchResults = useMemo(() => {
    if (!isSearchActive) return null;
    const query = searchQuery.toLowerCase();
    const matching = dietaryFilteredItems.filter(
      (item) =>
        item.menuItemName.toLowerCase().includes(query) ||
        item.description?.toLowerCase().includes(query) ||
        item.groupTitle?.toLowerCase().includes(query)
    );
    // Group by restaurant
    const grouped: Record<string, { restaurantName: string; items: MenuItem[] }> = {};
    matching.forEach((item) => {
      const rid = item.restaurantId;
      const rname = item.restaurant?.name || item.restaurantName || "Unknown";
      if (!grouped[rid]) {
        grouped[rid] = { restaurantName: rname, items: [] };
      }
      grouped[rid].items.push(item);
    });
    return Object.entries(grouped).sort(([, a], [, b]) =>
      a.restaurantName.localeCompare(b.restaurantName)
    );
  }, [isSearchActive, searchQuery, dietaryFilteredItems]);

  // Cuisine-filtered restaurants
  // TODO: Replace with API-provided cuisine tags. Currently matches cuisine label against restaurant name as a placeholder.
  const filteredRestaurants = useMemo(() => {
    if (!selectedCuisine) return availableRestaurants;
    const cuisine = CUISINE_FILTERS.find((c) => c.id === selectedCuisine);
    if (!cuisine) return availableRestaurants;
    return availableRestaurants.filter((r) =>
      r.restaurant_name.toLowerCase().includes(cuisine.label.toLowerCase())
    );
  }, [availableRestaurants, selectedCuisine]);

  // --- View 2: Restaurant Menu ---

  const selectedRestaurant = useMemo(
    () => availableRestaurants.find((r) => r.id === selectedRestaurantId) || null,
    [availableRestaurants, selectedRestaurantId]
  );

  const restaurantItems = useMemo(() => {
    if (!selectedRestaurantId) return [];
    return dietaryFilteredItems.filter(
      (item) => item.restaurantId === selectedRestaurantId
    );
  }, [selectedRestaurantId, dietaryFilteredItems]);

  // Group items by groupTitle, sorted by menuGroupSettings displayOrder
  const groupedItems = useMemo(() => {
    if (restaurantItems.length === 0) return [];

    // Get menuGroupSettings from the restaurant object (more reliable than item.restaurant)
    const restaurant = restaurants.find((r) => r.id === selectedRestaurantId);
    const menuGroupSettings =
      restaurant?.menuGroupSettings ||
      restaurantItems[0]?.restaurant?.menuGroupSettings;
    const hasSettings =
      menuGroupSettings && Object.keys(menuGroupSettings).length > 0;

    // Determine group order
    let groupNames: string[];
    if (hasSettings) {
      groupNames = Object.keys(menuGroupSettings!).sort((a, b) => {
        const orderA = menuGroupSettings![a]?.displayOrder ?? 999;
        const orderB = menuGroupSettings![b]?.displayOrder ?? 999;
        return orderA - orderB;
      });
    } else {
      groupNames = Array.from(
        new Set(restaurantItems.map((i) => i.groupTitle || "Other"))
      ).sort((a, b) => a.localeCompare(b));
    }

    // Bucket items into groups
    const buckets: Record<string, MenuItem[]> = {};
    groupNames.forEach((g) => (buckets[g] = []));
    restaurantItems.forEach((item) => {
      const group = item.groupTitle || "Other";
      if (!buckets[group]) buckets[group] = [];
      buckets[group].push(item);
    });

    // Helper: display price
    const getDisplayPrice = (item: MenuItem) => {
      const price = parseFloat(item.price?.toString() || "0");
      const discountPrice = parseFloat(item.discountPrice?.toString() || "0");
      return (
        (item.cateringQuantityUnit ?? 1) *
        (item.isDiscount && discountPrice > 0 ? discountPrice : price)
      );
    };

    // Build result: only groups with items
    return groupNames
      .filter((name) => buckets[name] && buckets[name].length > 0)
      .map((name) => {
        const items = buckets[name];
        // Sort by itemDisplayOrder (primary), then images first, then by price
        items.sort((a, b) => {
          const orderA = a.itemDisplayOrder ?? 999;
          const orderB = b.itemDisplayOrder ?? 999;
          if (orderA !== orderB) return orderA - orderB;
          const aHasImage = a.image && a.image.trim() !== "" ? 0 : 1;
          const bHasImage = b.image && b.image.trim() !== "" ? 0 : 1;
          if (aHasImage !== bHasImage) return aHasImage - bHasImage;
          return getDisplayPrice(a) - getDisplayPrice(b);
        });

        const information = menuGroupSettings?.[name]?.information || null;

        return {
          name,
          items,
          information,
        };
      });
  }, [restaurantItems, restaurants, selectedRestaurantId]);

  const toggleGroupCollapse = (groupName: string) => {
    setCollapsedGroups((prev) => {
      const next = new Set(prev);
      if (next.has(groupName)) {
        next.delete(groupName);
      } else {
        next.add(groupName);
      }
      return next;
    });
  };

  const handleSelectRestaurant = (restaurantId: string) => {
    setSelectedRestaurantId(restaurantId);
    setSearchQuery("");
    setSelectedCuisine(null);
    setCollapsedGroups(new Set());
  };

  const handleBackToRestaurants = () => {
    setSelectedRestaurantId(null);
    setCollapsedGroups(new Set());
  };

  // --- Dietary filter pills (shared between both views) ---
  const renderDietaryFilters = () => (
    <div className="flex items-center gap-2 overflow-x-auto pb-1 pt-1 scrollbar-hide">
      <span className="flex-shrink-0 text-xs text-gray-500 mr-1">Diet:</span>
      {(
        [
          { value: DietaryFilter.HALAL, label: "Halal" },
          { value: DietaryFilter.VEGETARIAN, label: "Vegetarian" },
          { value: DietaryFilter.VEGAN, label: "Vegan" },
          { value: DietaryFilter.PESCATERIAN, label: "Pescatarian" },
        ] as const
      ).map((option) => (
        <button
          key={option.value}
          onClick={() => toggleDietaryFilter(option.value)}
          className={`
            flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-medium transition-all border
            ${
              selectedDietaryFilters.includes(option.value)
                ? "bg-green-600 text-white border-green-600"
                : "bg-white text-gray-600 border-gray-300 hover:border-green-500 hover:text-green-600"
            }
          `}
        >
          {option.label}
          {selectedDietaryFilters.includes(option.value) && (
            <span className="ml-1.5 inline-flex items-center justify-center w-3.5 h-3.5 rounded-full bg-white/20">
              x
            </span>
          )}
        </button>
      ))}
    </div>
  );

  // ============================================================
  // VIEW 2: Restaurant Menu
  // ============================================================
  if (selectedRestaurantId && selectedRestaurant) {
    return (
      <div>
        {/* Back button */}
        <button
          onClick={handleBackToRestaurants}
          className="flex items-center gap-1.5 text-sm text-primary font-medium hover:underline mb-3"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Restaurants
        </button>

        {/* Restaurant header */}
        <div className="flex items-center gap-3 mb-3">
          {selectedRestaurant.images && selectedRestaurant.images.length > 0 ? (
            <img
              src={selectedRestaurant.images[0]}
              alt={selectedRestaurant.restaurant_name}
              className="w-14 h-14 rounded-lg object-cover flex-shrink-0"
            />
          ) : (
            <div className="w-14 h-14 rounded-lg bg-base-200 flex items-center justify-center flex-shrink-0">
              <span className="text-lg font-bold text-gray-400">
                {selectedRestaurant.restaurant_name.charAt(0)}
              </span>
            </div>
          )}
          <div>
            <h2 className="text-lg font-bold text-gray-900">
              {selectedRestaurant.restaurant_name}
            </h2>
            {selectedRestaurant.minCateringOrderQuantity &&
              selectedRestaurant.minCateringOrderQuantity > 0 && (
                <p className="text-xs text-gray-500">
                  Min order: {selectedRestaurant.minCateringOrderQuantity} items
                </p>
              )}
          </div>
        </div>

        {/* Dietary filters */}
        {renderDietaryFilters()}

        {/* Grouped items */}
        <div className="mt-3">
          {groupedItems.length === 0 ? (
            <div className="text-center py-6">
              <p className="text-gray-500 text-sm">
                No items match the selected filters.
              </p>
            </div>
          ) : (
            groupedItems.map((group) => {
              const isCollapsed = collapsedGroups.has(group.name);
              return (
                <div key={group.name} className="mb-4">
                  {/* Group header */}
                  <button
                    onClick={() => toggleGroupCollapse(group.name)}
                    className="w-full flex items-center justify-between py-2 px-1 hover:bg-gray-50 rounded-lg transition-colors"
                  >
                    <div className="flex items-center gap-2">
                      <h3 className="text-base font-bold text-primary">
                        {group.name}
                      </h3>
                      <span className="text-xs text-gray-400 font-normal">
                        ({group.items.length})
                      </span>
                    </div>
                    {isCollapsed ? (
                      <ChevronDown className="w-4 h-4 text-gray-400" />
                    ) : (
                      <ChevronUp className="w-4 h-4 text-gray-400" />
                    )}
                  </button>

                  {/* Group information */}
                  {group.information && !isCollapsed && (
                    <div className="flex items-start gap-1.5 px-1 pb-2">
                      <Info className="w-3.5 h-3.5 text-gray-400 flex-shrink-0 mt-0.5" />
                      <p className="text-xs text-gray-500 whitespace-pre-line">
                        {group.information}
                      </p>
                    </div>
                  )}

                  {/* Items grid */}
                  {!isCollapsed && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-1">
                      {group.items.map((item, itemIdx) => (
                        <div
                          key={item.id}
                          ref={
                            expandedSessionIndex === sessionIndex &&
                            itemIdx === 0 &&
                            group === groupedItems[0]
                              ? firstMenuItemRef
                              : undefined
                          }
                        >
                          <MenuItemCard
                            item={item}
                            quantity={getItemQuantity(item.id)}
                            isExpanded={expandedItemId === item.id}
                            onToggleExpand={() =>
                              setExpandedItemId(
                                expandedItemId === item.id ? null : item.id
                              )
                            }
                            onAddItem={onAddItem}
                            onUpdateQuantity={onUpdateQuantity}
                            onAddOrderPress={onAddOrderPress}
                          />
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>
    );
  }

  // ============================================================
  // VIEW 1: Restaurant List (default)
  // ============================================================
  return (
    <div>
      {/* Search bar */}
      <div className="relative mt-2 mb-2">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search across all restaurants..."
          className="w-full pl-9 pr-9 py-2.5 rounded-xl border border-base-300 bg-white text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors"
        />
        {searchQuery && (
          <button
            onClick={() => setSearchQuery("")}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Cuisine filter row - hidden during search */}
      {!isSearchActive && (
        <div className="overflow-x-auto pb-2 pt-1 scrollbar-hide -mx-3 px-3 md:-mx-5 md:px-5">
          <div className="flex items-center gap-3">
            {CUISINE_FILTERS.map((cuisine) => (
              <button
                key={cuisine.id}
                onClick={() =>
                  setSelectedCuisine(
                    selectedCuisine === cuisine.id ? null : cuisine.id
                  )
                }
                className={`
                  flex-shrink-0 flex flex-col items-center gap-0.5 px-3 py-2 rounded-xl transition-all border
                  ${
                    selectedCuisine === cuisine.id
                      ? "bg-primary/10 border-primary text-primary"
                      : "bg-base-200 border-transparent text-gray-700 hover:bg-base-300"
                  }
                `}
              >
                <span className="text-xl leading-none">{cuisine.icon}</span>
                <span className="text-[10px] font-medium">{cuisine.label}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Dietary filters */}
      {renderDietaryFilters()}

      {/* Search results view */}
      {isSearchActive ? (
        !allMenuItems ? (
          <div className="text-center py-6">
            <div className="inline-block w-6 h-6 border-3 border-primary border-t-transparent rounded-full animate-spin" />
            <p className="mt-2 text-sm text-gray-500">Loading menu items...</p>
          </div>
        ) : searchResults && searchResults.length === 0 ? (
          <div className="text-center py-6">
            <Search className="w-8 h-8 text-gray-300 mx-auto mb-2" />
            <p className="text-gray-500 text-sm">
              No items found for &ldquo;{searchQuery}&rdquo;
            </p>
          </div>
        ) : searchResults ? (
          <div className="mt-3">
            {searchResults.map(([restaurantId, group]) => (
              <div key={restaurantId} className="mb-6">
                <h3 className="text-sm font-bold text-primary mb-2">
                  {group.restaurantName}{" "}
                  <span className="text-gray-400 font-normal">
                    ({group.items.length})
                  </span>
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {group.items.map((item) => (
                    <div key={item.id}>
                      <MenuItemCard
                        item={item}
                        quantity={getItemQuantity(item.id)}
                        isExpanded={expandedItemId === item.id}
                        onToggleExpand={() =>
                          setExpandedItemId(
                            expandedItemId === item.id ? null : item.id
                          )
                        }
                        onAddItem={onAddItem}
                        onUpdateQuantity={onUpdateQuantity}
                        onAddOrderPress={onAddOrderPress}
                      />
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        ) : null
      ) : (
        /* Restaurant cards grid */
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mt-3">
          {filteredRestaurants.length === 0 ? (
            <div className="col-span-full text-center py-6">
              <p className="text-gray-500 text-sm">
                No restaurants found.
              </p>
            </div>
          ) : (
            filteredRestaurants.map((restaurant) => (
              <button
                key={restaurant.id}
                onClick={() => handleSelectRestaurant(restaurant.id)}
                className="bg-white rounded-xl border border-base-300 overflow-hidden text-left hover:shadow-md transition-shadow"
              >
                {/* 16:9 image or placeholder */}
                {restaurant.images && restaurant.images.length > 0 ? (
                  <div className="relative w-full aspect-video bg-gray-100">
                    <img
                      src={restaurant.images[0]}
                      alt={restaurant.restaurant_name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                ) : (
                  <div className="w-full aspect-video bg-base-200 flex items-center justify-center">
                    <span className="text-3xl font-bold text-gray-300">
                      {restaurant.restaurant_name.charAt(0)}
                    </span>
                  </div>
                )}
                {/* Info */}
                <div className="p-2">
                  <p className="text-sm font-semibold text-gray-900 line-clamp-1">
                    {restaurant.restaurant_name}
                  </p>
                  {restaurant.minCateringOrderQuantity &&
                    restaurant.minCateringOrderQuantity > 0 && (
                      <span className="inline-block mt-1 px-2 py-0.5 rounded-full bg-primary/10 text-primary text-[10px] font-medium">
                        Min {restaurant.minCateringOrderQuantity} items
                      </span>
                    )}
                </div>
              </button>
            ))
          )}
        </div>
      )}
    </div>
  );
}
