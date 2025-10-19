import { useState, useEffect } from "react";
import { MenuItem, Addon } from "./Step2MenuItems";

interface MenuItemModalProps {
  item: MenuItem;
  isOpen: boolean;
  onClose: () => void;
  quantity: number;
  onAddItem: (item: MenuItem) => void;
  onUpdateQuantity: (itemId: string, quantity: number) => void;
}

interface AddonGroup {
  items: Addon[];
  isRequired: boolean;
  selectionType: "single" | "multiple";
}

export default function MenuItemModal({
  item,
  isOpen,
  onClose,
  quantity,
  onAddItem,
  onUpdateQuantity,
}: MenuItemModalProps) {
  console.log("Modal received item: ", item);
  const [itemQuantity, setItemQuantity] = useState(1);
  const [selectedAddons, setSelectedAddons] = useState<
    Record<string, Record<string, boolean>>
  >({});
  const [addonGroups, setAddonGroups] = useState<Record<string, AddonGroup>>(
    {}
  );
  const [totalPrice, setTotalPrice] = useState(0);

  const price = parseFloat(item.price?.toString() || "0");
  const discountPrice = parseFloat(item.discountPrice?.toString() || "0");
  const displayPrice =
    item.isDiscount && discountPrice > 0 ? discountPrice : price;
  const BACKEND_QUANTITY_UNIT = item.cateringQuantityUnit || 7;
  const DISPLAY_FEEDS_PER_UNIT = item.feedsPerUnit || 10;

  const numUnits = quantity / BACKEND_QUANTITY_UNIT;
  const displayQuantity = numUnits * DISPLAY_FEEDS_PER_UNIT;

  // Reset state when modal opens
  useEffect(() => {
    if (isOpen) {
      setItemQuantity(1);
      setSelectedAddons({});
    }
  }, [isOpen]);

  // Group addons and initialize selections
  useEffect(() => {
    console.log("Modal item changed:", item);
    console.log("Modal item addons:", item?.addons);
    console.log("Addons is array?", Array.isArray(item?.addons));
    console.log("Addons length:", item?.addons?.length);

    if (!item?.addons || item.addons.length === 0) {
      console.log("No addons found, resetting groups");
      setAddonGroups({});
      setSelectedAddons({});
      return;
    }

    console.log("Processing addons:", item.addons);

    // Group addons by groupTitle
    const grouped = item.addons.reduce((acc, addon) => {
      console.log("Processing addon:", addon);
      const groupTitle = addon.groupTitle || "Default";
      if (!acc[groupTitle]) {
        acc[groupTitle] = {
          items: [],
          isRequired: addon.isRequired,
          selectionType: addon.selectionType,
        };
      }
      acc[groupTitle].items.push(addon);
      return acc;
    }, {} as Record<string, AddonGroup>);

    console.log("Grouped addons:", grouped);
    setAddonGroups(grouped);

    // Initialize selected addons state
    const initialSelections: Record<string, Record<string, boolean>> = {};
    Object.keys(grouped).forEach((groupTitle) => {
      initialSelections[groupTitle] = {};
      grouped[groupTitle].items.forEach((addon) => {
        initialSelections[groupTitle][addon.name] = false;
      });
    });
    console.log("Initial selections:", initialSelections);
    setSelectedAddons(initialSelections);
  }, [item]);

  // Calculate total price when quantity or selected addons change
  useEffect(() => {
    if (!item) return;

    // Get base price (use discount price if available)
    let basePrice = item.isDiscount
      ? parseFloat(item.discountPrice || "0")
      : parseFloat(item.price || "0");

    if (isNaN(basePrice)) basePrice = 0;

    // Calculate addon costs
    let addonCost = 0;
    Object.entries(addonGroups).forEach(([groupTitle, group]) => {
      group.items.forEach((addon) => {
        if (selectedAddons[groupTitle]?.[addon.name]) {
          addonCost += parseFloat(addon.price) || 0;
        }
      });
    });

    // Set total price based on quantity and addons
    setTotalPrice((basePrice + addonCost) * itemQuantity);
  }, [item, itemQuantity, selectedAddons, addonGroups]);

  const toggleAddon = (groupTitle: string, addonName: string) => {
    setSelectedAddons((prev) => {
      // Create a deep copy of the selections
      const newSelections: Record<string, Record<string, boolean>> = {};

      // Deep copy each group
      Object.keys(prev).forEach((key) => {
        newSelections[key] = { ...prev[key] };
      });

      const group = addonGroups[groupTitle];

      // Ensure the group exists in newSelections
      if (!newSelections[groupTitle]) {
        newSelections[groupTitle] = {};
      }

      if (group.selectionType === "single") {
        // For single selection, deselect all others in the group first
        Object.keys(newSelections[groupTitle]).forEach((name) => {
          newSelections[groupTitle][name] = false;
        });
        // Then select the clicked addon
        newSelections[groupTitle][addonName] = true;
      } else {
        // For multiple selection, toggle the clicked addon
        const currentValue = prev[groupTitle]?.[addonName] || false;
        newSelections[groupTitle][addonName] = !currentValue;
      }

      return newSelections;
    });
  };

  const validateRequiredAddons = () => {
    return Object.entries(addonGroups).every(([groupTitle, group]) => {
      if (!group.isRequired) return true;

      // Check if at least one addon is selected in required groups
      return Object.values(selectedAddons[groupTitle] || {}).some(
        (isSelected) => isSelected
      );
    });
  };

  const handleAddToCart = () => {
    if (!item) return;

    // Validate required addons
    if (!validateRequiredAddons()) {
      alert("Please select all required options before adding to cart.");
      return;
    }

    // Collect selected addons with their prices
    const addonsForCart: {
      name: string;
      price: number;
      quantity: number;
      groupTitle: string;
    }[] = [];
    Object.entries(addonGroups).forEach(([groupTitle, group]) => {
      group.items.forEach((addon) => {
        if (selectedAddons[groupTitle]?.[addon.name]) {
          addonsForCart.push({
            name: addon.name,
            price: Number(addon.price) || 0,
            quantity: 1,
            groupTitle: groupTitle,
          });
        }
      });
    });

    // Calculate addon price per portion, then multiply by quantity
    const addonPricePerPortion = addonsForCart.reduce(
      (sum, addon) => sum + addon.price,
      0
    );

    // Create item with selected addons
    const itemWithAddons = {
      ...item,
      selectedAddons: addonsForCart,
      addonPrice: addonPricePerPortion * itemQuantity,
      // Store the portion quantity for the parent to use
      portionQuantity: itemQuantity,
    };

    onAddItem(itemWithAddons);
    onClose();
  };

  if (!isOpen) return null;

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
                  ⚠️ Disclaimer: Allergen info not available. Please contact the
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
              <p className="text-sm text-base-content/60 mb-4">
                Feeds up to {DISPLAY_FEEDS_PER_UNIT} people
              </p>

              {/* Quantity Selector */}
              <div className="bg-base-200 p-4 rounded-lg">
                <h3 className="font-semibold text-sm text-base-content mb-3">
                  Number of Portions
                </h3>
                <div className="flex items-center justify-between">
                  <button
                    onClick={() =>
                      setItemQuantity(Math.max(1, itemQuantity - 1))
                    }
                    className="w-10 h-10 bg-base-100 border border-base-300 rounded-lg hover:bg-base-200 flex items-center justify-center text-lg font-medium"
                  >
                    −
                  </button>
                  <div className="text-center">
                    <span className="font-bold text-lg text-base-content">
                      {itemQuantity}
                    </span>
                    <p className="text-xs text-base-content/60">
                      Feeds {itemQuantity * DISPLAY_FEEDS_PER_UNIT} people
                    </p>
                  </div>
                  <button
                    onClick={() => setItemQuantity(itemQuantity + 1)}
                    className="w-10 h-10 bg-base-100 border border-base-300 rounded-lg hover:bg-base-200 flex items-center justify-center text-lg font-medium"
                  >
                    +
                  </button>
                </div>
              </div>
            </div>

            {/* Addons section */}
            {Object.keys(addonGroups).length > 0 && (
              <div className="pt-4">
                <h3 className="font-semibold text-base text-base-content mb-3">
                  Customize Your Order
                </h3>
                {Object.entries(addonGroups).map(([groupTitle, group]) => (
                  <div key={groupTitle} className="mb-4">
                    <div className="mb-2">
                      <div className="flex items-center justify-between">
                        <h4 className="font-medium text-sm text-base-content">
                          {groupTitle}
                          {group.isRequired && (
                            <span className="text-error ml-1">*</span>
                          )}
                        </h4>
                        <span className="text-xs text-base-content/60 italic">
                          {group.selectionType === "single"
                            ? "Choose one"
                            : "Choose multiple"}
                        </span>
                      </div>
                    </div>

                    <div className="space-y-2">
                      {group.items.map((addon, index) => (
                        <button
                          key={index}
                          onClick={() => toggleAddon(groupTitle, addon.name)}
                          className={`w-full flex items-center justify-between p-3 rounded-lg border transition-all ${
                            selectedAddons[groupTitle]?.[addon.name]
                              ? "border-primary bg-primary/5"
                              : "border-base-300 bg-base-100 hover:border-primary/50"
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            {group.selectionType === "single" ? (
                              <div
                                className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                                  selectedAddons[groupTitle]?.[addon.name]
                                    ? "border-primary bg-primary/10"
                                    : "border-base-300"
                                }`}
                              >
                                {selectedAddons[groupTitle]?.[addon.name] && (
                                  <div className="w-2.5 h-2.5 rounded-full bg-primary" />
                                )}
                              </div>
                            ) : (
                              <div
                                className={`w-5 h-5 rounded border-2 flex items-center justify-center ${
                                  selectedAddons[groupTitle]?.[addon.name]
                                    ? "border-primary bg-primary"
                                    : "border-base-300"
                                }`}
                              >
                                {selectedAddons[groupTitle]?.[addon.name] && (
                                  <svg
                                    className="w-3 h-3 text-white"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    stroke="currentColor"
                                  >
                                    <path
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                      strokeWidth={3}
                                      d="M5 13l4 4L19 7"
                                    />
                                  </svg>
                                )}
                              </div>
                            )}
                            <span className="text-sm text-base-content">
                              {addon.name}
                            </span>
                          </div>
                          {parseFloat(addon.price) > 0 && (
                            <span className="text-sm font-medium text-primary">
                              +£{parseFloat(addon.price).toFixed(2)}
                            </span>
                          )}
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}

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
                  onClick={handleAddToCart}
                  className="w-full bg-primary hover:opacity-90 text-white py-3 rounded-lg font-medium transition-all text-base"
                >
                  Add to Order
                </button>
              )}
            </div>

            {/* Show total with customizations - always show if quantity > 1 or addons selected */}
            {(itemQuantity > 1 || Object.values(selectedAddons).some((group) =>
              Object.values(group).some((selected) => selected)
            )) && (
              <div className="pt-2 border-t border-base-300">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium text-base-content/70">
                    Total {itemQuantity > 1 ? `(${itemQuantity} portions)` : ""}:
                  </span>
                  <span className="text-lg font-bold text-primary">
                    £
                    {(
                      (displayPrice +
                        Object.entries(addonGroups).reduce(
                          (sum, [groupTitle, group]) => {
                            return (
                              sum +
                              group.items.reduce((addonSum, addon) => {
                                if (selectedAddons[groupTitle]?.[addon.name]) {
                                  return addonSum + parseFloat(addon.price);
                                }
                                return addonSum;
                              }, 0)
                            );
                          },
                          0
                        )) *
                      BACKEND_QUANTITY_UNIT *
                      itemQuantity
                    ).toFixed(2)}
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
