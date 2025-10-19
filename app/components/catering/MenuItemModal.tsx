import { MenuItem } from "./Step2MenuItems";

interface MenuItemModalProps {
  item: MenuItem;
  isOpen: boolean;
  onClose: () => void;
  quantity: number;
  onAddItem: (item: MenuItem) => void;
  onUpdateQuantity: (itemId: string, quantity: number) => void;
}

export default function MenuItemModal({
  item,
  isOpen,
  onClose,
  quantity,
  onAddItem,
  onUpdateQuantity,
}: MenuItemModalProps) {
  if (!isOpen) return null;

  const price = parseFloat(item.price?.toString() || "0");
  const discountPrice = parseFloat(item.discountPrice?.toString() || "0");
  const displayPrice =
    item.isDiscount && discountPrice > 0 ? discountPrice : price;
  const BACKEND_QUANTITY_UNIT = item.cateringQuantityUnit || 7;
  const DISPLAY_FEEDS_PER_UNIT = item.feedsPerUnit || 10;

  const numUnits = quantity / BACKEND_QUANTITY_UNIT;
  const displayQuantity = numUnits * DISPLAY_FEEDS_PER_UNIT;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/50" />

      {/* Modal Content */}
      <div
        className="relative bg-base-100 rounded-xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-3 right-3 w-8 h-8 flex items-center justify-center rounded-full bg-base-200 hover:bg-base-300 transition-colors z-10"
          aria-label="Close modal"
        >
          ✕
        </button>

        {/* Modal Body */}
        <div className="p-6">
          <h2 className="font-bold text-xl md:text-2xl text-base-content mb-4 pr-8">
            {item.name}
          </h2>

          <div className="space-y-4">
            {item.description && (
              <div>
                <h3 className="font-semibold text-sm text-base-content mb-2">
                  Description
                </h3>
                <p className="text-base-content/70 text-sm leading-relaxed">
                  {item.description}
                </p>
              </div>
            )}

            {item.allergens && item.allergens.length > 0 ? (
              <div>
                <h3 className="font-semibold text-sm text-base-content mb-2">
                  Allergens
                </h3>
                <div className="flex flex-wrap gap-2 mb-3">
                  {item.allergens.map((allergen: string, index: number) => (
                    <span
                      key={index}
                      className="bg-warning/20 text-warning-content px-3 py-1 rounded-full text-xs font-medium"
                    >
                      {allergen}
                    </span>
                  ))}
                </div>
                <p className="text-xs text-base-content/50 italic bg-base-200 p-3 rounded">
                  ⚠️ This is approximate. For full allergen info, contact the
                  restaurant or our team.
                </p>
              </div>
            ) : (
              <div className="bg-base-200 p-3 rounded">
                <p className="text-xs text-base-content/60 italic">
                  ⚠️ Allergen info not available. Please contact the
                  restaurant or our team.
                </p>
              </div>
            )}

            {/* Pricing */}
            <div className="pt-2">
              <div className="flex items-center gap-2 mb-1">
                {item.isDiscount && discountPrice > 0 ? (
                  <>
                    <span className="text-2xl font-bold text-primary">
                      £{(discountPrice * BACKEND_QUANTITY_UNIT).toFixed(2)}
                    </span>
                    <span className="text-xl text-base-content/50 line-through">
                      £{(price * BACKEND_QUANTITY_UNIT).toFixed(2)}
                    </span>
                  </>
                ) : (
                  <span className="text-2xl font-bold text-primary">
                    £{(displayPrice * BACKEND_QUANTITY_UNIT).toFixed(2)}
                  </span>
                )}
              </div>
              <p className="text-sm text-base-content/60">
                Feeds up to {DISPLAY_FEEDS_PER_UNIT} people
              </p>
            </div>

            {/* Add/Update Quantity Controls */}
            <div className="pt-2">
              {quantity > 0 ? (
                <div className="flex items-center justify-between bg-base-200 p-3 rounded-lg mb-3">
                  <button
                    onClick={() =>
                      onUpdateQuantity(
                        item.id,
                        Math.max(0, quantity - BACKEND_QUANTITY_UNIT)
                      )
                    }
                    className="w-10 h-10 bg-base-100 border border-base-300 rounded-lg hover:bg-base-200 flex items-center justify-center text-lg font-medium"
                  >
                    −
                  </button>
                  <span className="font-medium text-base text-base-content">
                    Feeds {displayQuantity} people
                  </span>
                  <button
                    onClick={() =>
                      onUpdateQuantity(
                        item.id,
                        quantity + BACKEND_QUANTITY_UNIT
                      )
                    }
                    className="w-10 h-10 bg-base-100 border border-base-300 rounded-lg hover:bg-base-200 flex items-center justify-center text-lg font-medium"
                  >
                    +
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => onAddItem(item)}
                  className="w-full bg-primary hover:opacity-90 text-white py-3 rounded-lg font-medium transition-all text-base"
                >
                  Add to Order
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
