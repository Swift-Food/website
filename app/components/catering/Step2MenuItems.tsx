import { useState, useEffect } from "react";
import { cateringService } from "@/services/cateringServices";
import { useCatering } from "@/context/CateringContext";
import MenuItemCard from "./MenuItemCard";

export interface Restaurant {
  id: string;
  restaurant_name: string;
  images: string[];
  averageRating: string;
  minCateringOrderQuantity?: number;
  minimumDeliveryNoticeHours?: number;
  contactEmail?: string; // Add this
  contactNumber?: string; // Add this
  cateringMinOrderSettings?: {
    minQuantity: number;
    applicableSections: string[];
  } | null;
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
  addons: any[];
  restaurant?: {
    id: string;
    name: string;
    restaurantId: string;
    menuGroupSettings?: Record<string, any>;
  };
}

export default function Step2MenuItems() {
  // const [sortedGroups, setSortedGroups] = useState<string[]>([]);
  // const [groupedItems, setGroupedItems] = useState<Record<string, MenuItem[]>>(
  //   {}
  // );

  const {
    selectedItems,
    addMenuItem,
    removeMenuItem,
    updateItemQuantity,
    setCurrentStep,
    setSelectedRestaurants,
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

  // Fetch all restaurants on mount
  useEffect(() => {
    fetchRestaurants();
  }, []);
  useEffect(() => {
    const restaurantIds = new Set(
      selectedItems.map((item) => item.item.restaurantId)
    );
    const selectedRests = restaurants.filter((r) => restaurantIds.has(r.id));
    setSelectedRestaurants(selectedRests);
  }, [selectedItems, restaurants]);

  // useEffect(() => {
  //   if (selectedRestaurantId) {
  //     const selectedRestaurant = restaurants.find(
  //       (r) => r.id === selectedRestaurantId
  //     );
  //     setRestaurantName(selectedRestaurant?.restaurant_name || "");
  //   } else {
  //     setRestaurantName("");
  //   }
  // }, [restaurants, selectedRestaurantId]);

  // Fetch menu items when restaurant is selected
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
      // console.log("All menu items response:", response);

      const menuItemsOnly = (response || []).map((item: any) => ({
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
        addons: item.addons,
        restaurant: {
          id: item.restaurantId,
          name: item.restaurant?.restaurant_name || "Unknown",
          restaurantId: item.restaurantId,
          menuGroupSettings: item.restaurant?.menuGroupSettings,
        },
      }));

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
      // Filter to only show restaurants with isCatering = true
      // const cateringRestaurants = data.filter(
      //   (restaurant: any) => restaurant.isCatering === true
      // );
      setRestaurants(data);
    } catch (error) {
      console.error("Error fetching restaurants:", error);
    } finally {
      setRestaurantsLoading(false);
    }
  };

  // Add this function at the top of the component, after other helper functions
  const getRestaurantItemCounts = () => {
    const counts: Record<
      string,
      {
        count: number;
        minRequired: number;
        name: string;
        applicableSections: string[];
      }
    > = {};

    selectedItems.forEach(({ item, quantity }) => {
      const restaurantId = item.restaurantId;

      // Skip if restaurantId is undefined
      if (!restaurantId) return;

      const restaurant = restaurants.find((r) => r.id === restaurantId);

      if (!counts[restaurantId]) {
        const settings = restaurant?.cateringMinOrderSettings;
        counts[restaurantId] = {
          count: 0,
          minRequired:
            settings?.minQuantity || restaurant?.minCateringOrderQuantity || 1,
          name: restaurant?.restaurant_name || "Unknown Restaurant",
          applicableSections: settings?.applicableSections || [],
        };
      }

      // Only count if item's groupTitle is in applicableSections (or if applicableSections is empty)
      const shouldCount =
        counts[restaurantId].applicableSections.length === 0 ||
        (item.groupTitle &&
          counts[restaurantId].applicableSections.includes(item.groupTitle));

      if (shouldCount) {
        const BACKEND_QUANTITY_UNIT = item.cateringQuantityUnit || 7;
        counts[restaurantId].count += quantity / BACKEND_QUANTITY_UNIT;
      }
    });

    return counts;
  };

  const getMinimumOrderWarnings = () => {
    const counts = getRestaurantItemCounts();
    const warnings: string[] = [];

    Object.entries(counts).forEach(([, data]) => {
      if (data.count < data.minRequired) {
        const sectionInfo =
          data.applicableSections.length > 0
            ? ` from sections: ${data.applicableSections.join(", ")}`
            : "";
        warnings.push(
          `${data.name}: Add ${
            data.minRequired - data.count
          } more item(s)${sectionInfo}`
        );
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

  // useEffect(() => {
  //   // Handle multi-restaurant search results by deriving groups from items
  //   const menuGroupSettings = displayItems[0]?.restaurant?.menuGroupSettings;
  //   const hasSettings =
  //     menuGroupSettings && Object.keys(menuGroupSettings).length > 0;

  //   // Check if all items are from the same restaurant
  //   const restaurantIds = new Set(
  //     displayItems.map((item) => item.restaurantId)
  //   );
  //   const singleRestaurant = restaurantIds.size === 1;

  //   let groups: string[] = [];

  //   // Only use menuGroupSettings if all items are from the same restaurant
  //   if (hasSettings && singleRestaurant) {
  //     groups = Object.keys(menuGroupSettings!)
  //       .filter((g) => {
  //         const lower = g.toLowerCase();
  //         return lower !== "drink" && lower !== "drinks";
  //       })
  //       .sort((a, b) => {
  //         const orderA = menuGroupSettings![a]?.displayOrder ?? 999;
  //         const orderB = menuGroupSettings![b]?.displayOrder ?? 999;
  //         return orderA - orderB;
  //       });
  //   } else {
  //     // Multi-restaurant or no settings: derive groups from items
  //     groups = Array.from(
  //       new Set(
  //         displayItems
  //           .map((i) => i.groupTitle || "Other")
  //           .filter((g) => {
  //             const lower = g.toLowerCase();
  //             return lower !== "drink" && lower !== "drinks";
  //           })
  //       )
  //     );
  //     groups.sort((a, b) => a.localeCompare(b));
  //   }

  //   const groupItems: Record<string, MenuItem[]> = {};
  //   groups.forEach((g) => (groupItems[g] = []));

  //   displayItems.forEach((item) => {
  //     const group = item.groupTitle || "Other";
  //     const lower = group.toLowerCase();
  //     if (lower === "drink" || lower === "drinks") return;
  //     if (!groupItems[group]) groupItems[group] = [];
  //     groupItems[group].push(item);
  //   });
  //   Object.keys(groupItems).forEach((groupName) => {
  //     groupItems[groupName].sort(
  //       (a, b) => (a.itemDisplayOrder ?? 999) - (b.itemDisplayOrder ?? 999)
  //     );
  //   });

  //   // setGroupedItems(groupItems);
  //   // setSortedGroups(groups);
  // }, [displayItems]);

  const clearSearch = () => {
    setSearchQuery("");
    setIsSearching(false);
    setSearchResults(null);
    fetchAllMenuItems();
  };

  const getItemQuantity = (itemId: string) => {
    return selectedItems.find((i) => i.item.id === itemId)?.quantity || 0;
  };

  const handleAddItem = (item: MenuItem) => {
    const backendQuantity = item.cateringQuantityUnit || 7;
    console.log("Adding item with backend quantity:", backendQuantity);
    addMenuItem({ item: item, quantity: backendQuantity });
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
        <form onSubmit={handleSearch} className="mb-6">
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
                🔍
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
                          .filter((g) => {
                            const lower = g.toLowerCase();
                            return lower !== "drink" && lower !== "drinks";
                          })
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
                            rest.items
                              .map((i) => i.groupTitle || "Other")
                              .filter((g) => {
                                const lower = g.toLowerCase();
                                return lower !== "drink" && lower !== "drinks";
                              })
                          )
                        ).sort((a, b) => a.localeCompare(b));
                      }

                      const groupItemsForRest: Record<string, MenuItem[]> = {};
                      groupsForRest.forEach((g) => (groupItemsForRest[g] = []));
                      rest.items.forEach((item) => {
                        const group = item.groupTitle || "Other";
                        const lower = group.toLowerCase();
                        if (lower === "drink" || lower === "drinks") return;
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
                                  restaurant?.contactNumber) && (
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
                                      <div className="bg-base-content text-base-100 text-sm rounded-lg p-3 shadow-lg">
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
                                      </div>
                                    </div>
                                  </div>
                                )
                              );
                            })()}
                          </div>
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
                                  <h3 className="text-2xl font-bold text-primary mb-4">
                                    {groupName}
                                  </h3>
                                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
                                    {orderedItems.map((item) => (
                                      <MenuItemCard
                                        key={item.id}
                                        item={item}
                                        quantity={getItemQuantity(item.id)}
                                        isExpanded={expandedItemId === item.id}
                                        isSearching={isSearching}
                                        onToggleExpand={() =>
                                          setExpandedItemId(
                                            expandedItemId === item.id
                                              ? null
                                              : item.id
                                          )
                                        }
                                        onAddItem={handleAddItem}
                                        onUpdateQuantity={updateItemQuantity}
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
                          ? "border-primary shadow-lg"
                          : "border-base-300 hover:border-primary/50"
                      }`}
                    >
                      <img
                        src={restaurant.images[0] || "/placeholder.jpg"}
                        alt={restaurant.restaurant_name}
                        className="w-full aspect-[16/9]  object-cover"
                      />
                      <div className="p-2 md:p-3 bg-base-100">
                        <div className="flex items-center justify-between gap-2">
                          <h4 className="font-semibold text-xs md:text-sm text-base-content truncate">
                            {restaurant.restaurant_name}
                          </h4>
                          {(restaurant.contactEmail ||
                            restaurant.contactNumber) && (
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
                                <div className="bg-base-content text-base-100 text-xs rounded-lg p-3 shadow-lg">
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
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                        <div className="flex items-center gap-1 mt-1">
                          <span className="text-yellow-500 text-xs md:text-sm">
                            ★
                          </span>
                          <span className="text-xs md:text-sm text-base-content/70">
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
                          <div className="mt-2 text-xs text-base-content/70 bg-info/10 px-2 py-1 rounded">
                            {restaurant.minimumDeliveryNoticeHours >= 24
                              ? `${Math.floor(
                                  restaurant.minimumDeliveryNoticeHours / 24
                                )} day${
                                  Math.floor(
                                    restaurant.minimumDeliveryNoticeHours / 24
                                  ) > 1
                                    ? "s"
                                    : ""
                                } notice required`
                              : `${restaurant.minimumDeliveryNoticeHours}h notice required`}
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
          <div className="hidden lg:block lg:w-96 sticky top-32 h-fit items-center justify-center">
            <div className="bg-base-100 rounded-xl shadow-xl p-6 border border-base-300">
              <h3 className="text-xl font-bold text-base-content mb-6">
                Your Catering List
              </h3>
              {(() => {
                const warnings = getMinimumOrderWarnings();
                return warnings.length > 0 ? (
                  <div className="mb-4 p-3 bg-warning/10 border border-warning/30 rounded-xl">
                    <p className="text-md font-semibold text-base-content mb-2">
                      ⚠️ Minimum Order Requirements
                    </p>
                    {warnings.map((warning, index) => (
                      <p key={index} className="text-md text-base-content">
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
                <>
                  <div className="space-y-4 mb-6 max-h-96 overflow-y-auto">
                    {selectedItems.map(({ item, quantity }) => {
                      const price = parseFloat(item.price?.toString() || "0");
                      const discountPrice = parseFloat(
                        item.discountPrice?.toString() || "0"
                      );
                      const itemPrice =
                        item.isDiscount && discountPrice > 0
                          ? discountPrice
                          : price;
                      const subtotal = itemPrice * quantity;
                      const BACKEND_QUANTITY_UNIT =
                        item.cateringQuantityUnit || 7;
                      const DISPLAY_FEEDS_PER_UNIT = item.feedsPerUnit || 10;

                      const numUnits = quantity / BACKEND_QUANTITY_UNIT;
                      const displayQuantity = numUnits * DISPLAY_FEEDS_PER_UNIT;

                      return (
                        <div
                          key={item.id}
                          className="flex gap-3 pb-4 border-b border-base-300"
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
                            <p className="text-xl font-bold text-primary mb-2">
                              £{subtotal.toFixed(2)}
                            </p>

                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <button
                                  onClick={() =>
                                    updateItemQuantity(
                                      item.id,
                                      Math.max(
                                        0,
                                        quantity - BACKEND_QUANTITY_UNIT
                                      )
                                    )
                                  }
                                  className="w-6 h-6 bg-base-200 rounded flex items-center justify-center hover:bg-base-300"
                                >
                                  −
                                </button>
                                <span className="text-sm font-medium text-base-content">
                                  Feeds {displayQuantity} people
                                </span>
                                <button
                                  onClick={() =>
                                    updateItemQuantity(
                                      item.id,
                                      quantity + BACKEND_QUANTITY_UNIT
                                    )
                                  }
                                  className="w-6 h-6 bg-base-200 rounded flex items-center justify-center hover:bg-base-300"
                                >
                                  +
                                </button>
                              </div>
                              <button
                                onClick={() => removeMenuItem(item.id)}
                                className="text-error hover:opacity-80 text-xs"
                              >
                                Remove
                              </button>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  <div className="space-y-2 border-t border-base-300 pt-4 mb-6">
                    <div className="flex justify-between text-sm text-base-content/70">
                      <span>Items ({selectedItems.length})</span>
                      <span>
                        Feeds up to{" "}
                        {selectedItems.reduce((sum, { item, quantity }) => {
                          const BACKEND_QUANTITY_UNIT =
                            item.cateringQuantityUnit || 7;
                          const DISPLAY_FEEDS_PER_UNIT =
                            item.feedsPerUnit || 10;
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
                        £
                        {selectedItems
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
                            return sum + itemPrice * quantity;
                          }, 0)
                          .toFixed(2)}
                      </span>
                    </div>
                  </div>

                  <button
                    className="w-full bg-primary hover:opacity-90 text-white py-4 rounded-lg font-bold text-lg transition-all shadow-lg disabled:bg-base-300 disabled:cursor-not-allowed"
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
                </>
              )}
            </div>
            {/* Remove the back button section and replace with: */}
            {selectedRestaurantId && (
              <div className="flex justify-center w-full my-6">
                <button
                  className="bg-base-300 text-base-content px-4 py-2 rounded-lg font-medium hover:bg-base-content/10 transition-colors text-sm md:text-base"
                  onClick={() => {
                    setSelectedRestaurantId(null);
                    setSearchQuery("");
                    window.scrollTo({ top: 0, behavior: "smooth" });
                  }}
                >
                  ← Back to Restaurants
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Cart Button - Fixed at bottom */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-base-100 border-t border-base-300 p-4 z-20">
        <div className="flex gap-2">
          {selectedRestaurantId && (
            <button
              className="bg-base-300 text-base-content px-3 py-2 rounded-lg font-medium hover:bg-base-content/10 transition-colors text-sm flex-shrink-0"
              onClick={() => {
                setSelectedRestaurantId(null);
                setSearchQuery("");
                window.scrollTo({ top: 0, behavior: "smooth" });
              }}
            >
              ← Back
            </button>
          )}
          {selectedItems.length > 0 ? (
            <button
              onClick={() => setShowCartMobile(true)}
              className="flex-1 bg-primary hover:opacity-90 text-white py-4 rounded-lg font-bold text-lg transition-all shadow-lg flex items-center justify-between px-6"
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
                    return sum + itemPrice * quantity;
                  }, 0)
                  .toFixed(2)}
              </span>
            </button>
          ) : (
            <button
              disabled
              className="flex-1 bg-base-300 text-base-content/50 py-4 rounded-lg font-bold text-lg cursor-not-allowed"
            >
              No items selected
            </button>
          )}
        </div>
      </div>

      {/* Mobile Cart Modal */}
      {showCartMobile && (
        <div className="lg:hidden fixed inset-0 bg-black/50 z-50 flex items-end">
          <div className="bg-base-100 w-full rounded-t-3xl max-h-[85vh] overflow-y-auto">
            <div className="sticky top-0 bg-base-100 border-b border-base-300 p-4 flex justify-between items-center">
              <h3 className="text-xl font-bold text-base-content">
                Your Catering List
              </h3>
              <button
                onClick={() => setShowCartMobile(false)}
                className="text-2xl"
              >
                ×
              </button>
            </div>

            <div className="p-4">
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
                <>
                  <div className="space-y-4 mb-6">
                    {selectedItems.map(({ item, quantity }) => {
                      const price = parseFloat(item.price?.toString() || "0");
                      const discountPrice = parseFloat(
                        item.discountPrice?.toString() || "0"
                      );
                      const itemPrice =
                        item.isDiscount && discountPrice > 0
                          ? discountPrice
                          : price;
                      const subtotal = itemPrice * quantity;

                      // USE ITEM'S OWN VALUES:
                      const BACKEND_QUANTITY_UNIT =
                        item.cateringQuantityUnit || 7;
                      const DISPLAY_FEEDS_PER_UNIT = item.feedsPerUnit || 10;

                      const numUnits = quantity / BACKEND_QUANTITY_UNIT;

                      const displayQuantity = numUnits * DISPLAY_FEEDS_PER_UNIT;

                      return (
                        <div
                          key={item.id}
                          className="flex gap-3 pb-4 border-b border-base-300"
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
                            <p className="text-lg font-bold text-primary mb-2">
                              £{subtotal.toFixed(2)}
                            </p>

                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <button
                                  onClick={() =>
                                    updateItemQuantity(
                                      item.id,
                                      Math.max(
                                        0,
                                        quantity - BACKEND_QUANTITY_UNIT
                                      )
                                    )
                                  }
                                  className="w-8 h-8 bg-base-200 rounded flex items-center justify-center hover:bg-base-300"
                                >
                                  −
                                </button>
                                <span className="text-sm font-medium text-base-content">
                                  Feeds {displayQuantity} people
                                </span>
                                <button
                                  onClick={() =>
                                    updateItemQuantity(
                                      item.id,
                                      quantity + BACKEND_QUANTITY_UNIT
                                    )
                                  }
                                  className="w-8 h-8 bg-base-200 rounded flex items-center justify-center hover:bg-base-300"
                                >
                                  +
                                </button>
                              </div>
                              <button
                                onClick={() => removeMenuItem(item.id)}
                                className="text-error hover:opacity-80 text-sm"
                              >
                                Remove
                              </button>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  <div className="space-y-2 border-t border-base-300 pt-4 mb-6">
                    <div className="flex justify-between text-sm text-base-content/70">
                      <span>Items ({selectedItems.length})</span>
                      <span>
                        Feeds up to{" "}
                        {selectedItems.reduce((sum, { item, quantity }) => {
                          const BACKEND_QUANTITY_UNIT =
                            item.cateringQuantityUnit || 7;
                          const DISPLAY_FEEDS_PER_UNIT =
                            item.feedsPerUnit || 10;
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
                        £
                        {selectedItems
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
                            return sum + itemPrice * quantity;
                          }, 0)
                          .toFixed(2)}
                      </span>
                    </div>
                  </div>

                  <button
                    className="w-full bg-primary hover:opacity-90 text-white py-4 rounded-lg font-bold text-lg transition-all shadow-lg disabled:bg-base-300 disabled:cursor-not-allowed"
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
                      setCurrentStep(3);
                    }}
                    disabled={getMinimumOrderWarnings().length > 0}
                  >
                    Continue to Contact Info
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
