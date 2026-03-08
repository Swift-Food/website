# Restaurant Menu Browser Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Replace category-based menu browsing in the catering order builder with restaurant-first browsing — users pick a restaurant, then browse its items grouped by `groupTitle`.

**Architecture:** Extract the current `renderCategoriesSection` from `CateringOrderBuilder` into a `CategoryMenuBrowser.tsx` backup component. Create a new `RestaurantMenuBrowser` component with two views: restaurant list (with cuisine + dietary filters) and restaurant menu (items grouped by `groupTitle`). Swap it into `CateringOrderBuilder` in place of the old category section.

**Tech Stack:** React, Next.js, TypeScript, Tailwind CSS, lucide-react icons, existing `MenuItemCard` component, existing `useCateringData` hook.

---

### Task 1: Extract `renderCategoriesSection` to `CategoryMenuBrowser.tsx`

Preserve the old category-based browsing code for easy revert.

**Files:**
- Create: `lib/components/catering/CategoryMenuBrowser.tsx`
- Reference: `lib/components/catering/CateringOrderBuilder.tsx:963-1201`

**Step 1: Create CategoryMenuBrowser component**

Extract lines 963-1201 of `CateringOrderBuilder.tsx` (the `renderCategoriesSection` function) into a standalone component. It needs these props (currently consumed from parent scope):

```tsx
// lib/components/catering/CategoryMenuBrowser.tsx
"use client";

import { Search, X, ShoppingBag } from "lucide-react";
import { DietaryFilter } from "@/types/menuItem";
import MenuItemCard from "./MenuItemCard";
import { MenuItem } from "./Step2MenuItems";
import { CategoryWithSubcategories, Subcategory } from "@/types/catering.types";
import { RefObject } from "react";

interface CategoryMenuBrowserProps {
  sessionIndex: number;
  expandedSessionIndex: number | null;
  // Search
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  searchResults: MenuItem[] | null;
  searchLoading: boolean;
  // Categories
  categories: CategoryWithSubcategories[];
  selectedCategory: CategoryWithSubcategories | null;
  selectedSubcategory: Subcategory | null;
  categoriesLoading: boolean;
  categoriesError: string | null;
  handleCategoryClick: (cat: CategoryWithSubcategories) => void;
  handleSubcategoryClick: (sub: Subcategory) => void;
  // Dietary
  selectedDietaryFilters: DietaryFilter[];
  toggleDietaryFilter: (filter: DietaryFilter) => void;
  // Menu items
  menuItems: MenuItem[];
  menuItemsLoading: boolean;
  menuItemsError: string | null;
  // Item interaction
  expandedItemId: string | null;
  setExpandedItemId: (id: string | null) => void;
  getItemQuantity: (itemId: string) => number;
  handleAddItem: (item: MenuItem) => void;
  handleUpdateQuantity: (itemId: string, quantity: number) => void;
  handleAddOrderPress: (item: MenuItem) => void;
  // Refs
  categoriesRowRef: RefObject<HTMLDivElement>;
  firstMenuItemRef: RefObject<HTMLDivElement>;
}

export default function CategoryMenuBrowser(props: CategoryMenuBrowserProps) {
  // ... paste the JSX from renderCategoriesSection, replacing scope references with props.*
}
```

Copy the full JSX body from `renderCategoriesSection` (lines 964-1201 of `CateringOrderBuilder.tsx`), replacing all references to variables from the parent scope with `props.xyz`. The logic is purely presentational — no hooks or effects needed.

**Step 2: Verify it compiles**

Run: `npx tsc --noEmit`
Expected: No new errors

**Step 3: Commit**

```
feat: extract CategoryMenuBrowser from CateringOrderBuilder for revert safety
```

---

### Task 2: Create `RestaurantMenuBrowser` component — Restaurant List View

**Files:**
- Create: `lib/components/catering/RestaurantMenuBrowser.tsx`
- Reference: `lib/components/catering/RestaurantCatalogue.tsx` (card pattern)
- Reference: `lib/components/catering/MenuCatalogue.tsx` (groupTitle grouping)
- Reference: `lib/components/catering/Step2MenuItems.tsx` (Restaurant, MenuItem interfaces)

**Step 1: Create the component file with cuisine filter constants and props interface**

```tsx
// lib/components/catering/RestaurantMenuBrowser.tsx
"use client";

import { useState, useMemo, useEffect, RefObject } from "react";
import { Search, X, ArrowLeft, ChevronDown, ChevronUp, Info } from "lucide-react";
import { DietaryFilter } from "@/types/menuItem";
import MenuItemCard from "./MenuItemCard";
import { MenuItem, Restaurant } from "./Step2MenuItems";

const CUISINE_FILTERS = [
  { id: "thai", label: "Thai", icon: "🍜" },
  { id: "indian", label: "Indian", icon: "🍛" },
  { id: "chinese", label: "Chinese", icon: "🥡" },
  { id: "mexican", label: "Mexican", icon: "🌮" },
  { id: "italian", label: "Italian", icon: "🍝" },
  { id: "japanese", label: "Japanese", icon: "🍣" },
  { id: "mediterranean", label: "Mediterranean", icon: "🥙" },
  { id: "american", label: "American", icon: "🍔" },
] as const;

interface RestaurantMenuBrowserProps {
  restaurants: Restaurant[];
  // All menu items (for search + restaurant menu display)
  allMenuItems: MenuItem[] | null;
  fetchAllMenuItems: () => void;
  // Item interaction callbacks
  onAddItem: (item: MenuItem) => void;
  onUpdateQuantity: (itemId: string, quantity: number) => void;
  onAddOrderPress: (item: MenuItem) => void;
  getItemQuantity: (itemId: string) => number;
  expandedItemId: string | null;
  setExpandedItemId: (id: string | null) => void;
  // Dietary filters (shared state with parent)
  selectedDietaryFilters: DietaryFilter[];
  toggleDietaryFilter: (filter: DietaryFilter) => void;
  // Refs
  firstMenuItemRef: RefObject<HTMLDivElement>;
  sessionIndex: number;
  expandedSessionIndex: number | null;
}
```

**Step 2: Implement the restaurant list view**

Inside the component, manage local state:

```tsx
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
  const [selectedRestaurantId, setSelectedRestaurantId] = useState<string | null>(null);
  const [selectedCuisine, setSelectedCuisine] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [collapsedGroups, setCollapsedGroups] = useState<Set<string>>(new Set());

  // Ensure all items are loaded for search and restaurant menus
  useEffect(() => {
    if (!allMenuItems) {
      fetchAllMenuItems();
    }
  }, [allMenuItems, fetchAllMenuItems]);

  const selectedRestaurant = useMemo(
    () => restaurants.find((r) => r.id === selectedRestaurantId) || null,
    [restaurants, selectedRestaurantId]
  );

  // Filter restaurants by cuisine (dummy: for now filter by restaurant name containing cuisine)
  const filteredRestaurants = useMemo(() => {
    let filtered = restaurants.filter((r) => r.restaurantType !== "coming_soon");
    if (selectedCuisine) {
      // Dummy filter: match cuisine label against restaurant_name (case-insensitive)
      // Will be replaced by API-provided cuisine tags
      filtered = filtered.filter((r) =>
        r.restaurant_name.toLowerCase().includes(selectedCuisine.toLowerCase())
      );
    }
    return filtered;
  }, [restaurants, selectedCuisine]);

  // Search across all items
  const isSearchActive = searchQuery.trim().length > 0;

  const searchResults = useMemo(() => {
    if (!isSearchActive || !allMenuItems) return null;
    const query = searchQuery.toLowerCase().trim();
    return allMenuItems.filter((item) => {
      const matchesQuery =
        item.menuItemName.toLowerCase().includes(query) ||
        item.description?.toLowerCase().includes(query) ||
        item.groupTitle?.toLowerCase().includes(query);
      const matchesDietary =
        selectedDietaryFilters.length === 0 ||
        selectedDietaryFilters.every((f) => item.dietaryFilters?.includes(f));
      return matchesQuery && matchesDietary;
    });
  }, [searchQuery, allMenuItems, selectedDietaryFilters, isSearchActive]);

  // Group search results by restaurant
  const searchResultsByRestaurant = useMemo(() => {
    if (!searchResults) return null;
    const grouped = new Map<string, { name: string; items: MenuItem[] }>();
    searchResults.forEach((item) => {
      const rid = item.restaurantId || item.restaurant?.id || "unknown";
      const rName = item.restaurantName || item.restaurant?.name || "Unknown";
      if (!grouped.has(rid)) {
        grouped.set(rid, { name: rName, items: [] });
      }
      grouped.get(rid)!.items.push(item);
    });
    return grouped;
  }, [searchResults]);

  // Handle cuisine filter toggle
  const handleCuisineClick = (cuisineId: string) => {
    setSelectedCuisine((prev) => (prev === cuisineId ? null : cuisineId));
  };

  // Handle restaurant card click
  const handleRestaurantClick = (restaurantId: string) => {
    setSelectedRestaurantId(restaurantId);
    setSearchQuery("");
  };

  // Handle back to restaurant list
  const handleBackToRestaurants = () => {
    setSelectedRestaurantId(null);
    setCollapsedGroups(new Set());
  };

  // If a restaurant is selected, render the menu view (Task 3)
  if (selectedRestaurant) {
    return renderRestaurantMenu();  // Implemented in Task 3
  }

  // Render restaurant list view
  return (
    <div>
      {/* Search Bar */}
      <div className="relative mt-2 mb-2">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search menu items across all restaurants..."
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

      {/* Cuisine Filter Row */}
      {!isSearchActive && (
        <div className="overflow-x-auto scrollbar-hide -mx-3 px-3 md:-mx-5 md:px-5 pb-2">
          <div className="flex items-center gap-3">
            {CUISINE_FILTERS.map((cuisine) => (
              <button
                key={cuisine.id}
                onClick={() => handleCuisineClick(cuisine.id)}
                className={`flex-shrink-0 flex flex-col items-center gap-1 px-3 py-2 rounded-xl transition-all min-w-[64px]
                  ${selectedCuisine === cuisine.id
                    ? "bg-primary/10 border-2 border-primary"
                    : "bg-base-200 border-2 border-transparent hover:bg-base-300"
                  }`}
              >
                <span className="text-2xl">{cuisine.icon}</span>
                <span className={`text-xs font-medium ${
                  selectedCuisine === cuisine.id ? "text-primary" : "text-gray-600"
                }`}>
                  {cuisine.label}
                </span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Dietary Filter Row */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 pt-1 scrollbar-hide -mx-3 px-3 md:-mx-5 md:px-5">
        <span className="flex-shrink-0 text-xs text-gray-500 mr-1">Diet:</span>
        {([
          { value: DietaryFilter.HALAL, label: "Halal" },
          { value: DietaryFilter.VEGETARIAN, label: "Vegetarian" },
          { value: DietaryFilter.VEGAN, label: "Vegan" },
          { value: DietaryFilter.PESCATERIAN, label: "Pescatarian" },
        ] as const).map((option) => (
          <button
            key={option.value}
            onClick={() => toggleDietaryFilter(option.value)}
            className={`flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-medium transition-all border
              ${selectedDietaryFilters.includes(option.value)
                ? "bg-green-600 text-white border-green-600"
                : "bg-white text-gray-600 border-gray-300 hover:border-green-500 hover:text-green-600"
              }`}
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

      {/* Search Results or Restaurant Grid */}
      <div className="bg-base-100 rounded-xl p-4 mt-2">
        {isSearchActive ? (
          // Search results grouped by restaurant
          !allMenuItems ? (
            <div className="text-center py-4">
              <div className="inline-block w-6 h-6 border-3 border-primary border-t-transparent rounded-full animate-spin" />
              <p className="mt-2 text-sm text-gray-500">Searching...</p>
            </div>
          ) : searchResults && searchResults.length === 0 ? (
            <div className="text-center py-6">
              <Search className="w-8 h-8 text-gray-300 mx-auto mb-2" />
              <p className="text-gray-500 text-sm">
                No items found for &ldquo;{searchQuery}&rdquo;
              </p>
            </div>
          ) : searchResultsByRestaurant ? (
            <div className="space-y-6">
              {Array.from(searchResultsByRestaurant.entries()).map(([rid, { name, items }]) => (
                <div key={rid}>
                  <h3 className="text-lg font-semibold text-gray-700 mb-3">
                    {name} ({items.length} result{items.length !== 1 ? "s" : ""})
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {items.map((item) => (
                      <MenuItemCard
                        key={item.id}
                        item={item}
                        quantity={getItemQuantity(item.id)}
                        isExpanded={expandedItemId === item.id}
                        onToggleExpand={() =>
                          setExpandedItemId(expandedItemId === item.id ? null : item.id)
                        }
                        onAddItem={onAddItem}
                        onUpdateQuantity={onUpdateQuantity}
                        onAddOrderPress={onAddOrderPress}
                      />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          ) : null
        ) : (
          // Restaurant cards grid
          <div>
            <h3 className="text-lg font-semibold text-gray-700 mb-3">
              {selectedCuisine
                ? `${CUISINE_FILTERS.find((c) => c.id === selectedCuisine)?.label || ""} Restaurants`
                : "All Restaurants"}
            </h3>
            {filteredRestaurants.length === 0 ? (
              <p className="text-gray-500 text-sm text-center py-6">
                No restaurants found{selectedCuisine ? " for this cuisine" : ""}.
              </p>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {filteredRestaurants.map((restaurant) => (
                  <button
                    key={restaurant.id}
                    onClick={() => handleRestaurantClick(restaurant.id)}
                    className="text-left bg-white rounded-xl border border-base-300 hover:border-primary hover:shadow-md transition-all overflow-hidden group"
                  >
                    {/* Restaurant image */}
                    <div className="aspect-[16/9] bg-base-200 overflow-hidden">
                      {restaurant.images?.[0] ? (
                        <img
                          src={restaurant.images[0]}
                          alt={restaurant.restaurant_name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-400 text-sm font-medium">
                          {restaurant.restaurant_name}
                        </div>
                      )}
                    </div>
                    {/* Restaurant info */}
                    <div className="p-3">
                      <h4 className="font-semibold text-sm text-gray-800 truncate">
                        {restaurant.restaurant_name}
                      </h4>
                      {restaurant.minCateringOrderQuantity && restaurant.minCateringOrderQuantity > 1 && (
                        <p className="text-xs text-amber-600 mt-1">
                          Min {restaurant.minCateringOrderQuantity} portions
                        </p>
                      )}
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );

  // --- Restaurant Menu View (placeholder, built in Task 3) ---
  function renderRestaurantMenu() {
    return <div>Restaurant menu placeholder</div>;
  }
}
```

**Step 3: Verify it compiles**

Run: `npx tsc --noEmit`
Expected: No new errors (the component isn't wired up yet, just needs to compile)

**Step 4: Commit**

```
feat: add RestaurantMenuBrowser component with restaurant list view
```

---

### Task 3: Implement Restaurant Menu View inside `RestaurantMenuBrowser`

**Files:**
- Modify: `lib/components/catering/RestaurantMenuBrowser.tsx`
- Reference: `lib/components/catering/MenuCatalogue.tsx:279-539` (groupTitle grouping logic)

**Step 1: Implement `renderRestaurantMenu` function**

Replace the placeholder `renderRestaurantMenu` function with the full implementation. This shows the selected restaurant's items grouped by `groupTitle`, with dietary filters and a back button.

```tsx
function renderRestaurantMenu() {
  if (!selectedRestaurant || !allMenuItems) return null;

  // Get items for this restaurant, apply dietary filters
  const restaurantItems = allMenuItems.filter((item) => {
    const matchesRestaurant =
      item.restaurantId === selectedRestaurant.id ||
      item.restaurant?.id === selectedRestaurant.id;
    const matchesDietary =
      selectedDietaryFilters.length === 0 ||
      selectedDietaryFilters.every((f) => item.dietaryFilters?.includes(f));
    return matchesRestaurant && matchesDietary;
  });

  // Group by groupTitle, sorted by menuGroupSettings displayOrder
  const groups = new Map<string, MenuItem[]>();
  restaurantItems.forEach((item) => {
    const group = item.groupTitle || "Other";
    if (!groups.has(group)) groups.set(group, []);
    groups.get(group)!.push(item);
  });

  // Sort groups by menuGroupSettings if available
  const menuGroupSettings = restaurantItems[0]?.restaurant?.menuGroupSettings;
  const sortedGroupNames = Array.from(groups.keys()).sort((a, b) => {
    const orderA = menuGroupSettings?.[a]?.displayOrder ?? 999;
    const orderB = menuGroupSettings?.[b]?.displayOrder ?? 999;
    return orderA - orderB;
  });

  // Sort items within each group: items with images first, then by price
  sortedGroupNames.forEach((groupName) => {
    const items = groups.get(groupName)!;
    items.sort((a, b) => {
      const aHasImage = a.image ? 0 : 1;
      const bHasImage = b.image ? 0 : 1;
      if (aHasImage !== bHasImage) return aHasImage - bHasImage;
      const aPrice = parseFloat(a.discountPrice || a.price) || 0;
      const bPrice = parseFloat(b.discountPrice || b.price) || 0;
      return aPrice - bPrice;
    });
  });

  const toggleGroup = (groupName: string) => {
    setCollapsedGroups((prev) => {
      const next = new Set(prev);
      if (next.has(groupName)) next.delete(groupName);
      else next.add(groupName);
      return next;
    });
  };

  return (
    <div>
      {/* Back Button */}
      <button
        onClick={handleBackToRestaurants}
        className="flex items-center gap-2 text-sm text-gray-600 hover:text-primary transition-colors mb-3 mt-1"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Back to Restaurants</span>
      </button>

      {/* Restaurant Header */}
      <div className="flex items-center gap-3 mb-3">
        {selectedRestaurant.images?.[0] && (
          <img
            src={selectedRestaurant.images[0]}
            alt={selectedRestaurant.restaurant_name}
            className="w-12 h-12 rounded-xl object-cover"
          />
        )}
        <div>
          <h3 className="text-lg font-bold text-gray-800">
            {selectedRestaurant.restaurant_name}
          </h3>
          {selectedRestaurant.minCateringOrderQuantity && selectedRestaurant.minCateringOrderQuantity > 1 && (
            <p className="text-xs text-amber-600">
              Min {selectedRestaurant.minCateringOrderQuantity} portions per item
            </p>
          )}
        </div>
      </div>

      {/* Dietary Filters */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 pt-1 scrollbar-hide -mx-3 px-3 md:-mx-5 md:px-5">
        <span className="flex-shrink-0 text-xs text-gray-500 mr-1">Diet:</span>
        {([
          { value: DietaryFilter.HALAL, label: "Halal" },
          { value: DietaryFilter.VEGETARIAN, label: "Vegetarian" },
          { value: DietaryFilter.VEGAN, label: "Vegan" },
          { value: DietaryFilter.PESCATERIAN, label: "Pescatarian" },
        ] as const).map((option) => (
          <button
            key={option.value}
            onClick={() => toggleDietaryFilter(option.value)}
            className={`flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-medium transition-all border
              ${selectedDietaryFilters.includes(option.value)
                ? "bg-green-600 text-white border-green-600"
                : "bg-white text-gray-600 border-gray-300 hover:border-green-500 hover:text-green-600"
              }`}
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

      {/* Menu Items by Group */}
      <div className="bg-base-100 rounded-xl p-4 mt-2">
        {restaurantItems.length === 0 ? (
          <p className="text-gray-500 text-sm text-center py-6">
            No items available{selectedDietaryFilters.length > 0 ? " for the selected dietary filters" : ""}.
          </p>
        ) : (
          <div className="space-y-4">
            {sortedGroupNames.map((groupName) => {
              const items = groups.get(groupName)!;
              const isCollapsed = collapsedGroups.has(groupName);
              const groupInfo = menuGroupSettings?.[groupName]?.information;

              return (
                <div key={groupName}>
                  <button
                    onClick={() => toggleGroup(groupName)}
                    className="flex items-center justify-between w-full text-left mb-2"
                  >
                    <h4 className="text-md font-semibold text-gray-700">
                      {groupName}
                      <span className="text-xs font-normal text-gray-400 ml-2">
                        ({items.length})
                      </span>
                    </h4>
                    {isCollapsed ? (
                      <ChevronDown className="w-4 h-4 text-gray-400" />
                    ) : (
                      <ChevronUp className="w-4 h-4 text-gray-400" />
                    )}
                  </button>
                  {groupInfo && !isCollapsed && (
                    <p className="text-xs text-gray-500 mb-2 flex items-start gap-1">
                      <Info className="w-3 h-3 mt-0.5 flex-shrink-0" />
                      {groupInfo}
                    </p>
                  )}
                  {!isCollapsed && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {items.map((item, itemIdx) => (
                        <div
                          key={item.id}
                          ref={
                            expandedSessionIndex === sessionIndex && itemIdx === 0
                              ? firstMenuItemRef
                              : undefined
                          }
                        >
                          <MenuItemCard
                            item={item}
                            quantity={getItemQuantity(item.id)}
                            isExpanded={expandedItemId === item.id}
                            onToggleExpand={() =>
                              setExpandedItemId(expandedItemId === item.id ? null : item.id)
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
            })}
          </div>
        )}
      </div>
    </div>
  );
}
```

**Step 2: Verify it compiles**

Run: `npx tsc --noEmit`
Expected: No new errors

**Step 3: Commit**

```
feat: add restaurant menu view with groupTitle grouping to RestaurantMenuBrowser
```

---

### Task 4: Expose `allMenuItems` and `fetchAllMenuItems` from `useCateringData`

The `RestaurantMenuBrowser` needs access to all menu items (currently only exposed as `searchResults` after a query). We need to expose the raw data and the fetch function.

**Files:**
- Modify: `lib/components/catering/hooks/useCateringData.ts`
- Modify: `lib/components/catering/types.ts` (if `UseCateringDataReturn` type is defined there)

**Step 1: Add `allMenuItems` and `fetchAllMenuItems` to the hook's return**

In `useCateringData.ts`, find the return statement (around line 252). Add these two to it:

```ts
// Add to the return object:
allMenuItems,        // MenuItem[] | null — the cached full item list
fetchAllMenuItems,   // () => void — triggers the lazy fetch if not already loaded
```

The `fetchAllMenuItems` function already exists internally in the hook (around line 147). Just expose it. The `allMenuItems` state already exists too. Simply add them to the return object.

**Step 2: Update the `UseCateringDataReturn` type if it exists in `types.ts`**

Check `lib/components/catering/types.ts` for a return type. If it exists, add:
```ts
allMenuItems: MenuItem[] | null;
fetchAllMenuItems: () => void;
```

**Step 3: Verify it compiles**

Run: `npx tsc --noEmit`

**Step 4: Commit**

```
feat: expose allMenuItems and fetchAllMenuItems from useCateringData hook
```

---

### Task 5: Wire `RestaurantMenuBrowser` into `CateringOrderBuilder`

**Files:**
- Modify: `lib/components/catering/CateringOrderBuilder.tsx`

**Step 1: Add import for RestaurantMenuBrowser**

Add at the top of the imports section (around line 22):
```ts
import RestaurantMenuBrowser from "./RestaurantMenuBrowser";
```

**Step 2: Get `allMenuItems` and `fetchAllMenuItems` from useCateringData**

Update the destructuring of `useCateringData` (around line 124) to include:
```ts
const {
  // ... existing destructured values ...
  allMenuItems,
  fetchAllMenuItems,
} = useCateringData({ expandedSessionIndex });
```

**Step 3: Replace `renderCategoriesSection` call with `RestaurantMenuBrowser`**

In `renderSessionContent` (line 1240), replace:
```tsx
{renderCategoriesSection(index)}
```
with:
```tsx
<RestaurantMenuBrowser
  restaurants={restaurants}
  allMenuItems={allMenuItems}
  fetchAllMenuItems={fetchAllMenuItems}
  onAddItem={handleAddItem}
  onUpdateQuantity={handleUpdateQuantity}
  onAddOrderPress={handleAddOrderPress}
  getItemQuantity={getItemQuantity}
  expandedItemId={expandedItemId}
  setExpandedItemId={setExpandedItemId}
  selectedDietaryFilters={selectedDietaryFilters}
  toggleDietaryFilter={toggleDietaryFilter}
  firstMenuItemRef={firstMenuItemRef}
  sessionIndex={index}
  expandedSessionIndex={expandedSessionIndex}
/>
```

**Step 4: Remove unused imports**

After replacing, these imports from `CateringOrderBuilder` may become unused:
- `Search`, `X`, `ShoppingBag` from lucide-react (check if used elsewhere in the file)
- `DietaryFilter` from `@/types/menuItem` (check if used elsewhere)
- `MenuItemCard` (check — still used by edit modal? No, edit modal uses `MenuItemModal`)

Only remove imports that are truly unused after the swap. The `renderCategoriesSection` function itself (lines 963-1201) can be deleted from the file since it's preserved in `CategoryMenuBrowser.tsx`.

**Step 5: Verify it compiles and the app loads**

Run: `npx tsc --noEmit`
Then: `npm run dev` and check the catering builder page renders correctly

**Step 6: Commit**

```
feat: wire RestaurantMenuBrowser into CateringOrderBuilder, replacing category browsing
```

---

### Task 6: Visual QA and cleanup

**Files:**
- Possibly tweak: `lib/components/catering/RestaurantMenuBrowser.tsx`

**Step 1: Manual visual check**

Open the catering builder in the browser. Verify:
- Cuisine filter row scrolls horizontally, icons render above labels
- Dietary filters show below cuisine filters
- Restaurant cards display in a grid with images and names
- Clicking a restaurant shows its menu grouped by groupTitle
- Back button returns to restaurant list
- Search bar searches across all restaurants, results grouped by restaurant name
- Adding items to cart works (quantities update on MenuItemCards)
- `SelectedItemsByCategory` still shows the cart correctly above the menu browser

**Step 2: Fix any styling or layout issues found**

**Step 3: Commit**

```
fix: visual adjustments to RestaurantMenuBrowser
```

---

## Revert Instructions

To revert to category-based browsing:
1. In `CateringOrderBuilder.tsx`, import `CategoryMenuBrowser` instead of `RestaurantMenuBrowser`
2. Replace `<RestaurantMenuBrowser ...>` in `renderSessionContent` with `<CategoryMenuBrowser ...>` passing the appropriate props
3. The `CategoryMenuBrowser.tsx` file contains the exact original code
