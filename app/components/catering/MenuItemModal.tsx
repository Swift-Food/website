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
  const [itemQuantityInput, setItemQuantityInput] = useState("1"); // String for input field
  const [selectedAddons, setSelectedAddons] = useState<
    Record<string, Record<string, boolean>>
  >({});
  const [addonQuantities, setAddonQuantities] = useState<
    Record<string, Record<string, number>>
  >({}); // For single-selection groups: tracks quantity per addon
  const [addonQuantityInputs, setAddonQuantityInputs] = useState<
    Record<string, Record<string, string>>
  >({}); // String values for input fields
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
      setItemQuantityInput("1");
      setSelectedAddons({});
      setAddonQuantities({});
      setAddonQuantityInputs({});
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
    const initialQuantities: Record<string, Record<string, number>> = {};
    const initialQuantityInputs: Record<string, Record<string, string>> = {};

    Object.keys(grouped).forEach((groupTitle) => {
      initialSelections[groupTitle] = {};
      initialQuantities[groupTitle] = {};
      initialQuantityInputs[groupTitle] = {};
      grouped[groupTitle].items.forEach((addon) => {
        initialSelections[groupTitle][addon.name] = false;
        initialQuantities[groupTitle][addon.name] = 0;
        initialQuantityInputs[groupTitle][addon.name] = "0";
      });
    });
    console.log("Initial selections:", initialSelections);
    console.log("Initial quantities:", initialQuantities);
    setSelectedAddons(initialSelections);
    setAddonQuantities(initialQuantities);
    setAddonQuantityInputs(initialQuantityInputs);
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
          const addonPrice = parseFloat(addon.price) || 0;
          if (group.selectionType === "single") {
            // For single selection: multiply by specific addon quantity
            const qty = addonQuantities[groupTitle]?.[addon.name] || 0;
            addonCost += addonPrice * qty;
          } else {
            // For multiple selection: multiply by total item quantity (applies to all portions)
            addonCost += addonPrice * itemQuantity;
          }
        }
      });
    });

    // Set total price based on quantity and addons
    setTotalPrice(basePrice * itemQuantity + addonCost);
  }, [item, itemQuantity, selectedAddons, addonQuantities, addonGroups]);

  // Handle quantity change for single-selection addons
  const updateAddonQuantity = (
    groupTitle: string,
    addonName: string,
    change: number
  ) => {
    setAddonQuantities((prev) => {
      const newQuantities: Record<string, Record<string, number>> = {};
      Object.keys(prev).forEach((key) => {
        newQuantities[key] = { ...prev[key] };
      });

      if (!newQuantities[groupTitle]) {
        newQuantities[groupTitle] = {};
      }

      const currentQty = newQuantities[groupTitle][addonName] || 0;
      const newQty = Math.max(0, currentQty + change);

      newQuantities[groupTitle][addonName] = newQty;

      // Update input string to match
      setAddonQuantityInputs((prevInputs) => {
        const newInputs: Record<string, Record<string, string>> = {};
        Object.keys(prevInputs).forEach((key) => {
          newInputs[key] = { ...prevInputs[key] };
        });
        if (!newInputs[groupTitle]) {
          newInputs[groupTitle] = {};
        }
        newInputs[groupTitle][addonName] = newQty.toString();
        return newInputs;
      });

      // Update selected state based on quantity
      setSelectedAddons((prevSelected) => {
        const newSelections: Record<string, Record<string, boolean>> = {};
        Object.keys(prevSelected).forEach((key) => {
          newSelections[key] = { ...prevSelected[key] };
        });
        if (!newSelections[groupTitle]) {
          newSelections[groupTitle] = {};
        }
        newSelections[groupTitle][addonName] = newQty > 0;
        return newSelections;
      });

      return newQuantities;
    });
  };

  // Set addon quantity directly (for text input or click-to-fill)
  const setAddonQuantityDirect = (
    groupTitle: string,
    addonName: string,
    newQty: number
  ) => {
    const validQty = Math.max(0, Math.floor(newQty));

    setAddonQuantities((prev) => {
      const newQuantities: Record<string, Record<string, number>> = {};
      Object.keys(prev).forEach((key) => {
        newQuantities[key] = { ...prev[key] };
      });

      if (!newQuantities[groupTitle]) {
        newQuantities[groupTitle] = {};
      }

      newQuantities[groupTitle][addonName] = validQty;

      // Update input value to match
      setAddonQuantityInputs((prevInputs) => {
        const newInputs: Record<string, Record<string, string>> = {};
        Object.keys(prevInputs).forEach((key) => {
          newInputs[key] = { ...prevInputs[key] };
        });
        if (!newInputs[groupTitle]) {
          newInputs[groupTitle] = {};
        }
        newInputs[groupTitle][addonName] = validQty.toString();
        return newInputs;
      });

      // Update selected state based on quantity
      setSelectedAddons((prevSelected) => {
        const newSelections: Record<string, Record<string, boolean>> = {};
        Object.keys(prevSelected).forEach((key) => {
          newSelections[key] = { ...prevSelected[key] };
        });
        if (!newSelections[groupTitle]) {
          newSelections[groupTitle] = {};
        }
        newSelections[groupTitle][addonName] = validQty > 0;
        return newSelections;
      });

      return newQuantities;
    });
  };

  // Handle clicking on the addon row to set it to all portions and reset others in group
  const handleAddonRowClick = (groupTitle: string, addonName: string) => {
    setAddonQuantities((prev) => {
      const newQuantities: Record<string, Record<string, number>> = {};
      Object.keys(prev).forEach((key) => {
        newQuantities[key] = { ...prev[key] };
      });

      if (!newQuantities[groupTitle]) {
        newQuantities[groupTitle] = {};
      }

      // Reset all addons in this group to 0
      Object.keys(newQuantities[groupTitle]).forEach((addon) => {
        newQuantities[groupTitle][addon] = 0;
      });

      // Set the clicked addon to itemQuantity
      newQuantities[groupTitle][addonName] = itemQuantity;

      // Update input strings
      setAddonQuantityInputs((prevInputs) => {
        const newInputs: Record<string, Record<string, string>> = {};
        Object.keys(prevInputs).forEach((key) => {
          newInputs[key] = { ...prevInputs[key] };
        });
        if (!newInputs[groupTitle]) {
          newInputs[groupTitle] = {};
        }
        // Reset all addon inputs in this group to "0"
        Object.keys(newInputs[groupTitle]).forEach((addon) => {
          newInputs[groupTitle][addon] = "0";
        });
        // Set the clicked addon input to itemQuantity
        newInputs[groupTitle][addonName] = itemQuantity.toString();
        return newInputs;
      });

      // Update selected state
      setSelectedAddons((prevSelected) => {
        const newSelections: Record<string, Record<string, boolean>> = {};
        Object.keys(prevSelected).forEach((key) => {
          newSelections[key] = { ...prevSelected[key] };
        });
        if (!newSelections[groupTitle]) {
          newSelections[groupTitle] = {};
        }
        // Reset all selections in this group
        Object.keys(newSelections[groupTitle]).forEach((addon) => {
          newSelections[groupTitle][addon] = false;
        });
        // Only the clicked addon is selected
        newSelections[groupTitle][addonName] = true;
        return newSelections;
      });

      return newQuantities;
    });
  };

  const toggleAddon = (groupTitle: string, addonName: string) => {
    const group = addonGroups[groupTitle];

    // For single-selection groups, we don't toggle - we use quantity controls
    if (group.selectionType === "single") {
      return; // Quantity controls handle this
    }

    // For multiple selection, toggle the clicked addon
    setSelectedAddons((prev) => {
      const newSelections: Record<string, Record<string, boolean>> = {};
      Object.keys(prev).forEach((key) => {
        newSelections[key] = { ...prev[key] };
      });

      if (!newSelections[groupTitle]) {
        newSelections[groupTitle] = {};
      }

      const currentValue = prev[groupTitle]?.[addonName] || false;
      newSelections[groupTitle][addonName] = !currentValue;

      return newSelections;
    });
  };

  // Helper to get total selected quantity for a single-selection group
  const getSingleSelectionTotal = (groupTitle: string) => {
    const quantities = addonQuantities[groupTitle] || {};
    return Object.values(quantities).reduce((sum, qty) => sum + qty, 0);
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

  const validateSingleSelectionTotals = () => {
    // Check that all single-selection groups have quantities that add up to itemQuantity
    const errors: string[] = [];

    Object.entries(addonGroups).forEach(([groupTitle, group]) => {
      if (group.selectionType === "single") {
        const total = getSingleSelectionTotal(groupTitle);
        const hasAnySelection = Object.values(
          selectedAddons[groupTitle] || {}
        ).some((isSelected) => isSelected);

        if (hasAnySelection && total !== itemQuantity) {
          errors.push(
            `${groupTitle}: Please select exactly ${itemQuantity} portion${
              itemQuantity > 1 ? "s" : ""
            } (currently ${total})`
          );
        }
      }
    });

    return errors;
  };

  const handleAddToCart = () => {
    if (!item) return;

    // Validate required addons
    if (!validateRequiredAddons()) {
      alert("Please select all required options before adding to cart.");
      return;
    }

    // Validate single-selection totals
    const validationErrors = validateSingleSelectionTotals();
    if (validationErrors.length > 0) {
      alert("Please adjust your selections:\n\n" + validationErrors.join("\n"));
      return;
    }

    // Collect selected addons with their quantities and prices
    const addonsForCart: {
      name: string;
      price: number;
      quantity: number;
      groupTitle: string;
    }[] = [];

    let totalAddonPrice = 0;

    Object.entries(addonGroups).forEach(([groupTitle, group]) => {
      group.items.forEach((addon) => {
        if (selectedAddons[groupTitle]?.[addon.name]) {
          const addonPrice = Number(addon.price) || 0;

          if (group.selectionType === "single") {
            // For single selection: use the specific quantity
            const qty = addonQuantities[groupTitle]?.[addon.name] || 0;
            if (qty > 0) {
              addonsForCart.push({
                name: addon.name,
                price: addonPrice,
                quantity: qty,
                groupTitle: groupTitle,
              });
              totalAddonPrice += addonPrice * qty;
            }
          } else {
            // For multiple selection: quantity is always equal to itemQuantity
            addonsForCart.push({
              name: addon.name,
              price: addonPrice,
              quantity: itemQuantity,
              groupTitle: groupTitle,
            });
            totalAddonPrice += addonPrice * itemQuantity;
          }
        }
      });
    });

    // Create item with selected addons
    const itemWithAddons = {
      ...item,
      selectedAddons: addonsForCart,
      addonPrice: totalAddonPrice,
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
                <div className="flex items-center justify-between gap-3">
                  <button
                    onClick={() => {
                      const newQty = Math.max(1, itemQuantity - 1);
                      setItemQuantity(newQty);
                      setItemQuantityInput(newQty.toString());
                    }}
                    className="w-10 h-10 bg-base-100 border border-base-300 rounded-lg hover:bg-base-200 flex items-center justify-center text-lg font-medium flex-shrink-0"
                  >
                    −
                  </button>
                  <div className="flex flex-col items-center gap-1 flex-1">
                    <input
                      type="text"
                      inputMode="numeric"
                      value={itemQuantityInput}
                      onChange={(e) => {
                        const val = e.target.value;
                        // Allow empty or numeric input only
                        if (val === "" || /^\d+$/.test(val)) {
                          setItemQuantityInput(val);
                          if (val !== "" && !isNaN(parseInt(val))) {
                            setItemQuantity(Math.max(1, parseInt(val)));
                          }
                        }
                      }}
                      onBlur={(e) => {
                        if (
                          e.target.value === "" ||
                          parseInt(e.target.value) < 1
                        ) {
                          setItemQuantity(1);
                          setItemQuantityInput("1");
                        }
                      }}
                      className="w-20 text-center font-bold text-lg text-base-content bg-base-100 border border-base-300 rounded px-2 py-1"
                    />
                    <p className="text-xs text-base-content/60">
                      Feeds {itemQuantity * DISPLAY_FEEDS_PER_UNIT} people
                    </p>
                  </div>
                  <button
                    onClick={() => {
                      const newQty = itemQuantity + 1;
                      setItemQuantity(newQty);
                      setItemQuantityInput(newQty.toString());
                    }}
                    className="w-10 h-10 bg-base-100 border border-base-300 rounded-lg hover:bg-base-200 flex items-center justify-center text-lg font-medium flex-shrink-0"
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
                            ? `Select portions (total: ${getSingleSelectionTotal(
                                groupTitle
                              )}/${itemQuantity})`
                            : "Choose multiple (applies to all portions)"}
                        </span>
                      </div>
                    </div>

                    <div className="space-y-2">
                      {group.items.map((addon, index) => {
                        const addonQty =
                          addonQuantities[groupTitle]?.[addon.name] || 0;
                        const addonQtyInput =
                          addonQuantityInputs[groupTitle]?.[addon.name] || "0";

                        return group.selectionType === "single" ? (
                          // Single selection: Show quantity controls
                          <div
                            key={index}
                            className={`w-full flex items-center justify-between p-3 rounded-lg border transition-all cursor-pointer ${
                              addonQty > 0
                                ? "border-primary bg-primary/5"
                                : "border-base-300 bg-base-100 hover:border-primary/30"
                            }`}
                            onClick={() =>
                              handleAddonRowClick(groupTitle, addon.name)
                            }
                          >
                            <div className="flex flex-col sm:flex-row sm:items-center sm:gap-3 flex-1">
                              <span className="text-sm text-base-content">
                                {addon.name}
                              </span>
                              {parseFloat(addon.price) > 0 && (
                                <span className="text-xs font-medium text-primary">
                                  +£{parseFloat(addon.price).toFixed(2)}
                                </span>
                              )}
                            </div>
                            <div
                              className="flex items-center gap-2"
                              onClick={(e) => e.stopPropagation()}
                            >
                              <button
                                onClick={() =>
                                  updateAddonQuantity(
                                    groupTitle,
                                    addon.name,
                                    -1
                                  )
                                }
                                className="w-7 h-7 bg-base-100 border border-base-300 rounded hover:bg-base-200 flex items-center justify-center text-sm font-medium"
                              >
                                −
                              </button>
                              <input
                                type="text"
                                inputMode="numeric"
                                value={addonQtyInput}
                                onChange={(e) => {
                                  const val = e.target.value;
                                  // Allow empty or numeric input only
                                  if (val === "" || /^\d+$/.test(val)) {
                                    // Update input string
                                    setAddonQuantityInputs((prev) => {
                                      const newInputs: Record<
                                        string,
                                        Record<string, string>
                                      > = {};
                                      Object.keys(prev).forEach((key) => {
                                        newInputs[key] = { ...prev[key] };
                                      });
                                      if (!newInputs[groupTitle]) {
                                        newInputs[groupTitle] = {};
                                      }
                                      newInputs[groupTitle][addon.name] = val;
                                      return newInputs;
                                    });

                                    // Update actual quantity
                                    if (val !== "" && !isNaN(parseInt(val))) {
                                      setAddonQuantityDirect(
                                        groupTitle,
                                        addon.name,
                                        parseInt(val)
                                      );
                                    }
                                  }
                                }}
                                onBlur={(e) => {
                                  if (
                                    e.target.value === "" ||
                                    parseInt(e.target.value) < 0
                                  ) {
                                    setAddonQuantityDirect(
                                      groupTitle,
                                      addon.name,
                                      0
                                    );
                                  }
                                }}
                                className="w-12 text-center text-sm font-medium text-base-content bg-base-100 border border-base-300 rounded px-1 py-0.5"
                                onClick={(e) => e.stopPropagation()}
                              />
                              <button
                                onClick={() =>
                                  updateAddonQuantity(groupTitle, addon.name, 1)
                                }
                                className="w-7 h-7 bg-base-100 border border-base-300 rounded hover:bg-base-200 flex items-center justify-center text-sm font-medium"
                              >
                                +
                              </button>
                            </div>
                          </div>
                        ) : (
                          // Multiple selection: Show checkbox
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
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            )}

            <button
              onClick={handleAddToCart}
              className="w-full bg-primary hover:opacity-90 text-white py-3 rounded-lg font-medium transition-all text-base"
            >
              Add to Order
            </button>
            {/* Show total with customizations - always show if quantity > 1 or addons selected */}
            {(itemQuantity > 1 ||
              Object.values(selectedAddons).some((group) =>
                Object.values(group).some((selected) => selected)
              )) && (
              <div className="pt-2 border-t border-base-300">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium text-base-content/70">
                    Total {itemQuantity > 1 ? `(${itemQuantity} portions)` : ""}
                    :
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
