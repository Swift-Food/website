import { MenuItem } from "./Step2MenuItems";
import MenuItemModal from "./MenuItemModal";

interface MenuItemCardProps {
  item: MenuItem;
  quantity: number;
  isExpanded?: boolean;
  isSearching: boolean;
  onToggleExpand?: () => void;
  onAddItem: (item: MenuItem) => void;
  onUpdateQuantity: (itemId: string, quantity: number) => void;
}

export default function MenuItemCard({
  item,
  quantity,
  isExpanded = false,
  isSearching,
  onToggleExpand = () => {},
  onAddItem,
  onUpdateQuantity,
}: MenuItemCardProps) {
  console.log("Item: ", JSON.stringify(item, null, 2));
  const price = parseFloat(item.price?.toString() || "0");
  const discountPrice = parseFloat(item.discountPrice?.toString() || "0");
  const displayPrice =
    item.isDiscount && discountPrice > 0 ? discountPrice : price;
  const BACKEND_QUANTITY_UNIT = item.cateringQuantityUnit || 7;
  const DISPLAY_FEEDS_PER_UNIT = item.feedsPerUnit || 10;

  const numUnits = quantity / BACKEND_QUANTITY_UNIT;
  const displayQuantity = numUnits * DISPLAY_FEEDS_PER_UNIT;

  return (
    <>
      <div
        key={item.id}
        className="bg-base-100 rounded-xl overflow-hidden shadow-md hover:shadow-xl transition-all border border-base-300 h-full flex flex-col cursor-pointer"
        onClick={onToggleExpand}
      >
        {/* Normal Card View with Image */}
        {item.image && (
          <img
            src={item.image}
            alt={item.name}
            className="w-full h-40 md:h-48 object-cover"
          />
        )}
        <div className="p-3 md:p-4 flex-1 flex flex-col">
          <h3 className="font-bold text-base md:text-lg text-base-content mb-2">
            {item.name}
          </h3>
          {item.description && (
            <p className="text-base-content/70 text-xs md:text-sm mb-3 line-clamp-2">
              {item.description}
            </p>
          )}

          {/* Show restaurant name in search results */}
          {isSearching && item.restaurant && (
            <p className="text-xs md:text-sm text-base-content/50 mb-2">
              From: {item.restaurant.name}
            </p>
          )}

          <div className="flex flex-column items-center gap-1 mb-3">
            {item.isDiscount && discountPrice > 0 ? (
              <span>
                <span className="text-xl md:text-2xl font-bold text-primary mr-2">
                  £{(discountPrice * BACKEND_QUANTITY_UNIT).toFixed(2)}
                </span>
                <span className="text-lg md:text-xl text-base-content/50 line-through">
                  £{(price * BACKEND_QUANTITY_UNIT).toFixed(2)}
                </span>
              </span>
            ) : (
              <span className="text-xl md:text-2xl font-bold text-primary">
                £{(price * BACKEND_QUANTITY_UNIT).toFixed(2)}
              </span>
            )}
            {/* end price block */}
          </div>
          {DISPLAY_FEEDS_PER_UNIT > 1 && (
            <div className="flex flex-column items-center gap-1 mb-3">
              <span className="text-xs text-base-content/60">
                Feeds up to {DISPLAY_FEEDS_PER_UNIT} people
              </span>
            </div>
          )}
          <div className="mt-auto" onClick={(e) => e.stopPropagation()}>
            {quantity > 0 ? (
              <div className="flex items-center justify-between bg-base-200 p-2 rounded-lg mb-3">
                <button
                  onClick={() =>
                    onUpdateQuantity(
                      item.id,
                      Math.max(0, quantity - BACKEND_QUANTITY_UNIT)
                    )
                  }
                  className="w-7 h-7 md:w-8 md:h-8 bg-base-100 border border-base-300 rounded-lg hover:bg-base-200 flex items-center justify-center text-sm"
                >
                  −
                </button>
                <span className="font-medium text-xs md:text-sm text-base-content">
                  Feeds {displayQuantity} people
                </span>
                <button
                  onClick={() =>
                    onUpdateQuantity(
                      item.id,
                      quantity + BACKEND_QUANTITY_UNIT
                    )
                  }
                  className="w-7 h-7 md:w-8 md:h-8 bg-base-100 border border-base-300 rounded-lg hover:bg-base-200 flex items-center justify-center text-sm"
                >
                  +
                </button>
              </div>
            ) : (
              <button
                onClick={() => onAddItem(item)}
                className="w-full bg-primary hover:opacity-90 text-white py-2 md:py-3 rounded-lg font-medium transition-all text-sm md:text-base"
              >
                Add to Order
              </button>
            )}

            <p className="text-xs text-center text-base-content/40 mt-2">
              Click card to view details & allergens
            </p>
          </div>
        </div>
      </div>

      {/* Modal */}
      <MenuItemModal
        item={item}
        isOpen={isExpanded}
        onClose={onToggleExpand}
        quantity={quantity}
        onAddItem={onAddItem}
        onUpdateQuantity={onUpdateQuantity}
      />
    </>
  );
}
