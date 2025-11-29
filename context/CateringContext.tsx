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
import { Restaurant } from "@/lib/components/catering/Step2MenuItems";

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

  const calculatePromotionDiscount = (
    restaurantId: string,
    subtotal: number,
    cartItems: Array<{ menuItemId: string; groupTitle: string; price: number; quantity: number; restaurantId: string }>
  ): { discount: number; promotion: any | null } => {
    const promos = restaurantPromotions[restaurantId];
  
    
    if (!promos || promos.length === 0) {
      return { discount: 0, promotion: null };
    }
  
    // CHANGED: Get ALL applicable promotions, not just the first one
    const applicablePromos = promos
      .filter(promo => {
        const isApplicable = isPromotionApplicable(promo, subtotal);
        return isApplicable;
      })
      .sort((a, b) => (b.priority || 0) - (a.priority || 0));
  
    if (applicablePromos.length === 0) {
      return { discount: 0, promotion: null };
    }
  
  
    // Calculate discount from ALL applicable promotions
    let totalDiscount = 0;
    let primaryPromotion = applicablePromos[0]; // For display purposes
  
    applicablePromos.forEach(promo => {
      const discount = calculateDiscountByType(promo, subtotal, cartItems);
      totalDiscount += discount;
    });
  
    
    return { 
      discount: Number(Number(totalDiscount).toFixed(2)), 
      promotion: primaryPromotion 
    };
  };
  
  // Helper: Check if promotion is applicable
  const isPromotionApplicable = (promo: any, subtotal: number): boolean => {
    // Check date range
    const now = new Date();
    if (now < new Date(promo.startDate) || now > new Date(promo.endDate)) {
      return false;
    }
  
    // Check minimum order amount
    if (promo.minOrderAmount && subtotal < promo.minOrderAmount) {
      return false;
    }
    return true;
  };
  
  const calculateDiscountByType = (
    promo: any,
    subtotal: number,
    cartItems: Array<{ menuItemId: string; groupTitle: string; price: number; quantity: number }>
  ): number => {
    let eligibleAmount = 0;
  
    switch (promo.promotionType) {
      case 'RESTAURANT_WIDE':
        eligibleAmount = subtotal;
        break;
  
      case 'CATEGORY_SPECIFIC':
        eligibleAmount = cartItems
          .filter(item => promo.applicableCategories?.includes(item.groupTitle))
          .reduce((sum, item) => sum + (item.price * item.quantity), 0);
        break;
  
      case 'ITEM_SPECIFIC':
        eligibleAmount = cartItems
          .filter(item => promo.applicableMenuItemIds?.includes(item.menuItemId))
          .reduce((sum, item) => sum + (item.price * item.quantity), 0);
        break;
  
      case 'BUY_MORE_SAVE_MORE':
        return calculateBuyMoreSaveMoreDiscount(promo, cartItems);
  
      case 'BOGO': // ADD THIS CASE
        return calculateBogoDiscount(promo, cartItems);
  
      default:
        eligibleAmount = 0;
    }
  
    // Calculate percentage discount
    let discount = eligibleAmount * (promo.discountPercentage / 100);
    
    // Apply max discount cap if set
    if (promo.maxDiscountAmount && discount > promo.maxDiscountAmount) {
      discount = promo.maxDiscountAmount;
    }
    
    return discount;
  };
  
  // Helper: For future BUY_MORE_SAVE_MORE type
  const calculateBuyMoreSaveMoreDiscount = (
    promo: any,
    cartItems: Array<{ menuItemId: string; groupTitle: string; price: number; quantity: number }>
  ): number => {
    if (!promo.discountTiers || promo.discountTiers.length === 0) {
      return 0;
    }
  
    // Filter applicable items
    const applicableItems = cartItems.filter((item) => {
      // If applyToAllGroups is true, all items are applicable
      if (promo.applyToAllGroups) {
        return true;
      }
  
      // Otherwise check if item's group is in applicableCategories
      return item.groupTitle
        ? (promo.applicableCategories?.includes(item.groupTitle) ?? false)
        : false;
    });
  
    // Calculate total quantity of applicable items
    const totalQuantity = applicableItems.reduce(
      (sum, item) => sum + item.quantity,
      0
    );
  
    // Find the highest tier that applies
    const sortedTiers = [...promo.discountTiers].sort(
      (a, b) => b.minQuantity - a.minQuantity
    );
    const applicableTier = sortedTiers.find(
      (tier) => totalQuantity >= tier.minQuantity
    );
  
    if (!applicableTier) {
      return 0;
    }
  
    // Calculate total price of applicable items
    const eligibleAmount = applicableItems.reduce(
      (sum, item) => sum + (item.price * item.quantity),
      0
    );
  
    // Apply discount percentage from the tier
    let discount = eligibleAmount * (applicableTier.discountPercentage / 100);
  
    // Apply max discount cap if set
    if (promo.maxDiscountAmount && discount > promo.maxDiscountAmount) {
      discount = promo.maxDiscountAmount;
    }
  
    return discount;
  };

  const calculateBogoDiscount = (
    promo: any,
    cartItems: Array<{ menuItemId: string; groupTitle: string; price: number; quantity: number }>
  ): number => {
  
    if (!promo.bogoItemIds || promo.bogoItemIds.length === 0) {
      return 0;
    }
  
    let totalDiscount = 0;
  
    // Filter applicable items
    const applicableItems = cartItems.filter((item) =>
      promo.bogoItemIds.includes(item.menuItemId)
    );
  
  
    applicableItems.forEach((item) => {
      const buyQty = promo.buyQuantity || 1;
      const getQty = promo.getQuantity || 1;
      const setSize = buyQty + getQty;
  
      const completeSets = Math.floor(item.quantity / setSize);
      const unitPrice = item.price;
      const freeItemsCount = completeSets * getQty;
      const discount = freeItemsCount * unitPrice;
  
      totalDiscount += discount;
    });
  
  
    if (promo.maxDiscountAmount && totalDiscount > promo.maxDiscountAmount) {
      totalDiscount = promo.maxDiscountAmount;
    }
  
    return totalDiscount;
  };

  // NEW: Calculate totals with promotions whenever items or promotions change
  useEffect(() => {
    // Object.entries(restaurantPromotions).forEach(([restaurantId, promos]) => {
    //   console.log(`🏪 Restaurant ${restaurantId} promotions:`, promos.map(p => ({
    //     name: p.name,
    //     type: p.promotionType,
    //     bogoItemIds: p.bogoItemIds,
    //     status: p.status
    //   })));
    // });
    const restaurantSubtotals: Record<string, number> = {};
    const newRestaurantDiscounts: Record<string, { discount: number; promotion: any }> = {};
    
    // Calculate subtotal per restaurant
    selectedItems.forEach(({ item, quantity }) => {
      const restaurantId = item.restaurantId;

      const price = parseFloat(item.price?.toString() || "0");
      const discountPrice = parseFloat(item.discountPrice?.toString() || "0");
      const itemPrice = item.isDiscount && discountPrice > 0 ? discountPrice : price;

      // Addon total = sum of (addonPrice × addonQuantity) - no scaling multipliers
      const addonTotal = (item.selectedAddons || []).reduce(
        (total, { price, quantity }) => {
          return total + (price || 0) * (quantity || 0);
        },
        0
      );

      // Item subtotal = (unitPrice × quantity) + addonTotal
      const itemSubtotal = (itemPrice * quantity) + addonTotal;
      
      if (!restaurantSubtotals[restaurantId]) {
        restaurantSubtotals[restaurantId] = 0;
      }
      restaurantSubtotals[restaurantId] += itemSubtotal;
    });

    // Build cart items with proper quantity calculation
    const cartItems = selectedItems.map(selected => {
      const price = parseFloat(selected.item.price?.toString() || "0");
      const discountPrice = parseFloat(selected.item.discountPrice?.toString() || "0");
      const itemPrice = selected.item.isDiscount && discountPrice > 0 ? discountPrice : price;
      
      return {
        menuItemId: selected.item.id,
        groupTitle: selected.item.groupTitle || '',
        price: itemPrice,
        quantity: selected.quantity,
        restaurantId: selected.item.restaurantId
      };
    });
    // console.log("🛒 Cart Items for discount calculation:", cartItems.map(item => ({
    //   menuItemId: item.menuItemId,
    //   groupTitle: item.groupTitle,
    //   price: item.price,
    //   quantity: item.quantity,
    //   restuarantId: item.restaurantId
    // })));
    // Calculate discount per restaurant
    Object.keys(restaurantSubtotals).forEach(restaurantId => {
      const subtotal = restaurantSubtotals[restaurantId];
      // console.log(`\n💰 Processing restaurant ${restaurantId}, subtotal: £${subtotal}`);
      
      const { discount, promotion } = calculatePromotionDiscount(restaurantId, subtotal, cartItems);
      // console.log(`💵 Discount calculated: £${discount}`, promotion?.name);
      
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
        const price = parseFloat(item.price?.toString() || "0");
        const discountPrice = parseFloat(item.discountPrice?.toString() || "0");
        const unitPrice =
          item.isDiscount && discountPrice > 0 ? discountPrice : price;

        const itemPrice = unitPrice * quantity;

        // Addon total = sum of (addonPrice × addonQuantity) - no scaling multipliers
        const addonTotal = (item.selectedAddons || []).reduce(
          (sum, { price, quantity }) => {
            return sum + (price || 0) * (quantity || 0);
          },
          0
        );

        return total + itemPrice + addonTotal;
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