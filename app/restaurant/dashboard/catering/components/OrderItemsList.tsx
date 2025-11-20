/**
 * OrderItemsList Component
 * Expandable list of order items with pricing
 */

import { useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";
import { MenuItemPricingCard } from "./MenuItemPricingCard";
import { calculateMenuItemPricing } from "../utils/pricing.utils";

interface OrderItemsListProps {
  orderItems: any[];
}

export function OrderItemsList({ orderItems }: OrderItemsListProps) {
  const [expandedItems, setExpandedItems] = useState(false);

  const totalItems = orderItems.reduce(
    (total, restaurant) => total + restaurant.menuItems.length,
    0
  );

  const toggleItems = () => setExpandedItems(!expandedItems);

  return (
    <div className="border-t border-gray-200 pt-4">
      <button
        onClick={toggleItems}
        className="w-full flex items-center justify-between font-semibold text-gray-900 mb-3 text-sm sm:text-base hover:text-blue-600 transition-colors"
      >
        <span>Order Items ({totalItems} items)</span>
        {expandedItems ? (
          <ChevronUp size={20} className="text-blue-600" />
        ) : (
          <ChevronDown size={20} className="text-gray-600" />
        )}
      </button>

      {expandedItems && (
        <div>
          {orderItems.map((restaurant, idx) => (
            <div key={idx} className="mb-3">
              <div className="space-y-2">
                {restaurant.menuItems.map((item: any, itemIdx: number) => {
                  const pricing = calculateMenuItemPricing(item);
                  const hasNewPricingData = item.restaurantNetAmount !== undefined;

                  return (
                    <MenuItemPricingCard
                      key={itemIdx}
                      pricing={pricing}
                      itemName={item.menuItemName || item.name}
                      hasNewPricingData={hasNewPricingData}
                    />
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
