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
  };

  const getTotalPrice = () => {
    return selectedItems.reduce((total, { item, quantity }) => {
      const price = parseFloat(item.price?.toString() || "0");
      const discountPrice = parseFloat(item.discountPrice?.toString() || "0");
      const itemPrice =
        item.isDiscount && discountPrice > 0 ? discountPrice : price;

      // Add addon price if available
      const addonPrice = item.addonPrice || 0;

      return total + itemPrice * quantity + addonPrice;
    }, 0);
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
