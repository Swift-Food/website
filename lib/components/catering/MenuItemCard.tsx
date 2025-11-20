import { useState, useEffect } from "react";
import { MenuItem } from "./Step2MenuItems";
import MenuItemModal from "./MenuItemModal";

interface MenuItemCardProps {
  item: MenuItem;
  quantity: number;
  isExpanded?: boolean;
  // isSearching: boolean;
  onToggleExpand?: () => void;
  onAddItem: (item: MenuItem) => void;
  onUpdateQuantity: (itemId: string, quantity: number) => void;
  onAddOrderPress: (item: MenuItem) => void;
}

export default function MenuItemCard({
  item,
  quantity,
  isExpanded = false,
  // isSearching,
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
  const [quantityInput, setQuantityInput] = useState(
    portionQuantity.toString()
  );
  // const [isImageEnlarged, setIsImageEnlarged] = useState(false);

  // Sync input with external quantity changes
  useEffect(() => {
    setQuantityInput(portionQuantity.toString());
  }, [portionQuantity]);

  const hasAddons = item.addons && item.addons.length > 0;

  const handleAddToOrder = () => {
    // Check if mobile (width < 768px which is md breakpoint)
    const isMobile = window.innerWidth < 768;

    if (isMobile || hasAddons) {
      // On mobile or if item has addons, open modal
      onAddOrderPress(item);
    } else {
      // On md and larger with no addons, directly add to cart with default quantity
      onAddItem({ ...item, portionQuantity: 1 });
    }
  };

  return (
    <>
      <div
        key={item.id}
        className="bg-white rounded-lg border border-gray-200 transition-shadow overflow-hidden cursor-pointer h-[140px] md:h-[200px]"
        onClick={onToggleExpand}
      >
        <div className="flex flex-row h-full">
          {/* Left Side - Content */}
          <div className="flex-1 px-4 py-2 sm:p-6">
            {/* Header - Name */}
            <div className="flex flex-col h-full justify-between">
              <div>
                <div className="flex items-start justify-between mb-2">
                  <h3 className="font-bold text-md md:text-xl text-gray-900 flex-1 line-clamp-1">
                    {item.menuItemName}
                  </h3>
                </div>

                {/* Description - 2 lines */}
                {item.description && (
                  <p className="text-gray-600 text-xs md:text-sm mb-3 line-clamp-2">
                    {item.description}
                  </p>
                )}
              </div>

              {/* Show restaurant name in search results */}
              {/* {isSearching && item.restaurant && (
              <p className="text-xs md:text-sm text-gray-500 mb-2">
                From: {item.restaurant.name}
              </p>
            )} */}

              {/* Price and Add to Order / Quantity */}
              <div className="flex items-end justify-between gap-4">
                <div className="flex-1">
                  {item.isDiscount && discountPrice > 0 ? (
                    <div className="flex flex-row items-center justify-start gap-3">
                      <p className="text-gray-500 text-[11px] md:text-sm line-through">
                        £{(price * BACKEND_QUANTITY_UNIT).toFixed(2)}
                      </p>
                      <p className="text-primary font-bold text-sm md:text-2xl">
                        £{(discountPrice * BACKEND_QUANTITY_UNIT).toFixed(2)}
                      </p>
                    </div>
                  ) : (
                    <p className="text-primary font-bold text-md md:text-lg">
                      £{(price * BACKEND_QUANTITY_UNIT).toFixed(2)}
                    </p>
                  )}
                  {/* Feeds per unit */}
                  {DISPLAY_FEEDS_PER_UNIT > 1 && (
                    <p className="text-[10px] md:text-xs text-gray-600 mt-1">
                      Feeds up to {DISPLAY_FEEDS_PER_UNIT} people
                    </p>
                  )}
                </div>

                {/* Add to order button / quantity controls */}
                <div
                  onClick={(e) => e.stopPropagation()}
                  className="flex-shrink-0"
                >
                  {quantity > 0 ? (
                    <>
                      {/* On md and smaller: show simple add button that opens modal */}
                      <button
                        onClick={() => onAddOrderPress(item)}
                        className="lg:hidden w-8 h-8 bg-primary hover:opacity-90 text-white rounded-full font-medium transition-all flex items-center justify-center"
                        aria-label="Add to Order"
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-3 w-3"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                          strokeWidth={2}
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M12 4v16m8-8H4"
                          />
                        </svg>
                      </button>

                      {/* On lg and larger: show quantity controls */}
                      <div className="hidden lg:flex bg-[#F5F1E8] p-2 rounded-lg border border-[#F0ECE3] items-center gap-2 max-w-[180px]">
                        <button
                          onClick={() => {
                            const newPortionQty = Math.max(
                              0,
                              portionQuantity - 1
                            );
                            const newBackendQty =
                              newPortionQty * BACKEND_QUANTITY_UNIT;
                            onUpdateQuantity(item.id, newBackendQty);
                          }}
                          className="w-7 h-7 md:w-8 md:h-8 bg-white border border-gray-300 rounded-lg hover:bg-gray-100 flex items-center justify-center text-sm flex-shrink-0"
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
                                const newBackendQty =
                                  Math.max(0, newPortionQty) *
                                  BACKEND_QUANTITY_UNIT;
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
                          className="w-12 text-center font-medium text-xs md:text-sm text-gray-900 bg-white border border-gray-300 rounded px-1 py-1 flex-shrink-0"
                        />

                        <button
                          onClick={() => {
                            const newPortionQty = portionQuantity + 1;
                            const newBackendQty =
                              newPortionQty * BACKEND_QUANTITY_UNIT;
                            onUpdateQuantity(item.id, newBackendQty);
                          }}
                          className="w-7 h-7 md:w-8 md:h-8 bg-white border border-gray-300 rounded-lg hover:bg-gray-100 flex items-center justify-center text-sm flex-shrink-0"
                        >
                          +
                        </button>
                      </div>
                    </>
                  ) : (
                    <button
                      onClick={handleAddToOrder}
                      className="w-8 h-8 md:w-10 md:h-10 bg-primary hover:opacity-90 text-white rounded-full font-medium transition-all flex items-center justify-center"
                      aria-label="Add to Order"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-3 w-3 md:h-5 md:w-5"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth={2}
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M12 4v16m8-8H4"
                        />
                      </svg>
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Right Side - Image */}
          {item.image && (
            <div className="w-[140px] md:w-[200px] h-full bg-gray-200 flex-shrink-0">
              <img
                src={item.image}
                alt={item.menuItemName}
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

      {/* Image Lightbox */}
      {/* {isImageEnlarged && item.image && (
        <div
          className="fixed inset-0 bg-black/95 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={() => setIsImageEnlarged(false)}
        >
          <button
            onClick={() => setIsImageEnlarged(false)}
            className="absolute top-4 right-4 text-white hover:text-gray-300 transition-colors"
            aria-label="Close"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-8 w-8"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
          <img
            src={item.image}
            alt={item.name}
            className="max-w-full max-h-full object-contain"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )} */}
    </>
  );
}
