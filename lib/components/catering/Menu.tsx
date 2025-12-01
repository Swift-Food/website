import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { cateringService } from "@/services/api/catering.api";
import { useCatering } from "@/context/CateringContext";
import { promotionsServices } from "@/services/api/promotion.api";
import RestaurantCatalogue from "./RestaurantCatalogue";
import MenuCatalogue from "./MenuCatalogue";
import { useCateringFilters } from "@/context/CateringFilterContext";
import { API_BASE_URL, API_ENDPOINTS } from "@/lib/constants/api";
import { fetchWithAuth } from "@/lib/api-client/auth-client";

// Re-export types from Step2MenuItems for backwards compatibility
export { type Restaurant, type Addon, type MenuItem } from "./Step2MenuItems";
import type { Restaurant, MenuItem } from "./Step2MenuItems";

export default function Menu() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { filters } = useCateringFilters();

  const {
    restaurantPromotions,
    setRestaurantPromotions,
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

  const [expandedItemId, setExpandedItemId] = useState<string | null>(null);
  const [filterModalOpen, setFilterModalOpen] = useState(false);

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
  }, []);

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

    setRestaurantPromotions(promotionsMap);
  };

  const fetchAllMenuItems = async () => {
    setLoading(true);
    try {
      const response = await cateringService.getMenuItems();

      const menuItemsOnly = (response || []).map((item: any) => {
        return {
          id: item.id,
          menuItemName: item.name,
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
          dietaryFilters: item.dietaryFilters,
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
      const response = await fetchWithAuth(
        `${API_BASE_URL}${API_ENDPOINTS.RESTAURANT_CATERING}`
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
          item.menuItemName.toLowerCase().includes(query) ||
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

  return (
    <div className="min-h-screen bg-base-100">
      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Back button for desktop - shown above content when viewing a restaurant */}
        {selectedRestaurantId && (
          <div className="hidden lg:block mb-4">
            <button
              className="px-4 py-2 bg-base-200 hover:bg-base-300 text-base-content rounded-lg font-medium transition-colors text-sm flex items-center gap-2"
              onClick={() => {
                updateSelectedRestaurant(null);
                clearRestaurantSearch();
                window.scrollTo({ top: 0, behavior: "smooth" });
              }}
            >
              ← Back to All Restaurants
            </button>
          </div>
        )}

        <div className="flex flex-col gap-6">
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
              searchQuery={catalogueSearchQuery}
              onSearchChange={setCatalogueSearchQuery}
              onSearch={handleCatalogueSearch}
              onClearSearch={clearCatalogueSearch}
              viewOnly={true}
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
              searchQuery={restaurantSearchQuery}
              onSearchChange={setRestaurantSearchQuery}
              onSearch={handleRestaurantSearch}
              onClearSearch={clearRestaurantSearch}
              viewOnly={true}
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
              hasActiveFilters={
                filters.dietaryRestrictions.length > 0 ||
                filters.allergens.length > 0
              }
              onFilterClick={() => setFilterModalOpen(!filterModalOpen)}
              filterModalOpen={filterModalOpen}
            />
          )}
        </div>

        {/* Back button for mobile - fixed at bottom when viewing a restaurant */}
        {selectedRestaurantId && (
          <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-base-100 border-t border-base-300 p-3 z-20">
            <button
              className="w-full bg-base-300 text-base-content px-3 py-3 rounded-lg font-medium hover:bg-base-content/10 transition-colors text-sm"
              onClick={() => {
                updateSelectedRestaurant(null);
                clearRestaurantSearch();
                window.scrollTo({ top: 0, behavior: "smooth" });
              }}
            >
              ← Back to All Restaurants
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
