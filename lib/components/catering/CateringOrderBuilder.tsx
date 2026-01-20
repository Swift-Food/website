"use client";

import { useState, useRef, useEffect, useMemo } from "react";
import { useSearchParams } from "next/navigation";
import { useCatering } from "@/context/CateringContext";
import {
  MealSessionState,
  CategoryWithSubcategories,
  Subcategory,
  MenuItemDetails,
} from "@/types/catering.types";
import { categoryService } from "@/services/api/category.api";
import { cateringService } from "@/services/api/catering.api";
import MenuItemCard from "./MenuItemCard";
import MenuItemModal from "./MenuItemModal";
import { MenuItem, Restaurant } from "./Step2MenuItems";
import SelectedItemsByCategory from "./SelectedItemsByCategory";
import {
  LocalMealSession,
  transformLocalSessionsToPdfData,
} from "@/lib/utils/menuPdfUtils";
import { pdf } from "@react-pdf/renderer";
import { CateringMenuPdf } from "@/lib/components/pdf/CateringMenuPdf";
import { API_BASE_URL, API_ENDPOINTS } from "@/lib/constants/api";
import { fetchWithAuth } from "@/lib/api-client/auth-client";
import { validateSessionMinOrders } from "@/lib/utils/catering-min-order-validation";

// Icons from lucide-react
import {
  ChevronDown,
  ChevronUp,
  ChevronLeft,
  Plus,
  Clock,
  ShoppingBag,
  Calendar,
  X,
} from "lucide-react";

// Day grouping interface and helper
interface DayGroup {
  date: string; // ISO date string or 'unscheduled'
  displayDate: string; // "11 Dec"
  fullDate: string; // "11 December 2024"
  dayName: string; // "Wed"
  sessions: { session: MealSessionState; index: number }[];
  total: number;
}

function groupSessionsByDay(
  sessions: MealSessionState[],
  getSessionTotal: (index: number) => number
): DayGroup[] {
  const groups: Map<string, DayGroup> = new Map();

  sessions.forEach((session, index) => {
    const date = session.sessionDate || "unscheduled";
    if (!groups.has(date)) {
      const dateObj =
        date !== "unscheduled" ? new Date(date + "T00:00:00") : null;
      groups.set(date, {
        date,
        displayDate:
          dateObj?.toLocaleDateString("en-GB", {
            day: "numeric",
            month: "short",
          }) || "No Date",
        fullDate:
          dateObj?.toLocaleDateString("en-GB", {
            day: "numeric",
            month: "long",
            year: "numeric",
          }) || "Unscheduled",
        dayName:
          dateObj?.toLocaleDateString("en-GB", { weekday: "short" }) || "",
        sessions: [],
        total: 0,
      });
    }
    const group = groups.get(date)!;
    group.sessions.push({ session, index });
    group.total += getSessionTotal(index);
  });

  // Sort sessions within each group by eventTime
  groups.forEach((group) => {
    group.sessions.sort((a, b) => {
      if (!a.session.eventTime && !b.session.eventTime) return 0;
      if (!a.session.eventTime) return 1;
      if (!b.session.eventTime) return -1;
      return a.session.eventTime.localeCompare(b.session.eventTime);
    });
  });

  // Sort groups by date
  return Array.from(groups.values()).sort((a, b) => {
    if (a.date === "unscheduled") return 1;
    if (b.date === "unscheduled") return -1;
    return a.date.localeCompare(b.date);
  });
}

// Hour and minute options for time picker
const HOUR_12_OPTIONS = Array.from({ length: 12 }, (_, i) => ({
  label: `${i + 1}`,
  value: String(i + 1).padStart(2, "0"),
}));

const MINUTE_OPTIONS = [
  { label: "00", value: "00" },
  { label: "15", value: "15" },
  { label: "30", value: "30" },
  { label: "45", value: "45" },
];

interface SessionEditorProps {
  session: MealSessionState;
  sessionIndex: number;
  onUpdate: (index: number, updates: Partial<MealSessionState>) => void;
  onClose: (cancelled: boolean) => void;
  restaurants: Restaurant[];
}

function SessionEditor({
  session,
  sessionIndex,
  onUpdate,
  onClose,
  restaurants,
}: SessionEditorProps) {
  const [sessionName, setSessionName] = useState(session.sessionName);
  const [sessionDate, setSessionDate] = useState(session.sessionDate);
  const [selectedHour, setSelectedHour] = useState(() => {
    if (session.eventTime) {
      const h = session.eventTime.split(":")[0];
      const hour12 = Number(h) % 12 || 12;
      return String(hour12).padStart(2, "0");
    }
    return "";
  });
  const [selectedMinute, setSelectedMinute] = useState(() => {
    if (session.eventTime) {
      return session.eventTime.split(":")[1];
    }
    return "00";
  });
  const [selectedPeriod, setSelectedPeriod] = useState(() => {
    if (session.eventTime) {
      const hour = Number(session.eventTime.split(":")[0]);
      return hour >= 12 ? "PM" : "AM";
    }
    return "AM";
  });
  const [validationError, setValidationError] = useState<string | null>(null);

  const handleCancel = () => {
    onClose(true);
  };

  const getMinDate = () => {
    const date = new Date();
    return date.toISOString().split("T")[0];
  };

  const getMaxDate = () => {
    const date = new Date();
    date.setMonth(date.getMonth() + 3);
    return date.toISOString().split("T")[0];
  };

  const handleSave = () => {
    // Clear any previous errors
    setValidationError(null);

    // Calculate event time if hour and minute are set
    let eventTime = "";
    if (selectedHour && selectedMinute) {
      let hourNum = Number(selectedHour) % 12;
      if (selectedPeriod === "PM") hourNum += 12;
      if (selectedPeriod === "AM" && hourNum === 12) hourNum = 0;
      eventTime = `${String(hourNum).padStart(2, "0")}:${selectedMinute}`;
    }

    // Validate that date and time are set before saving
    if (!sessionDate) {
      setValidationError("Please select a date for this session.");
      return;
    }
    if (!eventTime) {
      setValidationError("Please select a time for this session.");
      return;
    }

    // Validate catering operation hours
    // Get unique restaurant IDs from session items
    const restaurantIds = new Set(
      session.orderItems.map((oi) => oi.item.restaurantId)
    );

    // Check each restaurant's catering hours
    for (const restaurantId of restaurantIds) {
      const restaurant = restaurants.find((r) => r.id === restaurantId);
      if (!restaurant) continue;

      const cateringHours = restaurant.cateringOperatingHours;
      if (!cateringHours || cateringHours.length === 0) continue;

      // Get day of week from selected date
      const selectedDateTime = new Date(sessionDate + "T00:00:00");
      const dayOfWeek = selectedDateTime
        .toLocaleDateString("en-US", { weekday: "long" })
        .toLowerCase();

      // Find the schedule for this day
      const daySchedule = cateringHours.find(
        (schedule) => schedule.day.toLowerCase() === dayOfWeek
      );

      if (!daySchedule || !daySchedule.enabled) {
        setValidationError(
          `${restaurant.restaurant_name} does not accept event orders on ${dayOfWeek}s. Please select a different date.`
        );
        return;
      }

      // Check if time is within operating hours
      if (daySchedule.open && daySchedule.close) {
        const [eventHour, eventMinute] = eventTime.split(":").map(Number);
        const [openHour, openMinute] = daySchedule.open.split(":").map(Number);
        const [closeHour, closeMinute] = daySchedule.close
          .split(":")
          .map(Number);

        const eventMinutes = eventHour * 60 + eventMinute;
        const openMinutes = openHour * 60 + openMinute;
        const closeMinutes = closeHour * 60 + closeMinute;

        if (eventMinutes < openMinutes || eventMinutes > closeMinutes) {
          const formatTime = (hour: number, minute: number) => {
            const period = hour >= 12 ? "PM" : "AM";
            const hour12 = hour % 12 || 12;
            return `${hour12}:${minute.toString().padStart(2, "0")} ${period}`;
          };

          setValidationError(
            `${restaurant.restaurant_name} accepts event orders on ${dayOfWeek}s between ${formatTime(openHour, openMinute)} and ${formatTime(closeHour, closeMinute)}. Please select a time within these hours.`
          );
          return;
        }
      }
    }

    onUpdate(sessionIndex, {
      sessionName: sessionName || "Untitled Session",
      sessionDate,
      eventTime,
    });
    onClose(false);
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[100] p-4">
      <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl overflow-hidden">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
            <Clock className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-gray-900">Edit Session</h3>
            <p className="text-sm text-gray-500">
              Update session details
            </p>
          </div>
        </div>

        <div className="flex flex-col gap-4">
          {/* Session Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Session Name
            </label>
            <input
              type="text"
              value={sessionName}
              onChange={(e) => setSessionName(e.target.value)}
              placeholder="e.g., Breakfast, Lunch, Dinner"
              className="w-full px-4 py-3 border border-base-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
            />
          </div>

          {/* Date */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Date
            </label>
            <input
              type="date"
              value={sessionDate}
              onChange={(e) => {
                setSessionDate(e.target.value);
                setValidationError(null);
              }}
              min={getMinDate()}
              max={getMaxDate()}
              className="w-full px-4 py-3 border border-base-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary appearance-none bg-white min-w-0 box-border"
              style={{ WebkitAppearance: 'none' }}
            />
          </div>

          {/* Time */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Time
            </label>
            <div className="flex items-center gap-2">
              <select
                value={selectedHour}
                onChange={(e) => {
                  setSelectedHour(e.target.value);
                  setValidationError(null);
                }}
                className="flex-1 px-4 py-3 border border-base-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
              >
                <option value="">HH</option>
                {HOUR_12_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
              <span className="text-gray-400">:</span>
              <select
                value={selectedMinute}
                onChange={(e) => {
                  setSelectedMinute(e.target.value);
                  setValidationError(null);
                }}
                className="flex-1 px-4 py-3 border border-base-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
              >
                {MINUTE_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
              <select
                value={selectedPeriod}
                onChange={(e) => {
                  setSelectedPeriod(e.target.value);
                  setValidationError(null);
                }}
                className="flex-1 px-4 py-3 border border-base-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
              >
                <option value="AM">AM</option>
                <option value="PM">PM</option>
              </select>
            </div>
          </div>
        </div>

        {/* Validation Error */}
        {validationError && (
          <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-xl flex items-start gap-2">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5 text-red-500 flex-shrink-0 mt-0.5"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                clipRule="evenodd"
              />
            </svg>
            <p className="text-sm text-red-700">{validationError}</p>
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-3 mt-6">
          <button
            onClick={handleCancel}
            className="flex-1 px-4 py-3 border border-base-300 text-gray-600 rounded-xl hover:bg-base-100 transition-colors font-medium"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="flex-1 px-4 py-3 bg-primary text-white rounded-xl hover:bg-primary/90 transition-colors font-medium"
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
}

// Session Accordion Component Props
interface SessionAccordionProps {
  session: MealSessionState;
  isExpanded: boolean;
  onToggle: () => void;
  sessionTotal: number;
  accordionRef: (el: HTMLDivElement | null) => void;
  onEditSession: () => void;
  onRemoveSession: (e: React.MouseEvent) => void;
  canRemove: boolean;
  children?: React.ReactNode;
}

function SessionAccordion({
  session,
  isExpanded,
  onToggle,
  sessionTotal,
  accordionRef,
  onEditSession,
  onRemoveSession,
  canRemove,
  children,
}: SessionAccordionProps) {
  // Total quantity of all items (not just unique items)
  const totalItemCount = session.orderItems.reduce((sum, oi) => sum + oi.quantity, 0);

  // Format time for display
  const formatTime = (eventTime: string | undefined) => {
    if (!eventTime) return "Time not set";
    const [hours, minutes] = eventTime.split(":");
    const hour = parseInt(hours);
    const period = hour >= 12 ? "PM" : "AM";
    const hour12 = hour % 12 || 12;
    return `${hour12}:${minutes} ${period}`;
  };

  return (
    <div
      ref={accordionRef}
      className="bg-white rounded-xl shadow-sm border border-base-200"
    >
      {/* Header */}
      <button
        onClick={onToggle}
        className="w-full px-3 py-3 md:px-5 md:py-4 flex items-center justify-between hover:bg-base-50 transition-colors"
      >
        <div className="flex items-center gap-2 md:gap-4">
          <div
            className={`w-8 h-8 md:w-10 md:h-10 rounded-full flex items-center justify-center ${
              isExpanded ? "bg-primary" : "bg-base-200"
            }`}
          >
            <Clock
              className={`w-4 h-4 md:w-5 md:h-5 ${
                isExpanded ? "text-white" : "text-gray-500"
              }`}
            />
          </div>
          <div className="text-left">
            <p className="text-sm md:text-base font-semibold text-gray-800">{session.sessionName}</p>
            <p className="text-xs md:text-sm text-gray-500">
              {formatTime(session.eventTime)}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 md:gap-4">
          {/* Desktop: items shown inline */}
          <div className="hidden md:flex items-center gap-2 text-gray-500">
            <ShoppingBag className="w-4 h-4" />
            <span className="text-sm">{totalItemCount} items</span>
          </div>
          {/* Price and items (mobile: stacked, desktop: inline) */}
          <div className="text-right">
            <span className="text-sm md:text-base font-semibold text-primary">
              £{sessionTotal.toFixed(2)}
            </span>
            {/* Mobile: items shown below price */}
            <p className="md:hidden text-[10px] text-gray-500">{totalItemCount} items</p>
          </div>
          {isExpanded ? (
            <ChevronUp className="w-4 h-4 md:w-5 md:h-5 text-gray-400" />
          ) : (
            <ChevronDown className="w-4 h-4 md:w-5 md:h-5 text-gray-400" />
          )}
        </div>
      </button>

      {/* Expanded Content */}
      {isExpanded && (
        <div className="px-3 pb-3 md:px-5 md:pb-5 border-t border-base-200">
          <div className="flex items-center justify-between py-2 md:py-3">
            <button
              onClick={(e) => {
                e.stopPropagation();
                onEditSession();
              }}
              className="flex items-center gap-1 md:gap-2 text-xs md:text-sm text-gray-600 hover:text-primary transition-colors"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-3 w-3 md:h-4 md:w-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"
                />
              </svg>
              <span className="hidden sm:inline">Edit Session Details</span>
              <span className="sm:hidden">Edit</span>
            </button>
            {canRemove && (
              <button
                onClick={onRemoveSession}
                className="flex items-center gap-1 md:gap-2 text-xs md:text-sm text-red-500 hover:text-red-600 transition-colors"
              >
                <X className="w-3 h-3 md:w-4 md:h-4" />
                <span className="hidden sm:inline">Remove Session</span>
                <span className="sm:hidden">Remove</span>
              </button>
            )}
          </div>

          {/* Children content (selected items, categories, menu items) */}
          {children}
        </div>
      )}
    </div>
  );
}

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
    getTotalPrice,
    setCurrentStep,
  } = useCatering();

  const [editingSessionIndex, setEditingSessionIndex] = useState<number | null>(
    null
  );
  // Track if the session being edited is newly created (should be removed on cancel)
  const [isNewSession, setIsNewSession] = useState(false);
  const sessionButtonRefs = useRef<Map<number, HTMLButtonElement>>(new Map());

  // Navigation state for day/session UI
  const [navMode, setNavMode] = useState<"dates" | "sessions">("dates");
  const [selectedDayDate, setSelectedDayDate] = useState<string | null>(null);
  const [expandedSessionIndex, setExpandedSessionIndex] = useState<
    number | null
  >(0);

  // Add day modal state
  const [isAddDayModalOpen, setIsAddDayModalOpen] = useState(false);
  const [newDayDate, setNewDayDate] = useState("");

  // Refs for scroll-to behavior
  const sessionAccordionRefs = useRef<Map<number, HTMLDivElement>>(new Map());
  const dayRefs = useRef<Map<string, HTMLDivElement>>(new Map());

  // Sticky nav detection
  const [isNavSticky, setIsNavSticky] = useState(false);

  // Category state
  const [categories, setCategories] = useState<CategoryWithSubcategories[]>([]);
  const [selectedCategory, setSelectedCategory] =
    useState<CategoryWithSubcategories | null>(null);
  const [selectedSubcategory, setSelectedSubcategory] =
    useState<Subcategory | null>(null);
  const [categoriesLoading, setCategoriesLoading] = useState(true);
  const [categoriesError, setCategoriesError] = useState<string | null>(null);

  // Menu items state
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [menuItemsLoading, setMenuItemsLoading] = useState(false);
  const [menuItemsError, setMenuItemsError] = useState<string | null>(null);
  const [expandedItemId, setExpandedItemId] = useState<string | null>(null);

  // Edit item state
  const [editingItemIndex, setEditingItemIndex] = useState<number | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  // Pending item modal state (for items added from menu view)
  const [pendingItem, setPendingItem] = useState<MenuItem | null>(null);

  // Collapsed categories state for the cart list
  const [collapsedCategories, setCollapsedCategories] = useState<Set<string>>(
    new Set()
  );

  // Restaurants state for validation
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);

  // PDF generation state
  const [generatingPdf, setGeneratingPdf] = useState(false);
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
        // Add category context for grouping in cart
        categoryId: selectedCategory?.id,
        categoryName: selectedCategory?.name,
        // Use selected subcategory filter if set, otherwise use item's subcategory from API
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

  // Helper to map MenuItemDetails to MenuItem format
  const mapToMenuItem = (item: MenuItemDetails): MenuItem => ({
    id: item.id,
    menuItemName: item.name,
    description: item.description,
    price: item.price?.toString() || "0",
    discountPrice: item.discountPrice?.toString(),
    allergens: item.allergens,
    isDiscount: item.isDiscount || false,
    image: item.image,
    averageRating: item.averageRating,
    restaurantId: item.restaurantId,
    restaurantName: (item as any).restaurant?.restaurant_name,
    groupTitle: item.groupTitle,
    status: item.status,
    itemDisplayOrder: item.itemDisplayOrder || 0,
    cateringQuantityUnit: (item as any).cateringQuantityUnit,
    feedsPerUnit: (item as any).feedsPerUnit,
    dietaryFilters: (item as any).dietaryFilters,
    // Include subcategory info from API response
    subcategoryId: (item as any).subcategories?.[0]?.id,
    subcategoryName: (item as any).subcategories?.[0]?.name,
    addons: (item.addons || []).map((addon) => ({
      name: addon.name,
      price: addon.price?.toString() || "0",
      allergens: addon.allergens?.join(", ") || "",
      groupTitle: addon.groupTitle || "",
      isRequired: addon.isRequired || false,
      selectionType: addon.selectionType || "single",
    })),
  });

  // Fetch restaurants on mount (for validation)
  useEffect(() => {
    const fetchRestaurants = async () => {
      try {
        const response = await fetchWithAuth(
          `${API_BASE_URL}${API_ENDPOINTS.RESTAURANT_CATERING}`
        );
        const data = await response.json();
        setRestaurants(data);
      } catch (error) {
        console.error("Error fetching restaurants:", error);
      }
    };
    fetchRestaurants();
  }, []);

  // Detect when sticky nav becomes stuck
  useEffect(() => {
    const handleScroll = () => {
      setIsNavSticky(window.scrollY > 10);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll(); // Check initial state

    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Prefill cart from bundle query parameter
  useEffect(() => {
    const bundleId = searchParams.get("bundleId");
    if (!bundleId) return;

    // Get date and time from URL params (from events website)
    const sessionDate = searchParams.get("sessionDate"); // Format: YYYY-MM-DD
    const sessionTime = searchParams.get("sessionTime"); // Format: HH:MM (24h)

    const prefillFromBundle = async () => {
      try {
        // Fetch bundle data
        const bundle = await cateringService.getBundleById(bundleId);

        // Fetch all menu items to match with bundle items
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

        // Match bundle items with loaded menu items and add to cart
        bundle.items.forEach((bundleItem) => {
          const menuItem = allMenuItems.find(
            (item: MenuItem) => item.id === bundleItem.menuItemId
          );

          if (menuItem) {
            // Create a copy of the menu item with selected addons from the bundle
            const itemWithAddons: MenuItem = {
              ...menuItem,
              selectedAddons: bundleItem.selectedAddons,
            };

            // Add to the active session
            addMenuItem(activeSessionIndex, {
              item: itemWithAddons,
              quantity: bundleItem.quantity,
            });
          } else {
            console.warn(
              `Menu item ${bundleItem.menuItemId} not found in loaded menu items`
            );
          }
        });

        // Update session with date and time from URL params
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

  // Check for pending item from menu view (localStorage)
  useEffect(() => {
    const pendingItemJson = localStorage.getItem("catering_pending_item");
    if (!pendingItemJson) return;

    try {
      const item = JSON.parse(pendingItemJson) as MenuItem;

      // Clear the pending item from localStorage immediately
      localStorage.removeItem("catering_pending_item");

      // Open the modal for this item so user can select quantity and addons
      setPendingItem(item);
    } catch (error) {
      console.error("Error parsing pending item:", error);
      localStorage.removeItem("catering_pending_item");
    }
  }, []);

  // Fetch categories on mount
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setCategoriesLoading(true);
        setCategoriesError(null);
        const data = await categoryService.getCategoriesWithSubcategories();
        setCategories(data);
        // Auto-select "Mains" category by default
        const mainCategory = data.find(
          (cat) => cat.name.toLowerCase() === "mains"
        );
        if (mainCategory) {
          setSelectedCategory(mainCategory);
        }
      } catch (error) {
        console.error("Failed to fetch categories:", error);
        setCategoriesError("Failed to load categories");
      } finally {
        setCategoriesLoading(false);
      }
    };

    fetchCategories();
  }, []);

  // Auto-select "Mains" category when a session is expanded
  useEffect(() => {
    if (expandedSessionIndex !== null && categories.length > 0 && !selectedCategory) {
      const mainsCategory = categories.find(
        (cat) => cat.name.toLowerCase() === "mains"
      );
      if (mainsCategory) {
        setSelectedCategory(mainsCategory);
      }
    }
  }, [expandedSessionIndex, categories, selectedCategory]);

  // Fetch menu items when category or subcategory changes
  useEffect(() => {
    const fetchMenuItems = async () => {
      if (!selectedCategory) {
        setMenuItems([]);
        return;
      }

      try {
        setMenuItemsLoading(true);
        setMenuItemsError(null);

        let data: MenuItemDetails[];
        if (selectedSubcategory) {
          data = await categoryService.getMenuItemsBySubcategory(
            selectedSubcategory.id
          );
        } else {
          data = await categoryService.getMenuItemsByCategory(
            selectedCategory.id
          );
        }
        // Map to MenuItem format for MenuItemCard
        const mappedItems = data.map(mapToMenuItem);

        // Sort items: items with images first, then items without images
        const itemsWithImage = mappedItems.filter((item) => item.image && item.image.trim() !== "");
        const itemsWithoutImage = mappedItems.filter((item) => !item.image || item.image.trim() === "");
        const sortedItems = [...itemsWithImage, ...itemsWithoutImage];

        setMenuItems(sortedItems);
      } catch (error) {
        console.error("Failed to fetch menu items:", error);
        setMenuItemsError("Failed to load menu items");
        setMenuItems([]);
      } finally {
        setMenuItemsLoading(false);
      }
    };

    fetchMenuItems();
  }, [selectedCategory, selectedSubcategory]);

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

  // Format time for display (e.g., "12:00 PM")
  const formatTimeDisplay = (eventTime: string | undefined) => {
    if (!eventTime) return "Set time";
    const [hours, minutes] = eventTime.split(":");
    const hour = parseInt(hours);
    const period = hour >= 12 ? "PM" : "AM";
    const hour12 = hour % 12 || 12;
    return `${hour12}:${minutes} ${period}`;
  };

  // Handle clicking a date tab in the navigation
  const handleDateClick = (dayDate: string) => {
    setSelectedDayDate(dayDate);
    setNavMode("sessions");
    // Jump to day section with offset for sticky header
    setTimeout(() => {
      const element = dayRefs.current.get(dayDate);
      if (element) {
        const headerOffset = 60; // Account for sticky date/session nav
        const elementPosition = element.getBoundingClientRect().top;
        const offsetPosition =
          elementPosition + window.pageYOffset - headerOffset;
        window.scrollTo({
          top: offsetPosition,
          behavior: "smooth",
        });
      }
    }, 150);
  };

  // Handle back button to return to dates view
  const handleBackToDates = () => {
    // Only remove sessions that are incomplete (no time set) AND have no items
    // This keeps properly configured sessions even if they have no items yet
    if (selectedDayDate && currentDayGroup) {
      const sessionsToRemove = currentDayGroup.sessions
        .filter(({ session }) => session.orderItems.length === 0 && !session.eventTime)
        .map(({ index }) => index)
        .sort((a, b) => b - a); // Sort descending to remove from end first

      sessionsToRemove.forEach((index) => {
        removeMealSession(index);
      });
    }
    setNavMode("dates");
    setSelectedDayDate(null);
  };

  // Handle clicking a session pill in the nav bar
  const handleSessionPillClick = (sessionIndex: number) => {
    setExpandedSessionIndex(sessionIndex);
    setActiveSessionIndex(sessionIndex);
    // Jump to session accordion with offset for sticky header
    setTimeout(() => {
      const element = sessionAccordionRefs.current.get(sessionIndex);
      if (element) {
        const headerOffset = 60; // Account for sticky date/session nav
        const elementPosition = element.getBoundingClientRect().top;
        const offsetPosition =
          elementPosition + window.pageYOffset - headerOffset;
        window.scrollTo({
          top: offsetPosition,
          behavior: "smooth",
        });
      }
    }, 150);
  };

  // Toggle session accordion expansion (only one at a time)
  const toggleSessionExpand = (sessionIndex: number) => {
    setExpandedSessionIndex((prev) =>
      prev === sessionIndex ? null : sessionIndex
    );
    setActiveSessionIndex(sessionIndex);
  };

  // Handle adding a new day
  const handleAddDay = () => {
    setNewDayDate("");
    setIsAddDayModalOpen(true);
  };

  // Handle confirming add day modal
  const handleConfirmAddDay = () => {
    if (!newDayDate) {
      alert("Please select a date.");
      return;
    }

    // Check if day already exists
    const existingDay = dayGroups.find((g) => g.date === newDayDate);
    if (existingDay) {
      alert("This date already has sessions. Please select a different date.");
      return;
    }

    // Create a new session with this date
    const newSession: MealSessionState = {
      sessionName: "New Session",
      sessionDate: newDayDate,
      eventTime: "",
      orderItems: [],
    };
    addMealSession(newSession);

    // Get the new session index and open editor
    const newIndex = mealSessions.length;
    setIsAddDayModalOpen(false);
    setSelectedDayDate(newDayDate);
    setNavMode("sessions");
    setExpandedSessionIndex(newIndex);
    selectMainsCategory();

    // Open editor for the new session after state update
    setTimeout(() => {
      setEditingSessionIndex(newIndex);
      setActiveSessionIndex(newIndex);
      setIsNewSession(true);
    }, 100);
  };

  // Helper to select Mains category
  const selectMainsCategory = () => {
    const mainsCategory = categories.find(
      (cat) => cat.name.toLowerCase() === "mains"
    );
    if (mainsCategory) {
      setSelectedCategory(mainsCategory);
      setSelectedSubcategory(null);
    }
  };

  // Handle adding a session to a specific day
  const handleAddSessionToDay = (dayDate: string) => {
    const newSession: MealSessionState = {
      sessionName: `Session ${mealSessions.length + 1}`,
      sessionDate: dayDate,
      eventTime: "",
      orderItems: [],
    };
    addMealSession(newSession);

    const newIndex = mealSessions.length;
    setActiveSessionIndex(newIndex);
    setExpandedSessionIndex(newIndex);
    selectMainsCategory();

    // Open editor after state update and scroll to the new session
    setTimeout(() => {
      setEditingSessionIndex(newIndex);
      setIsNewSession(true);
      // Scroll to the new session
      const element = sessionAccordionRefs.current.get(newIndex);
      if (element) {
        const headerOffset = 80;
        const elementPosition = element.getBoundingClientRect().top;
        const offsetPosition = elementPosition + window.pageYOffset - headerOffset;
        window.scrollTo({
          top: offsetPosition,
          behavior: "smooth",
        });
      }
    }, 150);
  };

  // Calculate totals for summary
  const totalDays = dayGroups.filter((g) => g.date !== "unscheduled").length;
  const totalSessions = mealSessions.length;
  const totalItems = mealSessions.reduce(
    (acc, s) => acc + s.orderItems.length,
    0
  );

  const handleCategoryClick = (category: CategoryWithSubcategories) => {
    if (selectedCategory?.id === category.id) {
      setSelectedCategory(null);
      setSelectedSubcategory(null);
    } else {
      setSelectedCategory(category);
      setSelectedSubcategory(null);
    }
  };

  const handleSubcategoryClick = (subcategory: Subcategory) => {
    setSelectedSubcategory(
      selectedSubcategory?.id === subcategory.id ? null : subcategory
    );
  };

  const handleEditorClose = (cancelled: boolean) => {
    const sessionIndex = editingSessionIndex;

    // If cancelled and this was a new session, remove it
    if (cancelled && isNewSession && sessionIndex !== null) {
      removeMealSession(sessionIndex);
    }

    // Clear validation error for this session if it was successfully updated
    if (sessionIndex !== null && !cancelled) {
      setSessionValidationErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[sessionIndex];
        return newErrors;
      });
    }

    setEditingSessionIndex(null);
    setIsNewSession(false);

    // After editor closes, expand the session and scroll to it (only if not cancelled)
    if (sessionIndex !== null && !cancelled) {
      setExpandedSessionIndex(sessionIndex);
      // Scroll to the session after a short delay to allow DOM update
      setTimeout(() => {
        const element = sessionAccordionRefs.current.get(sessionIndex);
        if (element) {
          const headerOffset = 80;
          const elementPosition = element.getBoundingClientRect().top;
          const offsetPosition = elementPosition + window.pageYOffset - headerOffset;
          window.scrollTo({
            top: offsetPosition,
            behavior: "smooth",
          });
        }
      }, 150);
    }
  };

  const handleRemoveSession = (index: number, e: React.MouseEvent) => {
    e.stopPropagation();
    setSessionToRemove(index);
  };

  const confirmRemoveSession = () => {
    if (sessionToRemove !== null) {
      removeMealSession(sessionToRemove);
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

  // Handle edit item from cart list
  const handleEditItem = (itemIndex: number) => {
    setEditingItemIndex(itemIndex);
    setIsEditModalOpen(true);
  };

  // Handle remove item from cart list
  const handleRemoveItem = (itemIndex: number) => {
    removeMenuItemByIndex(activeSessionIndex, itemIndex);
  };

  // Handle save from edit modal
  const handleSaveEditedItem = (updatedItem: MenuItem) => {
    if (editingItemIndex === null) return;

    const BACKEND_QUANTITY_UNIT = updatedItem.cateringQuantityUnit || 7;
    const quantity = (updatedItem.portionQuantity || 1) * BACKEND_QUANTITY_UNIT;

    // Preserve the category context from the original item
    const originalItem =
      mealSessions[activeSessionIndex].orderItems[editingItemIndex].item;

    updateMenuItemByIndex(activeSessionIndex, editingItemIndex, {
      item: {
        ...updatedItem,
        categoryId: originalItem.categoryId,
        categoryName: originalItem.categoryName,
        subcategoryId: originalItem.subcategoryId,
        subcategoryName: originalItem.subcategoryName,
        restaurantName: 'restaurantName' in originalItem ? originalItem.restaurantName : originalItem.restaurant?.name,
      },
      quantity,
    });

    setIsEditModalOpen(false);
    setEditingItemIndex(null);
  };

  // State for empty session warning modal
  const [emptySessionIndex, setEmptySessionIndex] = useState<number | null>(
    null
  );

  // State for remove session confirmation modal
  const [sessionToRemove, setSessionToRemove] = useState<number | null>(null);

  // State for catering hours validation errors
  const [sessionValidationErrors, setSessionValidationErrors] = useState<Record<number, string>>({});

  // Handle checkout - validate all sessions have date and time
  const handleCheckout = () => {
    // First check for empty sessions (if more than one session exists)
    if (mealSessions.length > 1) {
      const emptyIndex = mealSessions.findIndex(
        (session) => session.orderItems.length === 0
      );
      if (emptyIndex !== -1) {
        setEmptySessionIndex(emptyIndex);
        return;
      }
    }

    // Check minimum order requirements for all sessions
    for (let i = 0; i < mealSessions.length; i++) {
      const session = mealSessions[i];
      if (session.orderItems.length === 0) continue;

      const sessionValidation = validateSessionMinOrders(session, restaurants);
      const hasUnmetRequirements = sessionValidation.some(
        (status) => !status.isValid
      );

      if (hasUnmetRequirements) {
        setActiveSessionIndex(i);
        alert(
          `${session.sessionName} has unmet minimum order requirements. Please review the highlighted sections.`
        );
        return;
      }
    }

    // Find all sessions with items that are missing date or time
    for (let i = 0; i < mealSessions.length; i++) {
      const session = mealSessions[i];
      const hasItems = session.orderItems.length > 0;
      const missingDate = !session.sessionDate;
      const missingTime = !session.eventTime;

      if (hasItems && (missingDate || missingTime)) {
        // Open the session editor for the incomplete session
        setActiveSessionIndex(i);
        setEditingSessionIndex(i);
        return;
      }
    }

    // Validate catering operation hours for all sessions
    const errors: Record<number, string> = {};
    for (let i = 0; i < mealSessions.length; i++) {
      const session = mealSessions[i];
      if (session.orderItems.length === 0) continue;

      // Get unique restaurant IDs from session items
      const restaurantIds = new Set(
        session.orderItems.map((oi) => oi.item.restaurantId)
      );

      // Check each restaurant's catering hours
      for (const restaurantId of restaurantIds) {
        const restaurant = restaurants.find((r) => r.id === restaurantId);
        if (!restaurant) continue;

        const cateringHours = restaurant.cateringOperatingHours;
        if (!cateringHours || cateringHours.length === 0) continue;

        // Get day of week from session date
        const selectedDateTime = new Date(session.sessionDate + "T00:00:00");
        const dayOfWeek = selectedDateTime
          .toLocaleDateString("en-US", { weekday: "long" })
          .toLowerCase();

        // Find the schedule for this day
        const daySchedule = cateringHours.find(
          (schedule) => schedule.day.toLowerCase() === dayOfWeek
        );

        if (!daySchedule || !daySchedule.enabled) {
          errors[i] = `${restaurant.restaurant_name} does not accept event orders on ${dayOfWeek}s. Please select a different date for this session.`;
          break;
        }

        // Check if time is within operating hours
        if (daySchedule.open && daySchedule.close && session.eventTime) {
          const [eventHour, eventMinute] = session.eventTime.split(":").map(Number);
          const [openHour, openMinute] = daySchedule.open.split(":").map(Number);
          const [closeHour, closeMinute] = daySchedule.close
            .split(":")
            .map(Number);

          const eventMinutes = eventHour * 60 + eventMinute;
          const openMinutes = openHour * 60 + openMinute;
          const closeMinutes = closeHour * 60 + closeMinute;

          if (eventMinutes < openMinutes || eventMinutes > closeMinutes) {
            const formatTime = (hour: number, minute: number) => {
              const period = hour >= 12 ? "PM" : "AM";
              const hour12 = hour % 12 || 12;
              return `${hour12}:${minute.toString().padStart(2, "0")} ${period}`;
            };

            errors[i] = `${restaurant.restaurant_name} accepts event orders on ${dayOfWeek}s between ${formatTime(openHour, openMinute)} and ${formatTime(closeHour, closeMinute)}. Please select a time within these hours for this session.`;
            break;
          }
        }
      }
    }

    // If there are validation errors, display them and scroll to first error
    if (Object.keys(errors).length > 0) {
      setSessionValidationErrors(errors);
      const firstErrorSessionIndex = parseInt(Object.keys(errors)[0]);
      setActiveSessionIndex(firstErrorSessionIndex);
      setExpandedSessionIndex(firstErrorSessionIndex);
      // Scroll to the first error session
      setTimeout(() => {
        const element = sessionAccordionRefs.current.get(firstErrorSessionIndex);
        if (element) {
          const headerOffset = 80;
          const elementPosition = element.getBoundingClientRect().top;
          const offsetPosition = elementPosition + window.pageYOffset - headerOffset;
          window.scrollTo({
            top: offsetPosition,
            behavior: "smooth",
          });
        }
      }, 150);
      return;
    }

    // All sessions are complete, clear any validation errors and proceed to contact details (step 2)
    setSessionValidationErrors({});
    setCurrentStep(2);
  };

  // Handle removing empty session
  const handleRemoveEmptySession = () => {
    if (emptySessionIndex !== null) {
      removeMealSession(emptySessionIndex);
      setEmptySessionIndex(null);
    }
  };

  // Handle adding items to empty session
  const handleAddItemsToEmptySession = () => {
    if (emptySessionIndex !== null) {
      const session = mealSessions[emptySessionIndex];
      const sessionDate = session?.sessionDate;

      // Set active session
      setActiveSessionIndex(emptySessionIndex);

      // Navigate to sessions view for this day
      if (sessionDate) {
        setSelectedDayDate(sessionDate);
        setNavMode("sessions");
      }

      // Expand this session
      setExpandedSessionIndex(emptySessionIndex);

      // Close the modal
      setEmptySessionIndex(null);

      // Scroll to the session after state updates
      setTimeout(() => {
        const element = sessionAccordionRefs.current.get(emptySessionIndex);
        if (element) {
          const headerOffset = 80;
          const elementPosition = element.getBoundingClientRect().top;
          const offsetPosition = elementPosition + window.pageYOffset - headerOffset;
          window.scrollTo({
            top: offsetPosition,
            behavior: "smooth",
          });
        }
      }, 150);
    }
  };

  // Handle view menu preview - now downloads PDF
  const handleViewMenu = async () => {
    if (generatingPdf) return;
    setGeneratingPdf(true);
    try {
      // Convert mealSessions to LocalMealSession format
      const sessionsForPreview: LocalMealSession[] = mealSessions.map(
        (session) => ({
          sessionName: session.sessionName,
          sessionDate: session.sessionDate,
          eventTime: session.eventTime,
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
        })
      );

      // DEBUG: Log image URLs being passed to PDF
      // console.log("=== PDF Image Debug ===");
      // sessionsForPreview.forEach((session, sIdx) => {
      //   console.log(`Session ${sIdx}: ${session.sessionName}`);
      //   session.orderItems.forEach((orderItem, iIdx) => {
      //     console.log(`  Item ${iIdx}: ${orderItem.item.menuItemName}`);
      //     console.log(`    Image URL: ${orderItem.item.image || "NO IMAGE"}`);
      //   });
      // });

      // Transform to PDF data format (now async to fetch images)
      const pdfData = await transformLocalSessionsToPdfData(sessionsForPreview, true);

      // DEBUG: Log transformed PDF data
      // console.log("=== Transformed PDF Data ===");
      // pdfData.sessions.forEach((session, sIdx) => {
      //   console.log(`Session ${sIdx}: ${session.sessionName}`);
      //   session.categories.forEach((cat) => {
      //     console.log(`  Category: ${cat.name}`);
      //     cat.items.forEach((item, iIdx) => {
      //       console.log(`    Item ${iIdx}: ${item.name}`);
      //       console.log(`      Image: ${item.image ? (item.image.startsWith("data:") ? "BASE64 IMAGE" : item.image) : "NO IMAGE"}`);
      //     });
      //   });
      // });

      // Generate and download PDF
      const blob = await pdf(
        <CateringMenuPdf
          sessions={pdfData.sessions}
          showPrices={pdfData.showPrices}
          deliveryCharge={pdfData.deliveryCharge}
          totalPrice={pdfData.totalPrice}
          logoUrl={pdfData.logoUrl}
        />
      ).toBlob();

      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = "catering-menu.pdf";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Failed to generate PDF:", error);
      alert("Failed to generate PDF. Please try again.");
    } finally {
      setGeneratingPdf(false);
    }
  };

  return (
    <div className="min-h-screen bg-base-100">
      {/* Sticky Navigation - Toggles between Dates and Sessions */}
      <div
        className={`sticky top-0 z-40 bg-base-100 transition-shadow duration-200 ${
          isNavSticky ? "shadow-sm border-b border-base-200" : ""
        }`}
      >
        <div className="max-w-6xl mx-auto px-2 py-2">
          <div className="flex gap-2 overflow-x-auto scrollbar-hide">
            {navMode === "dates" ? (
              <>
                {/* Date Tabs */}
                {dayGroups.filter((day) => day.date !== "unscheduled").map((day) => (
                  <button
                    key={day.date}
                    onClick={() => handleDateClick(day.date)}
                    className="flex-shrink-0 px-4 py-2 rounded-lg bg-base-200 text-gray-600 hover:bg-primary/10 transition-all"
                  >
                    <div className="text-[10px] font-medium opacity-80">
                      {day.dayName}
                    </div>
                    <div className="text-sm font-bold">{day.displayDate}</div>
                  </button>
                ))}
                {/* Add Day Button */}
                <button
                  onClick={handleAddDay}
                  className="flex-shrink-0 px-4 py-2 rounded-lg border-2 border-dashed border-base-300 text-gray-400 hover:border-primary hover:text-primary transition-colors"
                >
                  <Calendar className="w-4 h-4 mx-auto" />
                  <div className="text-[10px] font-medium mt-0.5">Add Day</div>
                </button>
              </>
            ) : (
              <>
                {/* Back Button - matches height of pink container */}
                <button
                  onClick={handleBackToDates}
                  className="flex-shrink-0 w-10 self-stretch rounded-lg bg-base-200 text-gray-600 hover:bg-primary/10 transition-all flex items-center justify-center"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>

                {/* Date + Sessions - all in one scrollable pink container */}
                <div className="flex items-stretch gap-0 animate-[expandIn_0.3s_ease-out] bg-primary/10 rounded-lg min-w-0 overflow-x-auto scrollbar-hide">
                  {/* Current Date Indicator - Same size as dates view */}
                  {(currentDayGroup || selectedDayDate) && (
                    <div className="flex-shrink-0 px-4 py-2 rounded-lg bg-primary text-white">
                      <div className="text-[10px] font-medium opacity-80 text-center">
                        {currentDayGroup?.dayName ||
                          (selectedDayDate && selectedDayDate !== "unscheduled"
                            ? new Date(selectedDayDate + "T00:00:00").toLocaleDateString("en-GB", { weekday: "short" })
                            : "")}
                      </div>
                      <div className="text-sm font-bold">
                        {currentDayGroup?.displayDate ||
                          (selectedDayDate && selectedDayDate !== "unscheduled"
                            ? new Date(selectedDayDate + "T00:00:00").toLocaleDateString("en-GB", { day: "numeric", month: "short" })
                            : "No Date")}
                      </div>
                    </div>
                  )}

                  {/* Sessions Container - connected to date */}
                  {currentDayGroup && currentDayGroup.sessions.length > 0 && (
                    <div className="flex items-center gap-1.5 pl-1.5 pr-1.5 py-1">
                      {/* Session Pills - Smaller */}
                      {currentDayGroup.sessions.map(({ session, index }, i) => (
                        <button
                          key={index}
                          ref={(el) => {
                            if (el) sessionButtonRefs.current.set(index, el);
                            else sessionButtonRefs.current.delete(index);
                          }}
                          onClick={() => handleSessionPillClick(index)}
                          style={{ animationDelay: `${(i + 1) * 50}ms` }}
                          className={`flex-shrink-0 px-2.5 py-1 rounded transition-all animate-[slideIn_0.25s_ease-out_both] ${
                            expandedSessionIndex === index
                              ? "bg-white text-primary border border-primary"
                              : "bg-white/60 text-gray-600 hover:bg-white border border-transparent"
                          }`}
                        >
                          <div className="text-[9px] font-medium opacity-70">
                            {formatTimeDisplay(session.eventTime)}
                          </div>
                          <div className="text-xs font-semibold leading-tight whitespace-nowrap">
                            {session.sessionName}
                          </div>
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* Add Session button - outside the pink container */}
                {selectedDayDate && selectedDayDate !== "unscheduled" && (
                  <button
                    onClick={() => handleAddSessionToDay(selectedDayDate)}
                    className="flex-shrink-0 px-2.5 py-1 self-stretch rounded-lg border-2 border-dashed border-base-300 text-gray-400 hover:border-primary hover:text-primary transition-colors animate-[fadeIn_0.3s_ease-out_0.2s_both] flex flex-col items-center justify-center"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <div className="text-[9px] font-medium whitespace-nowrap">Add Session</div>
                  </button>
                )}
              </>
            )}
          </div>
        </div>
      </div>

      {/* Session Editor - Rendered via portal */}
      {editingSessionIndex !== null && (
        <SessionEditor
          session={mealSessions[editingSessionIndex]}
          sessionIndex={editingSessionIndex}
          onUpdate={updateMealSession}
          onClose={handleEditorClose}
          restaurants={restaurants}
        />
      )}

      <div className="max-w-6xl mx-auto p-2">
        {/* Summary Card */}
        <div className="flex gap-3 mb-6">
          {/* Main Summary */}
          <div className="flex-1 bg-white rounded-xl shadow-sm border border-base-200 p-3 md:p-4 flex items-center justify-between">
            <div>
              <p className="text-xs md:text-sm text-gray-500">
                {totalDays > 0
                  ? `${totalDays} day${totalDays !== 1 ? "s" : ""}`
                  : "No days scheduled"}{" "}
                • {totalSessions} session{totalSessions !== 1 ? "s" : ""}
              </p>
            </div>
            <div className="text-right">
              <p className="text-xl md:text-2xl font-bold text-primary">
                £{getTotalPrice().toFixed(2)}
              </p>
              <p className="text-xs md:text-sm text-gray-500">{totalItems} items total</p>
            </div>
          </div>

          {/* Download Menu Button */}
          {totalItems > 0 && (
            <button
              onClick={handleViewMenu}
              disabled={generatingPdf}
              className="flex-shrink-0 bg-white rounded-xl shadow-sm border border-base-200 p-4 flex flex-col items-center justify-center hover:border-primary hover:bg-primary/5 transition-colors group disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {generatingPdf ? (
                <>
                  <span className="loading loading-spinner loading-sm text-primary"></span>
                  <span className="hidden md:block text-xs text-gray-500 mt-1">
                    Generating...
                  </span>
                </>
              ) : (
                <>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-6 w-6 text-primary"
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
                  <span className="hidden md:block text-xs text-gray-500 mt-1 group-hover:text-primary transition-colors">
                    Download Menu
                  </span>
                </>
              )}
            </button>
          )}
        </div>

        {/* Timeline - All Days */}
        <div className="relative mb-8">
          {/* Timeline Line - Hidden on mobile */}
          <div className="absolute left-[23px] top-8 bottom-8 w-0.5 bg-primary/20 hidden md:block" />

          {/* Unscheduled Sessions - Show first if any exist */}
          {dayGroups.find((day) => day.date === "unscheduled") && (
            <div className="relative mb-8">
              <div className="flex flex-col md:flex-row md:gap-4">
                {/* Timeline Dot - Warning Badge (Desktop only) */}
                <div className="hidden md:flex flex-shrink-0 w-12 h-12 rounded-xl bg-amber-500 flex-col items-center justify-center z-10 shadow-lg">
                  <Clock className="w-6 h-6 text-white" />
                </div>

                {/* Sessions Container with amber background */}
                <div className="flex-1 md:bg-amber-50 md:rounded-2xl md:p-4 border border-amber-200 rounded-xl">
                  {/* Header */}
                  <div className="mb-3 flex items-start gap-3 p-3 md:p-0">
                    {/* Warning Badge - Mobile only */}
                    <div className="md:hidden flex-shrink-0 w-11 h-11 rounded-xl bg-amber-500 text-white flex items-center justify-center">
                      <Clock className="w-5 h-5" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-800">
                        Unscheduled Sessions
                      </h3>
                      <p className="text-sm text-amber-600">
                        Set date & time to continue
                      </p>
                    </div>
                  </div>

                  {/* Unscheduled Sessions List */}
                  <div className="space-y-3 px-3 pb-3 md:px-0 md:pb-0">
                    {dayGroups
                      .find((day) => day.date === "unscheduled")
                      ?.sessions.map(({ session, index }) => (
                        <SessionAccordion
                          key={index}
                          session={session}
                          isExpanded={expandedSessionIndex === index}
                          onToggle={() => toggleSessionExpand(index)}
                          sessionTotal={getSessionTotal(index)}
                          accordionRef={(el) => {
                            if (el) sessionAccordionRefs.current.set(index, el);
                            else sessionAccordionRefs.current.delete(index);
                          }}
                          onEditSession={() => {
                            setEditingSessionIndex(index);
                          }}
                          onRemoveSession={(e) => handleRemoveSession(index, e)}
                          canRemove={mealSessions.length > 1}
                        >
                          {/* Validation Error Banner */}
                          {sessionValidationErrors[index] && (
                            <div className="mb-4 p-4 bg-red-50 border-2 border-red-500 rounded-xl flex items-start gap-3">
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                className="h-6 w-6 text-red-500 flex-shrink-0 mt-0.5"
                                viewBox="0 0 20 20"
                                fill="currentColor"
                              >
                                <path
                                  fillRule="evenodd"
                                  d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                                  clipRule="evenodd"
                                />
                              </svg>
                              <div className="flex-1">
                                <p className="text-sm font-semibold text-red-800 mb-1">
                                  Catering Hours Conflict
                                </p>
                                <p className="text-sm text-red-700">
                                  {sessionValidationErrors[index]}
                                </p>
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setEditingSessionIndex(index);
                                  }}
                                  className="mt-3 px-4 py-2 bg-red-600 text-white text-sm font-medium rounded-lg hover:bg-red-700 transition-colors"
                                >
                                  Edit Session Time
                                </button>
                              </div>
                            </div>
                          )}

                          {/* Selected Items for this session */}
                          {session.orderItems.length > 0 && (
                            <div className="mb-4 min-w-0 overflow-hidden">
                              <SelectedItemsByCategory
                                sessionIndex={index}
                                onEdit={handleEditItem}
                                onRemove={handleRemoveItem}
                                collapsedCategories={collapsedCategories}
                                onToggleCategory={handleToggleCategory}
                                onViewMenu={handleViewMenu}
                              />
                            </div>
                          )}

                          {/* Categories Row */}
                          <div className="-mx-3 px-3 md:-mx-5 md:px-5 pt-2 pb-1">
                            <div>
                              {categoriesLoading ? (
                                <div className="flex items-center gap-3 overflow-x-auto pb-2">
                                  {[...Array(6)].map((_, i) => (
                                    <div
                                      key={i}
                                      className="flex-shrink-0 w-28 h-10 bg-base-200 rounded-full animate-pulse"
                                    />
                                  ))}
                                </div>
                              ) : categoriesError ? (
                                <div className="text-center py-4 text-red-500">
                                  {categoriesError}
                                </div>
                              ) : (
                                <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-hide">
                                  {categories.map((category) => (
                                    <button
                                      key={category.id}
                                      onClick={() => handleCategoryClick(category)}
                                      className={`
                                  flex-shrink-0 px-4 py-2 rounded-full text-sm font-medium transition-all
                                  ${
                                    selectedCategory?.id === category.id
                                      ? "bg-primary text-white"
                                      : "bg-base-200 text-gray-700 hover:bg-base-300"
                                  }
                                `}
                                    >
                                      {category.name}
                                    </button>
                                  ))}
                                </div>
                              )}
                            </div>
                          </div>

                          {/* Subcategories Row - Sticky */}
                          {selectedCategory &&
                            selectedCategory.subcategories.length > 0 && (
                              <div className="sticky top-[70px] z-30 bg-white pb-1 pt-1 -mx-3 px-3 md:-mx-5 md:px-5">
                                <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-hide">
                                  <span className="flex-shrink-0 text-xs text-gray-500 mr-1">
                                    {selectedCategory.name}:
                                  </span>
                                  {selectedCategory.subcategories.map(
                                    (subcategory) => (
                                      <button
                                        key={subcategory.id}
                                        onClick={() =>
                                          handleSubcategoryClick(subcategory)
                                        }
                                        className={`
                                  flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-medium transition-all border border-primary/50
                                  ${
                                    selectedSubcategory?.id === subcategory.id
                                      ? "bg-primary text-white"
                                      : "bg-white text-primary hover:bg-secondary/20"
                                  }
                                `}
                                      >
                                        {subcategory.name}
                                        {selectedSubcategory?.id ===
                                          subcategory.id && (
                                          <span className="ml-1.5 inline-flex items-center justify-center w-3.5 h-3.5 rounded-full bg-white/20">
                                            ×
                                          </span>
                                        )}
                                      </button>
                                    )
                                  )}
                                </div>
                              </div>
                            )}

                          {/* Menu Items */}
                          <div className="bg-base-100 rounded-xl p-4 mt-2">
                            {menuItemsLoading ? (
                              <div className="text-center py-4">
                                <div className="inline-block w-6 h-6 border-3 border-primary border-t-transparent rounded-full animate-spin" />
                                <p className="mt-2 text-sm text-gray-500">
                                  Loading...
                                </p>
                              </div>
                            ) : menuItemsError ? (
                              <div className="text-center py-4 text-red-500 text-sm">
                                {menuItemsError}
                              </div>
                            ) : !selectedCategory ? (
                              <div className="text-center py-6">
                                <ShoppingBag className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                                <p className="text-gray-500 text-sm">
                                  Select a category to browse items
                                </p>
                              </div>
                            ) : menuItems.length === 0 ? (
                              <div className="text-center py-6">
                                <p className="text-gray-500 text-sm">
                                  No items available for{" "}
                                  {selectedSubcategory?.name ||
                                    selectedCategory.name}
                                </p>
                              </div>
                            ) : (
                              <div>
                                <h3 className="text-lg font-semibold text-gray-700 mb-3">
                                  {selectedSubcategory?.name ||
                                    selectedCategory.name}
                                </h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                  {menuItems.map((item) => (
                                    <MenuItemCard
                                      key={item.id}
                                      item={item}
                                      quantity={getItemQuantity(item.id)}
                                      isExpanded={expandedItemId === item.id}
                                      onToggleExpand={() =>
                                        setExpandedItemId(
                                          expandedItemId === item.id
                                            ? null
                                            : item.id
                                        )
                                      }
                                      onAddItem={handleAddItem}
                                      onUpdateQuantity={handleUpdateQuantity}
                                      onAddOrderPress={handleAddOrderPress}
                                    />
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>
                        </SessionAccordion>
                      ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {dayGroups.filter((day) => day.date !== "unscheduled").map((day) => (
            <div
              key={day.date}
              ref={(el) => {
                if (el) dayRefs.current.set(day.date, el);
                else dayRefs.current.delete(day.date);
              }}
              className="relative mb-8 last:mb-0"
            >
              {/* Day Container - Different layouts for mobile/desktop */}
              <div className="flex flex-col md:flex-row md:gap-4">
                {/* Timeline Dot - Date Badge (Desktop only) */}
                <div className="hidden md:flex flex-shrink-0 w-12 h-12 rounded-xl bg-primary flex-col items-center justify-center z-10 shadow-lg">
                  <span className="text-xs font-medium text-white/80">
                    {day.dayName}
                  </span>
                  <span className="text-sm font-bold text-white">
                    {day.displayDate.split(" ")[0]}
                  </span>
                </div>

                {/* Sessions Container with light pink background */}
                <div className="flex-1 md:bg-primary/5 md:rounded-2xl md:p-4">
                  {/* Day Info Header - Mobile: with square badge, Desktop: text only */}
                  <div className="mb-3 flex items-start gap-3">
                    {/* Date Badge Square - Mobile only */}
                    <div className="md:hidden flex-shrink-0 w-11 h-11 rounded-xl bg-primary text-white flex flex-col items-center justify-center">
                      <span className="text-[10px] font-medium leading-tight">
                        {day.dayName}
                      </span>
                      <span className="text-sm font-bold leading-tight">
                        {day.displayDate.split(" ")[0]}
                      </span>
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-800">
                        {day.fullDate}
                      </h3>
                      <p className="text-sm text-gray-500">
                        {day.sessions.length} session
                        {day.sessions.length !== 1 ? "s" : ""} • £
                        {day.total.toFixed(2)}
                      </p>
                    </div>
                  </div>

                  {/* Sessions List */}
                  <div className="space-y-3">
                    {day.sessions.map(({ session, index }) => (
                      <SessionAccordion
                        key={index}
                        session={session}
                        isExpanded={expandedSessionIndex === index}
                        onToggle={() => toggleSessionExpand(index)}
                        sessionTotal={getSessionTotal(index)}
                        accordionRef={(el) => {
                          if (el) sessionAccordionRefs.current.set(index, el);
                          else sessionAccordionRefs.current.delete(index);
                        }}
                        onEditSession={() => {
                          setEditingSessionIndex(index);
                        }}
                        onRemoveSession={(e) => handleRemoveSession(index, e)}
                        canRemove={true}
                      >
                        {/* Validation Error Banner */}
                        {sessionValidationErrors[index] && (
                          <div className="mb-4 p-4 bg-red-50 border-2 border-red-500 rounded-xl flex items-start gap-3">
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              className="h-6 w-6 text-red-500 flex-shrink-0 mt-0.5"
                              viewBox="0 0 20 20"
                              fill="currentColor"
                            >
                              <path
                                fillRule="evenodd"
                                d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                                clipRule="evenodd"
                              />
                            </svg>
                            <div className="flex-1">
                              <p className="text-sm font-semibold text-red-800 mb-1">
                                Catering Hours Conflict
                              </p>
                              <p className="text-sm text-red-700">
                                {sessionValidationErrors[index]}
                              </p>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setEditingSessionIndex(index);
                                }}
                                className="mt-3 px-4 py-2 bg-red-600 text-white text-sm font-medium rounded-lg hover:bg-red-700 transition-colors"
                              >
                                Edit Session Time
                              </button>
                            </div>
                          </div>
                        )}

                        {/* Selected Items for this session */}
                        {session.orderItems.length > 0 && (
                          <div className="mb-4 min-w-0 overflow-hidden">
                            <SelectedItemsByCategory
                              sessionIndex={index}
                              onEdit={handleEditItem}
                              onRemove={handleRemoveItem}
                              collapsedCategories={collapsedCategories}
                              onToggleCategory={handleToggleCategory}
                              onViewMenu={handleViewMenu}
                            />
                          </div>
                        )}

                        {/* Categories Row */}
                        <div className="-mx-3 px-3 md:-mx-5 md:px-5 pt-2 pb-1">
                          <div>
                            {categoriesLoading ? (
                              <div className="flex items-center gap-3 overflow-x-auto pb-2">
                                {[...Array(6)].map((_, i) => (
                                  <div
                                    key={i}
                                    className="flex-shrink-0 w-28 h-10 bg-base-200 rounded-full animate-pulse"
                                  />
                                ))}
                              </div>
                            ) : categoriesError ? (
                              <div className="text-center py-4 text-red-500">
                                {categoriesError}
                              </div>
                            ) : (
                              <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-hide">
                                {categories.map((category) => (
                                  <button
                                    key={category.id}
                                    onClick={() => handleCategoryClick(category)}
                                    className={`
                                  flex-shrink-0 px-4 py-2 rounded-full text-sm font-medium transition-all
                                  ${
                                    selectedCategory?.id === category.id
                                      ? "bg-primary text-white"
                                      : "bg-base-200 text-gray-700 hover:bg-base-300"
                                  }
                                `}
                                  >
                                    {category.name}
                                  </button>
                                ))}
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Subcategories Row - Sticky */}
                        {selectedCategory &&
                          selectedCategory.subcategories.length > 0 && (
                            <div className="sticky top-[70px] z-30 bg-white pb-1 pt-1 -mx-3 px-3 md:-mx-5 md:px-5">
                              <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-hide">
                                <span className="flex-shrink-0 text-xs text-gray-500 mr-1">
                                  {selectedCategory.name}:
                                </span>
                                {selectedCategory.subcategories.map(
                                  (subcategory) => (
                                    <button
                                      key={subcategory.id}
                                      onClick={() =>
                                        handleSubcategoryClick(subcategory)
                                      }
                                      className={`
                                  flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-medium transition-all border border-primary/50
                                  ${
                                    selectedSubcategory?.id === subcategory.id
                                      ? "bg-primary text-white"
                                      : "bg-white text-primary hover:bg-secondary/20"
                                  }
                                `}
                                    >
                                      {subcategory.name}
                                      {selectedSubcategory?.id ===
                                        subcategory.id && (
                                        <span className="ml-1.5 inline-flex items-center justify-center w-3.5 h-3.5 rounded-full bg-white/20">
                                          ×
                                        </span>
                                      )}
                                    </button>
                                  )
                                )}
                              </div>
                            </div>
                          )}

                        {/* Menu Items */}
                        <div className="bg-base-100 rounded-xl p-4 mt-2">
                          {menuItemsLoading ? (
                            <div className="text-center py-4">
                              <div className="inline-block w-6 h-6 border-3 border-primary border-t-transparent rounded-full animate-spin" />
                              <p className="mt-2 text-sm text-gray-500">
                                Loading...
                              </p>
                            </div>
                          ) : menuItemsError ? (
                            <div className="text-center py-4 text-red-500 text-sm">
                              {menuItemsError}
                            </div>
                          ) : !selectedCategory ? (
                            <div className="text-center py-6">
                              <ShoppingBag className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                              <p className="text-gray-500 text-sm">
                                Select a category to browse items
                              </p>
                            </div>
                          ) : menuItems.length === 0 ? (
                            <div className="text-center py-6">
                              <p className="text-gray-500 text-sm">
                                No items available for{" "}
                                {selectedSubcategory?.name ||
                                  selectedCategory.name}
                              </p>
                            </div>
                          ) : (
                            <div>
                              <h3 className="text-lg font-semibold text-gray-700 mb-3">
                                {selectedSubcategory?.name ||
                                  selectedCategory.name}
                              </h3>
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                {menuItems.map((item) => (
                                  <MenuItemCard
                                    key={item.id}
                                    item={item}
                                    quantity={getItemQuantity(item.id)}
                                    isExpanded={expandedItemId === item.id}
                                    onToggleExpand={() =>
                                      setExpandedItemId(
                                        expandedItemId === item.id
                                          ? null
                                          : item.id
                                      )
                                    }
                                    onAddItem={handleAddItem}
                                    onUpdateQuantity={handleUpdateQuantity}
                                    onAddOrderPress={handleAddOrderPress}
                                  />
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      </SessionAccordion>
                    ))}
                  </div>
                </div>
              </div>

              {/* Add Session to this day - Outside the pink container */}
              {day.date !== "unscheduled" && (
                <div className="md:ml-16 mt-3">
                  <button
                    onClick={() => handleAddSessionToDay(day.date)}
                    className="w-full p-3 rounded-xl border-2 border-dashed border-base-300 text-gray-400 hover:border-primary hover:text-primary transition-colors flex items-center justify-center gap-2"
                  >
                    <Plus className="w-4 h-4" />
                    <span className="text-sm font-medium">
                      Add Session to {day.displayDate}
                    </span>
                  </button>
                </div>
              )}
            </div>
          ))}

          {/* Add Day at bottom */}
          <div className={`relative mt-6 ${totalDays > 0 ? "md:ml-14" : ""}`}>
            <button
              onClick={handleAddDay}
              className="w-full p-4 rounded-xl border-2 border-dashed border-base-300 text-gray-400 hover:border-primary hover:text-primary transition-colors flex items-center justify-center gap-2"
            >
              <Calendar className="w-5 h-5" />
              <span className="font-medium">Add Day</span>
            </button>
          </div>
        </div>
      </div>

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

      {/* Pending Item Modal (for items added from menu view) */}
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

      {/* Add Day Modal */}
      {isAddDayModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[100] p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl overflow-hidden">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                <Calendar className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-900">Add New Day</h3>
                <p className="text-sm text-gray-500">
                  Select a date for your event
                </p>
              </div>
            </div>
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Date
              </label>
              <input
                type="date"
                value={newDayDate}
                onChange={(e) => setNewDayDate(e.target.value)}
                min={new Date().toISOString().split("T")[0]}
                max={(() => {
                  const d = new Date();
                  d.setMonth(d.getMonth() + 3);
                  return d.toISOString().split("T")[0];
                })()}
                className="w-full px-4 py-3 border border-base-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary appearance-none bg-white min-w-0 box-border"
                style={{ WebkitAppearance: 'none' }}
              />
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setIsAddDayModalOpen(false)}
                className="flex-1 px-4 py-3 border border-base-300 text-gray-600 rounded-xl hover:bg-base-100 transition-colors font-medium"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmAddDay}
                className="flex-1 px-4 py-3 bg-primary text-white rounded-xl hover:bg-primary/90 transition-colors font-medium"
              >
                Add Day
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Empty Session Warning Modal */}
      {emptySessionIndex !== null && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[100] p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-full bg-amber-100 flex items-center justify-center">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6 text-amber-600"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                  />
                </svg>
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-900">
                  Empty Session
                </h3>
                <p className="text-sm text-gray-500">
                  {mealSessions[emptySessionIndex]?.sessionName || "Session"}{" "}
                  has no items
                </p>
              </div>
            </div>
            <p className="text-gray-600 mb-6">
              This session doesn&apos;t have any items. Would you like to add
              items or remove it?
            </p>
            <div className="flex gap-3">
              <button
                onClick={handleRemoveEmptySession}
                className="flex-1 px-4 py-3 border border-red-200 text-red-600 rounded-xl hover:bg-red-50 transition-colors font-medium"
              >
                Remove Session
              </button>
              <button
                onClick={handleAddItemsToEmptySession}
                className="flex-1 px-4 py-3 bg-primary text-white rounded-xl hover:bg-primary/90 transition-colors font-medium"
              >
                Add Items
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Remove Session Confirmation Modal */}
      {sessionToRemove !== null && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[100] p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center">
                <X className="h-6 w-6 text-red-600" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-900">
                  Remove Session
                </h3>
                <p className="text-sm text-gray-500">
                  {mealSessions[sessionToRemove]?.sessionName || "Session"}
                </p>
              </div>
            </div>
            <p className="text-gray-600 mb-6">
              Are you sure you want to remove this session? This will delete all items in the session.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setSessionToRemove(null)}
                className="flex-1 px-4 py-3 border border-base-300 text-gray-600 rounded-xl hover:bg-base-100 transition-colors font-medium"
              >
                Cancel
              </button>
              <button
                onClick={confirmRemoveSession}
                className="flex-1 px-4 py-3 bg-red-500 text-white rounded-xl hover:bg-red-600 transition-colors font-medium"
              >
                Remove
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Checkout Button - Mobile (fixed bottom bar) */}
      {mealSessions.some((s) => s.orderItems.length > 0) && (
        <div
          className={`fixed bottom-0 left-0 right-0 md:hidden p-4 shadow-lg z-50 ${
            isCurrentSessionValid ? "bg-primary" : "bg-warning"
          }`}
        >
          <button
            onClick={handleCheckout}
            className="w-full flex items-center justify-between text-white"
          >
            <div className="flex flex-row justify-center items-center">
              <span className="text-lg font-semibold mr-2">Total:</span>
              <span className="text-xl font-bold">
                £{getTotalPrice().toFixed(2)}
              </span>
            </div>
            <div className="flex items-center gap-2">
              {!isCurrentSessionValid && (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                    clipRule="evenodd"
                  />
                </svg>
              )}
              <span className="font-semibold">
                {isCurrentSessionValid ? "Checkout" : "Min. Order Not Met"}
              </span>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5l7 7-7 7"
                />
              </svg>
            </div>
          </button>
        </div>
      )}

      {/* Checkout Button - Desktop (fixed bottom right) */}
      {mealSessions.some((s) => s.orderItems.length > 0) && (
        <button
          onClick={handleCheckout}
          className={`hidden md:flex fixed bottom-8 right-8 items-center gap-3 text-white px-4 py-2 rounded-xl shadow-lg transition-all z-50 ${
            isCurrentSessionValid
              ? "bg-primary hover:bg-primary/20"
              : "bg-warning hover:bg-warning/20"
          }`}
        >
          <div className="flex flex-col items-start">
            <span className="text-sm opacity-90">Total</span>
            <span className="text-lg font-bold">
              £{getTotalPrice().toFixed(2)}
            </span>
          </div>
          <div className="w-px h-10 bg-white/30" />
          <div className="flex items-center gap-2">
            {!isCurrentSessionValid && (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                  clipRule="evenodd"
                />
              </svg>
            )}
            <span className="font-semibold text-lg">
              {isCurrentSessionValid ? "Checkout" : "Min. Order Not Met"}
            </span>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 5l7 7-7 7"
              />
            </svg>
          </div>
        </button>
      )}
    </div>
  );
}
