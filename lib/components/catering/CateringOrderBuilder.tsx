"use client";

import { useState, useRef, useEffect, useMemo, useCallback } from "react";
import { useSearchParams } from "next/navigation";
import { useCatering } from "@/context/CateringContext";
import {
  CateringPricingResult,
  ContactInfo,
  MealSessionState,
} from "@/types/catering.types";
import { cateringService } from "@/services/api/catering.api";
import MenuItemModal from "./MenuItemModal";
import { MenuItem } from "./Step2MenuItems";
import TutorialTooltip from "./TutorialTooltip";
import {
  LocalMealSession,
  transformLocalSessionsToPdfData,
} from "@/lib/utils/menuPdfUtils";
import { pdf } from "@react-pdf/renderer";
import { CateringMenuPdf } from "@/lib/components/pdf/CateringMenuPdf";
import { validateSessionMinOrders } from "@/lib/utils/catering-min-order-validation";

// Extracted components
import SessionEditor from "./SessionEditor";
import DateSessionNav from "./DateSessionNav";
import ActiveSessionPanel from "./ActiveSessionPanel";
import ViewOrderModal from "./ViewOrderModal";
import MenuBrowserColumn from "./MenuBrowserColumn";
import EmptySessionWarningModal from "./modals/EmptySessionWarningModal";
import RemoveSessionConfirmModal from "./modals/RemoveSessionConfirmModal";
import MinOrderModal from "./modals/MinOrderModal";
import PdfDownloadModal from "./modals/PdfDownloadModal";
import HalkinVenueModal from "./modals/HalkinVenueModal";
import SwapItemModal from "./modals/SwapItemModal";
import PricingSummary from "./contact/PricingSummary";

// Hooks
import { useCateringTutorial } from "./hooks/useCateringTutorial";
import { useCateringData } from "./hooks/useCateringData";

// Helpers
import {
  groupSessionsByDay,
  formatTimeDisplay,
  mapToMenuItem,
} from "./catering-order-helpers";
import { API_BASE_URL } from "@/lib/constants/api";
import { fetchWithAuth } from "@/lib/api-client/auth-client";

// Icons
import { MoreHorizontal, ShoppingBag, Trash2, X } from "lucide-react";

export default function CateringOrderBuilder() {
  const searchParams = useSearchParams();
  const {
    mealSessions,
    activeSessionIndex,
    setActiveSessionIndex,
    addMealSession,
    updateMealSession,
    removeMealSession,
    addMenuItem,
    updateItemQuantity,
    removeMenuItemByIndex,
    updateMenuItemByIndex,
    getSessionTotal,
    getSessionDiscount,
    getTotalPrice,
    setCurrentStep,
    contactInfo,
    setContactInfo,
  } = useCatering();

  // Session editing state
  const [editingSessionIndex, setEditingSessionIndex] = useState<number | null>(
    null,
  );
  const [isNewSession, setIsNewSession] = useState(false);

  // Navigation state
  const [navMode, setNavMode] = useState<"dates" | "sessions">("dates");
  const [selectedDayDate, setSelectedDayDate] = useState<string | null>(null);


  // Menu items state
  const [expandedItemId, setExpandedItemId] = useState<string | null>(null);

  // Edit item state
  const [editingItemIndex, setEditingItemIndex] = useState<number | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  // Pending item modal state
  const [pendingItem, setPendingItem] = useState<MenuItem | null>(null);

  // Collapsed categories state
  const [collapsedCategories, setCollapsedCategories] = useState<Set<string>>(
    new Set(),
  );

  // PDF generation state
  const [generatingPdf, setGeneratingPdf] = useState(false);
  const [showPdfModal, setShowPdfModal] = useState(false);
  const [showHalkinModal, setShowHalkinModal] = useState(false);

  // Empty session warning modal state
  const [emptySessionIndex, setEmptySessionIndex] = useState<number | null>(
    null,
  );

  // Remove session confirmation modal state
  const [sessionToRemove, setSessionToRemove] = useState<number | null>(null);

  // Min order modal state
  const [minOrderModalSession, setMinOrderModalSession] = useState<{
    index: number;
    validation: typeof validationStatus;
  } | null>(null);

  // Catering hours validation errors
  const [sessionValidationErrors, setSessionValidationErrors] = useState<
    Record<number, string>
  >({});

  // Bundle browser state
  const [showBundleBrowser, setShowBundleBrowser] = useState(false);

  // Swap item state (for bundle items)
  const [swapItemIndex, setSwapItemIndex] = useState<number | null>(null);
  const [swapAlternatives, setSwapAlternatives] = useState<MenuItem[]>([]);

  // Mobile View Order modal state
  const [isViewOrderOpen, setIsViewOrderOpen] = useState(false);

  // Remove item confirmation
  const [removeItemIndex, setRemoveItemIndex] = useState<number | null>(null);

  // Clear all items confirmation + cart actions popovers
  const [isClearAllConfirmOpen, setIsClearAllConfirmOpen] = useState(false);
  const [isMobileCartMenuOpen, setIsMobileCartMenuOpen] = useState(false);
  const [isDesktopCartMenuOpen, setIsDesktopCartMenuOpen] = useState(false);
  const [desktopMenuPos, setDesktopMenuPos] = useState({ bottom: 0, left: 0 });
  const desktopMenuBtnRef = useRef<HTMLButtonElement>(null);

  // Tutorial refs
  const addDayNavButtonRef = useRef<HTMLButtonElement>(null);
  const backButtonRef = useRef<HTMLButtonElement>(null);
  const firstDayTabRef = useRef<HTMLDivElement>(null);
  const firstSessionPillRef = useRef<HTMLButtonElement>(null);
  const addSessionNavButtonRef = useRef<HTMLButtonElement>(null);
  const restaurantListRef = useRef<HTMLDivElement>(null);
  const firstMenuItemRef = useRef<HTMLDivElement>(null);
  const categoriesRowRef = useRef<HTMLDivElement>(null);
  const resetRestaurantListRef = useRef<(() => void) | null>(null);

  // Use custom hooks
  const {
    categories,
    selectedCategory,
    selectedSubcategory,
    handleCategoryClick,
    selectMainsCategory,
    restaurants,
    restaurantsLoading,
    selectedDietaryFilters,
    toggleDietaryFilter,
  } = useCateringData({ expandedSessionIndex: activeSessionIndex });

  const {
    tutorialStep,
    tutorialPhase,
    currentTutorialStep,
    handleTutorialNext,
    handleSkipTutorial,
    triggerNavigationTutorial,
    triggerSessionCreated,
    resetTutorial,
    getTutorialSteps,
  } = useCateringTutorial({
    mealSessions,
    refs: {
      addDayNavButtonRef,
      backButtonRef,
      firstDayTabRef,
      firstSessionPillRef,
      addSessionNavButtonRef,
      categoriesRowRef,
      restaurantListRef,
      firstMenuItemRef,
      resetRestaurantListRef,
    },
  });

  // Get quantity for an item in the current session
  const getItemQuantity = (itemId: string): number => {
    const session = mealSessions[activeSessionIndex];
    if (!session) return 0;
    const orderItem = session.orderItems.find((oi) => oi.item.id === itemId);
    return orderItem?.quantity || 0;
  };

  // Handle adding item to cart
  const handleAddItem = (item: MenuItem) => {
    const BACKEND_QUANTITY_UNIT = item.cateringQuantityUnit || 7;
    const portionQuantity = item.portionQuantity || 1;
    const quantity = portionQuantity * BACKEND_QUANTITY_UNIT;

    addMenuItem(activeSessionIndex, {
      item: {
        id: item.id,
        menuItemName: item.menuItemName,
        description: item.description,
        price: item.price,
        discountPrice: item.discountPrice,
        allergens: item.allergens,
        dietaryFilters: item.dietaryFilters,
        isDiscount: item.isDiscount,
        image: item.image,
        restaurantId: item.restaurantId,
        restaurantName: item.restaurantName,
        groupTitle: item.groupTitle,
        cateringQuantityUnit: item.cateringQuantityUnit,
        feedsPerUnit: item.feedsPerUnit,
        itemDisplayOrder: item.itemDisplayOrder,
        addons: item.addons,
        selectedAddons: item.selectedAddons,
        categoryId: selectedCategory?.id,
        categoryName: selectedCategory?.name,
        subcategoryId: selectedSubcategory?.id || item.subcategoryId,
        subcategoryName: selectedSubcategory?.name || item.subcategoryName,
      },
      quantity,
    });
    setExpandedItemId(null);
  };

  // Handle updating item quantity
  const handleUpdateQuantity = (itemId: string, quantity: number) => {
    updateItemQuantity(activeSessionIndex, itemId, quantity);
  };

  // Handle opening modal for add/edit
  const handleAddOrderPress = (item: MenuItem) => {
    setExpandedItemId(item.id);
  };


  const basketColumnRef = useRef<HTMLDivElement>(null);
  const [basketHeight, setBasketHeight] = useState("100vh");
  useEffect(() => {
    const updateHeight = () => {
      if (basketColumnRef.current) {
        const top = Math.max(
          0,
          basketColumnRef.current.getBoundingClientRect().top,
        );
        setBasketHeight(`calc(100vh - ${top}px)`);
      }
    };
    updateHeight();
    window.addEventListener("scroll", updateHeight, { passive: true });
    window.addEventListener("resize", updateHeight);
    return () => {
      window.removeEventListener("scroll", updateHeight);
      window.removeEventListener("resize", updateHeight);
    };
  }, []);

  // Prefill cart from bundle query parameter
  useEffect(() => {
    const bundleId = searchParams.get("bundleId");
    if (!bundleId) return;

    const sessionDate = searchParams.get("sessionDate");
    const sessionTime = searchParams.get("sessionTime");

    const prefillFromBundle = async () => {
      try {
        const bundle = await cateringService.getBundleById(bundleId);
        const response = await cateringService.getMenuItems();
        const allMenuItems = (response || []).map((item: any) => ({
          id: item.id,
          menuItemName: item.name,
          description: item.description,
          price: item.price?.toString() || "0",
          discountPrice: item.discountPrice?.toString(),
          isDiscount: item.isDiscount || false,
          image: item.image,
          averageRating: item.averageRating?.toString(),
          restaurantId: item.restaurantId || "",
          cateringQuantityUnit: item.cateringQuantityUnit || 7,
          feedsPerUnit: item.feedsPerUnit || 10,
          groupTitle: item.groupTitle,
          status: item.status,
          itemDisplayOrder: item.itemDisplayOrder,
          addons: Array.isArray(item.addons) ? item.addons : [],
          allergens: Array.isArray(item.allergens) ? item.allergens : [],
          restaurant: {
            id: item.restaurantId,
            name: item.restaurant?.restaurant_name || "Unknown",
            restaurantId: item.restaurantId,
            menuGroupSettings: item.restaurant?.menuGroupSettings,
          },
          dietaryFilters: item.dietaryFilters,
        }));

        bundle.items.forEach((bundleItem) => {
          const menuItem = allMenuItems.find(
            (item: MenuItem) => item.id === bundleItem.menuItemId,
          );

          if (menuItem) {
            const itemWithAddons: MenuItem = {
              ...menuItem,
              selectedAddons: bundleItem.selectedAddons,
            };

            addMenuItem(activeSessionIndex, {
              item: itemWithAddons,
              quantity: bundleItem.quantity,
            });
          } else {
            console.warn(
              `Menu item ${bundleItem.menuItemId} not found in loaded menu items`,
            );
          }
        });

        if (sessionDate || sessionTime) {
          updateMealSession(activeSessionIndex, {
            ...(sessionDate && { sessionDate }),
            ...(sessionTime && { eventTime: sessionTime }),
          });
        }
      } catch (error) {
        console.error("Error loading bundle:", error);
      }
    };

    prefillFromBundle();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);

  // Check for pending item from menu view
  useEffect(() => {
    const pendingItemJson = localStorage.getItem("catering_pending_item");
    if (!pendingItemJson) return;

    try {
      const item = JSON.parse(pendingItemJson) as MenuItem;
      localStorage.removeItem("catering_pending_item");
      setPendingItem(item);
    } catch (error) {
      console.error("Error parsing pending item:", error);
      localStorage.removeItem("catering_pending_item");
    }
  }, []);

  // Validate minimum order requirements for current session
  const validationStatus = useMemo(() => {
    const activeSession = mealSessions[activeSessionIndex];
    if (!activeSession || restaurants.length === 0) {
      return [];
    }
    return validateSessionMinOrders(activeSession, restaurants);
  }, [mealSessions, activeSessionIndex, restaurants]);

  // Check if current session meets all minimum order requirements
  const isCurrentSessionValid = useMemo(() => {
    return validationStatus.every((status) => status.isValid);
  }, [validationStatus]);

  // Group sessions by day for timeline view
  const dayGroups = useMemo(() => {
    return groupSessionsByDay(mealSessions, getSessionTotal);
  }, [mealSessions, getSessionTotal]);

  // Get the current day group based on selected date
  const currentDayGroup = useMemo(() => {
    if (!selectedDayDate) return null;
    return dayGroups.find((g) => g.date === selectedDayDate) || null;
  }, [dayGroups, selectedDayDate]);

  // Sync selected day date with active session
  useEffect(() => {
    if (navMode !== "sessions" || activeSessionIndex === null) {
      return;
    }

    const activeSession = mealSessions[activeSessionIndex];
    if (!activeSession?.sessionDate) {
      return;
    }

    if (selectedDayDate !== activeSession.sessionDate) {
      setSelectedDayDate(activeSession.sessionDate);
    }
  }, [navMode, activeSessionIndex, mealSessions, selectedDayDate]);

  // Handle clicking a date tab
  const handleDateClick = (dayDate: string) => {
    setSelectedDayDate(dayDate);
    setNavMode("sessions");

    // Select first session on this day
    const dayGroup = dayGroups.find((g) => g.date === dayDate);
    if (dayGroup && dayGroup.sessions.length > 0) {
      setActiveSessionIndex(dayGroup.sessions[0].index);
    }
  };

  // Handle back to dates view
  const handleBackToDates = () => {
    if (selectedDayDate && currentDayGroup) {
      const sessionsToRemove = currentDayGroup.sessions
        .filter(
          ({ session }) =>
            session.orderItems.length === 0 && !session.eventTime,
        )
        .map(({ index }) => index)
        .sort((a, b) => b - a);

      sessionsToRemove.forEach((index) => {
        removeMealSession(index);
      });
    }
    setNavMode("dates");
    setSelectedDayDate(null);
  };

  // Handle session pill click
  const handleSessionPillClick = (sessionIndex: number) => {
    const session = mealSessions[sessionIndex];
    if (session?.sessionDate) {
      setSelectedDayDate(session.sessionDate);
      setNavMode("sessions");
    }
    setActiveSessionIndex(sessionIndex);
    setShowBundleBrowser(false);
  };

  // Handle navigation from min order modal to a specific section
  const handleMinOrderNavigate = (_restaurantId: string, section: string) => {
    if (!minOrderModalSession) return;

    const sessionIndex = minOrderModalSession.index;

    // Close the modal
    setMinOrderModalSession(null);

    // Ensure the session is active
    setActiveSessionIndex(sessionIndex);

    const session = mealSessions[sessionIndex];
    if (session?.sessionDate) {
      setSelectedDayDate(session.sessionDate);
      setNavMode("sessions");
    }

    // Try to find and select a category that matches the section name
    const matchingCategory = categories.find(
      (cat) => cat.name.toLowerCase() === section.toLowerCase(),
    );
    if (matchingCategory) {
      handleCategoryClick(matchingCategory);
    }
  };

  const isUnconfiguredDefaultSession = (
    session: MealSessionState | undefined,
  ) => {
    if (!session) return false;

    return (
      session.sessionName === "Main Event" &&
      !session.sessionDate &&
      !session.eventTime &&
      !session.guestCount &&
      !session.specialRequirements?.trim() &&
      session.orderItems.length === 0
    );
  };

  // Handle adding a new day — opens the SessionEditor directly
  const handleAddDay = () => {
    const newSession: MealSessionState = {
      sessionName: `Session ${mealSessions.length + 1}`,
      sessionDate: "",
      eventTime: "",
      orderItems: [],
    };

    const shouldReuseDefaultSession =
      mealSessions.length === 1 &&
      isUnconfiguredDefaultSession(mealSessions[0]);
    const newIndex = shouldReuseDefaultSession ? 0 : mealSessions.length;

    if (shouldReuseDefaultSession) {
      updateMealSession(0, newSession);
    } else {
      addMealSession(newSession);
    }

    setActiveSessionIndex(newIndex);
    selectMainsCategory();

    setTimeout(() => {
      setEditingSessionIndex(newIndex);
      setIsNewSession(true);
    }, 100);
  };

  // Handle adding session to a day
  const handleAddSessionToDay = (dayDate: string) => {
    const newSession: MealSessionState = {
      sessionName: `Session ${mealSessions.length + 1}`,
      sessionDate: dayDate,
      eventTime: "",
      orderItems: [],
    };

    const shouldReuseDefaultSession =
      mealSessions.length === 1 &&
      isUnconfiguredDefaultSession(mealSessions[0]);
    const newIndex = shouldReuseDefaultSession ? 0 : mealSessions.length;

    if (shouldReuseDefaultSession) {
      updateMealSession(0, newSession);
    } else {
      addMealSession(newSession);
    }

    setSelectedDayDate(dayDate);
    setNavMode("sessions");
    setActiveSessionIndex(newIndex);
    selectMainsCategory();

    setTimeout(() => {
      setEditingSessionIndex(newIndex);
      setIsNewSession(true);
    }, 150);
  };

  // Calculate totals
  const totalDays = dayGroups.filter((g) => g.date !== "unscheduled").length;
  const totalSessions = mealSessions.length;
  const totalItems = mealSessions.reduce(
    (acc, s) => acc + s.orderItems.reduce((sum, oi) => sum + oi.quantity, 0),
    0,
  );

  // Pricing summary
  const [pricing, setPricing] = useState<CateringPricingResult | null>(null);
  const [calculatingPricing, setCalculatingPricing] = useState(false);
  const pricingDebounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Delivery address for pricing — seeded from persisted contactInfo
  const [deliveryLocation, setDeliveryLocation] = useState<{
    latitude: number;
    longitude: number;
  } | null>(
    contactInfo?.latitude && contactInfo?.longitude
      ? { latitude: contactInfo.latitude, longitude: contactInfo.longitude }
      : null,
  );

  const handleDeliveryPlaceSelect = useCallback(
    (place: google.maps.places.PlaceResult) => {
      const lat = place.geometry?.location?.lat();
      const lng = place.geometry?.location?.lng();
      if (!lat || !lng) return;

      // Extract address components
      let addressLine1 = "";
      let city = "";
      let zipcode = "";
      place.address_components?.forEach((c) => {
        if (c.types.includes("street_number")) addressLine1 = c.long_name + " ";
        if (c.types.includes("route")) addressLine1 += c.long_name;
        if (c.types.includes("postal_town") || c.types.includes("locality"))
          city = c.long_name;
        if (c.types.includes("postal_code")) zipcode = c.long_name;
      });

      setDeliveryLocation({ latitude: lat, longitude: lng });

      // Persist to CateringContext so Step3 pre-fills the address
      setContactInfo({
        ...(contactInfo ?? ({} as ContactInfo)),
        addressLine1: addressLine1.trim() || place.formatted_address || "",
        city,
        zipcode,
        latitude: lat,
        longitude: lng,
      });

      const placeText = `${place.name || ""} ${place.formatted_address || ""}`;
      if (/halkin\s*-/i.test(placeText)) {
        setShowHalkinModal(true);
      }
    },
    [contactInfo, setContactInfo],
  );

  const handleClearDeliveryAddress = useCallback(() => {
    setDeliveryLocation(null);
    setPricing(null);
    setContactInfo({
      ...(contactInfo ?? ({} as ContactInfo)),
      addressLine1: "",
      city: "",
      zipcode: "",
      latitude: undefined,
      longitude: undefined,
    });
  }, [contactInfo, setContactInfo]);

  const fetchPricing = useCallback(
    async (sessions: MealSessionState[]) => {
      const hasItems = sessions.some((s) => s.orderItems.length > 0);
      if (!hasItems) {
        setPricing(null);
        return;
      }
      setCalculatingPricing(true);
      try {
        const result =
          await cateringService.calculateCateringPricingWithMealSessions(
            sessions,
            [],
            deliveryLocation ?? undefined,
          );
        if (result.isValid) setPricing(result);
      } catch {
        // silently ignore — pricing is best-effort in the sidebar
      } finally {
        setCalculatingPricing(false);
      }
    },
    [deliveryLocation],
  );

  useEffect(() => {
    if (pricingDebounceRef.current) clearTimeout(pricingDebounceRef.current);
    pricingDebounceRef.current = setTimeout(() => {
      fetchPricing(mealSessions);
    }, 600);
    return () => {
      if (pricingDebounceRef.current) clearTimeout(pricingDebounceRef.current);
    };
  }, [mealSessions, fetchPricing]);

  // Handle editor close
  const handleEditorClose = (cancelled: boolean) => {
    const sessionIndex = editingSessionIndex;
    const wasNewSession = isNewSession;

    if (cancelled && isNewSession && sessionIndex !== null) {
      removeMealSession(sessionIndex);
    }

    if (sessionIndex !== null && !cancelled) {
      setSessionValidationErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[sessionIndex];
        return newErrors;
      });
    }

    setEditingSessionIndex(null);
    setIsNewSession(false);

    if (sessionIndex !== null && !cancelled) {
      const session = mealSessions[sessionIndex];
      if (session?.sessionDate) {
        setSelectedDayDate(session.sessionDate);
        setNavMode("sessions");
      }
      setActiveSessionIndex(sessionIndex);

      if (wasNewSession && tutorialPhase === "navigation") {
        triggerSessionCreated();
      }
    }
  };

  // Handle remove session
  const handleRemoveSession = (index: number, e: React.MouseEvent) => {
    e.stopPropagation();
    setSessionToRemove(index);
  };

  const confirmRemoveSession = () => {
    if (sessionToRemove !== null) {
      const remainingSessions = mealSessions.filter(
        (_, index) => index !== sessionToRemove,
      );

      removeMealSession(sessionToRemove);

      if (remainingSessions.length === 0) {
        setSelectedDayDate(null);
        setNavMode("dates");
        setActiveSessionIndex(0);
      } else {
        const nextSessionIndex = Math.min(
          sessionToRemove,
          remainingSessions.length - 1,
        );
        const nextSession = remainingSessions[nextSessionIndex];

        setActiveSessionIndex(nextSessionIndex);
        setSelectedDayDate(nextSession?.sessionDate || null);
        setNavMode(nextSession?.sessionDate ? "sessions" : "dates");
      }

      setEditingSessionIndex(null);
      setSessionToRemove(null);
    }
  };

  // Toggle collapsed category
  const handleToggleCategory = (categoryName: string) => {
    setCollapsedCategories((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(categoryName)) {
        newSet.delete(categoryName);
      } else {
        newSet.add(categoryName);
      }
      return newSet;
    });
  };

  // Handle edit item from cart
  const handleEditItem = (itemIndex: number) => {
    setEditingItemIndex(itemIndex);
    setIsEditModalOpen(true);
  };

  // Handle remove item from cart
  const handleRemoveItem = (itemIndex: number) => {
    setRemoveItemIndex(itemIndex);
  };

  const confirmRemoveItem = () => {
    if (removeItemIndex !== null) {
      removeMenuItemByIndex(activeSessionIndex, removeItemIndex);
      setRemoveItemIndex(null);
    }
  };

  const handleRemoveBundle = (bundleId: string) => {
    const session = mealSessions[activeSessionIndex];
    if (!session) return;
    const indices = session.orderItems
      .map((item, idx) => (item.bundleId === bundleId ? idx : -1))
      .filter((idx) => idx !== -1)
      .sort((a, b) => b - a);
    indices.forEach((idx) => removeMenuItemByIndex(activeSessionIndex, idx));
  };

  // Handle swap item (for bundle items) — fetches from restaurant on demand
  const handleSwapItem = async (itemIndex: number) => {
    const session = mealSessions[activeSessionIndex];
    if (!session) return;
    const orderItem = session.orderItems[itemIndex];
    if (!orderItem) return;

    const item = orderItem.item as MenuItem;
    const restaurantId = item.restaurantId;

    setSwapItemIndex(itemIndex);
    setSwapAlternatives([]);

    if (!restaurantId) return;

    try {
      const response = await fetchWithAuth(
        `${API_BASE_URL}/menu-item/restaurant/${restaurantId}`,
      );
      const data = await response.json();
      const items: MenuItem[] = (data.menuItems || []).map(mapToMenuItem);
      const groupTitle = item.groupTitle;
      const alternatives = groupTitle
        ? items.filter((mi) => mi.groupTitle === groupTitle)
        : items;
      setSwapAlternatives(alternatives);
    } catch (error) {
      console.error("Failed to fetch swap alternatives:", error);
    }
  };

  const handleConfirmSwap = (newItem: MenuItem) => {
    if (swapItemIndex === null) return;
    const session = mealSessions[activeSessionIndex];
    if (!session) return;

    const oldOrderItem = session.orderItems[swapItemIndex];
    const backendQuantityUnit = newItem.cateringQuantityUnit || 7;
    const quantity =
      newItem.portionQuantity && newItem.portionQuantity > 0
        ? newItem.portionQuantity * backendQuantityUnit
        : oldOrderItem.quantity;

    updateMenuItemByIndex(activeSessionIndex, swapItemIndex, {
      item: {
        ...newItem,
        categoryId: oldOrderItem.item.categoryId,
        categoryName: oldOrderItem.item.categoryName,
        subcategoryId: oldOrderItem.item.subcategoryId,
        subcategoryName: oldOrderItem.item.subcategoryName,
      },
      quantity,
      bundleId: oldOrderItem.bundleId,
      bundleName: oldOrderItem.bundleName,
    });

    setSwapItemIndex(null);
    setSwapAlternatives([]);
  };

  // Handle save edited item
  const handleSaveEditedItem = (updatedItem: MenuItem) => {
    if (editingItemIndex === null) return;

    const BACKEND_QUANTITY_UNIT = updatedItem.cateringQuantityUnit || 7;
    const quantity = (updatedItem.portionQuantity || 1) * BACKEND_QUANTITY_UNIT;

    const originalOrderItem =
      mealSessions[activeSessionIndex].orderItems[editingItemIndex];
    const originalItem = originalOrderItem.item;

    updateMenuItemByIndex(activeSessionIndex, editingItemIndex, {
      item: {
        ...updatedItem,
        categoryId: originalItem.categoryId,
        categoryName: originalItem.categoryName,
        subcategoryId: originalItem.subcategoryId,
        subcategoryName: originalItem.subcategoryName,
        restaurantName:
          "restaurantName" in originalItem
            ? originalItem.restaurantName
            : originalItem.restaurant?.name,
      },
      quantity,
      bundleId: originalOrderItem.bundleId,
      bundleName: originalOrderItem.bundleName,
    });

    setIsEditModalOpen(false);
    setEditingItemIndex(null);
  };

  // Handle checkout
  const handleCheckout = () => {
    // Check for empty sessions
    if (mealSessions.length > 1) {
      const emptyIndex = mealSessions.findIndex(
        (session) => session.orderItems.length === 0,
      );
      if (emptyIndex !== -1) {
        setEmptySessionIndex(emptyIndex);
        return;
      }
    }

    // Check minimum order requirements
    for (let i = 0; i < mealSessions.length; i++) {
      const session = mealSessions[i];
      if (session.orderItems.length === 0) continue;

      const sessionValidation = validateSessionMinOrders(session, restaurants);
      const hasUnmetRequirements = sessionValidation.some(
        (status) => !status.isValid,
      );

      if (hasUnmetRequirements) {
        setActiveSessionIndex(i);
        setMinOrderModalSession({
          index: i,
          validation: sessionValidation,
        });
        return;
      }
    }

    // Check for missing date/time
    for (let i = 0; i < mealSessions.length; i++) {
      const session = mealSessions[i];
      const hasItems = session.orderItems.length > 0;
      const missingDate = !session.sessionDate;
      const missingTime = !session.eventTime;

      if (hasItems && (missingDate || missingTime)) {
        setActiveSessionIndex(i);
        setEditingSessionIndex(i);
        return;
      }
    }

    // Validate catering hours
    const errors: Record<number, string> = {};
    for (let i = 0; i < mealSessions.length; i++) {
      const session = mealSessions[i];
      if (session.orderItems.length === 0) continue;

      const restaurantIds = new Set(
        session.orderItems.map((oi) => oi.item.restaurantId),
      );

      for (const restaurantId of restaurantIds) {
        const restaurant = restaurants.find((r) => r.id === restaurantId);
        if (!restaurant) continue;

        const cateringHours = restaurant.cateringOperatingHours;
        if (!cateringHours || cateringHours.length === 0) continue;

        const selectedDateTime = new Date(session.sessionDate + "T00:00:00");
        const dayOfWeek = selectedDateTime
          .toLocaleDateString("en-US", { weekday: "long" })
          .toLowerCase();

        const formatTimeRange = (hour: number, minute: number) => {
          const period = hour >= 12 ? "PM" : "AM";
          const hour12 = hour % 12 || 12;
          return `${hour12}:${minute.toString().padStart(2, "0")} ${period}`;
        };

        // Check date overrides first
        const dateString = session.sessionDate;
        const dateOverride = restaurant.dateOverrides?.find(
          (o) => o.date === dateString,
        );

        if (dateOverride) {
          if (dateOverride.isClosed) {
            errors[i] =
              `${restaurant.restaurant_name} is closed on ${dateString}${dateOverride.reason ? ` (${dateOverride.reason})` : ""}. Please select a different date.`;
            break;
          }
          if (
            dateOverride.timeSlots &&
            dateOverride.timeSlots.length > 0 &&
            session.eventTime
          ) {
            const [eventHour, eventMinute] = session.eventTime
              .split(":")
              .map(Number);
            const eventMinutes = eventHour * 60 + eventMinute;
            const inAnySlot = dateOverride.timeSlots.some((slot) => {
              const [oh, om] = slot.open.split(":").map(Number);
              const [ch, cm] = slot.close.split(":").map(Number);
              return (
                eventMinutes >= oh * 60 + om && eventMinutes <= ch * 60 + cm
              );
            });
            if (!inAnySlot) {
              const slotDescs = dateOverride.timeSlots
                .map((s) => {
                  const [oh, om] = s.open.split(":").map(Number);
                  const [ch, cm] = s.close.split(":").map(Number);
                  return `${formatTimeRange(oh, om)} - ${formatTimeRange(ch, cm)}`;
                })
                .join(", ");
              errors[i] =
                `${restaurant.restaurant_name} only accepts orders between ${slotDescs} on ${dateString}.`;
              break;
            }
          }
        } else {
          // Regular weekly schedule
          const daySlots = cateringHours.filter(
            (schedule) =>
              schedule.day.toLowerCase() === dayOfWeek && schedule.enabled,
          );

          if (daySlots.length === 0) {
            errors[i] =
              `${restaurant.restaurant_name} does not accept event orders on ${dayOfWeek}s. Please select a different date for this session.`;
            break;
          }

          const enabledSlots = daySlots.filter((s) => s.open && s.close);
          if (enabledSlots.length > 0 && session.eventTime) {
            const [eventHour, eventMinute] = session.eventTime
              .split(":")
              .map(Number);
            const eventMinutes = eventHour * 60 + eventMinute;

            const inAnySlot = enabledSlots.some((slot) => {
              const [openHour, openMinute] = slot.open!.split(":").map(Number);
              const [closeHour, closeMinute] = slot
                .close!.split(":")
                .map(Number);
              return (
                eventMinutes >= openHour * 60 + openMinute &&
                eventMinutes <= closeHour * 60 + closeMinute
              );
            });

            if (!inAnySlot) {
              const slotDescs = enabledSlots
                .map((s) => {
                  const [oh, om] = s.open!.split(":").map(Number);
                  const [ch, cm] = s.close!.split(":").map(Number);
                  return `${formatTimeRange(oh, om)} - ${formatTimeRange(ch, cm)}`;
                })
                .join(", ");
              errors[i] =
                `${restaurant.restaurant_name} accepts event orders on ${dayOfWeek}s between ${slotDescs}. Please select a time within these hours for this session.`;
              break;
            }
          }
        }
      }
    }

    if (Object.keys(errors).length > 0) {
      setSessionValidationErrors(errors);
      const firstErrorSessionIndex = parseInt(Object.keys(errors)[0]);
      setActiveSessionIndex(firstErrorSessionIndex);
      return;
    }

    setSessionValidationErrors({});
    setCurrentStep(2);
  };

  // Handle remove empty session
  const handleRemoveEmptySession = () => {
    if (emptySessionIndex !== null) {
      removeMealSession(emptySessionIndex);
      setEmptySessionIndex(null);
    }
  };

  // Handle add items to empty session
  const handleAddItemsToEmptySession = () => {
    if (emptySessionIndex !== null) {
      const session = mealSessions[emptySessionIndex];
      const sessionDate = session?.sessionDate;

      setActiveSessionIndex(emptySessionIndex);

      if (sessionDate) {
        setSelectedDayDate(sessionDate);
        setNavMode("sessions");
      }

      setEmptySessionIndex(null);
    }
  };

  // Handle view menu - opens modal to choose with/without prices
  const handleViewMenu = () => {
    setShowPdfModal(true);
  };

  const handleClearAllItems = () => {
    // Remove sessions from highest index down. When the last one is removed,
    // the context resets to a single fresh default session.
    for (let i = mealSessions.length - 1; i >= 0; i--) {
      removeMealSession(i);
    }
    setActiveSessionIndex(0);
    setIsClearAllConfirmOpen(false);
    setIsMobileCartMenuOpen(false);
  };

  // Handle PDF download with selected price option
  const handlePdfDownload = async (withPrices: boolean) => {
    if (generatingPdf) return;
    setGeneratingPdf(true);
    try {
      const hasDeliveryQuote = deliveryLocation !== null;
      const pricingMealSessions = (pricing as any)?.mealSessions as
        | Array<{ deliveryFee?: number }>
        | undefined;
      // The API only sends non-empty sessions, so pricingMealSessions[i] corresponds
      // to the i-th non-empty local session. Build a local-index → deliveryFee map.
      const deliveryFeeByLocalIndex = new Map<number, number | undefined>();
      let pricingSessionIndex = 0;
      mealSessions.forEach((session, localIndex) => {
        if (session.orderItems.length > 0) {
          deliveryFeeByLocalIndex.set(
            localIndex,
            pricingMealSessions?.[pricingSessionIndex]?.deliveryFee,
          );
          pricingSessionIndex++;
        }
      });

      const sessionsForPreview: LocalMealSession[] = mealSessions.map(
        (session, index) => ({
          sessionName: session.sessionName,
          sessionDate: session.sessionDate,
          eventTime: session.eventTime,
          deliveryFee: hasDeliveryQuote
            ? deliveryFeeByLocalIndex.get(index)
            : undefined,
          orderItems: session.orderItems.map((orderItem) => ({
            item: {
              id: orderItem.item.id,
              menuItemName: orderItem.item.menuItemName,
              price: orderItem.item.price,
              discountPrice: orderItem.item.discountPrice,
              isDiscount: orderItem.item.isDiscount,
              image: orderItem.item.image,
              restaurantId: orderItem.item.restaurantId,
              cateringQuantityUnit: orderItem.item.cateringQuantityUnit,
              feedsPerUnit: orderItem.item.feedsPerUnit,
              categoryName: orderItem.item.categoryName,
              subcategoryName: orderItem.item.subcategoryName,
              selectedAddons: orderItem.item.selectedAddons,
              description: (orderItem.item as any).description,
              allergens: (orderItem.item as any).allergens,
              dietaryFilters: (orderItem.item as any).dietaryFilters,
            },
            quantity: orderItem.quantity,
          })),
        }),
      );

      const restaurantNameById = Object.fromEntries(
        restaurants.map((r) => [r.id, r.restaurant_name]),
      );
      const pdfAppliedPromotions = (pricing?.appliedPromotions || [])
        .map((p) => {
          const restaurantName = restaurantNameById[p.restaurantId];
          const label = restaurantName
            ? `${p.name} (${restaurantName})`
            : p.name;
          return { name: label, discountAmount: p.discount };
        })
        .filter((p) => p.discountAmount > 0);
      const pdfData = await transformLocalSessionsToPdfData(
        sessionsForPreview,
        withPrices,
        pricing?.deliveryFee || undefined,
        pricing?.promoDiscount || undefined,
        pdfAppliedPromotions.length > 0 ? pdfAppliedPromotions : undefined,
      );

      const blob = await pdf(
        <CateringMenuPdf
          sessions={pdfData.sessions}
          showPrices={pdfData.showPrices}
          deliveryCharge={pdfData.deliveryCharge}
          totalPrice={pricing?.total ?? pdfData.totalPrice}
          promoDiscount={pdfData.promoDiscount}
          appliedPromotions={pdfData.appliedPromotions}
          logoUrl={pdfData.logoUrl}
        />,
      ).toBlob();

      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = withPrices
        ? "catering-menu-with-prices.pdf"
        : "catering-menu.pdf";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      setShowPdfModal(false);
    } catch (error) {
      console.error("Failed to generate PDF:", error);
      alert("Failed to generate PDF. Please try again.");
    } finally {
      setGeneratingPdf(false);
    }
  };

  return (
    <div className="min-h-screen bg-base-100">
      {/* Session Editor Modal */}
      {editingSessionIndex !== null && (
        <SessionEditor
          session={mealSessions[editingSessionIndex]}
          sessionIndex={editingSessionIndex}
          onUpdate={updateMealSession}
          onClose={handleEditorClose}
          restaurants={restaurants}
          existingDates={dayGroups
            .filter((d) => d.date !== "unscheduled")
            .map((d) => ({
              date: d.date,
              dayName: d.dayName,
              displayDate: d.displayDate,
            }))}
        />
      )}

      {/* Two-Column Layout */}
      <div className="flex flex-col md:flex-row px-2">
        {/* Left Column: Session Nav + Menu Browser — centered in remaining space */}
        <div className="flex-1 min-w-0 flex flex-col">
          <DateSessionNav
            navMode={navMode}
            dayGroups={dayGroups}
            selectedDayDate={selectedDayDate}
            currentDayGroup={currentDayGroup}
            expandedSessionIndex={activeSessionIndex}

            onDateClick={handleDateClick}
            onBackToDates={handleBackToDates}
            onSessionPillClick={handleSessionPillClick}
            onAddDay={handleAddDay}
            onAddSessionToDay={handleAddSessionToDay}
            formatTimeDisplay={formatTimeDisplay}
            addDayNavButtonRef={addDayNavButtonRef}
            backButtonRef={backButtonRef}
            firstDayTabRef={firstDayTabRef}
            firstSessionPillRef={firstSessionPillRef}
            addSessionNavButtonRef={addSessionNavButtonRef}
          />
          <div className="max-w-6xl mx-auto w-full px-2 md:px-6">
            <MenuBrowserColumn
              showBundleBrowser={showBundleBrowser}
              onToggleBundleBrowser={setShowBundleBrowser}
              sessionIndex={activeSessionIndex}
              defaultGuestCount={
                mealSessions[activeSessionIndex]?.guestCount ?? 1
              }
              restaurants={restaurants}
              restaurantsLoading={restaurantsLoading}
              onAddItem={handleAddItem}
              onUpdateQuantity={handleUpdateQuantity}
              onAddOrderPress={handleAddOrderPress}
              getItemQuantity={getItemQuantity}
              expandedItemId={expandedItemId}
              setExpandedItemId={setExpandedItemId}
              selectedDietaryFilters={selectedDietaryFilters}
              toggleDietaryFilter={toggleDietaryFilter}
              restaurantListRef={restaurantListRef}
              firstMenuItemRef={firstMenuItemRef}
              categoriesRowRef={categoriesRowRef}
              expandedSessionIndex={activeSessionIndex}
              onRegisterResetToList={(fn) => {
                resetRestaurantListRef.current = fn;
              }}
            />
          </div>
        </div>

        {/* Right Column: Basket — full-height sticky sidebar */}
        <div
          ref={basketColumnRef}
          className="hidden md:flex md:w-96 flex-shrink-0 flex-col sticky top-0 overflow-hidden"
          style={{ height: basketHeight }}
        >
          {mealSessions[activeSessionIndex] && (
            <div className="flex h-full flex-col gap-2 overflow-hidden">
              <ActiveSessionPanel
                session={mealSessions[activeSessionIndex]}
                sessionIndex={activeSessionIndex}
                sessionTotal={getSessionTotal(activeSessionIndex)}
                sessionPromotions={
                  getSessionDiscount(activeSessionIndex).promotions
                }
                validationError={
                  sessionValidationErrors[activeSessionIndex] || null
                }
                isUnscheduled={!mealSessions[activeSessionIndex].sessionDate}
                canRemove={mealSessions.length > 1}
                onEditSession={() => setEditingSessionIndex(activeSessionIndex)}
                onRemoveSession={(e) =>
                  handleRemoveSession(activeSessionIndex, e)
                }
                onEditItem={handleEditItem}
                onRemoveItem={handleRemoveItem}
                onSwapItem={handleSwapItem}
                onRemoveBundle={handleRemoveBundle}
                collapsedCategories={collapsedCategories}
                onToggleCategory={handleToggleCategory}
                onViewMenu={handleViewMenu}
                isCurrentSessionValid={isCurrentSessionValid}
                totalPrice={getTotalPrice()}
                onCheckout={handleCheckout}
                showCheckoutButton={false}
                restaurants={restaurants}
              />
              <div className="mt-auto flex-shrink-0 flex flex-col gap-1.5 pb-4">
                {totalItems > 0 && (
                  <div className="px-2 pb-1 border-t border-base-300 pt-3">
                    <PricingSummary
                      pricing={pricing}
                      calculatingPricing={calculatingPricing}
                      compact
                      onPlaceSelect={handleDeliveryPlaceSelect}
                      onClearAddress={handleClearDeliveryAddress}
                    />
                  </div>
                )}
                <div className="flex w-full items-stretch gap-2 px-2">
                  {mealSessions.length > 0 && (
                    <div className="relative flex-shrink-0">
                      <button
                        ref={desktopMenuBtnRef}
                        onClick={() => {
                          if (
                            !isDesktopCartMenuOpen &&
                            desktopMenuBtnRef.current
                          ) {
                            const rect =
                              desktopMenuBtnRef.current.getBoundingClientRect();
                            setDesktopMenuPos({
                              bottom: window.innerHeight - rect.top + 8,
                              left: rect.left,
                            });
                          }
                          setIsDesktopCartMenuOpen((v) => !v);
                        }}
                        className="flex h-full items-center justify-center rounded-lg border border-base-300 px-3 text-base-content/60 transition-colors hover:bg-base-200"
                        title="More options"
                      >
                        <MoreHorizontal className="h-4 w-4" />
                      </button>
                      {isDesktopCartMenuOpen && (
                        <>
                          <div
                            className="fixed inset-0 z-40"
                            onClick={() => setIsDesktopCartMenuOpen(false)}
                          />
                          <div
                            className="fixed z-50 w-44 overflow-hidden rounded-xl border border-base-200 bg-white shadow-lg"
                            style={{
                              bottom: desktopMenuPos.bottom,
                              left: desktopMenuPos.left,
                            }}
                          >
                            <button
                              onClick={() => {
                                setIsDesktopCartMenuOpen(false);
                                handleViewMenu();
                              }}
                              disabled={generatingPdf || totalItems === 0}
                              className="flex w-full items-center gap-2 px-3 py-2.5 text-left text-sm text-gray-700 transition-colors hover:bg-base-100 disabled:cursor-not-allowed disabled:opacity-50"
                            >
                              {generatingPdf ? (
                                <span className="loading loading-spinner loading-xs" />
                              ) : (
                                <svg
                                  xmlns="http://www.w3.org/2000/svg"
                                  className="h-4 w-4"
                                  fill="none"
                                  viewBox="0 0 24 24"
                                  stroke="currentColor"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
                                  />
                                </svg>
                              )}
                              Download Menu
                            </button>
                            <button
                              onClick={() => {
                                setIsDesktopCartMenuOpen(false);
                                setIsClearAllConfirmOpen(true);
                              }}
                              className="flex w-full items-center gap-2 border-t border-base-200 px-3 py-2.5 text-left text-sm text-red-600 transition-colors hover:bg-red-50"
                            >
                              <Trash2 className="h-4 w-4" />
                              Clear Cart
                            </button>
                          </div>
                        </>
                      )}
                    </div>
                  )}
                  <button
                    onClick={handleCheckout}
                    className={`flex flex-1 items-center justify-center rounded-lg px-3 py-3 text-sm font-semibold text-white transition-colors ${
                      isCurrentSessionValid
                        ? "bg-primary hover:bg-primary/90"
                        : "bg-warning hover:bg-warning/90"
                    }`}
                  >
                    {isCurrentSessionValid ? "Checkout" : "Min. Order Not Met"}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Mobile: View Order Bar */}
      <div className="fixed bottom-0 left-0 right-0 md:hidden z-50">
          {/* Session detail pill */}
          <div className="flex justify-center items-center gap-2 pb-2 px-4">
            <button
              onClick={() => setEditingSessionIndex(activeSessionIndex)}
              className="flex flex-col items-center px-3 py-1.5 rounded-2xl bg-white/50 backdrop-blur-sm shadow-sm border border-base-200 text-left"
            >
              <span className="text-xs font-semibold text-gray-800">
                {mealSessions[activeSessionIndex]?.sessionName}
              </span>
              <span className="text-[10px] text-gray-500">
                {mealSessions[activeSessionIndex]?.sessionDate
                  ? new Date(
                      mealSessions[activeSessionIndex].sessionDate,
                    ).toLocaleDateString("en-GB", {
                      weekday: "short",
                      day: "numeric",
                      month: "short",
                    })
                  : "Date not set"}
                {mealSessions[activeSessionIndex]?.eventTime &&
                  ` · ${formatTimeDisplay(mealSessions[activeSessionIndex].eventTime)}`}
              </span>
            </button>
            <div className="relative">
              <button
                onClick={() => setIsMobileCartMenuOpen((v) => !v)}
                className="flex h-9 w-9 items-center justify-center rounded-full border border-base-200 bg-white/70 text-gray-700 shadow-sm backdrop-blur-sm transition-colors hover:bg-white"
                title="More actions"
              >
                <MoreHorizontal className="h-4 w-4" />
              </button>
              {isMobileCartMenuOpen && (
                <>
                  <div
                    className="fixed inset-0 z-40"
                    onClick={() => setIsMobileCartMenuOpen(false)}
                  />
                  <div className="absolute bottom-full right-0 z-50 mb-2 w-44 overflow-hidden rounded-xl border border-base-200 bg-white shadow-lg">
                    <button
                      onClick={() => {
                        setIsMobileCartMenuOpen(false);
                        handleViewMenu();
                      }}
                      disabled={generatingPdf || totalItems === 0}
                      className="flex w-full items-center gap-2 px-3 py-2.5 text-left text-sm text-gray-700 transition-colors hover:bg-base-100 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-4 w-4"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
                        />
                      </svg>
                      Download Menu
                    </button>
                    <button
                      onClick={() => {
                        setIsMobileCartMenuOpen(false);
                        resetTutorial();
                        setNavMode("dates");
                        setSelectedDayDate(null);
                      }}
                      className="flex w-full items-center gap-2 px-3 py-2.5 text-left text-sm text-gray-700 transition-colors hover:bg-base-100"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      Tutorial
                    </button>
                    <div className="mx-3 border-t border-base-200" />
                    <button
                      onClick={() => {
                        setIsMobileCartMenuOpen(false);
                        setIsClearAllConfirmOpen(true);
                      }}
                      className="flex w-full items-center gap-2 px-3 py-2.5 text-left text-sm text-red-600 transition-colors hover:bg-red-50"
                    >
                      <Trash2 className="h-4 w-4" />
                      Clear Cart
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
          {/* View Order bar */}
          {mealSessions.some((s) => s.orderItems.length > 0) && (
            <div className="p-4 bg-primary">
              <button
                onClick={() => setIsViewOrderOpen(true)}
                className="w-full flex items-center justify-between text-white"
              >
                <div className="flex items-center gap-2">
                  <ShoppingBag className="w-5 h-5" />
                  <span className="font-semibold">View Order</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-lg font-bold">
                    £{getTotalPrice().toFixed(2)}
                  </span>
                  <span className="text-sm opacity-80">{totalItems} items</span>
                </div>
              </button>
            </div>
          )}
        </div>

      {/* Mobile: View Order Modal */}
      <ViewOrderModal
        isOpen={isViewOrderOpen}
        onClose={() => setIsViewOrderOpen(false)}
        mealSessions={mealSessions}
        activeSessionIndex={activeSessionIndex}
        onSessionChange={setActiveSessionIndex}
        getSessionTotal={getSessionTotal}
        getSessionDiscount={getSessionDiscount}
        validationErrors={sessionValidationErrors}
        onEditSession={(index) => {
          setIsViewOrderOpen(false);
          setEditingSessionIndex(index);
        }}
        onRemoveSession={(index, e) => handleRemoveSession(index, e)}
        onEditItem={handleEditItem}
        onRemoveItem={handleRemoveItem}
        onSwapItem={handleSwapItem}
        onRemoveBundle={handleRemoveBundle}
        collapsedCategories={collapsedCategories}
        onToggleCategory={handleToggleCategory}
        onViewMenu={handleViewMenu}
        generatingPdf={generatingPdf}
        isCurrentSessionValid={isCurrentSessionValid}
        totalPrice={getTotalPrice()}
        onCheckout={handleCheckout}
        canRemoveSession={() => mealSessions.length > 1}
        formatTimeDisplay={formatTimeDisplay}
        navMode={navMode}
        dayGroups={dayGroups}
        selectedDayDate={selectedDayDate}
        currentDayGroup={currentDayGroup}
        onDateClick={handleDateClick}
        onBackToDates={handleBackToDates}
        onAddDay={handleAddDay}
        onAddSessionToDay={handleAddSessionToDay}
        restaurants={restaurants}
        pricing={pricing}
        calculatingPricing={calculatingPricing}
        onPlaceSelect={handleDeliveryPlaceSelect}
        onClearAddress={handleClearDeliveryAddress}
      />

      {/* Edit Item Modal */}
      {isEditModalOpen && editingItemIndex !== null && (
        <MenuItemModal
          item={
            mealSessions[activeSessionIndex].orderItems[editingItemIndex]
              .item as MenuItem
          }
          isOpen={isEditModalOpen}
          onClose={() => {
            setIsEditModalOpen(false);
            setEditingItemIndex(null);
          }}
          quantity={
            mealSessions[activeSessionIndex].orderItems[editingItemIndex]
              .quantity
          }
          isEditMode={true}
          editingIndex={editingItemIndex}
          onAddItem={handleSaveEditedItem}
          onRemoveItem={(index) => {
            removeMenuItemByIndex(activeSessionIndex, index);
            setIsEditModalOpen(false);
            setEditingItemIndex(null);
          }}
        />
      )}

      {/* Pending Item Modal */}
      {pendingItem && (
        <MenuItemModal
          item={pendingItem}
          isOpen={true}
          onClose={() => setPendingItem(null)}
          quantity={0}
          onAddItem={(item) => {
            handleAddItem(item);
            setPendingItem(null);
          }}
        />
      )}

      {/* Empty Session Warning Modal */}
      {emptySessionIndex !== null && (
        <EmptySessionWarningModal
          sessionName={
            mealSessions[emptySessionIndex]?.sessionName || "Session"
          }
          onRemove={handleRemoveEmptySession}
          onAddItems={handleAddItemsToEmptySession}
        />
      )}

      {/* Remove Item Confirmation Modal */}
      {removeItemIndex !== null && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[100] p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center">
                <X className="h-6 w-6 text-red-600" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-900">Remove Item</h3>
                <p className="text-sm text-gray-500">
                  {mealSessions[activeSessionIndex]?.orderItems[removeItemIndex]
                    ?.item.menuItemName || "Item"}
                </p>
              </div>
            </div>
            <p className="text-gray-600 mb-6">
              Are you sure you want to remove this item from your order?
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setRemoveItemIndex(null)}
                className="flex-1 px-4 py-3 border border-base-300 text-gray-600 rounded-xl hover:bg-base-100 transition-colors font-medium"
              >
                Cancel
              </button>
              <button
                onClick={confirmRemoveItem}
                className="flex-1 px-4 py-3 bg-red-500 text-white rounded-xl hover:bg-red-600 transition-colors font-medium"
              >
                Remove
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Remove Session Confirmation Modal */}
      {sessionToRemove !== null && (
        <RemoveSessionConfirmModal
          sessionName={mealSessions[sessionToRemove]?.sessionName || "Session"}
          onConfirm={confirmRemoveSession}
          onCancel={() => setSessionToRemove(null)}
        />
      )}

      {/* Clear All Items Confirmation Modal */}
      {isClearAllConfirmOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
            <div className="mb-4 flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-red-100">
                <Trash2 className="h-6 w-6 text-red-600" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-900">Clear Cart</h3>
                <p className="text-sm text-gray-500">
                  Remove all items and sessions
                </p>
              </div>
            </div>
            <p className="mb-6 text-gray-600">
              This will delete every session and remove all items you&apos;ve
              added, returning your order to a single empty session. This action
              cannot be undone.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setIsClearAllConfirmOpen(false)}
                className="flex-1 rounded-xl border border-base-300 px-4 py-3 font-medium text-gray-600 transition-colors hover:bg-base-100"
              >
                Cancel
              </button>
              <button
                onClick={handleClearAllItems}
                className="flex-1 rounded-xl bg-red-500 px-4 py-3 font-medium text-white transition-colors hover:bg-red-600"
              >
                Clear All
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Min Order Modal */}
      {minOrderModalSession !== null && (
        <MinOrderModal
          sessionName={
            mealSessions[minOrderModalSession.index]?.sessionName || "Session"
          }
          validationStatus={minOrderModalSession.validation}
          onClose={() => setMinOrderModalSession(null)}
          onNavigateToSection={handleMinOrderNavigate}
        />
      )}

      {showHalkinModal && (
        <HalkinVenueModal onClose={() => setShowHalkinModal(false)} />
      )}

      {/* PDF Download Modal */}
      {showPdfModal && (
        <PdfDownloadModal
          onDownload={handlePdfDownload}
          onClose={() => setShowPdfModal(false)}
          isGenerating={generatingPdf}
        />
      )}

      {/* Swap Item Modal */}
      {swapItemIndex !== null && (
        <SwapItemModal
          currentItem={
            mealSessions[activeSessionIndex]?.orderItems[swapItemIndex]
              ?.item as MenuItem
          }
          currentQuantity={
            mealSessions[activeSessionIndex]?.orderItems[swapItemIndex]
              ?.quantity ?? 0
          }
          alternatives={swapAlternatives}
          isOpen={true}
          onClose={() => {
            setSwapItemIndex(null);
            setSwapAlternatives([]);
          }}
          onSwap={handleConfirmSwap}
        />
      )}

      {/* Tutorial Tooltip */}
      <TutorialTooltip
        step={currentTutorialStep}
        onNext={handleTutorialNext}
        onSkip={handleSkipTutorial}
        currentStepIndex={tutorialStep ?? 0}
        totalSteps={getTutorialSteps().length}
      />

      {/* Tutorial Help Button */}
      <button
        onClick={() => {
          resetTutorial();
          setNavMode("dates");
          setSelectedDayDate(null);
        }}
        className="hidden md:flex fixed bottom-4 left-4 md:bottom-8 md:left-8 w-10 h-10 md:w-12 md:h-12 bg-white border border-base-300 rounded-full shadow-lg items-center justify-center text-gray-500 hover:text-primary hover:border-primary transition-colors z-40"
        title="Restart Tutorial"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-5 w-5 md:h-6 md:w-6"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
      </button>
    </div>
  );
}
