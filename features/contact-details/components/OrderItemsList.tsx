import { useState } from 'react';
import { ALLERGENS } from '@/lib/constants/allergens';

interface MenuItem {
  menuItemName: string;
  image?: string;
  price: string | number;
  discountPrice?: string | number;
  isDiscount?: boolean;
  feedsPerUnit?: number;
  cateringQuantityUnit?: number;
  allergens?: string[];
  selectedAddons?: Array<{
    name: string;
    price: number;
    quantity: number;
  }>;
}

interface SelectedItem {
  item: MenuItem;
  quantity: number;
}

interface OrderItemsListProps {
  selectedItems: SelectedItem[];
}

export function OrderItemsList({ selectedItems }: OrderItemsListProps) {
  const [expandedAllergens, setExpandedAllergens] = useState<Set<number>>(new Set());

  const toggleAllergen = (index: number) => {
    setExpandedAllergens(prev => {
      const newSet = new Set(prev);
      if (newSet.has(index)) {
        newSet.delete(index);
      } else {
        newSet.add(index);
      }
      return newSet;
    });
  };
  return (
    <div className="space-y-3 mb-6 max-h-60 overflow-y-auto">
      {selectedItems.map(({ item, quantity }, index) => {
        const price = parseFloat(item.price?.toString() || '0');
        const discountPrice = parseFloat(item.discountPrice?.toString() || '0');
        const itemPrice = item.isDiscount && discountPrice > 0 ? discountPrice : price;

        const BACKEND_QUANTITY_UNIT = item.cateringQuantityUnit || 7;
        const displayFeeds = quantity / BACKEND_QUANTITY_UNIT;

        // Addon total = sum of (addonPrice × addonQuantity) - no scaling multipliers
        const addonTotal = (item.selectedAddons || []).reduce(
          (sum, { price, quantity }) => {
            return sum + (price || 0) * (quantity || 0);
          },
          0
        );

        const subtotal = itemPrice * quantity + addonTotal;

        return (
          <div key={index} className="flex items-center gap-3">
            {item.image && (
              <img
                src={item.image}
                alt={item.menuItemName}
                className="w-12 h-12 object-cover rounded-lg"
              />
            )}
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-sm text-base-content truncate">{item.menuItemName}</p>
              {item.selectedAddons && item.selectedAddons.length > 0 && (
                <p className="text-xs text-base-content/50 mb-1">
                  {item.selectedAddons.map((addon, idx) => (
                    <span key={idx}>
                      + {addon.name}
                      {addon.quantity > 1 && ` (×${addon.quantity})`}
                      {idx < item.selectedAddons!.length - 1 ? ', ' : ''}
                    </span>
                  ))}
                </p>
              )}
              {item.allergens && item.allergens.length > 0 && (
                <div className="mt-1">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleAllergen(index);
                    }}
                    className="flex items-center gap-1 text-[10px] font-medium text-orange-700 hover:text-orange-800 transition-colors"
                  >
                    <span className="text-orange-600">⚠️</span>
                    <span>Allergens ({item.allergens.length})</span>
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className={`h-2.5 w-2.5 transition-transform ${
                        expandedAllergens.has(index) ? "rotate-180" : ""
                      }`}
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 9l-7 7-7-7"
                      />
                    </svg>
                  </button>
                  {expandedAllergens.has(index) && (
                    <div className="flex flex-wrap gap-1 mt-1">
                      {item.allergens.map((allergenValue) => {
                        const allergen = ALLERGENS.find((a) => a.value === allergenValue);
                        return (
                          <span
                            key={allergenValue}
                            className="inline-flex items-center bg-orange-100 text-orange-800 px-1.5 py-0.5 rounded text-[10px]"
                          >
                            {allergen?.label || allergenValue}
                          </span>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}
              <div className="flex items-center gap-2 mt-1">
                <span className="text-xs text-base-content/70">
                  {displayFeeds} portions
                </span>
              </div>
            </div>
            <div className="text-right">
              <p className="font-bold text-sm text-primary">£{subtotal.toFixed(2)}</p>
            </div>
          </div>
        );
      })}
    </div>
  );
}
