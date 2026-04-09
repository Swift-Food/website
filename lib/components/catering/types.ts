import { MealSessionState, CateringPricingResult } from "@/types/catering.types";
import { MenuItem, Restaurant } from "./Step2MenuItems";

// Day grouping interface for timeline view
export interface DayGroup {
  date: string; // ISO date string or 'unscheduled'
  displayDate: string; // "11 Dec"
  fullDate: string; // "11 December 2024"
  dayName: string; // "Wed"
  sessions: { session: MealSessionState; index: number }[];
  total: number;
}

// SessionEditor component props
export interface SessionEditorProps {
  session: MealSessionState;
  sessionIndex: number;
  onUpdate: (index: number, updates: Partial<MealSessionState>) => void;
  onClose: (cancelled: boolean) => void;
  restaurants: Restaurant[];
  existingDates?: { date: string; dayName: string; displayDate: string }[];
}

// SessionAccordion component props
export interface SessionAccordionProps {
  session: MealSessionState;
  isExpanded: boolean;
  onToggle: () => void;
  sessionTotal: number;
  sessionPromotions?: any[];
  accordionRef: (el: HTMLDivElement | null) => void;
  onEditSession: () => void;
  onRemoveSession: (e: React.MouseEvent) => void;
  canRemove: boolean;
  children?: React.ReactNode;
}

// DateSessionNav component props
export interface DateSessionNavProps {
  navMode: "dates" | "sessions";
  dayGroups: DayGroup[];
  selectedDayDate: string | null;
  currentDayGroup: DayGroup | null;
  expandedSessionIndex: number | null;
  isNavSticky: boolean;
  onDateClick: (dayDate: string) => void;
  onBackToDates: () => void;
  onSessionPillClick: (sessionIndex: number) => void;
  onAddDay: () => void;
  onAddSessionToDay: (dayDate: string) => void;
  formatTimeDisplay: (eventTime: string | undefined) => string;
  // Tutorial refs
  addDayNavButtonRef: React.RefObject<HTMLButtonElement | null>;
  backButtonRef: React.RefObject<HTMLButtonElement | null>;
  firstDayTabRef: React.RefObject<HTMLDivElement | null>;
  firstSessionPillRef: React.RefObject<HTMLButtonElement | null>;
  addSessionNavButtonRef: React.RefObject<HTMLButtonElement | null>;
}

// CheckoutBar component props
export interface CheckoutBarProps {
  isCurrentSessionValid: boolean;
  totalPrice: number;
  onCheckout: () => void;
}

// AddDayModal component props
export interface AddDayModalProps {
  isOpen: boolean;
  newDayDate: string;
  onDateChange: (date: string) => void;
  onConfirm: () => void;
  onClose: () => void;
}

// EmptySessionWarningModal component props
export interface EmptySessionWarningModalProps {
  sessionName: string;
  onRemove: () => void;
  onAddItems: () => void;
}

// RemoveSessionConfirmModal component props
export interface RemoveSessionConfirmModalProps {
  sessionName: string;
  onConfirm: () => void;
  onCancel: () => void;
}

// PdfDownloadModal component props
export interface PdfDownloadModalProps {
  onDownload: (withPrices: boolean) => void;
  onClose: () => void;
  isGenerating?: boolean;
}

// Tutorial phases
export type TutorialPhase =
  | "initial"
  | "navigation"
  | "restaurants"
  | "menu_items"
  | "completed";

// Tutorial hook return type
export interface UseCateringTutorialReturn {
  tutorialStep: number | null;
  tutorialPhase: TutorialPhase;
  currentTutorialStep: import("./TutorialTooltip").TutorialStep | null;
  handleTutorialNext: () => void;
  handleSkipTutorial: () => void;
  triggerNavigationTutorial: () => void;
  resetTutorial: () => void;
  getTutorialSteps: () => import("./TutorialTooltip").TutorialStep[];
}

// ActiveSessionPanel component props
export interface ActiveSessionPanelProps {
  session: MealSessionState;
  sessionIndex: number;
  sessionTotal: number;
  sessionPromotions?: any[];
  validationError?: string | null;
  isUnscheduled?: boolean;
  canRemove: boolean;
  onEditSession: () => void;
  onRemoveSession: (e: React.MouseEvent) => void;
  onEditItem: (itemIndex: number) => void;
  onRemoveItem: (itemIndex: number) => void;
  onSwapItem: (itemIndex: number) => void;
  onRemoveBundle: (bundleId: string) => void;
  collapsedCategories: Set<string>;
  onToggleCategory: (categoryName: string) => void;
  onViewMenu: () => void;
  isCurrentSessionValid: boolean;
  totalPrice: number;
  onCheckout: () => void;
  showCheckoutButton?: boolean;
  restaurants?: { id: string; restaurant_name: string; images: string[] }[];
}

// ViewOrderModal component props
export interface ViewOrderModalProps {
  isOpen: boolean;
  onClose: () => void;
  mealSessions: MealSessionState[];
  activeSessionIndex: number;
  onSessionChange: (index: number) => void;
  getSessionTotal: (index: number) => number;
  getSessionDiscount: (index: number) => { promotions: any[] };
  validationErrors: Record<number, string>;
  onEditSession: (index: number) => void;
  onRemoveSession: (index: number, e: React.MouseEvent) => void;
  onEditItem: (itemIndex: number) => void;
  onRemoveItem: (itemIndex: number) => void;
  onSwapItem: (itemIndex: number) => void;
  onRemoveBundle: (bundleId: string) => void;
  collapsedCategories: Set<string>;
  onToggleCategory: (categoryName: string) => void;
  onViewMenu: () => void;
  generatingPdf?: boolean;
  isCurrentSessionValid: boolean;
  totalPrice: number;
  onCheckout: () => void;
  canRemoveSession: (index: number) => boolean;
  formatTimeDisplay: (eventTime: string | undefined) => string;
  // DateSessionNav props for modal
  navMode: "dates" | "sessions";
  dayGroups: DayGroup[];
  selectedDayDate: string | null;
  currentDayGroup: DayGroup | null;
  onDateClick: (dayDate: string) => void;
  onBackToDates: () => void;
  onAddDay: () => void;
  onAddSessionToDay: (dayDate: string) => void;
  restaurants?: { id: string; restaurant_name: string; images: string[] }[];
  pricing?: CateringPricingResult | null;
  calculatingPricing?: boolean;
}

// Catering data hook return type
export interface UseCateringDataReturn {
  // Categories
  categories: import("@/types/catering.types").CategoryWithSubcategories[];
  selectedCategory: import("@/types/catering.types").CategoryWithSubcategories | null;
  selectedSubcategory: import("@/types/catering.types").Subcategory | null;
  categoriesLoading: boolean;
  categoriesError: string | null;
  handleCategoryClick: (category: import("@/types/catering.types").CategoryWithSubcategories) => void;
  handleSubcategoryClick: (subcategory: import("@/types/catering.types").Subcategory) => void;
  selectMainsCategory: () => void;

  // Menu items
  menuItems: MenuItem[];
  menuItemsLoading: boolean;
  menuItemsError: string | null;

  // Restaurants
  restaurants: Restaurant[];

  // All menu items
  allMenuItems: MenuItem[] | null;
  fetchAllMenuItems: () => void;
}
