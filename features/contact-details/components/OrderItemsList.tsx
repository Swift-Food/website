interface MenuItem {
  menuItemName: string;
  image?: string;
  price: string | number;
  discountPrice?: string | number;
  isDiscount?: boolean;
  feedsPerUnit?: number;
  cateringQuantityUnit?: number;
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
