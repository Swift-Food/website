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
  CorporateUser,
} from "@/types/catering.types";
import { Restaurant } from "@/app/components/catering/Step2MenuItems";

interface CateringContextType {
  currentStep: number;
  eventDetails: EventDetails | null;
  selectedItems: SelectedMenuItem[];
  contactInfo: ContactInfo | null;
  promoCodes: string[] | null;
  selectedRestaurants: Restaurant[];
  corporateUser: CorporateUser | null;
  totalPrice: number;
  restaurantPromotions: Record<string, any[]>; // NEW
  subtotalBeforeDiscount: number; // NEW
  promotionDiscount: number; // NEW
  finalTotal: number; // NEW
  restaurantDiscounts: Record<string, { discount: number; promotion: any }>; // NEW
  setCurrentStep: (step: number) => void;
  setEventDetails: (details: EventDetails) => void;
  addMenuItem: (item: SelectedMenuItem) => void;
  setPromoCodes: (code: string[]) => void;
  removeMenuItemByIndex: (index: number) => void;
  removeMenuItem: (itemId: string) => void;
  updateItemQuantity: (itemId: string, quantity: number) => void;
  updateMenuItemByIndex: (index: number, item: SelectedMenuItem) => void;
  setContactInfo: (info: ContactInfo) => void;
  getTotalPrice: () => number;
  resetOrder: () => void;
  setSelectedRestaurants: (restaurants: Restaurant[]) => void;
  setCorporateUser: (user: CorporateUser | null) => void;
  markOrderAsSubmitted: () => void;
  setRestaurantPromotions: (promotions: Record<string, any[]>) => void; // NEW
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
  CORPORATE_USER: "catering_corporate_user",
  ORDER_SUBMITTED: "catering_order_submitted",
  RESTAURANT_PROMOTIONS: "catering_restaurant_promotions", // NEW
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
  const [corporateUser, setCorporateUserState] = useState<CorporateUser | null>(null);
  const [restaurantPromotions, setRestaurantPromotionsState] = useState<Record<string, any[]>>({}); // NEW

  // NEW: Calculated values for promotions
  const [subtotalBeforeDiscount, setSubtotalBeforeDiscount] = useState(0);
  const [promotionDiscount, setPromotionDiscount] = useState(0);
  const [finalTotal, setFinalTotal] = useState(0);
  const [restaurantDiscounts, setRestaurantDiscounts] = useState<Record<string, { discount: number; promotion: any }>>({});

  // NEW: Helper function to calculate promotion discount
  const calculatePromotionDiscount = (
    restaurantId: string,
    subtotal: number
  ): { discount: number; promotion: any | null } => {
    const promos = restaurantPromotions[restaurantId];
    
    if (!promos || promos.length === 0) {
      return { discount: 0, promotion: null };
    }

    const promo = promos[0];

    // Check minimum order amount
    if (promo.minOrderAmount && subtotal < promo.minOrderAmount) {
      return { discount: 0, promotion: promo };
    }

    // Calculate percentage discount
    let discount = subtotal * (promo.discountPercentage / 100);

    // Apply max discount cap if set
    if (promo.maxDiscountAmount && discount > promo.maxDiscountAmount) {
      discount = promo.maxDiscountAmount;
    }

    return { discount: Number(Number(discount).toFixed(2)), promotion: promo };
  };

  // NEW: Calculate totals with promotions whenever items or promotions change
  useEffect(() => {
    const restaurantSubtotals: Record<string, number> = {};
    const newRestaurantDiscounts: Record<string, { discount: number; promotion: any }> = {};
    
    // Calculate subtotal per restaurant
    selectedItems.forEach(({ item, quantity }) => {
      const restaurantId = item.restaurantId;
      const BACKEND_QUANTITY_UNIT = item.cateringQuantityUnit || 7;
      const DISPLAY_FEEDS_PER_UNIT = item.feedsPerUnit || 10;
      
      const price = parseFloat(item.price?.toString() || "0");
      const discountPrice = parseFloat(item.discountPrice?.toString() || "0");
      const itemPrice = item.isDiscount && discountPrice > 0 ? discountPrice : price;
      
      // FIXED: Calculate addon price correctly
      const addonPricePerPortion = (item.selectedAddons || []).reduce(
        (addonTotal, { price, quantity }) => {
          return addonTotal + (price || 0) * (quantity || 0) * DISPLAY_FEEDS_PER_UNIT;
        },
        0
      );
      
      const numPortions = quantity / BACKEND_QUANTITY_UNIT;
      const totalAddonPrice = addonPricePerPortion * numPortions;
      const itemSubtotal = (itemPrice * quantity) + totalAddonPrice;
      
      if (!restaurantSubtotals[restaurantId]) {
        restaurantSubtotals[restaurantId] = 0;
      }
      restaurantSubtotals[restaurantId] += itemSubtotal;
    });

    // Calculate discount per restaurant
    Object.keys(restaurantSubtotals).forEach(restaurantId => {
      const subtotal = restaurantSubtotals[restaurantId];
      const { discount, promotion } = calculatePromotionDiscount(restaurantId, subtotal);
      newRestaurantDiscounts[restaurantId] = { discount, promotion };
    });

    // Calculate totals
    const newSubtotal = Object.values(restaurantSubtotals).reduce((sum, val) => sum + val, 0);
    const newTotalDiscount = Object.values(newRestaurantDiscounts).reduce(
      (sum, { discount }) => sum + discount,
      0
    );
    const newFinalTotal = newSubtotal - newTotalDiscount;

    setSubtotalBeforeDiscount(newSubtotal);
    setPromotionDiscount(newTotalDiscount);
    setFinalTotal(newFinalTotal);
    setRestaurantDiscounts(newRestaurantDiscounts);
  }, [selectedItems, restaurantPromotions]);

  // Load data from localStorage on mount
  useEffect(() => {
    try {
      const orderSubmitted = localStorage.getItem(STORAGE_KEYS.ORDER_SUBMITTED);

      if (orderSubmitted === "true") {
        localStorage.removeItem(STORAGE_KEYS.CURRENT_STEP);
        localStorage.removeItem(STORAGE_KEYS.EVENT_DETAILS);
        localStorage.removeItem(STORAGE_KEYS.SELECTED_ITEMS);
        localStorage.removeItem(STORAGE_KEYS.CONTACT_INFO);
        localStorage.removeItem(STORAGE_KEYS.PROMO_CODES);
        localStorage.removeItem(STORAGE_KEYS.SELECTED_RESTAURANTS);
        localStorage.removeItem(STORAGE_KEYS.CORPORATE_USER);
        localStorage.removeItem(STORAGE_KEYS.ORDER_SUBMITTED);
        localStorage.removeItem(STORAGE_KEYS.RESTAURANT_PROMOTIONS); // NEW

        setIsHydrated(true);
        return;
      }

      const savedStep = localStorage.getItem(STORAGE_KEYS.CURRENT_STEP);
      const savedEventDetails = localStorage.getItem(STORAGE_KEYS.EVENT_DETAILS);
      const savedItems = localStorage.getItem(STORAGE_KEYS.SELECTED_ITEMS);
      const savedContactInfo = localStorage.getItem(STORAGE_KEYS.CONTACT_INFO);
      const savedPromoCodes = localStorage.getItem(STORAGE_KEYS.PROMO_CODES);
      const savedRestaurants = localStorage.getItem(STORAGE_KEYS.SELECTED_RESTAURANTS);
      const savedCorporateUser = localStorage.getItem(STORAGE_KEYS.CORPORATE_USER);
      const savedPromotions = localStorage.getItem(STORAGE_KEYS.RESTAURANT_PROMOTIONS); // NEW

      if (savedStep) setCurrentStepState(JSON.parse(savedStep));
      if (savedEventDetails) setEventDetailsState(JSON.parse(savedEventDetails));
      if (savedItems) setSelectedItemsState(JSON.parse(savedItems));
      if (savedContactInfo) setContactInfoState(JSON.parse(savedContactInfo));
      if (savedPromoCodes) setPromoCodesState(JSON.parse(savedPromoCodes));
      if (savedRestaurants) setSelectedRestaurantsState(JSON.parse(savedRestaurants));
      if (savedCorporateUser) setCorporateUserState(JSON.parse(savedCorporateUser));
      if (savedPromotions) setRestaurantPromotionsState(JSON.parse(savedPromotions)); // NEW
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

  const setCorporateUser = (user: CorporateUser | null) => {
    setCorporateUserState(user);
    if (user) {
      localStorage.setItem(STORAGE_KEYS.CORPORATE_USER, JSON.stringify(user));
    } else {
      localStorage.removeItem(STORAGE_KEYS.CORPORATE_USER);
    }
  };

  // NEW: Set restaurant promotions
  const setRestaurantPromotions = (promotions: Record<string, any[]>) => {
    setRestaurantPromotionsState(promotions);
    localStorage.setItem(STORAGE_KEYS.RESTAURANT_PROMOTIONS, JSON.stringify(promotions));
  };

  const addMenuItem = (newItem: SelectedMenuItem) => {
    const validQuantity = Math.max(newItem.quantity);

    setSelectedItemsState((prev) => {
      const existingIndex = prev.findIndex((i) => {
        if (i.item.id !== newItem.item.id) return false;

        const existingAddons = i.item.selectedAddons || [];
        const newAddons = newItem.item.selectedAddons || [];

        if (existingAddons.length !== newAddons.length) return false;

        return existingAddons.every((existingAddon) =>
          newAddons.some(
            (newAddon) =>
              newAddon.name === existingAddon.name &&
              newAddon.groupTitle === existingAddon.groupTitle &&
              newAddon.quantity === existingAddon.quantity
          )
        );
      });

      let updated;

      if (existingIndex >= 0) {
        updated = [...prev];
        updated[existingIndex].quantity += validQuantity;
      } else {
        updated = [...prev, { ...newItem, quantity: validQuantity }];
      }

      localStorage.setItem(
        STORAGE_KEYS.SELECTED_ITEMS,
        JSON.stringify(updated)
      );
      getTotalPrice(updated);
      return updated;
    });
  };

  const removeMenuItemByIndex = (index: number) => {
    setSelectedItemsState((prev) => {
      const updated = [...prev];
      updated.splice(index, 1);
      localStorage.setItem(
        STORAGE_KEYS.SELECTED_ITEMS,
        JSON.stringify(updated)
      );
      getTotalPrice(updated);
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
      getTotalPrice(updated);
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
      getTotalPrice(updated);
      return updated;
    });
  };

  const updateMenuItemByIndex = (index: number, item: SelectedMenuItem) => {
    setSelectedItemsState((prev) => {
      const updated = [...prev];
      updated[index] = item;
      localStorage.setItem(
        STORAGE_KEYS.SELECTED_ITEMS,
        JSON.stringify(updated)
      );
      getTotalPrice(updated);
      return updated;
    });
  };

  const getTotalPrice = (optionalSelectedItems: SelectedMenuItem[] = []) => {
    const usedSelectedItems =
      optionalSelectedItems.length > 0 ? optionalSelectedItems : selectedItems;
    const newTotalPrice = usedSelectedItems.reduce(
      (total, { item, quantity }) => {
        const BACKEND_QUANTITY_UNIT = item.cateringQuantityUnit || 7;
        const DISPLAY_FEEDS_PER_UNIT = item.feedsPerUnit || 10;
  
        const price = parseFloat(item.price?.toString() || "0");
        const discountPrice = parseFloat(item.discountPrice?.toString() || "0");
        const unitPrice =
          item.isDiscount && discountPrice > 0 ? discountPrice : price;
  
        const itemPrice = unitPrice * quantity;
        
        // FIXED: Calculate addon price per portion, then multiply by number of portions
        const addonPricePerPortion = (item.selectedAddons || []).reduce(
          (addonTotal, { price, quantity }) => {
            return (
              addonTotal +
              (price || 0) * (quantity || 0) * DISPLAY_FEEDS_PER_UNIT
            );
          },
          0
        );
        
        // Calculate how many portions
        const numPortions = quantity / BACKEND_QUANTITY_UNIT;
        const totalAddonPrice = addonPricePerPortion * numPortions;
  
        return total + itemPrice + totalAddonPrice;
      },
      0
    );
    setTotalPrice(newTotalPrice);
    return newTotalPrice;
  };

  const resetOrder = () => {
    setCurrentStepState(1);
    setEventDetailsState(null);
    setSelectedItemsState([]);
    setContactInfoState(null);
    setPromoCodesState([]);
    setSelectedRestaurantsState([]);
    setCorporateUserState(null);
    setRestaurantPromotionsState({}); // NEW

    localStorage.removeItem(STORAGE_KEYS.CURRENT_STEP);
    localStorage.removeItem(STORAGE_KEYS.EVENT_DETAILS);
    localStorage.removeItem(STORAGE_KEYS.SELECTED_ITEMS);
    localStorage.removeItem(STORAGE_KEYS.CONTACT_INFO);
    localStorage.removeItem(STORAGE_KEYS.PROMO_CODES);
    localStorage.removeItem(STORAGE_KEYS.SELECTED_RESTAURANTS);
    localStorage.removeItem(STORAGE_KEYS.CORPORATE_USER);
    localStorage.removeItem(STORAGE_KEYS.ORDER_SUBMITTED);
    localStorage.removeItem(STORAGE_KEYS.RESTAURANT_PROMOTIONS); // NEW
  };

  const markOrderAsSubmitted = () => {
    localStorage.setItem(STORAGE_KEYS.ORDER_SUBMITTED, "true");
  };

  if (!isHydrated) {
    return null;
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
        corporateUser,
        restaurantPromotions, // NEW
        subtotalBeforeDiscount, // NEW
        promotionDiscount, // NEW
        finalTotal, // NEW
        restaurantDiscounts, // NEW
        setCurrentStep,
        setEventDetails,
        addMenuItem,
        removeMenuItemByIndex,
        removeMenuItem,
        updateItemQuantity,
        updateMenuItemByIndex,
        setContactInfo,
        getTotalPrice,
        resetOrder,
        setPromoCodes,
        setSelectedRestaurants,
        setCorporateUser,
        markOrderAsSubmitted,
        setRestaurantPromotions, // NEW
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