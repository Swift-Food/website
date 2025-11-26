// app/components/catering/dashboard/OrderItems.tsx
'use client';

import React, { useState } from 'react';
import { CateringOrderResponse } from '@/types/api';
import { ChefHat, Package, ChevronDown, ChevronUp } from 'lucide-react';

interface OrderItemsProps {
  order: CateringOrderResponse;
}

export default function OrderItems({ order }: OrderItemsProps) {
  // Support both new (restaurants) and legacy (orderItems) formats
  const restaurantsData = order.restaurants || order.orderItems || [];

  const [expandedRestaurants, setExpandedRestaurants] = useState<Set<number>>(
    new Set(restaurantsData.map((_, idx) => idx))
  );

  const toggleRestaurant = (idx: number) => {
    setExpandedRestaurants(prev => {
      const newSet = new Set(prev);
      if (newSet.has(idx)) {
        newSet.delete(idx);
      } else {
        newSet.add(idx);
      }
      return newSet;
    });
  };
  return (
    <div className="bg-white rounded-xl shadow-md p-4 sm:p-6">
      <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4 sm:mb-6 flex items-center gap-2">
        <Package className="h-5 w-5 sm:h-6 sm:w-6 text-pink-500" />
        Order Items
      </h2>

      <div className="space-y-4 sm:space-y-6">
        {restaurantsData.map((restaurant, idx) => {
          const isExpanded = expandedRestaurants.has(idx);
          
          return (
          <div key={idx} className="border border-gray-200 rounded-lg overflow-hidden hover:shadow-md transition-shadow">
            <button
              onClick={() => toggleRestaurant(idx)}
              className="w-full flex items-center justify-between gap-2 sm:gap-3 p-3 sm:p-5 border-b border-gray-200 hover:bg-gray-50 transition-colors"
            >
              <div className="flex items-center gap-2 sm:gap-3">
                <ChefHat className="h-5 w-5 sm:h-6 sm:w-6 text-pink-500 flex-shrink-0" />
                <h3 className="text-base sm:text-lg font-bold text-gray-900 break-words text-left">{restaurant.restaurantName}</h3>
              </div>
              {isExpanded ? (
                <ChevronUp className="h-5 w-5 text-gray-400 flex-shrink-0" />
              ) : (
                <ChevronDown className="h-5 w-5 text-gray-400 flex-shrink-0" />
              )}
            </button>

            {isExpanded && (
              <div className="p-3 sm:p-5">
            <div className="space-y-2 sm:space-y-3">
              {restaurant.menuItems.map((item, itemIdx) => {
                const cateringUnit = item.cateringQuantityUnit || 1;
                const feedsPerUnit = item.feedsPerUnit || 10;
                
                const numUnits = item.quantity / cateringUnit;
                console.log("items", item.menuItemName, item.quantity, cateringUnit)
                const totalFeeds = numUnits * feedsPerUnit;

                return (
                  <div key={itemIdx} className="bg-gray-50 rounded-lg p-3 sm:p-4 hover:bg-gray-100 transition-colors">
                    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-2 mb-2">
                      <div className="flex-1 sm:pr-4">
                        <p className="font-semibold text-sm sm:text-base text-gray-900 mb-1 break-words">
                          {item.menuItemName || item.name}
                        </p>
                        <p className="text-xs sm:text-sm text-gray-600">
                          {Math.round(numUnits)} portion{Math.round(numUnits) !== 1 ? 's' : ''} •
                          Serves ~{Math.round(totalFeeds)} people
                        </p>
                      </div>
                      <p className="font-bold text-pink-600 text-sm sm:text-base whitespace-nowrap self-end sm:self-auto">
                        £{Number(item.customerTotalPrice || 0).toFixed(2)}
                      </p>
                    </div>

                    {item.selectedAddons && item.selectedAddons.length > 0 && (
                      <div className="mt-2 sm:mt-3 pl-3 sm:pl-4 border-l-2 sm:border-l-3 border-pink-300 bg-white rounded-r-lg p-2 sm:p-3">
                        <p className="text-xs font-semibold text-gray-700 mb-1 sm:mb-2 uppercase tracking-wide">Add-ons:</p>
                        <div className="space-y-1">
                          {item.selectedAddons.map((addon, addonIdx) => (
                            <div key={addonIdx} className="flex justify-between items-center text-xs sm:text-sm gap-2">
                              <span className="text-gray-700 flex-1 break-words">
                                • {addon.name} <span className="text-gray-500">x {addon.quantity}</span>
                              </span>
                              <span className="text-pink-600 font-semibold whitespace-nowrap">
                                +£{(addon.customerUnitPrice * addon.quantity).toFixed(2)}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {'specialInstructions' in restaurant && restaurant.specialInstructions && (
              <div className="mt-3 sm:mt-4 bg-yellow-50 border-l-4 border-yellow-400 rounded-r-lg p-2 sm:p-3">
                <p className="text-xs font-semibold text-yellow-900 mb-1 uppercase tracking-wide">
                  Special Instructions:
                </p>
                <p className="text-xs sm:text-sm text-yellow-800 whitespace-pre-wrap break-words">{restaurant.specialInstructions}</p>
              </div>
            )}
            </div>
         
            )}
          </div>
        );
        })}

        {/* Pricing Summary */}
        <div className="border-t-2 border-gray-300 pt-4 sm:pt-6 mt-4 sm:mt-6">
          <h3 className="text-base sm:text-lg font-bold text-gray-900 mb-3 sm:mb-4">Order Summary</h3>
          <div className="space-y-2 sm:space-y-3 bg-gray-50 rounded-lg p-3 sm:p-5">
            <div className="flex justify-between text-gray-700 text-sm sm:text-base">
              <span className="font-medium">Subtotal:</span>
              <span className="font-semibold">£{Number(order.subtotal).toFixed(2)}</span>
            </div>
            
            <div className="flex justify-between text-gray-700 text-sm sm:text-base">
              <span className="font-medium">Delivery Fee:</span>
              <span className="font-semibold">£{Number(order.deliveryFee).toFixed(2)}</span>
            </div>
            
            {order.promoDiscount && order.promoDiscount > 0 && (
              <div className="flex justify-between text-green-600 text-sm sm:text-base">
                <span className="font-semibold">Promo Discount:</span>
                <span className="font-bold">-£{Number(order.promoDiscount).toFixed(2)}</span>
              </div>
            )}
            
            {order.promoCodes && order.promoCodes.length > 0 && (
              <div className="pt-2 border-t border-gray-300">
                <p className="text-xs text-gray-600 mb-1">Applied Promo Codes:</p>
                <div className="flex flex-wrap gap-1 sm:gap-2">
                  {order.promoCodes.map((code, idx) => (
                    <span key={idx} className="inline-block px-2 py-1 bg-green-100 text-green-800 text-xs font-semibold rounded">
                      {code}
                    </span>
                  ))}
                </div>
              </div>
            )}
            
            <div className="flex justify-between text-lg sm:text-xl font-bold text-gray-900 pt-2 sm:pt-3 border-t-2 border-gray-300">
              <span>Total:</span>
              <span className="text-pink-600">
                £{Number(order.finalTotal ?? order.estimatedTotal).toFixed(2)}
              </span>
            </div>

            {order.depositAmount && order.depositAmount > 0 && (
              <div className="pt-2 sm:pt-3 border-t border-gray-300">
                <div className="flex justify-between text-gray-700 text-sm sm:text-base">
                  <span className="font-medium">Deposit Amount:</span>
                  <span className="font-semibold text-blue-600">£{Number(order.depositAmount).toFixed(2)}</span>
                </div>
              </div>
            )}
          </div>

          {/* Payment Status */}
          {order.paidAt && (
            <div className="mt-3 sm:mt-4 bg-green-50 border border-green-200 rounded-lg p-3 sm:p-4">
              <div className="flex items-center gap-2 mb-1">
                <div className="h-2 w-2 bg-green-500 rounded-full"></div>
                <p className="text-xs sm:text-sm font-semibold text-green-900">Payment Received</p>
              </div>
              <p className="text-xs text-green-700">
                Paid on {new Date(order.paidAt).toLocaleString('en-GB', {
                  day: 'numeric',
                  month: 'long',
                  year: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </p>
            </div>
          )}

          {order.paymentLinkUrl && !order.paidAt && (
            <div className="mt-3 sm:mt-4">
              <a
                href={order.paymentLinkUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="block w-full bg-pink-500 text-white text-center py-2.5 sm:py-3 rounded-lg font-bold hover:bg-pink-600 transition-colors text-sm sm:text-base"
              >
                Complete Payment
              </a>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}