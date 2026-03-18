"use client";

import { RefObject } from "react";
import { Search, X, ShoppingBag } from "lucide-react";
import { CategoryWithSubcategories, Subcategory } from "@/types/catering.types";
import { DietaryFilter } from "@/types/menuItem";
import { MenuItem } from "./Step2MenuItems";
import MenuItemCard from "./MenuItemCard";

export interface CategoryMenuBrowserProps {
  sessionIndex: number;
  expandedSessionIndex: number | null;
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  searchResults: MenuItem[] | null;
  searchLoading: boolean;
  categories: CategoryWithSubcategories[];
  selectedCategory: CategoryWithSubcategories | null;
  selectedSubcategory: Subcategory | null;
  categoriesLoading: boolean;
  categoriesError: string | null;
  handleCategoryClick: (cat: CategoryWithSubcategories) => void;
  handleSubcategoryClick: (sub: Subcategory) => void;
  selectedDietaryFilters: DietaryFilter[];
  toggleDietaryFilter: (filter: DietaryFilter) => void;
  menuItems: MenuItem[];
  menuItemsLoading: boolean;
  menuItemsError: string | null;
  expandedItemId: string | null;
  setExpandedItemId: (id: string | null) => void;
  getItemQuantity: (itemId: string) => number;
  handleAddItem: (item: MenuItem) => void;
  handleUpdateQuantity: (itemId: string, quantity: number) => void;
  handleAddOrderPress: (item: MenuItem) => void;
  categoriesRowRef: RefObject<HTMLDivElement>;
  firstMenuItemRef: RefObject<HTMLDivElement>;
}

export default function CategoryMenuBrowser(props: CategoryMenuBrowserProps) {
  const {
    sessionIndex,
    expandedSessionIndex,
    searchQuery,
    setSearchQuery,
    searchResults,
    searchLoading,
    categories,
    selectedCategory,
    selectedSubcategory,
    categoriesLoading,
    categoriesError,
    handleCategoryClick,
    handleSubcategoryClick,
    selectedDietaryFilters,
    toggleDietaryFilter,
    menuItems,
    menuItemsLoading,
    menuItemsError,
    expandedItemId,
    setExpandedItemId,
    getItemQuantity,
    handleAddItem,
    handleUpdateQuantity,
    handleAddOrderPress,
    categoriesRowRef,
    firstMenuItemRef,
  } = props;

  const isSearchActive = searchQuery.trim().length > 0;

  return (
    <div>
      {/* Search Bar */}
      <div className="relative mt-2 mb-2">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search menu items..."
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

      {/* Categories Row - hidden during search */}
      {!isSearchActive && (
        <div
          ref={expandedSessionIndex === sessionIndex ? categoriesRowRef : undefined}
          className="-mx-3 px-3 md:-mx-5 md:px-5 pt-2 pb-1"
        >
          <div>
            {categoriesLoading ? (
              <div className="flex items-center gap-3 overflow-x-auto pb-2">
                {[...Array(6)].map((_, i) => (
                  <div
                    key={i}
                    className="flex-shrink-0 w-28 h-10 bg-base-200 rounded-full animate-pulse"
                  />
                ))}
              </div>
            ) : categoriesError ? (
              <div className="text-center py-4 text-red-500">
                {categoriesError}
              </div>
            ) : (
              <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-hide">
                {categories.map((category) => (
                  <button
                    key={category.id}
                    onClick={() => handleCategoryClick(category)}
                    className={`
                      flex-shrink-0 px-4 py-2 rounded-full text-sm font-medium transition-all flex items-center gap-2
                      ${
                        selectedCategory?.id === category.id
                          ? "bg-primary text-white"
                          : "bg-base-200 text-gray-700 hover:bg-base-300"
                      }
                    `}
                  >
                    {(category as any).images && (
                      <img src={(category as any).images} alt="" className="h-5 w-5 object-contain rounded-sm" />
                    )}
                    {category.name}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Subcategories Row - hidden during search */}
      {!isSearchActive && selectedCategory && selectedCategory.subcategories.length > 0 && (
        <div className="sticky top-[67px] z-30 bg-white pb-1 pt-1 -mx-3 px-3 md:-mx-5 md:px-5">
          <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-hide">
            <span className="flex-shrink-0 text-xs text-gray-500 mr-1">
              {selectedCategory.name}:
            </span>
            {selectedCategory.subcategories.map((subcategory) => (
              <button
                key={subcategory.id}
                onClick={() => handleSubcategoryClick(subcategory)}
                className={`
                  flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-medium transition-all border border-primary/50
                  ${
                    selectedSubcategory?.id === subcategory.id
                      ? "bg-primary text-white"
                      : "bg-white text-primary hover:bg-secondary/20"
                  }
                `}
              >
                {subcategory.name}
                {selectedSubcategory?.id === subcategory.id && (
                  <span className="ml-1.5 inline-flex items-center justify-center w-3.5 h-3.5 rounded-full bg-white/20">
                    ×
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Dietary Restriction Filters */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 pt-1 scrollbar-hide -mx-3 px-3 md:-mx-5 md:px-5">
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
                ×
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Menu Items */}
      <div className="bg-base-100 rounded-xl p-4 mt-2">
        {isSearchActive ? (
          // Search results view
          searchLoading ? (
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
          ) : searchResults ? (
            <div>
              <h3 className="text-lg font-semibold text-gray-700 mb-3">
                {searchResults.length} result{searchResults.length !== 1 ? "s" : ""} for &ldquo;{searchQuery}&rdquo;
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {searchResults.map((item, itemIdx) => (
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
                        setExpandedItemId(
                          expandedItemId === item.id ? null : item.id
                        )
                      }
                      onAddItem={handleAddItem}
                      onUpdateQuantity={handleUpdateQuantity}
                      onAddOrderPress={handleAddOrderPress}
                    />
                  </div>
                ))}
              </div>
            </div>
          ) : null
        ) : menuItemsLoading ? (
          <div className="text-center py-4">
            <div className="inline-block w-6 h-6 border-3 border-primary border-t-transparent rounded-full animate-spin" />
            <p className="mt-2 text-sm text-gray-500">Loading...</p>
          </div>
        ) : menuItemsError ? (
          <div className="text-center py-4 text-red-500 text-sm">
            {menuItemsError}
          </div>
        ) : !selectedCategory ? (
          <div className="text-center py-6">
            <ShoppingBag className="w-8 h-8 text-gray-300 mx-auto mb-2" />
            <p className="text-gray-500 text-sm">
              Select a category to browse items
            </p>
          </div>
        ) : menuItems.length === 0 ? (
          <div className="text-center py-6">
            <p className="text-gray-500 text-sm">
              No items available for{" "}
              {selectedSubcategory?.name || selectedCategory.name}
            </p>
          </div>
        ) : (
          <div>
            <h3 className="text-lg font-semibold text-gray-700 mb-3">
              {selectedSubcategory?.name || selectedCategory.name}
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {menuItems.map((item, itemIdx) => (
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
                      setExpandedItemId(
                        expandedItemId === item.id ? null : item.id
                      )
                    }
                    onAddItem={handleAddItem}
                    onUpdateQuantity={handleUpdateQuantity}
                    onAddOrderPress={handleAddOrderPress}
                  />
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
