import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { cateringService } from "@/services/cateringServices";
import { useCatering } from "@/context/CateringContext";
import MenuItemModal from "./MenuItemModal";
import { promotionsServices } from "@/services/promotionServices";
import RestaurantCatalogue from "./RestaurantCatalogue";
import MenuCatalogue from "./MenuCatalogue";
import { useCateringFilters } from "@/context/CateringFilterContext";

export interface Restaurant {
  id: string;
  restaurant_name: string;
  images: string[];
  averageRating: string;
  minCateringOrderQuantity?: number;
  minimumDeliveryNoticeHours?: number;
  contactEmail?: string; // Add this
  contactNumber?: string; // Add this
  cateringMinOrderSettings: {
    required?: {
      minQuantity: number;
      applicableSections: string[]; // Sections that MUST be ordered from
    };
    optional?: Array<{
      minQuantity: number;
      applicableSections: string[]; // If any item from these sections is ordered, this min applies
    }>;
  } | null;
  cateringOperatingHours?:
    | {
        day: string;
        open: string | null;
        close: string | null;
        enabled: boolean;
      }[]
    | null;
}

export interface Addon {
  name: string;
  price: string;
  allergens: string;
  groupTitle: string;
  isRequired: boolean;
  selectionType: "single" | "multiple";
}

export interface MenuItem {
  id: string;
  name: string;
  description?: string;
  price: string;
  discountPrice?: string;
  allergens?: string[];
  isDiscount: boolean;
  image?: string;
  averageRating?: string;
  cateringQuantityUnit?: number;
  feedsPerUnit?: number;
  restaurantId: string;
  groupTitle?: string;
  status?: string;
  itemDisplayOrder: number;
  addons: Addon[];
  selectedAddons?: {
    name: string;
    price: number;
    quantity: number;
    groupTitle: string;
  }[];
  addonPrice?: number;
  portionQuantity?: number; // Number of portions selected in modal
  restaurant?: {
    id: string;
    name: string;
    restaurantId: string;
    menuGroupSettings?: Record<string, any>;
  };
  dietaryFilters?: string[]; // Add this
}

export default function Step2MenuItems() {
  // const [sortedGroups, setSortedGroups] = useState<string[]>([]);
  // const [groupedItems, setGroupedItems] = useState<Record<string, MenuItem[]>>(
  //   {}
  // );

  const router = useRouter();
  const searchParams = useSearchParams();
  const { filters } = useCateringFilters();

  const {
    selectedItems,
    totalPrice,
    addMenuItem,
    removeMenuItemByIndex,
    getTotalPrice,
    updateItemQuantity,
    updateMenuItemByIndex,
    setCurrentStep,
    setSelectedRestaurants,
    restaurantPromotions, // FROM CONTEXT
    setRestaurantPromotions, // FROM CONTEXT
    subtotalBeforeDiscount, // FROM CONTEXT
    promotionDiscount, // FROM CONTEXT
    finalTotal, // FROM CONTEXT
  } = useCatering();

  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [selectedRestaurantId, setSelectedRestaurantId] = useState<
    string | null
  >(null);
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [restaurantsLoading, setRestaurantsLoading] = useState(true);

  // Catalogue-level search (API-based)
  const [catalogueSearchQuery, setCatalogueSearchQuery] = useState("");
  const [catalogueSearchResults, setCatalogueSearchResults] = useState<
    MenuItem[] | null
  >(null);
  const [isCatalogueSearchActive, setIsCatalogueSearchActive] = useState(false);

  // Restaurant-level search (Frontend-based)
  const [restaurantSearchQuery, setRestaurantSearchQuery] = useState("");
  const [restaurantMenuItems, setRestaurantMenuItems] = useState<MenuItem[]>(
    []
  );

  const [showCartMobile, setShowCartMobile] = useState(false);
  const [expandedItemId, setExpandedItemId] = useState<string | null>(null);
  const [editingItemIndex, setEditingItemIndex] = useState<number | null>(null);
  const [filterModalOpen, setFilterModalOpen] = useState(false);

  // Date/Time/Budget state for filter row (read-only display for now)
  const deliveryDate = "Tomorrow";
  const deliveryTime = "12:00 PM - 2:00 PM";
  const eventBudget = "£500";

  // Helper: stable sort items by restaurant name (fallback to id)
  const sortByRestaurant = (items: MenuItem[] | null) => {
    if (!items || items.length === 0) return [];
    return [...items].sort((a, b) => {
      const getName = (item: MenuItem) =>
        (
          item?.restaurant?.name ||
          item?.restaurant?.restaurantId ||
          item?.restaurantId ||
          ""
        )
          .toString()
          .toLowerCase();
      return getName(a).localeCompare(getName(b));
    });
  };

  // Read restaurant ID from URL on mount
  useEffect(() => {
    const restaurantIdFromUrl = searchParams.get("restaurantId");
    if (restaurantIdFromUrl) {
      setSelectedRestaurantId(restaurantIdFromUrl);
    }
  }, [searchParams]);

  // Scroll to top when component mounts
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  // Fetch all restaurants and menu items on mount
  useEffect(() => {
    fetchRestaurants();
    fetchAllMenuItems();
    getTotalPrice();
  }, []);
  useEffect(() => {
    const restaurantIds = new Set(
      selectedItems.map((item) => item.item.restaurantId)
    );
    const selectedRests = restaurants.filter((r) => restaurantIds.has(r.id));
    setSelectedRestaurants(selectedRests);
  }, [selectedItems, restaurants]);

  const fetchRestaurantPromotions = async (restaurantIds: string[]) => {
    const promotionsMap: Record<string, any[]> = {};

    await Promise.all(
      restaurantIds.map(async (restaurantId) => {
        try {
          const promos = await promotionsServices.getActivePromotions(
            restaurantId,
            "CATERING"
          );
          if (promos && promos.length > 0) {
            promotionsMap[restaurantId] = promos;
          }
        } catch (error) {
          console.error(
            `Failed to fetch promotions for ${restaurantId}:`,
            error
          );
        }
      })
    );

    setRestaurantPromotions(promotionsMap); // USE CONTEXT SETTER
  };

  useEffect(() => {
    console.log("Selected Items:", selectedItems);
  }, [selectedItems]);

  const fetchAllMenuItems = async () => {
    setLoading(true);
    try {
      const response = await cateringService.getMenuItems();
      console.log("All menu items response:", response);

      const menuItemsOnly = (response || []).map((item: any) => {
        return {
          id: item.id,
          name: item.name,
          description: item.description,
          price: item.price?.toString() || "0",
          discountPrice: item.discountPrice?.toString(),
          isDiscount: item.isDiscount || false,
          image: item.image,
          averageRating: item.averageRating?.toString(),
          restaurantId: item.restaurantId || "",
          cateringQuantityUnit: item.cateringQuantityUnit || 7,
          feedsPerUnit: item.feedsPerUnit || 10,
          groupTitle: item.groupTitle,
          status: item.status,
          itemDisplayOrder: item.itemDisplayOrder,
          addons: Array.isArray(item.addons) ? item.addons : [],
          allergens: Array.isArray(item.allergens) ? item.allergens : [],
          restaurant: {
            id: item.restaurantId,
            name: item.restaurant?.restaurant_name || "Unknown",
            restaurantId: item.restaurantId,
            menuGroupSettings: item.restaurant?.menuGroupSettings,
          },
          dietaryFilters: item.dietaryFilters, // Add this
        };
      });

      setMenuItems(menuItemsOnly);

    } catch (error) {
      console.error("Error fetching all menu items:", error);
      setMenuItems([]);
    } finally {
      setLoading(false);
    }
  };

  // Populate restaurantMenuItems when a restaurant is selected
  useEffect(() => {
    if (selectedRestaurantId) {
      const filtered = menuItems.filter(
        (item) => item.restaurantId === selectedRestaurantId
      );
      setRestaurantMenuItems(sortByRestaurant(filtered));
    }
  }, [selectedRestaurantId, menuItems]);

  const fetchRestaurants = async () => {
    setRestaurantsLoading(true);
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/restaurant/catering/restaurants`
      );
      const data = await response.json();
      const sortedRestaurants = data.sort((a: Restaurant, b: Restaurant) => {
        const aNotice = a.minimumDeliveryNoticeHours ?? 0;
        const bNotice = b.minimumDeliveryNoticeHours ?? 0;
        return aNotice - bNotice;
      });
      setRestaurants(sortedRestaurants);
      const restaurantIds = sortedRestaurants.map((r: Restaurant) => r.id);
      await fetchRestaurantPromotions(restaurantIds);
    } catch (error) {
      console.error("Error fetching restaurants:", error);
    } finally {
      setRestaurantsLoading(false);
    }
  };

  const getRestaurantItemCounts = () => {
    const counts: Record<
      string,
      {
        required?: {
          count: number;
          minRequired: number;
          sections: string[];
        };
        optional?: Array<{
          count: number;
          minRequired: number;
          sections: string[];
          hasItems: boolean;
        }>;
        name: string;
        hasAnyItems: boolean;
      }
    > = {};

    selectedItems.forEach(({ item, quantity }) => {
      const restaurantId = item.restaurantId;
      if (!restaurantId) return;

      const restaurant = restaurants.find((r) => r.id === restaurantId);
      const settings = restaurant?.cateringMinOrderSettings;

      if (!counts[restaurantId]) {
        counts[restaurantId] = {
          name: restaurant?.restaurant_name || "Unknown Restaurant",
          hasAnyItems: false,
        };

        // ✅ Handle required as array (take first element as the main required rule)
        if (
          settings?.required &&
          Array.isArray(settings.required) &&
          settings.required.length > 0
        ) {
          const firstRequired = settings.required[0];
          counts[restaurantId].required = {
            count: 0,
            minRequired: firstRequired.minQuantity || 0,
            sections: firstRequired.applicableSections || [],
          };
        }

        // Initialize optional settings
        if (
          settings?.optional &&
          Array.isArray(settings.optional) &&
          settings.optional.length > 0
        ) {
          counts[restaurantId].optional = settings.optional.map((rule) => ({
            count: 0,
            minRequired: rule.minQuantity || 0,
            sections: rule.applicableSections || [],
            hasItems: false,
          }));
        }
      }

      counts[restaurantId].hasAnyItems = true;

      const BACKEND_QUANTITY_UNIT = item.cateringQuantityUnit || 7;
      const normalizedQuantity = quantity / BACKEND_QUANTITY_UNIT;

      // Count for REQUIRED sections
      const requiredRule = counts[restaurantId]?.required;
      if (requiredRule) {
        const sections = requiredRule.sections || [];
        const isFromRequiredSection =
          sections.length === 0 ||
          (item.groupTitle && sections.includes(item.groupTitle));

        if (isFromRequiredSection) {
          requiredRule.count += normalizedQuantity;
        }
      }

      // Count for OPTIONAL sections
      const optionalRules = counts[restaurantId]?.optional;
      if (optionalRules && Array.isArray(optionalRules)) {
        optionalRules.forEach((rule) => {
          const sections = rule.sections || [];
          if (item.groupTitle && sections.includes(item.groupTitle)) {
            rule.hasItems = true;
            rule.count += normalizedQuantity;
          }
        });
      }
    });

    return counts;
  };

  const getMinimumOrderWarnings = () => {
    const counts = getRestaurantItemCounts();
    const warnings: string[] = [];
  
    Object.entries(counts).forEach(([, data]) => {
     
      // Check REQUIRED sections - applies if ANY item from restaurant is ordered
      if (data.required) {
       
        if (data.hasAnyItems && data.required.count < data.required.minRequired) {
          const shortage = data.required.minRequired - data.required.count;
          const sectionInfo =
            data.required.sections.length > 0
              ? ` from sections: ${data.required.sections.join(", ")}`
              : "";
          const warning = `${data.name}: Add ${shortage} more required item(s)${sectionInfo}`;
        
          warnings.push(warning);
        } 
      } 
      // Check OPTIONAL sections
      if (data.optional) {
       
        data.optional.forEach((rule, index) => {
          console.log(`    Rule ${index}:`, {
            hasItems: rule.hasItems,
            count: rule.count,
            minRequired: rule.minRequired,
            sections: rule.sections
          });
          
          if (rule.hasItems && rule.count < rule.minRequired) {
            const shortage = rule.minRequired - rule.count;
            const warning = `${data.name}: Add ${shortage} more item(s) from sections: ${rule.sections.join(", ")}`;
            
            warnings.push(warning);
          }
        });
      }
    });
  
  
    return warnings;
  };

  // CATALOGUE-LEVEL SEARCH (API-based)
  const handleCatalogueSearch = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();

    const hasNoFilters =
      (!filters.dietaryRestrictions ||
        filters.dietaryRestrictions.length === 0) &&
      (!filters.allergens || filters.allergens.length === 0);

    if (!catalogueSearchQuery.trim() && hasNoFilters) {
      clearCatalogueSearch();
      return;
    }

    setIsCatalogueSearchActive(true);
    setLoading(true);

    try {
      const response = await cateringService.searchMenuItems(
        catalogueSearchQuery,
        {
          page: 1,
          limit: 50,
          dietaryFilters: filters.dietaryRestrictions,
          allergens: filters.allergens,
        }
      );

      setCatalogueSearchResults(response.menuItems || []);
    } catch (error) {
      console.error("Error searching menu items:", error);
      setCatalogueSearchResults([]);
    } finally {
      setLoading(false);
    }
  };

  const clearCatalogueSearch = () => {
    setCatalogueSearchQuery("");
    setIsCatalogueSearchActive(false);
    setCatalogueSearchResults(null);
  };

  // RESTAURANT-LEVEL SEARCH (Frontend-based)
  const handleRestaurantSearch = (e?: React.FormEvent) => {
    if (e) e.preventDefault();

    if (!selectedRestaurantId) return;

    setLoading(true);

    // Start with all items for this restaurant
    let filtered = menuItems.filter(
      (item) => item.restaurantId === selectedRestaurantId
    );

    // Apply text search
    if (restaurantSearchQuery.trim()) {
      const query = restaurantSearchQuery.toLowerCase();
      filtered = filtered.filter(
        (item) =>
          item.name.toLowerCase().includes(query) ||
          item.description?.toLowerCase().includes(query) ||
          item.groupTitle?.toLowerCase().includes(query)
      );
    }

    // Apply allergen filters (exclude items with selected allergens)
    if (filters.allergens && filters.allergens.length > 0) {
      filtered = filtered.filter(
        (item) =>
          !item.allergens?.some((allergen) =>
            filters.allergens.includes(allergen as any)
          )
      );
    }

    // Apply dietary restriction filters
    if (filters.dietaryRestrictions && filters.dietaryRestrictions.length > 0) {
      console.log(filters.dietaryRestrictions)
      filtered = filtered.filter(
        (item) =>
          !filters.dietaryRestrictions ||
          filters.dietaryRestrictions.length === 0 ||
          filters.dietaryRestrictions.some((restriction) =>
            item.dietaryFilters?.includes(restriction)
          )
      );
    }

    setRestaurantMenuItems(sortByRestaurant(filtered));
    setLoading(false);
  };

  useEffect(() => {
    handleRestaurantSearch();
  }, [restaurantSearchQuery]);

  const clearRestaurantSearch = () => {
    setRestaurantSearchQuery("");
    // Reset to all items for the selected restaurant
    if (selectedRestaurantId) {
      const filtered = menuItems.filter(
        (item) => item.restaurantId === selectedRestaurantId
      );
      setRestaurantMenuItems(sortByRestaurant(filtered));
    }
  };

  // Function to update restaurant ID in both state and URL
  const updateSelectedRestaurant = (restaurantId: string | null) => {
    setSelectedRestaurantId(restaurantId);

    // If selecting a restaurant, clear catalogue search
    if (restaurantId) {
      clearCatalogueSearch();
    } else {
      // If deselecting restaurant, clear restaurant search
      clearRestaurantSearch();
    }

    // Update URL params
    const params = new URLSearchParams(searchParams.toString());
    if (restaurantId) {
      params.set("restaurantId", restaurantId);
    } else {
      params.delete("restaurantId");
    }
    router.push(`?${params.toString()}`, { scroll: false });
  };

  // Re-run search when filters change
  useEffect(() => {
    if (
      filters.dietaryRestrictions.length > 0 ||
      filters.allergens.length > 0
    ) {
      if (selectedRestaurantId) {
        // Restaurant view - use frontend filtering
        handleRestaurantSearch();
      } else {
        // Catalogue view - use API search
        handleCatalogueSearch();
      }
    } else {
      // No filters active
      if (selectedRestaurantId) {
        clearRestaurantSearch();
      } else {
        clearCatalogueSearch();
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters]);

  const getItemQuantity = (itemId: string, item?: MenuItem) => {
    // For items with addons, always return 0 so the card shows "Add to Order"
    // This allows users to add the same item with different addon combinations
    if (item && item.addons && item.addons.length > 0) {
      return 0;
    }
    // For items without addons, show the quantity in cart
    return selectedItems.find((i) => i.item.id === itemId)?.quantity || 0;
  };

  const handleAddItem = (item: MenuItem) => {
    // This is called from the modal after user selects addons
    const backendQuantityUnit = item.cateringQuantityUnit || 7;
    const portionQuantity = item.portionQuantity || 1;
    // Calculate total backend quantity based on portions
    const totalBackendQuantity = backendQuantityUnit * portionQuantity;
    console.log(
      "Adding item to cart:",
      item,
      "Portions:",
      portionQuantity,
      "Backend Quantity:",
      totalBackendQuantity
    );

    // Check if we're editing an existing item
    if (editingItemIndex !== null) {
      updateMenuItemByIndex(editingItemIndex, {
        item: item,
        quantity: totalBackendQuantity,
      });
      setEditingItemIndex(null);
    } else {
      addMenuItem({ item: item, quantity: totalBackendQuantity });
    }
  };

  const handleEditItem = (index: number) => {
    const selectedItem = selectedItems[index];
    setEditingItemIndex(index);
    setExpandedItemId(selectedItem.item.id);
  };

  const handleOrderPress = (item: MenuItem) => {
    // This opens the modal when clicking "Add to Order" button
    setExpandedItemId(expandedItemId === item.id ? null : item.id);
  };

  return (
    <div className="min-h-screen bg-base-100">
      {/* Main Content */}
      <div className="mx-auto px-4 py-6">
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Menu Items Grid */}

          {catalogueSearchResults !== null ? (
            // CATALOGUE SEARCH VIEW (API-based search results)
            <MenuCatalogue
              displayItems={catalogueSearchResults}
              loading={loading}
              isSearching={isCatalogueSearchActive}
              restaurants={restaurants}
              sortByRestaurant={sortByRestaurant}
              restaurantPromotions={restaurantPromotions}
              filterModalOpen={filterModalOpen}
              setFilterModalOpen={setFilterModalOpen}
              expandedItemId={expandedItemId}
              setExpandedItemId={setExpandedItemId}
              getItemQuantity={getItemQuantity}
              handleAddItem={handleAddItem}
              updateItemQuantity={updateItemQuantity}
              handleOrderPress={handleOrderPress}
              searchQuery={catalogueSearchQuery}
              onSearchChange={setCatalogueSearchQuery}
              onSearch={handleCatalogueSearch}
              onClearSearch={clearCatalogueSearch}
              deliveryDate={deliveryDate}
              deliveryTime={deliveryTime}
              eventBudget={eventBudget}
            />
          ) : selectedRestaurantId ? (
            // RESTAURANT MENU VIEW (Frontend-filtered menu)
            <MenuCatalogue
              displayItems={restaurantMenuItems}
              loading={loading}
              isSearching={false}
              restaurants={restaurants}
              sortByRestaurant={sortByRestaurant}
              restaurantPromotions={restaurantPromotions}
              filterModalOpen={filterModalOpen}
              setFilterModalOpen={setFilterModalOpen}
              expandedItemId={expandedItemId}
              setExpandedItemId={setExpandedItemId}
              getItemQuantity={getItemQuantity}
              handleAddItem={handleAddItem}
              updateItemQuantity={updateItemQuantity}
              handleOrderPress={handleOrderPress}
              searchQuery={restaurantSearchQuery}
              onSearchChange={setRestaurantSearchQuery}
              onSearch={handleRestaurantSearch}
              onClearSearch={clearRestaurantSearch}
              deliveryDate={deliveryDate}
              deliveryTime={deliveryTime}
              eventBudget={eventBudget}
            />
          ) : (
            // RESTAURANT CATALOGUE VIEW
            <RestaurantCatalogue
              restaurants={restaurants}
              restaurantsLoading={restaurantsLoading}
              selectedRestaurantId={selectedRestaurantId}
              setSelectedRestaurantId={updateSelectedRestaurant}
              restaurantPromotions={restaurantPromotions}
              searchQuery={catalogueSearchQuery}
              onSearchChange={setCatalogueSearchQuery}
              onSearch={handleCatalogueSearch}
              onClearSearch={clearCatalogueSearch}
              deliveryDate={deliveryDate}
              deliveryTime={deliveryTime}
              eventBudget={eventBudget}
              hasActiveFilters={
                filters.dietaryRestrictions.length > 0 ||
                filters.allergens.length > 0
              }
              onFilterClick={() => setFilterModalOpen(!filterModalOpen)}
              filterModalOpen={filterModalOpen}
            />
          )}

          {/* Cart Sidebar - Desktop */}
          <div
            className="hidden lg:block lg:w-[25%] sticky top-30"
            style={{ maxHeight: "calc(100vh - 10rem)" }}
          >
            <div className="bg-base-100 rounded-xl p-6 border border-base-300 flex flex-col max-h-full">
              {selectedRestaurantId && (
                <button
                  className="w-full mb-4 px-4 py-2 bg-base-200 hover:bg-base-300 text-base-content rounded-lg font-medium transition-colors text-sm flex items-center justify-center gap-2"
                  onClick={() => {
                    updateSelectedRestaurant(null);
                    clearRestaurantSearch();
                    window.scrollTo({ top: 0, behavior: "smooth" });
                  }}
                >
                  ← Back to All Restaurants
                </button>
              )}

              <h3 className="text-xl font-bold text-base-content mb-4">
                Your List
              </h3>

              {selectedItems.length === 0 ? (
                <p className="text-base-content/50 text-center py-8">
                  No items selected yet
                </p>
              ) : (
                <>
                  {/* Minimum Order Warnings - Compact */}
                  {(() => {
                    const warnings = getMinimumOrderWarnings();
                    return warnings.length > 0 ? (
                      <div className="mb-3 p-2 bg-warning/10 border border-warning/30 rounded-lg flex-shrink-0">
                        <p className="text-xs font-semibold text-base-content mb-1">
                          ⚠️ Minimum Order Requirements
                        </p>
                        {warnings.map((warning, index) => (
                          <p
                            key={index}
                            className="text-xs text-base-content leading-tight"
                          >
                            {warning}
                          </p>
                        ))}
                      </div>
                    ) : null;
                  })()}

                  {/* SCROLLABLE ITEMS SECTION */}
                  <div className="flex-1 overflow-y-auto mb-3 space-y-3 pr-2">
                    {selectedItems.map(({ item, quantity }, index) => {
                      const BACKEND_QUANTITY_UNIT =
                        item.cateringQuantityUnit || 7;
                      const DISPLAY_FEEDS_PER_UNIT = item.feedsPerUnit || 10;
                      const price = parseFloat(item.price?.toString() || "0");
                      const discountPrice = parseFloat(
                        item.discountPrice?.toString() || "0"
                      );
                      const itemPrice =
                        item.isDiscount && discountPrice > 0
                          ? discountPrice
                          : price;

                      // FIXED: Calculate addon price correctly
                      const addonPricePerPortion = (
                        item.selectedAddons || []
                      ).reduce((addonTotal, { price, quantity }) => {
                        return (
                          addonTotal +
                          (price || 0) *
                            (quantity || 0) *
                            DISPLAY_FEEDS_PER_UNIT
                        );
                      }, 0);

                      const numPortions = quantity / BACKEND_QUANTITY_UNIT;
                      const totalAddonPrice =
                        addonPricePerPortion * numPortions;
                      const lineTotal = itemPrice * quantity + totalAddonPrice;
                      const displayQuantity = numPortions;

                      return (
                        <div
                          key={index}
                          className="flex gap-2 p-2 bg-base-200/30 rounded-lg"
                        >
                          {item.image && (
                            <img
                              src={item.image}
                              alt={item.name}
                              className="w-14 h-14 object-cover rounded-lg flex-shrink-0"
                            />
                          )}
                          <div className="flex-1 min-w-0">
                            <h4 className="font-semibold text-xs text-base-content mb-0.5 truncate">
                              {item.name}
                            </h4>

                            {/* Addons - Compact */}
                            {item.selectedAddons &&
                              item.selectedAddons.length > 0 && (
                                <div className="text-[10px] text-base-content/60 mb-1">
                                  {(() => {
                                    const grouped = item.selectedAddons.reduce(
                                      (acc, addon) => {
                                        if (!acc[addon.groupTitle])
                                          acc[addon.groupTitle] = [];
                                        acc[addon.groupTitle].push(addon);
                                        return acc;
                                      },
                                      {} as Record<
                                        string,
                                        typeof item.selectedAddons
                                      >
                                    );
                                    return Object.entries(grouped).map(
                                      ([groupTitle, addons]) => (
                                        <div
                                          key={groupTitle}
                                          className="leading-tight"
                                        >
                                          <span className="font-semibold">
                                            {groupTitle}:{" "}
                                          </span>
                                          {addons.map((addon, idx) => (
                                            <span key={idx}>
                                              {addon.name}
                                              {addon.quantity > 1 &&
                                                ` ×${addon.quantity}`}
                                              {idx < addons.length - 1
                                                ? ", "
                                                : ""}
                                            </span>
                                          ))}
                                        </div>
                                      )
                                    );
                                  })()}
                                </div>
                              )}

                            {/* Price and Quantity */}
                            <div className="flex items-center justify-between mb-1">
                              <span className="text-sm font-bold text-primary">
                                £{lineTotal.toFixed(2)}
                              </span>
                              <span className="text-xs text-base-content/60">
                                {displayQuantity} portion
                                {displayQuantity !== 1 ? "s" : ""}
                              </span>
                            </div>

                            {/* Action Buttons - Compact */}
                            <div className="flex gap-1.5">
                              <button
                                onClick={() => handleEditItem(index)}
                                className="flex-1 px-2 py-1 text-primary hover:bg-primary/10 rounded text-[10px] font-semibold transition-colors border border-primary/20"
                              >
                                Edit
                              </button>
                              <button
                                onClick={() => removeMenuItemByIndex(index)}
                                className="flex-1 px-2 py-1 text-error hover:bg-error/10 rounded text-[10px] font-semibold transition-colors border border-error/20"
                              >
                                Remove
                              </button>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* COMPACT FOOTER SECTION - Fixed at bottom */}
                  <div className="flex-shrink-0 border-t border-base-300 pt-3 space-y-2">
                    {/* Summary Info */}
                    <div className="text-xs text-base-content/70 text-right">
                      Feeds up to{" "}
                      {selectedItems.reduce((sum, { item, quantity }) => {
                        const BACKEND_QUANTITY_UNIT =
                          item.cateringQuantityUnit || 7;
                        const DISPLAY_FEEDS_PER_UNIT = item.feedsPerUnit || 10;
                        return (
                          sum +
                          (quantity / BACKEND_QUANTITY_UNIT) *
                            DISPLAY_FEEDS_PER_UNIT
                        );
                      }, 0)}{" "}
                      people
                    </div>

                    {/* Pricing - Compact */}
                    <div className="space-y-1 text-sm">
                      <div className="flex justify-between text-base-content/70">
                        <span>Subtotal</span>
                        <span>£{subtotalBeforeDiscount.toFixed(2)}</span>
                      </div>

                      {promotionDiscount > 0 && (
                        <div className="flex justify-between text-green-600 font-semibold">
                          <span>Promotion</span>
                          <span>-£{promotionDiscount.toFixed(2)}</span>
                        </div>
                      )}

                      <div className="flex justify-between font-bold text-base-content pt-1 border-t border-base-300">
                        <span>Total:</span>
                        <div className="text-right">
                          {promotionDiscount > 0 && (
                            <div className="text-xs text-base-content/50 line-through">
                              £{subtotalBeforeDiscount.toFixed(2)}
                            </div>
                          )}
                          <div
                            className={
                              promotionDiscount > 0 ? "text-green-600" : ""
                            }
                          >
                            £{finalTotal.toFixed(2)}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Continue Button */}
                    <button
                      className="w-full bg-primary hover:opacity-90 text-white py-3 rounded-lg font-bold text-sm transition-all disabled:bg-base-300 disabled:cursor-not-allowed"
                      onClick={() => {
                        const warnings = getMinimumOrderWarnings();
                        if (warnings.length > 0) {
                          alert(
                            `Please meet minimum order requirements:\n\n${warnings.join(
                              "\n"
                            )}`
                          );
                          return;
                        }
                        setCurrentStep(2);
                      }}
                      disabled={
                        selectedItems.length === 0 ||
                        getMinimumOrderWarnings().length > 0
                      }
                    >
                      Continue to Event Details
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Cart Button - Fixed at bottom */}
      {(selectedRestaurantId || selectedItems.length > 0) && (
        <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-base-100 border-t border-base-300 p-3 z-20">
          <div className="flex gap-2">
            {selectedRestaurantId && (
              <button
                className={`bg-base-300 text-base-content px-3 py-2 rounded-lg font-medium hover:bg-base-content/10 transition-colors text-sm ${
                  selectedItems.length === 0 ? "flex-1" : "flex-shrink-0"
                }`}
                onClick={() => {
                  updateSelectedRestaurant(null);
                  clearRestaurantSearch();
                  window.scrollTo({ top: 0, behavior: "smooth" });
                }}
              >
                ← Back
              </button>
            )}
            {selectedItems.length > 0 && (
              <button
                onClick={() => setShowCartMobile(true)}
                className="flex-1 bg-primary hover:opacity-90 text-white py-3 rounded-lg font-bold text-base transition-all flex items-center justify-between px-4"
              >
                <span>View Cart ({selectedItems.length})</span>
                <span>
                  £
                  {selectedItems
                    .reduce((sum, { item, quantity }) => {
                      const price = parseFloat(item.price?.toString() || "0");
                      const discountPrice = parseFloat(
                        item.discountPrice?.toString() || "0"
                      );
                      const itemPrice =
                        item.isDiscount && discountPrice > 0
                          ? discountPrice
                          : price;
                      const addonPrice = item.addonPrice || 0;
                      return sum + itemPrice * quantity + addonPrice;
                    }, 0)
                    .toFixed(2)}
                </span>
              </button>
            )}
          </div>
        </div>
      )}

      {/* Mobile Cart Modal */}
      {showCartMobile && (
        <div className="lg:hidden fixed inset-0 bg-black/50 z-50 flex items-end">
          <div className="bg-base-100 w-full rounded-t-3xl max-h-[85vh] flex flex-col">
            <div className="bg-base-100 border-b border-base-300 p-4 flex justify-between items-center flex-shrink-0">
              <h3 className="text-xl font-bold text-base-content">Your List</h3>
              <button
                onClick={() => setShowCartMobile(false)}
                className="text-2xl"
              >
                ×
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4">
              {(() => {
                const warnings = getMinimumOrderWarnings();
                return warnings.length > 0 ? (
                  <div className="mb-4 p-3 bg-warning/10 border border-warning/30 rounded-xl">
                    <p className="text-xs font-semibold text-base-content mb-2">
                      ⚠️ Minimum Order Requirements
                    </p>
                    {warnings.map((warning, index) => (
                      <p key={index} className="text-xs text-base-content">
                        {warning}
                      </p>
                    ))}
                  </div>
                ) : null;
              })()}
              {selectedItems.length === 0 ? (
                <p className="text-base-content/50 text-center py-8">
                  No items selected yet
                </p>
              ) : (
                <div className="space-y-4">
                  {selectedItems.map(({ item, quantity }, index) => {
                    const BACKEND_QUANTITY_UNIT =
                      item.cateringQuantityUnit || 7;
                    const DISPLAY_FEEDS_PER_UNIT = item.feedsPerUnit || 10;
                    const price = parseFloat(item.price?.toString() || "0");
                    const discountPrice = parseFloat(
                      item.discountPrice?.toString() || "0"
                    );
                    const itemPrice =
                      item.isDiscount && discountPrice > 0
                        ? discountPrice
                        : price;

                    // FIXED: Calculate addon price correctly per portion, then multiply by number of portions
                    const addonPricePerPortion = (
                      item.selectedAddons || []
                    ).reduce((addonTotal, { price, quantity }) => {
                      return (
                        addonTotal +
                        (price || 0) * (quantity || 0) * DISPLAY_FEEDS_PER_UNIT
                      );
                    }, 0);

                    const numPortions = quantity / BACKEND_QUANTITY_UNIT;
                    const totalAddonPrice = addonPricePerPortion * numPortions;

                    // CORRECT CALCULATION: Item price + addon price for all portions
                    const lineTotal = itemPrice * quantity + totalAddonPrice;

                    const displayQuantity = numPortions;

                    return (
                      <div
                        key={index}
                        className={`flex gap-3 pb-4${
                          index !== selectedItems.length - 1
                            ? " border-b border-base-300"
                            : ""
                        }`}
                      >
                        {item.image && (
                          <img
                            src={item.image}
                            alt={item.name}
                            className="w-16 h-16 object-cover rounded-lg"
                          />
                        )}
                        <div className="flex-1">
                          <h4 className="font-semibold text-sm text-base-content mb-1">
                            {item.name}
                          </h4>
                          {item.selectedAddons &&
                            item.selectedAddons.length > 0 && (
                              <div className="text-xs text-base-content/60 mb-1 flex flex-col gap-1">
                                {(() => {
                                  const grouped = item.selectedAddons.reduce(
                                    (acc, addon) => {
                                      if (!acc[addon.groupTitle])
                                        acc[addon.groupTitle] = [];
                                      acc[addon.groupTitle].push(addon);
                                      return acc;
                                    },
                                    {} as Record<
                                      string,
                                      typeof item.selectedAddons
                                    >
                                  );
                                  return Object.entries(grouped).map(
                                    ([groupTitle, addons]) => (
                                      <div key={groupTitle} className="mb-1">
                                        <span className="font-semibold text-base-content/80 block mb-0.5">
                                          {groupTitle}
                                        </span>
                                        <span className="flex flex-col">
                                          {addons.map((addon, idx) => (
                                            <span key={idx}>
                                              + {addon.name}
                                              {addon.quantity > 1 &&
                                                ` (×${addon.quantity})`}
                                            </span>
                                          ))}
                                        </span>
                                      </div>
                                    )
                                  );
                                })()}
                              </div>
                            )}

                          {/* FIXED PRICE DISPLAY */}
                          <p className="text-xl font-bold text-primary mb-2">
                            £{lineTotal.toFixed(2)}
                          </p>

                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <span className="text-sm font-medium text-base-content">
                                {displayQuantity} portion
                                {displayQuantity !== 1 ? "s" : ""}
                              </span>
                            </div>
                            <div className="flex flex-row gap-2">
                              <button
                                onClick={() => handleEditItem(index)}
                                className="px-3 py-1 text-primary hover:bg-primary/10 rounded-lg text-xs font-medium transition-colors border border-primary/20"
                              >
                                Edit
                              </button>
                              <button
                                onClick={() => removeMenuItemByIndex(index)}
                                className="px-3 py-1 text-error hover:bg-error/10 rounded-lg text-xs font-medium transition-colors border border-error/20"
                              >
                                Remove
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {selectedItems.length > 0 && (
              <div className="border-t border-base-300 bg-base-100 p-4 flex-shrink-0">
                <div className="space-y-2 mb-4">
                  <div className="flex justify-end text-sm text-base-content/70">
                    {/* <span>Items ({selectedItems.length})</span> */}
                    <span>
                      Feeds up to{" "}
                      {selectedItems.reduce((sum, { item, quantity }) => {
                        const BACKEND_QUANTITY_UNIT =
                          item.cateringQuantityUnit || 7;
                        const DISPLAY_FEEDS_PER_UNIT = item.feedsPerUnit || 10;
                        return (
                          sum +
                          (quantity / BACKEND_QUANTITY_UNIT) *
                            DISPLAY_FEEDS_PER_UNIT
                        );
                      }, 0)}{" "}
                      people
                    </span>
                  </div>
                  <div className="flex justify-between text-lg font-bold text-base-content">
                    <span>Total:</span>
                    <span>
                      £{totalPrice.toFixed(2)}
                      {/* {selectedItems
                        .reduce((sum, { item, quantity }) => {
                          const price = parseFloat(
                            item.price?.toString() || "0"
                          );
                          const discountPrice = parseFloat(
                            item.discountPrice?.toString() || "0"
                          );
                          const itemPrice =
                            item.isDiscount && discountPrice > 0
                              ? discountPrice
                              : price;
                          const addonPrice = item.addonPrice || 0;
                          return sum + itemPrice * quantity + addonPrice;
                        }, 0)
                        .toFixed(2)} */}
                    </span>
                  </div>
                </div>

                <button
                  className="w-full bg-primary hover:opacity-90 text-white py-4 px-2 rounded-lg font-bold text-lg transition-all disabled:bg-base-300 disabled:cursor-not-allowed"
                  onClick={() => {
                    const warnings = getMinimumOrderWarnings();
                    if (warnings.length > 0) {
                      alert(
                        `Please meet minimum order requirements:\n\n${warnings.join(
                          "\n"
                        )}`
                      );
                      return;
                    }
                    setShowCartMobile(false);
                    setCurrentStep(2);
                  }}
                  disabled={getMinimumOrderWarnings().length > 0}
                >
                  Continue to Event Details
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Edit Modal for Cart Items */}
      {editingItemIndex !== null && selectedItems[editingItemIndex] && (
        <MenuItemModal
          item={selectedItems[editingItemIndex].item}
          isOpen={editingItemIndex !== null}
          onClose={() => {
            setEditingItemIndex(null);
            setExpandedItemId(null);
          }}
          quantity={selectedItems[editingItemIndex].quantity}
          onAddItem={handleAddItem}
          onUpdateQuantity={updateItemQuantity}
          isEditMode={true}
          onRemoveItem={removeMenuItemByIndex}
          editingIndex={editingItemIndex}
        />
      )}
    </div>
  );
}
