// app/components/catering/dashboard/OrderItems.tsx
import React from 'react';
import { CateringOrderDetails } from '@/types/catering.types';
import { ChefHat, Package } from 'lucide-react';
import OrderStatusBadge from './OrderStatusBadge';

interface OrderItemsProps {
  order: CateringOrderDetails;
}

export default function OrderItems({ order }: OrderItemsProps) {
  return (
    <div className="bg-white rounded-xl shadow-md p-6">
      <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
        <Package className="h-6 w-6 text-pink-500" />
        Order Items
      </h2>
      
      <div className="space-y-6">
        {order.orderItems.map((restaurant, idx) => (
          <div key={idx} className="border border-gray-200 rounded-lg p-5 hover:shadow-md transition-shadow">
            <div className="flex items-center gap-3 mb-4 pb-3 border-b border-gray-200">
              <ChefHat className="h-6 w-6 text-pink-500 flex-shrink-0" />
              <h3 className="text-lg font-bold text-gray-900">{restaurant.restaurantName}</h3>
            </div>

            <div className="space-y-3">
              {restaurant.menuItems.map((item, itemIdx) => {
                const cateringUnit = item.cateringQuantityUnit || 7;
                const feedsPerUnit = item.feedsPerUnit || 10;
                const numUnits = item.quantity / cateringUnit;
                const totalFeeds = numUnits * feedsPerUnit;

                return (
                  <div key={itemIdx} className="bg-gray-50 rounded-lg p-4 hover:bg-gray-100 transition-colors">
                    <div className="flex justify-between items-start mb-2">
                      <div className="flex-1 pr-4">
                        <p className="font-semibold text-gray-900 mb-1">{item.name}</p>
                        <p className="text-sm text-gray-600">
                          {Math.round(numUnits)} portion{Math.round(numUnits) !== 1 ? 's' : ''} • 
                          Serves ~{Math.round(totalFeeds)} people
                        </p>
                      </div>
                      <p className="font-bold text-pink-600 whitespace-nowrap">
                        £{Number(item.totalPrice).toFixed(2)}
                      </p>
                    </div>

                    {item.selectedAddons && item.selectedAddons.length > 0 && (
                      <div className="mt-3 pl-4 border-l-3 border-pink-300 bg-white rounded-r-lg p-3">
                        <p className="text-xs font-semibold text-gray-700 mb-2 uppercase tracking-wide">Add-ons:</p>
                        <div className="space-y-1">
                          {item.selectedAddons.map((addon, addonIdx) => (
                            <div key={addonIdx} className="flex justify-between items-center text-sm">
                              <span className="text-gray-700">
                                • {addon.name} <span className="text-gray-500">x {addon.quantity}</span>
                              </span>
                              <span className="text-pink-600 font-semibold ml-2">
                                +£{(addon.price * addon.quantity).toFixed(2)}
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

            {restaurant.specialInstructions && (
              <div className="mt-4 bg-yellow-50 border-l-4 border-yellow-400 rounded-r-lg p-3">
                <p className="text-xs font-semibold text-yellow-900 mb-1 uppercase tracking-wide">
                  Special Instructions:
                </p>
                <p className="text-sm text-yellow-800 whitespace-pre-wrap">{restaurant.specialInstructions}</p>
              </div>
            )}
          </div>
        ))}

        {/* Pricing Summary */}
        <div className="border-t-2 border-gray-300 pt-6 mt-6">
          <h3 className="text-lg font-bold text-gray-900 mb-4">Order Summary</h3>
          <div className="space-y-3 bg-gray-50 rounded-lg p-5">
            <div className="flex justify-between text-gray-700">
              <span className="font-medium">Subtotal:</span>
              <span className="font-semibold">£{Number(order.subtotal).toFixed(2)}</span>
            </div>
            
            <div className="flex justify-between text-gray-700">
              <span className="font-medium">Delivery Fee:</span>
              <span className="font-semibold">£{Number(order.deliveryFee).toFixed(2)}</span>
            </div>
            
            {order.promoDiscount > 0 && (
              <div className="flex justify-between text-green-600">
                <span className="font-semibold">Promo Discount:</span>
                <span className="font-bold">-£{Number(order.promoDiscount).toFixed(2)}</span>
              </div>
            )}
            
            {order.promoCodes && order.promoCodes.length > 0 && (
              <div className="pt-2 border-t border-gray-300">
                <p className="text-xs text-gray-600 mb-1">Applied Promo Codes:</p>
                <div className="flex flex-wrap gap-2">
                  {order.promoCodes.map((code, idx) => (
                    <span key={idx} className="inline-block px-2 py-1 bg-green-100 text-green-800 text-xs font-semibold rounded">
                      {code}
                    </span>
                  ))}
                </div>
              </div>
            )}
            
            <div className="flex justify-between text-xl font-bold text-gray-900 pt-3 border-t-2 border-gray-300">
              <span>Total:</span>
              <span className="text-pink-600">
                £{Number(order.finalTotal || order.estimatedTotal).toFixed(2)}
              </span>
            </div>

            {order.depositAmount > 0 && (
              <div className="pt-3 border-t border-gray-300">
                <div className="flex justify-between text-gray-700">
                  <span className="font-medium">Deposit Amount:</span>
                  <span className="font-semibold text-blue-600">£{Number(order.depositAmount).toFixed(2)}</span>
                </div>
              </div>
            )}
          </div>

          {/* Payment Status */}
          {order.paidAt && (
            <div className="mt-4 bg-green-50 border border-green-200 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-1">
                <div className="h-2 w-2 bg-green-500 rounded-full"></div>
                <p className="text-sm font-semibold text-green-900">Payment Received</p>
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
            <div className="mt-4">
              
              <a
                href={order.paymentLinkUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="block w-full bg-pink-500 text-white text-center py-3 rounded-lg font-bold hover:bg-pink-600 transition-colors"
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