import { useState, useEffect } from "react";
import { cateringService } from "@/services/cateringServices";
import { useCatering } from "@/context/CateringContext";
import MenuItemCard from "./MenuItemCard";
import MenuItemModal from "./MenuItemModal";
import { promotionsServices } from "@/services/promotionServices";

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
}

const formatCateringHours = (
  cateringOperatingHours:
    | {
        day: string;
        open: string | null;
        close: string | null;
        enabled: boolean;
      }[]
    | null
): string => {
  if (!cateringOperatingHours) {
    return "Available anytime";
  }

  const enabledDays = cateringOperatingHours.filter(
    (schedule) => schedule.enabled
  );

  if (enabledDays.length === 0) {
    return "No Event Ordering hours set";
  }

  // Group consecutive days with same hours
  const grouped: { days: string[]; hours: string }[] = [];

  enabledDays.forEach((schedule) => {
    const dayName =
      schedule.day.charAt(0).toUpperCase() + schedule.day.slice(1, 3);
    const hours =
      schedule.open && schedule.close
        ? `${formatTime(schedule.open)} - ${formatTime(schedule.close)}`
        : "Closed";

    const lastGroup = grouped[grouped.length - 1];
    if (lastGroup && lastGroup.hours === hours) {
      lastGroup.days.push(dayName);
    } else {
      grouped.push({ days: [dayName], hours });
    }
  });

  return grouped
    .map((group) => {
      const dayRange =
        group.days.length > 1
          ? `${group.days[0]} - ${group.days[group.days.length - 1]}`
          : group.days[0];
      return `${dayRange}: ${group.hours}`;
    })
    .join("\n");
};

const formatTime = (time: string): string => {
  const [hours, minutes] = time.split(":").map(Number);
  const ampm = hours >= 12 ? "PM" : "AM";
  const displayHours = hours === 0 ? 12 : hours > 12 ? hours - 12 : hours;
  return `${displayHours}:${minutes.toString().padStart(2, "0")} ${ampm}`;
};

export default function Step2MenuItems() {
  // const [sortedGroups, setSortedGroups] = useState<string[]>([]);
  // const [groupedItems, setGroupedItems] = useState<Record<string, MenuItem[]>>(
  //   {}
  // );

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
  const [searchQuery, setSearchQuery] = useState("");
  // const [restaurantName, setRestaurantName] = useState("");
  const [searchResults, setSearchResults] = useState<any[] | null>(null);
  const [isSearching, setIsSearching] = useState(false);
  const [showCartMobile, setShowCartMobile] = useState(false);
  const [expandedItemId, setExpandedItemId] = useState<string | null>(null);
  const [displayItems, setDisplayItems] = useState<MenuItem[]>([]);
  const [editingItemIndex, setEditingItemIndex] = useState<number | null>(null);

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

  // Scroll to top when component mounts
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  // Fetch all restaurants on mount
  useEffect(() => {
    fetchRestaurants();
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
            'CATERING'
          );
          if (promos && promos.length > 0) {
            promotionsMap[restaurantId] = promos;
          }
        } catch (error) {
          console.error(`Failed to fetch promotions for ${restaurantId}:`, error);
        }
      })
    );
    
    setRestaurantPromotions(promotionsMap); // USE CONTEXT SETTER
  };

  useEffect(() => {
    if (!isSearching) {
      fetchAllMenuItems();
    }
  }, [isSearching]);
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

  // Determine which items to display

  useEffect(() => {
    // Always sort items by restaurant so UI shows items grouped by restaurant
    const source = isSearching ? searchResults || [] : menuItems;
    setDisplayItems(sortByRestaurant(source));
  }, [isSearching, searchResults, menuItems]);

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
    const counts: Record<string, {
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
    }> = {};
  
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
        if (settings?.required && Array.isArray(settings.required) && settings.required.length > 0) {
          const firstRequired = settings.required[0];
          counts[restaurantId].required = {
            count: 0,
            minRequired: firstRequired.minQuantity || 0,
            sections: firstRequired.applicableSections || [],
          };
        }
  
        // Initialize optional settings
        if (settings?.optional && Array.isArray(settings.optional) && settings.optional.length > 0) {
          counts[restaurantId].optional = settings.optional.map(rule => ({
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
  
    Object.entries(counts).forEach(([restaurantId, data]) => {
     
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



  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!searchQuery.trim()) {
      setIsSearching(false);
      fetchAllMenuItems();
      return;
    }

    setIsSearching(true);
    setLoading(true);

    try {
      const response = await cateringService.searchMenuItems(searchQuery, {
        page: 1,
        limit: 50,
      });

      setSearchResults(response.menuItems || []);
    } catch (error) {
      console.error("Error searching menu items:", error);
      setSearchResults([]);
    } finally {
      setLoading(false);
    }
  };

  const clearSearch = () => {
    setSearchQuery("");
    setIsSearching(false);
    setSearchResults(null);
    fetchAllMenuItems();
  };

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

  // Replace the PromotionDetailsCard component with this scrollable version:
  const PromotionDetailsCard = ({ promotions }: { promotions: any[] }) => {
    if (!promotions || promotions.length === 0) return null;
    
    return (
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-3">
          <h3 className="text-lg font-bold text-gray-900">Active Offers</h3>
          <span className="bg-green-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">
            {promotions.length}
          </span>
        </div>
        
        {/* Horizontal Scrollable Container */}
        <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide snap-x snap-mandatory">
          {promotions.map((promo) => (
            <div
              key={promo.id}
              className="flex-shrink-0 snap-start bg-gradient-to-br from-green-50 to-emerald-50 border-2 border-green-500 rounded-xl p-4 min-w-[280px] max-w-[350px]"
            >
              <div className="flex items-start gap-3">
  
                <div className="flex-1 min-w-0">
                  <h4 className="text-base font-bold text-green-900 mb-1 truncate">
                    {promo.name}
                  </h4>
                  <p className="text-green-800 font-bold text-lg mb-2">
                    {promo.discountPercentage}% OFF
                  </p>
                  {promo.description && (
                    <p className="text-green-700 text-xs mb-2 line-clamp-2">
                      {promo.description}
                    </p>
                  )}
                  <div className="flex flex-col gap-1.5 text-xs">
                    {promo.minOrderAmount > 0 && (
                      <div className="flex items-center gap-1.5">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                          strokeWidth={2}
                          stroke="currentColor"
                          className="w-3.5 h-3.5 text-green-700"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25a3 3 0 00-3 3h15.75m-12.75-3h11.218c1.121-2.3 2.1-4.684 2.924-7.138a60.114 60.114 0 00-16.536-1.84M7.5 14.25L5.106 5.272M6 20.25a.75.75 0 11-1.5 0 .75.75 0 011.5 0zm12.75 0a.75.75 0 11-1.5 0 .75.75 0 011.5 0z"
                          />
                        </svg>
                        <span className="text-green-800 font-medium">
                          Min. £{promo.minOrderAmount}
                        </span>
                      </div>
                    )}
                    {promo.maxDiscountAmount && (
                      <div className="flex items-center gap-1.5">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                          strokeWidth={2}
                          stroke="currentColor"
                          className="w-3.5 h-3.5 text-green-700"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M12 6v12m-3-2.818l.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                          />
                        </svg>
                        <span className="text-green-800 font-medium">
                          Max. £{promo.maxDiscountAmount} off
                        </span>
                      </div>
                    )}
                    <div className="flex items-center gap-1.5">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        strokeWidth={2}
                        stroke="currentColor"
                        className="w-3.5 h-3.5 text-green-700"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5"
                        />
                      </svg>
                      <span className="text-green-700">
                        Until {new Date(promo.endDate).toLocaleDateString('en-GB', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric'
                        })}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
        
        {/* Scroll Indicator (optional) */}
        {promotions.length > 1 && (
          <div className="flex justify-center gap-1.5 mt-3">
            {promotions.map((_, index) => (
              <div
                key={index}
                className="w-1.5 h-1.5 rounded-full bg-green-500/30"
              />
            ))}
          </div>
        )}
      </div>
    );
  };

  // Filter by selected restaurant if one is selected
  useEffect(() => {
    if (selectedRestaurantId && !isSearching) {
      const filtered = menuItems.filter(
        (item) => item.restaurantId === selectedRestaurantId
      );
      setDisplayItems(sortByRestaurant(filtered));
      console.log("selected restaurant id", selectedRestaurantId, filtered);
    } else {
      const source = isSearching ? searchResults || [] : menuItems;
      setDisplayItems(sortByRestaurant(source));
    }
  }, [selectedRestaurantId, isSearching, menuItems, searchResults]);

  return (
    <div className="min-h-screen bg-base-100">
      {/* Main Content */}
      <div className="mx-auto px-4 py-6">
        <form onSubmit={handleSearch} className="mb-4">
          <div className="flex gap-2 md:gap-4">
            <div className="relative flex-1">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search menu items..."
                className="w-full pl-10 md:pl-12 pr-4 py-2 md:py-3 bg-white border border-base-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent text-sm md:text-base"
              />
              <div className="absolute left-3 md:left-4 top-1/2 -translate-y-1/2 text-base-content/40">
                <svg
                  aria-hidden="true"
                  focusable="false"
                  className="w-4 h-4 md:w-5 md:h-5"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <circle
                    cx="11"
                    cy="11"
                    r="6.25"
                    stroke="currentColor"
                    strokeWidth="1.5"
                  />
                  <path
                    d="M20 20L16.65 16.65"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                  />
                </svg>
              </div>
            </div>
            <button
              type="submit"
              className="bg-primary hover:opacity-90 text-white px-4 md:px-8 py-2 md:py-3 rounded-lg font-medium transition-all text-sm md:text-base"
            >
              Search
            </button>
            {isSearching && (
              <button
                type="button"
                onClick={clearSearch}
                className="bg-base-300 text-base-content px-3 md:px-6 py-2 md:py-3 rounded-lg font-medium hover:bg-base-content/10 transition-colors text-sm md:text-base"
              >
                Clear
              </button>
            )}
          </div>
        </form>
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Menu Items Grid */}

          {selectedRestaurantId || searchResults !== null ? (
            <div className="flex-1">
              {loading ? (
                <div className="text-center py-12 text-base-content/60">
                  Loading menu items...
                </div>
              ) : displayItems.length === 0 ? (
                <div className="text-center py-12 text-base-content/50 text-sm md:text-base">
                  {isSearching
                    ? "No menu items found matching your search."
                    : "No menu items available."}
                </div>
              ) : (
                <>
                  {/* Group items by restaurant */}
                  {(() => {
                    // Build map: restaurantId -> { restaurantName, items[] }
                    const byRestaurant: Record<
                      string,
                      {
                        restaurantId: string;
                        restaurantName: string;
                        items: MenuItem[];
                      }
                    > = {};

                    const sorted = sortByRestaurant(displayItems);
                    sorted.forEach((item) => {
                      const rid =
                        item.restaurantId ||
                        item.restaurant?.id ||
                        item.restaurant?.restaurantId ||
                        "unknown";
                      const rname =
                        item.restaurant?.name ||
                        restaurants.find((r) => r.id === rid)
                          ?.restaurant_name ||
                        "Unknown Restaurant";

                      if (!byRestaurant[rid]) {
                        byRestaurant[rid] = {
                          restaurantId: rid,
                          restaurantName: rname,
                          items: [],
                        };
                      }
                      byRestaurant[rid].items.push(item);
                    });

                    const restaurantList = Object.values(byRestaurant).sort(
                      (a, b) => a.restaurantName.localeCompare(b.restaurantName)
                    );

                    return restaurantList.map((rest) => {
                      // derive groups for this restaurant's items (fallback to groupTitle)
                      const menuGroupSettings =
                        rest.items[0]?.restaurant?.menuGroupSettings;
                      const hasSettings =
                        menuGroupSettings &&
                        Object.keys(menuGroupSettings).length > 0;

                      let groupsForRest: string[] = [];
                      if (hasSettings) {
                        groupsForRest = Object.keys(menuGroupSettings!)
                          // .filter((g) => {
                          //   const lower = g.toLowerCase();
                          //   return lower !== "drink" && lower !== "drinks";
                          // })
                          .sort((a, b) => {
                            const orderA =
                              menuGroupSettings![a]?.displayOrder ?? 999;
                            const orderB =
                              menuGroupSettings![b]?.displayOrder ?? 999;
                            return orderA - orderB;
                          });
                      } else {
                        groupsForRest = Array.from(
                          new Set(
                            rest.items.map((i) => i.groupTitle || "Other")
                            // .filter((g) => {
                            //   const lower = g.toLowerCase();
                            //   return lower !== "drink" && lower !== "drinks";
                            // })
                          )
                        ).sort((a, b) => a.localeCompare(b));
                      }

                      const groupItemsForRest: Record<string, MenuItem[]> = {};
                      groupsForRest.forEach((g) => (groupItemsForRest[g] = []));
                      rest.items.forEach((item) => {
                        const group = item.groupTitle || "Other";
                        // const lower = group.toLowerCase();
                        // if (lower === "drink" || lower === "drinks") return;
                        if (!groupItemsForRest[group])
                          groupItemsForRest[group] = [];
                        groupItemsForRest[group].push(item);
                      });

                      Object.keys(groupItemsForRest).forEach((groupName) => {
                        groupItemsForRest[groupName].sort(
                          (a, b) =>
                            (a.itemDisplayOrder ?? 999) -
                            (b.itemDisplayOrder ?? 999)
                        );
                      });

                      return (
                        <div key={rest.restaurantId} className="mb-12">
                          <div className="flex items-end justify-center gap-3 mb-6">
                            <h2 className="text-4xl font-bold text-primary">
                              {rest.restaurantName}
                            </h2>
                            {(() => {
                              const restaurant = restaurants.find(
                                (r) => r.id === rest.restaurantId
                              );
                              return (
                                (restaurant?.contactEmail ||
                                  restaurant?.contactNumber ||
                                  restaurant?.cateringOperatingHours) && (
                                  <div className="group relative">
                                    <button
                                      type="button"
                                      className="text-primary/60 hover:text-primary cursor-pointer touch-manipulation active:scale-95"
                                      onClick={(e) => {
                                        e.currentTarget.nextElementSibling?.classList.toggle(
                                          "hidden"
                                        );
                                      }}
                                    >
                                      <svg
                                        xmlns="http://www.w3.org/2000/svg"
                                        fill="none"
                                        viewBox="0 0 24 24"
                                        strokeWidth={1.5}
                                        stroke="currentColor"
                                        className="w-7 h-7 md:w-6 md:h-6"
                                      >
                                        <path
                                          strokeLinecap="round"
                                          strokeLinejoin="round"
                                          d="M11.25 11.25l.041-.02a.75.75 0 011.063.852l-.708 2.836a.75.75 0 001.063.853l.041-.021M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9-3.75h.008v.008H12V8.25z"
                                        />
                                      </svg>
                                    </button>
                                    <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 hidden md:group-hover:block z-10 w-56">
                                      <div className="bg-base-content text-base-100 text-sm rounded-lg p-3">
                                        <p className="font-semibold mb-2">
                                          Contact Restaurant:
                                        </p>
                                        {restaurant?.contactEmail && (
                                          <p className="mb-1 break-words">
                                            <span className="opacity-70">
                                              Email:
                                            </span>
                                            <br />
                                            <a
                                              href={`mailto:${restaurant.contactEmail}`}
                                              className="underline"
                                            >
                                              {restaurant.contactEmail}
                                            </a>
                                          </p>
                                        )}
                                        {restaurant?.contactNumber && (
                                          <p className="break-words">
                                            <span className="opacity-70">
                                              Phone:
                                            </span>
                                            <br />
                                            <a
                                              href={`tel:${restaurant.contactNumber}`}
                                              className="underline"
                                            >
                                              {restaurant.contactNumber}
                                            </a>
                                          </p>
                                        )}
                                        <div className="mv-2 text-xs">
                                          <p className="opacity-70 pt-2">
                                            Event Ordering Hours:
                                          </p>
                                          <div className="whitespace-pre-line text-xs mt-1">
                                            {formatCateringHours(
                                              restaurant.cateringOperatingHours ??
                                                null
                                            )}
                                          </div>
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                )
                              );
                            })()}
                          </div>
                          {restaurantPromotions[rest.restaurantId] && (
                            <PromotionDetailsCard promotions={restaurantPromotions[rest.restaurantId]} />
                          )}
                          {groupsForRest
                            .filter(
                              (groupName) =>
                                groupItemsForRest[groupName] &&
                                groupItemsForRest[groupName].length > 0
                            )
                            .map((groupName) => {
                              // Sort items with images and without images separately by display price
                              const getDisplayPrice = (item: MenuItem) => {
                                const price = parseFloat(
                                  item.price?.toString() || "0"
                                );
                                const discountPrice = parseFloat(
                                  item.discountPrice?.toString() || "0"
                                );
                                return (
                                  (item.cateringQuantityUnit ?? 7) *
                                  (item.isDiscount && discountPrice > 0
                                    ? discountPrice
                                    : price)
                                );
                              };
                              const itemsWithImage = groupItemsForRest[
                                groupName
                              ]
                                .filter(
                                  (item) =>
                                    item.image && item.image.trim() !== ""
                                )
                                .sort(
                                  (a, b) =>
                                    getDisplayPrice(a) - getDisplayPrice(b)
                                );
                              const itemsWithoutImage = groupItemsForRest[
                                groupName
                              ]
                                .filter(
                                  (item) =>
                                    !item.image || item.image.trim() === ""
                                )
                                .sort(
                                  (a, b) =>
                                    getDisplayPrice(a) - getDisplayPrice(b)
                                );
                              const orderedItems = [
                                ...itemsWithImage,
                                ...itemsWithoutImage,
                              ];

                              return (
                                <div
                                  key={`${rest.restaurantId}-${groupName}`}
                                  className="mb-8"
                                >
                                  <h3 className="ml-4 text-2xl font-bold text-primary mb-1">
                                    {groupName}
                                  </h3>

                                  {/* Group Information (from menuGroupSettings) */}
                                  {(() => {
                                    const info =
                                      rest.items[0]?.restaurant?.menuGroupSettings?.[groupName]
                                        ?.information;
                                    if (!info) return null;
                                    return (
                                      <p className="ml-4 text-gray-600 text-base mb-4 whitespace-pre-line">
                                        {info}
                                      </p>
                                    );
                                  })()}
                                  <div className="grid grid-cols-1 2xl:grid-cols-2 3xl:grid-cols-3 gap-4 md:gap-6">
                                    {orderedItems.map((item) => (
                                      <MenuItemCard
                                        key={item.id}
                                        item={item}
                                        quantity={getItemQuantity(
                                          item.id,
                                          item
                                        )}
                                        isExpanded={expandedItemId === item.id}
                                        // isSearching={isSearching}
                                        onToggleExpand={() =>
                                          setExpandedItemId(
                                            expandedItemId === item.id
                                              ? null
                                              : item.id
                                          )
                                        }
                                        onAddItem={handleAddItem}
                                        onUpdateQuantity={updateItemQuantity}
                                        onAddOrderPress={handleOrderPress}
                                      />
                                    ))}
                                  </div>
                                </div>
                              );
                            })}
                        </div>
                      );
                    });
                  })()}
                </>
              )}
            </div>
          ) : (
            <div className="flex-1">
              <h3 className="text-base md:text-lg font-semibold mb-3 text-base-content">
                Select Restaurant
              </h3>
              {restaurantsLoading ? (
                <div className="text-center py-4 text-base-content/60 text-sm md:text-base">
                  Loading restaurants...
                </div>
              ) : (
                <div className="flex flex-wrap sm:grid sm:grid-cols-3 gap-3 md:gap-4 pb-4">
                  {restaurants.map((restaurant) => (
                    <button
                      key={restaurant.id}
                      onClick={() => {
                        setSelectedRestaurantId(
                          selectedRestaurantId === restaurant.id
                            ? null
                            : restaurant.id
                        );
                        window.scrollTo({ top: 0, behavior: "smooth" });
                      }}
                      className={`flex-shrink-0 w-full rounded-xl overflow-hidden border-2 transition-all ${
                        selectedRestaurantId === restaurant.id
                          ? "border-primary"
                          : "border-base-300 hover:border-primary/50"
                      }`}
                    >
                      <div className="relative">
                        <img
                          src={restaurant.images[0] || "/placeholder.jpg"}
                          alt={restaurant.restaurant_name}
                          className="w-full aspect-[16/9]  object-cover"
                        />
                        {/* COMPACT PROMOTION BANNER OVERLAY */}
                      {restaurantPromotions[restaurant.id] && (
                        <div className="absolute top-2 left-2 right-2">
                          <div className="bg-green-500 text-white px-3 py-1.5 rounded-lg shadow-lg flex items-center justify-center gap-1.5 backdrop-blur-sm bg-opacity-95">
                            <span className="font-bold text-sm">
                              {restaurantPromotions[restaurant.id][0].discountPercentage}% OFF
                            </span>
                            {restaurantPromotions[restaurant.id][0].minOrderAmount > 0 && (
                              <span className="text-xs">
                                (£{restaurantPromotions[restaurant.id][0].minOrderAmount}+ orders)
                              </span>
                            )}
                          </div>
                        </div>
                      )}
                      </div>
                      <div className="p-2 md:p-3 bg-base-100">
                        <div className="flex items-center justify-between gap-2">
                          <h4 className="font-semibold text-md md:text-sm text-base-content truncate">
                            {restaurant.restaurant_name}
                          </h4>
                          {(restaurant.contactEmail ||
                            restaurant.contactNumber ||
                            restaurant.cateringOperatingHours) && (
                            <div className="group relative flex-shrink-0">
                              <button
                                type="button"
                                className="text-base-content/60 hover:text-base-content cursor-pointer touch-manipulation active:scale-95"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  e.currentTarget.nextElementSibling?.classList.toggle(
                                    "hidden"
                                  );
                                }}
                              >
                                <svg
                                  xmlns="http://www.w3.org/2000/svg"
                                  fill="none"
                                  viewBox="0 0 24 24"
                                  strokeWidth={1.5}
                                  stroke="currentColor"
                                  className="w-5 h-5 md:w-4 md:h-4"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    d="M11.25 11.25l.041-.02a.75.75 0 011.063.852l-.708 2.836a.75.75 0 001.063.853l.041-.021M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9-3.75h.008v.008H12V8.25z"
                                  />
                                </svg>
                              </button>
                              <div className="absolute bottom-full right-0 mb-2 hidden md:group-hover:block z-10 w-48">
                                <div className="bg-base-content text-base-100 text-xs rounded-lg p-3">
                                  <p className="font-semibold mb-2">
                                    Contact Info:
                                  </p>
                                  {restaurant.contactEmail && (
                                    <p className="mb-1 break-words">
                                      <span className="opacity-70">Email:</span>
                                      <br />
                                      <a
                                        href={`mailto:${restaurant.contactEmail}`}
                                        className="underline"
                                      >
                                        {restaurant.contactEmail}
                                      </a>
                                    </p>
                                  )}
                                  {restaurant.contactNumber && (
                                    <p className="break-words">
                                      <span className="opacity-70">Phone:</span>
                                      <br />
                                      <a
                                        href={`tel:${restaurant.contactNumber}`}
                                        className="underline"
                                      >
                                        {restaurant.contactNumber}
                                      </a>
                                    </p>
                                  )}
                                  <div className="mb-2">
                                    <p className="opacity-70 pt-2">
                                      Event Ordering Hours:
                                    </p>
                                    <div className="whitespace-pre-line text-xs mt-1">
                                      {formatCateringHours(
                                        restaurant.cateringOperatingHours ??
                                          null
                                      )}
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                        <div className="flex items-center gap-1 mt-1">
                          <span className="text-yellow-500 text-sm md:text-sm">
                            ★
                          </span>
                          <span className="text-sm md:text-sm text-base-content/70">
                            {restaurant.averageRating}
                          </span>
                        </div>
                        

                        {restaurant.minCateringOrderQuantity &&
                          restaurant.minCateringOrderQuantity > 1 && (
                            <div className="mt-2 text-xs text-black bg-warning/10 px-2 py-1 rounded">
                              Min. {restaurant.minCateringOrderQuantity} items
                            </div>
                          )}

                        {restaurant.minimumDeliveryNoticeHours && (
                          <div className="mt-2 text-xs text-white  bg-primary px-2 py-1 rounded-md">
                            {restaurant.minimumDeliveryNoticeHours >= 24 ? (
                              <>
                                <span className="font-bold">
                                  {Math.floor(
                                    restaurant.minimumDeliveryNoticeHours / 24
                                  )}{" "}
                                  day
                                  {Math.floor(
                                    restaurant.minimumDeliveryNoticeHours / 24
                                  ) > 1
                                    ? "s"
                                    : ""}
                                </span>{" "}
                                <span className="">notice required</span>
                              </>
                            ) : (
                              <>
                                <span className="font-bold">
                                  {restaurant.minimumDeliveryNoticeHours} hours
                                </span>{" "}
                                <span className="">notice required</span>
                              </>
                            )}
                          </div>
                        )}
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Cart Sidebar - Desktop */}
          {/* Cart Sidebar - Desktop */}
<div
  className="hidden lg:block lg:w-[25%] sticky top-4"
  style={{ maxHeight: "calc(100vh - 2rem)" }}
>
  <div className="bg-base-100 rounded-xl p-6 border border-base-300 flex flex-col h-full">
    {selectedRestaurantId && (
      <button
        className="w-full mb-4 px-4 py-2 bg-base-200 hover:bg-base-300 text-base-content rounded-lg font-medium transition-colors text-sm flex items-center justify-center gap-2"
        onClick={() => {
          setSelectedRestaurantId(null);
          setSearchQuery("");
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
                <p key={index} className="text-xs text-base-content leading-tight">
                  {warning}
                </p>
              ))}
            </div>
          ) : null;
        })()}

        {/* SCROLLABLE ITEMS SECTION */}
        <div className="flex-1 overflow-y-auto mb-3 space-y-3 pr-2">
          {selectedItems.map(({ item, quantity }, index) => {
            const BACKEND_QUANTITY_UNIT = item.cateringQuantityUnit || 7;
            const DISPLAY_FEEDS_PER_UNIT = item.feedsPerUnit || 10;
            const price = parseFloat(item.price?.toString() || "0");
            const discountPrice = parseFloat(item.discountPrice?.toString() || "0");
            const itemPrice = item.isDiscount && discountPrice > 0 ? discountPrice : price;
            
            // FIXED: Calculate addon price correctly
            const addonPricePerPortion = (item.selectedAddons || []).reduce(
              (addonTotal, { price, quantity }) => {
                return addonTotal + (price || 0) * (quantity || 0) * DISPLAY_FEEDS_PER_UNIT;
              },
              0
            );
            
            const numPortions = quantity / BACKEND_QUANTITY_UNIT;
            const totalAddonPrice = addonPricePerPortion * numPortions;
            const lineTotal = (itemPrice * quantity) + totalAddonPrice;
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
                  {item.selectedAddons && item.selectedAddons.length > 0 && (
                    <div className="text-[10px] text-base-content/60 mb-1">
                      {(() => {
                        const grouped = item.selectedAddons.reduce(
                          (acc, addon) => {
                            if (!acc[addon.groupTitle]) acc[addon.groupTitle] = [];
                            acc[addon.groupTitle].push(addon);
                            return acc;
                          },
                          {} as Record<string, typeof item.selectedAddons>
                        );
                        return Object.entries(grouped).map(([groupTitle, addons]) => (
                          <div key={groupTitle} className="leading-tight">
                            <span className="font-semibold">{groupTitle}: </span>
                            {addons.map((addon, idx) => (
                              <span key={idx}>
                                {addon.name}
                                {addon.quantity > 1 && ` ×${addon.quantity}`}
                                {idx < addons.length - 1 ? ", " : ""}
                              </span>
                            ))}
                          </div>
                        ));
                      })()}
                    </div>
                  )}
                  
                  {/* Price and Quantity */}
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-bold text-primary">
                      £{lineTotal.toFixed(2)}
                    </span>
                    <span className="text-xs text-base-content/60">
                      {displayQuantity} portion{displayQuantity !== 1 ? 's' : ''}
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
              const BACKEND_QUANTITY_UNIT = item.cateringQuantityUnit || 7;
              const DISPLAY_FEEDS_PER_UNIT = item.feedsPerUnit || 10;
              return sum + (quantity / BACKEND_QUANTITY_UNIT) * DISPLAY_FEEDS_PER_UNIT;
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
                <div className={promotionDiscount > 0 ? "text-green-600" : ""}>
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
                alert(`Please meet minimum order requirements:\n\n${warnings.join("\n")}`);
                return;
              }
              setCurrentStep(2);
            }}
            disabled={selectedItems.length === 0 || getMinimumOrderWarnings().length > 0}
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
                  setSelectedRestaurantId(null);
                  setSearchQuery("");
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
  const BACKEND_QUANTITY_UNIT = item.cateringQuantityUnit || 7;
  const DISPLAY_FEEDS_PER_UNIT = item.feedsPerUnit || 10;
  const price = parseFloat(item.price?.toString() || "0");
  const discountPrice = parseFloat(item.discountPrice?.toString() || "0");
  const itemPrice = item.isDiscount && discountPrice > 0 ? discountPrice : price;
  
  // FIXED: Calculate addon price correctly per portion, then multiply by number of portions
  const addonPricePerPortion = (item.selectedAddons || []).reduce(
    (addonTotal, { price, quantity }) => {
      return addonTotal + (price || 0) * (quantity || 0) * DISPLAY_FEEDS_PER_UNIT;
    },
    0
  );
  
  const numPortions = quantity / BACKEND_QUANTITY_UNIT;
  const totalAddonPrice = addonPricePerPortion * numPortions;
  
  // CORRECT CALCULATION: Item price + addon price for all portions
  const lineTotal = (itemPrice * quantity) + totalAddonPrice;
  
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
        {item.selectedAddons && item.selectedAddons.length > 0 && (
          <div className="text-xs text-base-content/60 mb-1 flex flex-col gap-1">
            {(() => {
              const grouped = item.selectedAddons.reduce(
                (acc, addon) => {
                  if (!acc[addon.groupTitle])
                    acc[addon.groupTitle] = [];
                  acc[addon.groupTitle].push(addon);
                  return acc;
                },
                {} as Record<string, typeof item.selectedAddons>
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
                          {addon.quantity > 1 && ` (×${addon.quantity})`}
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
              {displayQuantity} portion{displayQuantity !== 1 ? 's' : ''}
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
