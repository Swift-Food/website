"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import {
  EventDetails,
  SelectedMenuItem,
  ContactInfo,
} from "@/types/catering.types";
import { Restaurant } from "@/app/components/catering/Step2MenuItems";

interface CateringContextType {
  currentStep: number;
  eventDetails: EventDetails | null;
  selectedItems: SelectedMenuItem[];
  contactInfo: ContactInfo | null;
  promoCodes: string[] | null;
  selectedRestaurants: Restaurant[];
  totalPrice: number;
  setCurrentStep: (step: number) => void;
  setEventDetails: (details: EventDetails) => void;
  addMenuItem: (item: SelectedMenuItem) => void;
  setPromoCodes: (code: string[]) => void;
  removeMenuItemByIndex: (index: number) => void;
  removeMenuItem: (itemId: string) => void;
  updateItemQuantity: (itemId: string, quantity: number) => void;
  setContactInfo: (info: ContactInfo) => void;
  getTotalPrice: () => number;
  resetOrder: () => void;
  setSelectedRestaurants: (restaurants: Restaurant[]) => void;
}

const CateringContext = createContext<CateringContextType | undefined>(
  undefined
);

// LocalStorage keys
const STORAGE_KEYS = {
  CURRENT_STEP: "catering_current_step",
  EVENT_DETAILS: "catering_event_details",
  SELECTED_ITEMS: "catering_selected_items",
  CONTACT_INFO: "catering_contact_info",
  PROMO_CODES: "catering_promo_codes",
  SELECTED_RESTAURANTS: "catering_selected_restaurants",
};

export function CateringProvider({ children }: { children: ReactNode }) {
  const [isHydrated, setIsHydrated] = useState(false);
  const [currentStep, setCurrentStepState] = useState(1);
  const [eventDetails, setEventDetailsState] = useState<EventDetails | null>(
    null
  );
  const [totalPrice, setTotalPrice] = useState(0);
  const [selectedItems, setSelectedItemsState] = useState<SelectedMenuItem[]>(
    []
  );
  const [contactInfo, setContactInfoState] = useState<ContactInfo | null>(null);
  const [promoCodes, setPromoCodesState] = useState<string[]>([]);
  const [selectedRestaurants, setSelectedRestaurantsState] = useState<
    Restaurant[]
  >([]);

  // Load data from localStorage on mount
  useEffect(() => {
    try {
      const savedStep = localStorage.getItem(STORAGE_KEYS.CURRENT_STEP);
      const savedEventDetails = localStorage.getItem(
        STORAGE_KEYS.EVENT_DETAILS
      );
      const savedItems = localStorage.getItem(STORAGE_KEYS.SELECTED_ITEMS);
      const savedContactInfo = localStorage.getItem(STORAGE_KEYS.CONTACT_INFO);
      const savedPromoCodes = localStorage.getItem(STORAGE_KEYS.PROMO_CODES);
      const savedRestaurants = localStorage.getItem(
        STORAGE_KEYS.SELECTED_RESTAURANTS
      );

      if (savedStep) setCurrentStepState(JSON.parse(savedStep));
      if (savedEventDetails)
        setEventDetailsState(JSON.parse(savedEventDetails));
      if (savedItems) setSelectedItemsState(JSON.parse(savedItems));
      if (savedContactInfo) setContactInfoState(JSON.parse(savedContactInfo));
      if (savedPromoCodes) setPromoCodesState(JSON.parse(savedPromoCodes));
      if (savedRestaurants)
        setSelectedRestaurantsState(JSON.parse(savedRestaurants));
    } catch (error) {
      console.error("Error loading catering data from localStorage:", error);
    } finally {
      setIsHydrated(true);
    }
  }, []);

  // Wrapper functions that also save to localStorage
  const setCurrentStep = (step: number) => {
    setCurrentStepState(step);
    localStorage.setItem(STORAGE_KEYS.CURRENT_STEP, JSON.stringify(step));
  };

  const setSelectedRestaurants = (restaurants: Restaurant[]) => {
    setSelectedRestaurantsState(restaurants);
    localStorage.setItem(
      STORAGE_KEYS.SELECTED_RESTAURANTS,
      JSON.stringify(restaurants)
    );
  };

  const setEventDetails = (details: EventDetails) => {
    setEventDetailsState(details);
    localStorage.setItem(STORAGE_KEYS.EVENT_DETAILS, JSON.stringify(details));
  };

  const setContactInfo = (info: ContactInfo) => {
    setContactInfoState(info);
    localStorage.setItem(STORAGE_KEYS.CONTACT_INFO, JSON.stringify(info));
  };

  const setPromoCodes = (codes: string[]) => {
    setPromoCodesState(codes);
    localStorage.setItem(STORAGE_KEYS.PROMO_CODES, JSON.stringify(codes));
  };

  const addMenuItem = (newItem: SelectedMenuItem) => {
    const validQuantity = Math.max(newItem.quantity);

    setSelectedItemsState((prev) => {
      // Check if item exists with same addons AND same addon quantities
      const existingIndex = prev.findIndex((i) => {
        if (i.item.id !== newItem.item.id) return false;

        // Check if addons match
        const existingAddons = i.item.selectedAddons || [];
        const newAddons = newItem.item.selectedAddons || [];

        if (existingAddons.length !== newAddons.length) return false;

        // Compare addon selections (including quantities)
        return existingAddons.every((existingAddon) =>
          newAddons.some(
            (newAddon) =>
              newAddon.name === existingAddon.name &&
              newAddon.groupTitle === existingAddon.groupTitle &&
              newAddon.quantity === existingAddon.quantity // Also compare quantities
          )
        );
      });

      let updated;

      if (existingIndex >= 0) {
        // Item with exact same addons and quantities exists, increase item quantity
        updated = [...prev];
        updated[existingIndex].quantity += validQuantity;
      } else {
        // New item or different addon combination
        updated = [...prev, { ...newItem, quantity: validQuantity }];
      }

      // Save to localStorage
      localStorage.setItem(
        STORAGE_KEYS.SELECTED_ITEMS,
        JSON.stringify(updated)
      );
      return updated;
    });

    console.log("Updating context: ", selectedItems);
  };

  const removeMenuItemByIndex = (index: number) => {
    setSelectedItemsState((prev) => {
      const updated = [...prev];
      updated.splice(index, 1);
      localStorage.setItem(
        STORAGE_KEYS.SELECTED_ITEMS,
        JSON.stringify(updated)
      );
      return updated;
    });
    getTotalPrice();
  };

  const removeMenuItem = (itemId: string) => {
    setSelectedItemsState((prev) => {
      const updated = prev.filter((i) => i.item.id !== itemId);
      localStorage.setItem(
        STORAGE_KEYS.SELECTED_ITEMS,
        JSON.stringify(updated)
      );
      return updated;
    });
    getTotalPrice();
  };

  const updateItemQuantity = (itemId: string, quantity: number) => {
    if (quantity <= 0) {
      removeMenuItem(itemId);
      return;
    }

    setSelectedItemsState((prev) => {
      const updated = prev.map((i) =>
        i.item.id === itemId ? { ...i, quantity } : i
      );
      localStorage.setItem(
        STORAGE_KEYS.SELECTED_ITEMS,
        JSON.stringify(updated)
      );
      return updated;
    });
    getTotalPrice();
  };

  const getTotalPrice = () => {
    const newTotalPrice = selectedItems.reduce((total, { item, quantity }) => {
      console.log(item, quantity);
      const BACKEND_QUANTITY_UNIT = item.cateringQuantityUnit || 7;
      const DISPLAY_FEEDS_PER_UNIT = item.feedsPerUnit || 10;
      console.log("Backend quantity unit: ", BACKEND_QUANTITY_UNIT);

      const price = parseFloat(item.price?.toString() || "0");
      const discountPrice = parseFloat(item.discountPrice?.toString() || "0");
      const unitPrice =
        item.isDiscount && discountPrice > 0 ? discountPrice : price;

      console.log("Unit price: ", unitPrice);
      const itemPrice = unitPrice * quantity;
      console.log("item price: ", itemPrice);
      // Addon price: sum of (addon price * addon quantity * backend unit), or 0 if no addons
      const addonPrice = (item.selectedAddons || []).reduce(
        (addonTotal, { price, quantity }) => {
          return (
            addonTotal + (price || 0) * (quantity || 0) * DISPLAY_FEEDS_PER_UNIT
          );
        },
        0
      );

      console.log("addon price: ", addonPrice);

      return total + itemPrice + addonPrice;
    }, 0);
    setTotalPrice(newTotalPrice);
    return newTotalPrice;
    //  let basePrice =
    //     BACKEND_QUANTITY_UNIT *
    //     (item.isDiscount
    //       ? parseFloat(item.discountPrice || "0")
    //       : parseFloat(item.price || "0"));

    //   if (isNaN(basePrice)) basePrice = 0;

    //   // Calculate addon costs
    //   let addonCost = 0;
    //   Object.entries(addonGroups).forEach(([groupTitle, group]) => {
    //     group.items.forEach((addon) => {
    //       if (selectedAddons[groupTitle]?.[addon.name]) {
    //         const addonPrice = parseFloat(addon.price) || 0;
    //         if (group.selectionType === "single") {
    //           // For single selection: multiply by specific addon quantity
    //           const qty = addonQuantities[groupTitle]?.[addon.name] || 0;
    //           addonCost += addonPrice * qty * DISPLAY_FEEDS_PER_UNIT;
    //         } else {
    //           // For multiple selection: multiply by total item quantity (applies to all portions)
    //           addonCost += addonPrice * itemQuantity * DISPLAY_FEEDS_PER_UNIT;
    //         }
    //       }
    //     });
    //   });
  };

  const resetOrder = () => {
    setCurrentStepState(1);
    setEventDetailsState(null);
    setSelectedItemsState([]);
    setContactInfoState(null);
    setPromoCodesState([]);
    setSelectedRestaurantsState([]);

    // Clear localStorage
    localStorage.removeItem(STORAGE_KEYS.CURRENT_STEP);
    localStorage.removeItem(STORAGE_KEYS.EVENT_DETAILS);
    localStorage.removeItem(STORAGE_KEYS.SELECTED_ITEMS);
    localStorage.removeItem(STORAGE_KEYS.CONTACT_INFO);
    localStorage.removeItem(STORAGE_KEYS.PROMO_CODES);
    localStorage.removeItem(STORAGE_KEYS.SELECTED_RESTAURANTS);
  };

  // Prevent hydration mismatch by not rendering until client-side data is loaded
  if (!isHydrated) {
    return null; // or return a loading spinner
  }

  return (
    <CateringContext.Provider
      value={{
        currentStep,
        eventDetails,
        totalPrice,
        selectedItems,
        contactInfo,
        promoCodes,
        selectedRestaurants,
        setCurrentStep,
        setEventDetails,
        addMenuItem,
        removeMenuItemByIndex,
        removeMenuItem,
        updateItemQuantity,
        setContactInfo,
        getTotalPrice,
        resetOrder,
        setPromoCodes,
        setSelectedRestaurants,
      }}
    >
      {children}
    </CateringContext.Provider>
  );
}

export function useCatering() {
  const context = useContext(CateringContext);
  if (!context) {
    throw new Error("useCatering must be used within CateringProvider");
  }
  return context;
}
