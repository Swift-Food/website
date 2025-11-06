import { useState, useEffect } from "react";
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
  onAddOrderPress: (item: MenuItem) => void;
}

export default function MenuItemCard({
  item,
  quantity,
  isExpanded = false,
  isSearching,
  onToggleExpand = () => {},
  onAddItem,
  onUpdateQuantity,
  onAddOrderPress,
}: MenuItemCardProps) {
  // console.log("Item: ", JSON.stringify(item, null, 2));
  const price = parseFloat(item.price?.toString() || "0");
  const discountPrice = parseFloat(item.discountPrice?.toString() || "0");
  // const displayPrice =
  //   item.isDiscount && discountPrice > 0 ? discountPrice : price;
  const BACKEND_QUANTITY_UNIT = item.cateringQuantityUnit || 7;
  const DISPLAY_FEEDS_PER_UNIT = item.feedsPerUnit || 10;

  // Convert backend quantity to portions for display
  const portionQuantity = quantity > 0 ? quantity / BACKEND_QUANTITY_UNIT : 0;

  // Use simple quantity state
  const [quantityInput, setQuantityInput] = useState(portionQuantity.toString());

  // Sync input with external quantity changes
  useEffect(() => {
    setQuantityInput(portionQuantity.toString());
  }, [portionQuantity]);

  const hasAddons = item.addons && item.addons.length > 0;

  const handleAddToOrder = () => {
    if (hasAddons) {
      // If item has addons, open modal
      onAddOrderPress(item);
    } else {
      // If no addons, directly add to cart with default quantity
      onAddItem({ ...item, portionQuantity: 1 });
    }
  };

  return (
    <>
      <div
        key={item.id}
        className="bg-white rounded-lg border border-gray-200 hover:shadow-lg transition-shadow overflow-hidden cursor-pointer"
        onClick={onToggleExpand}
      >
        <div className="flex flex-col sm:flex-row">
          {/* Left Side - Content */}
          <div className="flex-1 p-4 sm:p-6">
            {/* Header - Name */}
            <div className="flex items-start justify-between mb-2">
              <h3 className="font-bold text-xl text-gray-900 flex-1">
                {item.name}
              </h3>
            </div>

            {/* Description - 2 lines */}
            {item.description && (
              <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                {item.description}
              </p>
            )}

            {/* Show restaurant name in search results */}
            {isSearching && item.restaurant && (
              <p className="text-xs md:text-sm text-gray-500 mb-2">
                From: {item.restaurant.name}
              </p>
            )}

            {/* Price */}
            <div className="flex items-center gap-4 mb-4">
              <div>
                {item.isDiscount && discountPrice > 0 ? (
                  <>
                    <p className="text-primary font-bold text-2xl">
                      £{(discountPrice * BACKEND_QUANTITY_UNIT).toFixed(2)}
                    </p>
                    <p className="text-gray-500 text-sm line-through">
                      £{(price * BACKEND_QUANTITY_UNIT).toFixed(2)}
                    </p>
                  </>
                ) : (
                  <p className="text-primary font-bold text-2xl">
                    £{(price * BACKEND_QUANTITY_UNIT).toFixed(2)}
                  </p>
                )}
                {/* Feeds per unit */}
                {DISPLAY_FEEDS_PER_UNIT > 1 && (
                  <p className="text-xs text-gray-600 mt-1">
                    Feeds up to {DISPLAY_FEEDS_PER_UNIT} people
                  </p>
                )}
              </div>
            </div>

            {/* Allergens */}
            {item.allergens && item.allergens.length > 0 && (
              <div className="mb-4">
                <div className="flex flex-wrap gap-1">
                  {item.allergens.slice(0, 4).map((allergen, idx) => (
                    <span
                      key={idx}
                      className="text-xs bg-red-100 text-red-800 px-2 py-1 rounded-full"
                    >
                      {allergen.replace(/_/g, " ")}
                    </span>
                  ))}
                  {item.allergens.length > 4 && (
                    <span className="text-xs text-gray-500 px-2 py-1">
                      +{item.allergens.length - 4} more
                    </span>
                  )}
                </div>
              </div>
            )}

            {/* Add to order button / quantity controls */}
            <div onClick={(e) => e.stopPropagation()}>
              {quantity > 0 ? (
                <div className="bg-[#F5F1E8] p-2 rounded-lg mb-3 border border-[#F0ECE3] flex items-center justify-between">
                  <span className="text-sm text-gray-700 ml-1">
                    Quantity
                  </span>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => {
                        const newPortionQty = Math.max(0, portionQuantity - 1);
                        const newBackendQty = newPortionQty * BACKEND_QUANTITY_UNIT;
                        onUpdateQuantity(item.id, newBackendQty);
                      }}
                      className="w-7 h-7 md:w-8 md:h-8 bg-white border border-gray-300 rounded-lg hover:bg-gray-100 flex items-center justify-center text-sm"
                    >
                      −
                    </button>
                    <input
                      type="text"
                      inputMode="numeric"
                      value={quantityInput}
                      onChange={(e) => {
                        const val = e.target.value;
                        if (val === "" || /^\d+$/.test(val)) {
                          setQuantityInput(val);
                          if (val !== "" && !isNaN(parseInt(val))) {
                            const newPortionQty = parseInt(val);
                            const newBackendQty = Math.max(0, newPortionQty) * BACKEND_QUANTITY_UNIT;
                            onUpdateQuantity(item.id, newBackendQty);
                          }
                        }
                      }}
                      onBlur={(e) => {
                        if (
                          e.target.value === "" ||
                          parseInt(e.target.value) < 1
                        ) {
                          onUpdateQuantity(item.id, 0);
                          setQuantityInput("0");
                        }
                      }}
                      className="w-12 text-center font-medium text-xs md:text-sm text-gray-900 bg-white border border-gray-300 rounded px-1 py-1"
                    />

                    <button
                      onClick={() => {
                        const newPortionQty = portionQuantity + 1;
                        const newBackendQty = newPortionQty * BACKEND_QUANTITY_UNIT;
                        onUpdateQuantity(item.id, newBackendQty);
                      }}
                      className="w-7 h-7 md:w-8 md:h-8 bg-white border border-gray-300 rounded-lg hover:bg-gray-100 flex items-center justify-center text-sm"
                    >
                      +
                    </button>
                  </div>
                </div>
              ) : (
                <button
                  onClick={handleAddToOrder}
                  className="w-full bg-primary hover:opacity-90 text-white py-2 md:py-3 rounded-lg font-medium transition-all text-sm md:text-base"
                >
                  Add to Order
                </button>
              )}

              <p className="text-xs text-center text-gray-500 mt-2">
                Click card to view details & allergens
              </p>
            </div>
          </div>

          {/* Right Side - Image */}
          {item.image && (
            <div className="w-full sm:w-64 h-48 sm:h-auto bg-gray-200 flex-shrink-0">
              <img
                src={item.image}
                alt={item.name}
                className="w-full h-full object-cover"
              />
            </div>
          )}
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
