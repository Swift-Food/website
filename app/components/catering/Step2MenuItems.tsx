import { useState, useEffect } from 'react';
import { cateringService } from '@/services/cateringServices';
import { useCatering } from '@/context/CateringContext';

// Constants
const FEEDS_PER_UNIT = 10;
const BASE_UNIT_QUANTITY = 10;
const PRICE_DISPLAY_PORTIONS = 7;

interface Restaurant {
  id: string;
  restaurant_name: string;
  images: string[];
  averageRating: string;
}

export interface MenuItem {
  id: string;
  name: string;
  description?: string;
  price: string;
  discountPrice?: string;
  isDiscount: boolean;
  image?: string;
  averageRating?: string;
  restaurantId: string;
  restaurant?: {
    id: string;
    name: string;
    restaurantId: string;
  };
}

export default function Step2MenuItems() {
  const { 
    selectedItems, 
    addMenuItem, 
    removeMenuItem, 
    updateItemQuantity,
    setCurrentStep 
  } = useCatering();
  
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [selectedRestaurantId, setSelectedRestaurantId] = useState<string | null>(null);
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [restaurantsLoading, setRestaurantsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showCartMobile, setShowCartMobile] = useState(false);

  // Fetch all restaurants on mount
  useEffect(() => {
    fetchRestaurants();
  }, []);

  // Fetch menu items when restaurant is selected
  useEffect(() => {
    if (!isSearching) {
      fetchAllMenuItems();
    }
  }, [isSearching]);

  const fetchAllMenuItems = async () => {
    setLoading(true);
    try {
      const response = await cateringService.getMenuItems();
      console.log("All menu items response:", response);
      
      const menuItemsOnly = (response || []).map((item: any) => ({
        id: item.id,
        name: item.name,
        description: item.description,
        price: item.price?.toString() || '0',
        discountPrice: item.discountPrice?.toString(),
        isDiscount: item.isDiscount || false,
        image: item.image,
        averageRating: item.averageRating?.toString(),
        restaurantId: item.restaurantId || '',
        restaurant: {
          id: item.restaurantId,
          name: item.restaurant?.restaurant_name || 'Unknown',
          restaurantId: item.restaurantId,
        },
      }));
      
      setMenuItems(menuItemsOnly);
    } catch (error) {
      console.error('Error fetching all menu items:', error);
      setMenuItems([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchRestaurants = async () => {
    setRestaurantsLoading(true);
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/restaurant`);
      const data = await response.json();
      setRestaurants(data);
    } catch (error) {
      console.error('Error fetching restaurants:', error);
    } finally {
      setRestaurantsLoading(false);
    }
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
      console.error('Error searching menu items:', error);
      setSearchResults([]);
    } finally {
      setLoading(false);
    }
  };

  const clearSearch = () => {
    setSearchQuery('');
    setIsSearching(false);
    setSearchResults([]);
    fetchAllMenuItems();
  };

  const getItemQuantity = (itemId: string) => {
    return selectedItems.find((i) => i.item.id === itemId)?.quantity || 0;
  };

  const handleAddItem = (item: MenuItem) => {
    addMenuItem({ item : item, quantity: BASE_UNIT_QUANTITY });
  };

  // Determine which items to display
  let displayItems = isSearching ? searchResults : menuItems;

  // Filter by selected restaurant if one is selected
  if (selectedRestaurantId && !isSearching) {
    displayItems = displayItems.filter(item => item.restaurantId === selectedRestaurantId);
  }

  return (
    <div className="min-h-screen bg-base-100">
      {/* Header */}
      <div className="bg-base-100 border-b border-base-300 pb-4">
        <div className="max-w-7xl mx-auto px-4 pt-4">
          <div className="flex justify-between items-center mb-4">
            <div>
              <h2 className="text-2xl md:text-3xl font-bold mb-2 text-base-content">Select Menu Items</h2>
              <p className="text-sm md:text-base text-base-content/60">Choose items for your catering order</p>
            </div>
            <button className="text-primary hover:opacity-80 font-medium text-sm md:text-base" onClick={() => setCurrentStep(1)} >
              ← Back
            </button>
          </div>

          {/* Search Bar */}
          <form onSubmit={handleSearch} className="mb-6">
            <div className="flex gap-2 md:gap-4">
              <div className="relative flex-1">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search menu items..."
                  className="w-full pl-10 md:pl-12 pr-4 py-2 md:py-3 bg-base-100 border border-base-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent text-sm md:text-base"
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

          {/* Restaurant Horizontal Scroll - Only show when not searching */}
          {!isSearching && (
            <div className="mt-6">
              <h3 className="text-base md:text-lg font-semibold mb-3 text-base-content">Select Restaurant</h3>
              {restaurantsLoading ? (
                <div className="text-center py-4 text-base-content/60 text-sm md:text-base">Loading restaurants...</div>
              ) : (
                <div className="flex gap-3 md:gap-4 overflow-x-auto pb-4 scrollbar-hide -mx-4 px-4">
                  {restaurants.map((restaurant) => (
                    <button
                      key={restaurant.id}
                      onClick={() => setSelectedRestaurantId(
                        selectedRestaurantId === restaurant.id ? null : restaurant.id
                      )}
                      className={`flex-shrink-0 w-32 md:w-40 rounded-xl overflow-hidden border-2 transition-all ${
                        selectedRestaurantId === restaurant.id
                          ? 'border-primary shadow-lg'
                          : 'border-base-300 hover:border-primary/50'
                      }`}
                    >
                      <img
                        src={restaurant.images[0] || '/placeholder.jpg'}
                
                        alt={restaurant.restaurant_name}
                        className="w-full h-24 md:h-32 object-cover"
                      />
                      <div className="p-2 md:p-3 bg-base-100">
                        <h4 className="font-semibold text-xs md:text-sm text-base-content truncate">{restaurant.restaurant_name}</h4>
                        <div className="flex items-center gap-1 mt-1">
                          <span className="text-yellow-500 text-xs md:text-sm">★</span>
                          <span className="text-xs md:text-sm text-base-content/70">{restaurant.averageRating}</span>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Search Results Header */}
          {isSearching && (
            <div className="mt-4 text-xs md:text-sm text-base-content/60">
              Showing search results for "{searchQuery}" ({displayItems.length} items found)
            </div>
          )}
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Menu Items Grid */}
          <div className="flex-1">
            {loading ? (
              <div className="text-center py-12 text-base-content/60">Loading menu items...</div>
            ) : displayItems.length === 0 ? (
              <div className="text-center py-12 text-base-content/50 text-sm md:text-base">
                {isSearching ? 'No menu items found matching your search.' : 'No menu items available.'}
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
                {displayItems.map((item) => {
                  const quantity = getItemQuantity(item.id);
                  const price = parseFloat(item.price?.toString() || '0');
                  const discountPrice = parseFloat(item.discountPrice?.toString() || '0');
                  const displayPrice = item.isDiscount && discountPrice > 0 ? discountPrice : price;

                  return (
                    <div key={item.id} className="bg-base-100 rounded-xl overflow-hidden shadow-md hover:shadow-xl transition-all border border-base-300">
                      {item.image && (
                        <img
                          src={item.image}
                          alt={item.name}
                     
                          className="w-full h-40 md:h-48 object-cover"
                        />
                      )}
                      <div className="p-3 md:p-4">
                        <h3 className="font-bold text-base md:text-lg text-base-content mb-2">{item.name}</h3>
                        {item.description && (
                          <p className="text-base-content/70 text-xs md:text-sm mb-3 line-clamp-2">{item.description}</p>
                        )}
                        
                        {/* Show restaurant name in search results */}
                        {isSearching && item.restaurant && (
                          <p className="text-xs md:text-sm text-base-content/50 mb-2">From: {item.restaurant.name}</p>
                        )}

                        <div className="flex flex-column items-center gap-1 mb-3">
                          <span className="text-xl md:text-2xl font-bold text-primary">£{(Number(displayPrice) * PRICE_DISPLAY_PORTIONS).toFixed(2)}</span>
                        </div>
                        <div className="flex flex-column items-center gap-1 mb-3">
                          <span className="text-xs text-base-content/60">Feeds up to {FEEDS_PER_UNIT} people</span>
                        </div>

                        {quantity > 0 ? (
                          <div className="flex items-center justify-between bg-base-200 p-2 rounded-lg mb-3">
                            <button
                              onClick={() => updateItemQuantity(item.id, Math.max(0, quantity - BASE_UNIT_QUANTITY))}
                              className="w-7 h-7 md:w-8 md:h-8 bg-base-100 border border-base-300 rounded-lg hover:bg-base-200 flex items-center justify-center text-sm md:text-base"
                            >
                              −
                            </button>
                            <span className="font-medium text-xs md:text-sm text-base-content">Feeds {(quantity / BASE_UNIT_QUANTITY) * FEEDS_PER_UNIT} people</span>
                            <button
                              onClick={() => updateItemQuantity(item.id, quantity + BASE_UNIT_QUANTITY)}
                              className="w-7 h-7 md:w-8 md:h-8 bg-base-100 border border-base-300 rounded-lg hover:bg-base-200 flex items-center justify-center text-sm md:text-base"
                            >
                              +
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => handleAddItem(item)}
                            className="w-full bg-primary hover:opacity-90 text-white py-2 md:py-3 rounded-lg font-medium transition-all text-sm md:text-base"
                          >
                            Add to Order
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Cart Sidebar - Desktop */}
          <div className="hidden lg:block lg:w-96 sticky top-4 h-fit">
            <div className="bg-base-100 rounded-xl shadow-xl p-6 border border-base-300">
              <h3 className="text-xl font-bold text-base-content mb-6">Your Catering List</h3>
              
              {selectedItems.length === 0 ? (
                <p className="text-base-content/50 text-center py-8">No items selected yet</p>
              ) : (
                <>
                  <div className="space-y-4 mb-6 max-h-96 overflow-y-auto">
                    {selectedItems.map(({ item, quantity }) => {
                      const price = parseFloat(item.price?.toString() || '0');
                      const discountPrice = parseFloat(item.discountPrice?.toString() || '0');
                      const itemPrice = item.isDiscount && discountPrice > 0 ? discountPrice : price;
                      const subtotal = itemPrice * (quantity / 2);

                      return (
                        <div key={item.id} className="flex gap-3 pb-4 border-b border-base-300">
                          {item.image && (
                            <img
                              src={item.image}
                              alt={item.name}
                  
                              className="w-16 h-16 object-cover rounded-lg"
                            />
                          )}
                          <div className="flex-1">
                            <h4 className="font-semibold text-sm text-base-content mb-1">{item.name}</h4>
                            <p className="text-xl font-bold text-primary mb-2">£{subtotal.toFixed(2)}</p>
                            
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <button
                                  onClick={() => updateItemQuantity(item.id, Math.max(0, quantity - BASE_UNIT_QUANTITY))}
                                  className="w-6 h-6 bg-base-200 rounded flex items-center justify-center hover:bg-base-300"
                                >
                                  −
                                </button>
                                <span className="text-sm font-medium text-base-content">{quantity / BASE_UNIT_QUANTITY}</span>
                                <button
                                  onClick={() => updateItemQuantity(item.id, quantity + BASE_UNIT_QUANTITY)}
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
                      <span>Feeds up to {selectedItems.reduce((sum, item) => sum + (item.quantity / BASE_UNIT_QUANTITY) * FEEDS_PER_UNIT, 0)} people</span>
                    </div>
                    <div className="flex justify-between text-lg font-bold text-base-content">
                      <span>Total:</span>
                      <span>£{selectedItems.reduce((sum, { item, quantity }) => {
                        const price = parseFloat(item.price?.toString() || '0');
                        const discountPrice = parseFloat(item.discountPrice?.toString() || '0');
                        const itemPrice = item.isDiscount && discountPrice > 0 ? discountPrice : price;
                        return sum + itemPrice * (quantity / 2);
                      }, 0).toFixed(2)}</span>
                    </div>
                  </div>

                  <button
                    className="w-full bg-primary hover:opacity-90 text-white py-4 rounded-lg font-bold text-lg transition-all shadow-lg"
                    onClick={() => setCurrentStep(3)}
                  >
                    Continue to Contact Info
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Cart Button - Fixed at bottom */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-base-100 border-t border-base-300 p-4 z-20">
        {selectedItems.length > 0 ? (
          <button
            onClick={() => setShowCartMobile(true)}
            className="w-full bg-primary hover:opacity-90 text-white py-4 rounded-lg font-bold text-lg transition-all shadow-lg flex items-center justify-between px-6"
          >
            <span>View Cart ({selectedItems.length})</span>
            <span>£{selectedItems.reduce((sum, { item, quantity }) => {
              const price = parseFloat(item.price?.toString() || '0');
              const discountPrice = parseFloat(item.discountPrice?.toString() || '0');
              const itemPrice = item.isDiscount && discountPrice > 0 ? discountPrice : price;
              return sum + itemPrice * (quantity / 2);
            }, 0).toFixed(2)}</span>
          </button>
        ) : (
          <button
            disabled
            className="w-full bg-base-300 text-base-content/50 py-4 rounded-lg font-bold text-lg cursor-not-allowed"
          >
            No items selected
          </button>
        )}
      </div>

      {/* Mobile Cart Modal */}
      {showCartMobile && (
        <div className="lg:hidden fixed inset-0 bg-black/50 z-50 flex items-end">
          <div className="bg-base-100 w-full rounded-t-3xl max-h-[85vh] overflow-y-auto">
            <div className="sticky top-0 bg-base-100 border-b border-base-300 p-4 flex justify-between items-center">
              <h3 className="text-xl font-bold text-base-content">Your Catering List</h3>
              <button onClick={() => setShowCartMobile(false)} className="text-2xl">×</button>
            </div>

            <div className="p-4">
              {selectedItems.length === 0 ? (
                <p className="text-base-content/50 text-center py-8">No items selected yet</p>
              ) : (
                <>
                  <div className="space-y-4 mb-6">
                    {selectedItems.map(({ item, quantity }) => {
                      const price = parseFloat(item.price?.toString() || '0');
                      const discountPrice = parseFloat(item.discountPrice?.toString() || '0');
                      const itemPrice = item.isDiscount && discountPrice > 0 ? discountPrice : price;
                      const subtotal = itemPrice * (quantity / 2);

                      return (
                        <div key={item.id} className="flex gap-3 pb-4 border-b border-base-300">
                          {item.image && (
                            <img
                              src={item.image}
                              alt={item.name}
                         
                              className="w-16 h-16 object-cover rounded-lg"
                            />
                          )}
                          <div className="flex-1">
                            <h4 className="font-semibold text-sm text-base-content mb-1">{item.name}</h4>
                            <p className="text-lg font-bold text-primary mb-2">£{subtotal.toFixed(2)}</p>
                            
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <button
                                  onClick={() => updateItemQuantity(item.id, Math.max(0, quantity - BASE_UNIT_QUANTITY))}
                                  className="w-8 h-8 bg-base-200 rounded flex items-center justify-center hover:bg-base-300"
                                >
                                  −
                                </button>
                                <span className="text-sm font-medium text-base-content">{quantity / BASE_UNIT_QUANTITY}</span>
                                <button
                                  onClick={() => updateItemQuantity(item.id, quantity + BASE_UNIT_QUANTITY)}
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
                      <span>Feeds up to {selectedItems.reduce((sum, item) => sum + (item.quantity / BASE_UNIT_QUANTITY) * FEEDS_PER_UNIT, 0)} people</span>
                    </div>
                    <div className="flex justify-between text-lg font-bold text-base-content">
                      <span>Total:</span>
                      <span>£{selectedItems.reduce((sum, { item, quantity }) => {
                        const price = parseFloat(item.price?.toString() || '0');
                        const discountPrice = parseFloat(item.discountPrice?.toString() || '0');
                        const itemPrice = item.isDiscount && discountPrice > 0 ? discountPrice : price;
                        return sum + itemPrice * (quantity / 2);
                      }, 0).toFixed(2)}</span>
                    </div>
                  </div>

                  <button
                    className="w-full bg-primary hover:opacity-90 text-white py-4 rounded-lg font-bold text-lg transition-all shadow-lg"
                    onClick={() => {
                      setShowCartMobile(false);
                      setCurrentStep(3);
                    }}
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