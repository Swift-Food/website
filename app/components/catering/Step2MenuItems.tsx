// components/catering/Step2MenuItems.tsx

'use client';

import { useState, useEffect } from 'react';
import { useCatering } from '@/context/CateringContext';
import { cateringService } from '@/services/cateringServices';
import { SearchResult, SearchFilters } from '@/types/catering.types';

export default function Step2MenuItems() {
  const { selectedItems, addMenuItem, removeMenuItem, updateItemQuantity, setCurrentStep } = useCatering();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [menuItems, setMenuItems] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState<SearchFilters>({
    page: 1,
    limit: 12,
  });
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    searchMenuItems();
  }, [filters.page]);

  const searchMenuItems = async () => {
    setLoading(true);
    try {
      const response = await cateringService.searchMenuItems(searchQuery, filters);
      console.log("response", JSON.stringify(response))
      setMenuItems(response.menuItems);
      setTotalPages(Math.ceil(response.pagination.total / (filters.limit || 12)));
    } catch (error) {
      console.error('Error searching menu items:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setFilters({ ...filters, page: 1 });
    searchMenuItems();
  };

  const getItemQuantity = (itemId: string) => {
    return selectedItems.find((i) => i.item.id === itemId)?.quantity || 0;
  };

  const handleAddItem = (item: SearchResult) => {
    addMenuItem({ item, quantity: 10 }); // Start with 10 instead of 1
  };

  return (
    <div className="flex gap-6">
      {/* Left side - Menu Items */}
      <div className="flex-1">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h2 className="text-3xl font-bold mb-2">Select Menu Items</h2>
            <p className="text-gray-600">Choose items for your catering order</p>
          </div>
          <button
            onClick={() => setCurrentStep(1)}
            className="text-blue-600 hover:text-blue-700 font-medium"
          >
            ← Back
          </button>
        </div>
  
        <form onSubmit={handleSearch} className="mb-8">
          <div className="flex gap-4">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search menu items..."
              className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <button
              type="submit"
              className="bg-blue-600 text-white px-8 py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors"
            >
              Search
            </button>
          </div>
        </form>
  
        {loading ? (
          <div className="text-center py-12">Loading...</div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              {menuItems.map((item) => {
                const quantity = getItemQuantity(item.id);
                const price = parseFloat(item.price?.toString() || '0');
                const discountPrice = parseFloat(item.discountPrice?.toString() || '0');
                const displayPrice = item.isDiscount && discountPrice > 0 ? discountPrice : price;
  
                return (
                  <div key={item.id} className="border rounded-lg overflow-hidden hover:shadow-lg transition-shadow">
                    {item.image && (
                      <img
                        src={item.image}
                        alt={item.name}
                        className="w-full h-48 object-cover"
                      />
                    )}
                    <div className="p-4">
                      <h3 className="font-semibold text-lg mb-2">{item.name}</h3>
                      {item.description && (
                        <p className="text-gray-600 text-sm mb-3 line-clamp-2">{item.description}</p>
                      )}
                      
                      {item.restaurant && (
                        <p className="text-sm text-gray-500 mb-2">From: {item.restaurant.name}</p>
                      )}
  
                      <div className="flex items-center justify-between mb-3">
                        <div>
                          {item.isDiscount ? (
                            <div className="flex items-center gap-2">
                              <span className="text-lg font-bold text-green-600">
                                ${(Number(displayPrice) * 10).toFixed(2)} <span className="text-xs text-gray-500">/10 units</span>
                              </span>
                              <span className="text-sm text-gray-400 line-through">
                                ${(price * 10).toFixed(2)}
                              </span>
                            </div>
                          ) : (
                            <div>
                              <span className="text-lg font-bold">${(Number(displayPrice) * 10).toFixed(2)}</span>
                              <span className="text-xs text-gray-500 ml-1">/10 units</span>
                            </div>
                          )}
                        </div>
                        {item.rating && (
                          <div className="flex items-center gap-1">
                            <span className="text-yellow-500">★</span>
                            <span className="text-sm">{item.rating}</span>
                          </div>
                        )}
                      </div>
  
                      {quantity > 0 ? (
                        <div className="flex items-center justify-between bg-gray-50 p-2 rounded">
                          <button
                            onClick={() => updateItemQuantity(item.id, Math.max(0, quantity - 10))}
                            className="w-8 h-8 bg-white border rounded hover:bg-gray-100"
                          >
                            -
                          </button>
                          <span className="font-medium">{quantity} units</span>
                          <button
                            onClick={() => updateItemQuantity(item.id, quantity + 10)}
                            className="w-8 h-8 bg-white border rounded hover:bg-gray-100"
                          >
                            +
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => handleAddItem(item)}
                          className="w-full bg-blue-600 text-white py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors"
                        >
                          Add to Order
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
  
            {totalPages > 1 && (
              <div className="flex justify-center gap-2 mb-8">
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                  <button
                    key={page}
                    onClick={() => setFilters({ ...filters, page })}
                    className={`px-4 py-2 rounded ${
                      filters.page === page
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-200 hover:bg-gray-300'
                    }`}
                  >
                    {page}
                  </button>
                ))}
              </div>
            )}
          </>
        )}
      </div>
  
      {/* Right side - Cart */}
      <div className="w-96 sticky top-4 h-fit">
        <div className="bg-white border rounded-lg shadow-lg p-6">
          <h3 className="text-xl font-bold mb-4">Your Order</h3>
          
          {selectedItems.length === 0 ? (
            <p className="text-gray-500 text-center py-8">No items selected yet</p>
          ) : (
            <>
              <div className="space-y-4 mb-6 max-h-96 overflow-y-auto">
                {selectedItems.map(({ item, quantity }) => {
                  const price = parseFloat(item.price?.toString() || '0');
                  const discountPrice = parseFloat(item.discountPrice?.toString() || '0');
                  const itemPrice = item.isDiscount && discountPrice > 0 ? discountPrice : price;
                  const subtotal = itemPrice * quantity;
  
                  return (
                    <div key={item.id} className="border-b pb-4">
                      <div className="flex gap-3">
                        {item.image && (
                          <img
                            src={item.image}
                            alt={item.name}
                            className="w-16 h-16 object-cover rounded"
                          />
                        )}
                        <div className="flex-1">
                          <h4 className="font-semibold text-sm mb-1">{item.name}</h4>
                          {item.restaurant && (
                            <p className="text-xs text-gray-500 mb-2">{item.restaurant.name}</p>
                          )}
                          <div className="flex items-center justify-between">
                            <div className="text-xs text-gray-600">
                              <div>${itemPrice.toFixed(2)} × {quantity} units</div>
                            </div>
                            <button
                              onClick={() => removeMenuItem(item.id)}
                              className="text-red-500 hover:text-red-700 text-xs"
                            >
                              Remove
                            </button>
                          </div>
                          <div className="mt-2 flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => updateItemQuantity(item.id, Math.max(0, quantity - 10))}
                                className="w-6 h-6 bg-gray-100 border rounded hover:bg-gray-200 text-sm"
                              >
                                -
                              </button>
                              <span className="text-sm font-medium">{quantity}</span>
                              <button
                                onClick={() => updateItemQuantity(item.id, quantity + 10)}
                                className="w-6 h-6 bg-gray-100 border rounded hover:bg-gray-200 text-sm"
                              >
                                +
                              </button>
                            </div>
                            <div className="font-bold text-sm">
                              ${subtotal.toFixed(2)}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
  
              <div className="border-t pt-4 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Items ({selectedItems.length})</span>
                  <span>{selectedItems.reduce((sum, item) => sum + item.quantity, 0)} units</span>
                </div>
                <div className="flex justify-between text-lg font-bold">
                  <span>Total:</span>
                  <span>${selectedItems.reduce((sum, { item, quantity }) => {
                    const price = parseFloat(item.price?.toString() || '0');
                    const discountPrice = parseFloat(item.discountPrice?.toString() || '0');
                    const itemPrice = item.isDiscount && discountPrice > 0 ? discountPrice : price;
                    return sum + itemPrice * quantity;
                  }, 0).toFixed(2)}</span>
                </div>
              </div>
  
              <button
                onClick={() => setCurrentStep(3)}
                className="w-full mt-6 bg-blue-600 text-white py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors"
              >
                Continue to Contact Info
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}