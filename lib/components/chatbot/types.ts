/**
 * Frontend mirror of the backend's typed message-part contract. Kept
 * in sync manually — when the backend's message-part.types.ts changes
 * shape, this file gets the matching update.
 */

export type ChatStatus =
  | "collecting"
  | "awaiting_confirmation" // legacy: backend no longer sets this; treat as 'collecting' if encountered
  | "complete"
  | "no_match"
  | "abandoned";

/**
 * Display-formatted view of the shared (event-wide) taxonomy. Mirrors
 * the backend's `SharedTaxonomyView` from datetime-format.helper.
 */
export interface SharedTaxonomyView {
  budget: number | null;
  occasion: string | null;
  // Always an array (backend initialises to []). Empty means the user
  // hasn't specified or said "none" — render the same.
  dietaryRestrictions: string[];
  // Arrays are null when the field has never been asked, [] when the
  // user explicitly said "none".
  cuisinePreference: string[] | null;
  allergensToExclude: string[] | null;
  formatPreference: string[] | null;
  // Backend-only retrieval signal. Do NOT render — it's the free-text
  // bucket the LLM stuffs dish/ingredient terms into for vector search.
  extras: string;
}

/**
 * Per-meal display view. Mirrors the backend's `ChatMealSessionView`.
 * One per planned meal in the order; multi-meal orders carry multiple.
 */
export interface ChatMealSessionView {
  index: number;
  sessionName: string;
  sessionDate: string; // friendly form: "Friday 15 May"
  eventTime: string; // "9:00 AM" or "13:00"
  guestCount: number | null;
  mealTime: string | null; // "Breakfast" | "Lunch" | "Dinner"
  hasDraft: boolean;
  ready: boolean; // hasDraft AND guestCount !== null
  /**
   * Per-meal cart draft. Backend hydrates this so the page's left aside
   * can render the cart without a separate menu_plan part.
   */
  draft: MenuDraft | null;
  /** Resolved override-vs-shared, ready for UI display. */
  effectiveTaxonomy: {
    dietaryRestrictions: string[];
    cuisinePreference: string[] | null;
    allergensToExclude: string[] | null;
    formatPreference: string[] | null;
  };
}

export type ChipAction =
  | "send_text"
  | "edit_field"
  | "confirm"
  | "menu_action"
  | "add_to_basket"
  | "more_variety"
  | "pick_meal_session"
  | "confirm_inheritance";

export interface Chip {
  label: string;
  action: ChipAction;
  payload?: Record<string, unknown>;
}

/**
 * Shared-taxonomy field names, used by ChipOption.field. Per-meal field
 * routing happens via the `mealSessionIndex` payload on the chip itself,
 * not via this type.
 */
export type SharedTaxonomyField =
  | "budget"
  | "occasion"
  | "dietary_restrictions"
  | "cuisine_preference"
  | "allergens_to_exclude"
  | "format_preference"
  | "extras";

export interface ChipOption {
  label: string;
  /** Where this option's value is routed. */
  field: SharedTaxonomyField | "extras_addition" | "ignore";
  value: unknown;
}

export type MealCategory = "main" | "snack" | "drink" | "dessert";

export interface RestaurantSummary {
  id: string;
  name: string;
  imageUrl: string | null;
  cuisine: string;
}

export interface RestaurantSubtotal {
  restaurantId: string;
  restaurantName: string;
  itemCount: number;
  subtotal: number;
  meetsMinOrder: boolean;
  minOrderShortfall?: { missingItems: number; missingValue: number };
}

export interface DraftItem {
  id: string;
  menuItemId: string;
  name: string;
  description: string | null;
  imageUrl: string | null;
  groupTitle: string | null;
  mealCategory: string;
  allergens: string[];
  dietaryFilters: string[];
  unitPrice: number;
  feedsPerUnit: number;
  cateringQuantityUnit: number;
  quantity: number;
  totalPrice: number;
  reason: string;
  restaurantId: string;
  intentPhrase: string;
}

export interface DraftPricing {
  subtotal: number;
  pricePerPerson: number;
  budgetRemaining: number;
}

export interface RestaurantCandidate {
  restaurant: RestaurantSummary;
  estimatedPricePerPerson: number;
  pickedReason: string;
}

export interface MenuDraft {
  id: string;
  restaurants: RestaurantSummary[];
  restaurantSubtotals: RestaurantSubtotal[];
  items: DraftItem[];
  pricing: DraftPricing;
  feedsPeople: number;
  pickedReason: string;
  alternatives: RestaurantCandidate[];
}

// ── Exploration mode (no headcount yet) ─────────────────────────────
// Returned when the user is browsing rather than committing to a draft.
// No qty/cost — those need a headcount.

export interface PreviewItem {
  menuItemId: string;
  name: string;
  description: string | null;
  imageUrl: string | null;
  groupTitle: string | null;
  mealCategory: MealCategory;
  /** When during the day this item is offered ("breakfast", "lunch", "all", …). */
  mealTime: string;
  allergens: string[];
  dietaryFilters: string[];
  /** Free-text ingredient list pulled from the menu_item record. */
  ingredients: string[];
  unitPrice: number;
  /** Sale price when isDiscount=true; null otherwise. */
  discountPrice: number | null;
  isDiscount: boolean;
  /** How many people one pack feeds. */
  feedsPerUnit: number;
  /** Pack size — how many physical units make one orderable pack. */
  cateringQuantityUnit: number;
  /** Restaurant's per-item minimum order. */
  minOrderQuantity: number;
  /** Estimated prep time in minutes. */
  prepTime: number;
  /** Surfaced because it's been ordered more than peers. */
  popular: boolean;
  /** Average rating out of 5 from past orders. 0 = unrated. */
  averageRating: number;
  restaurant: RestaurantSummary;
  /** One-line "shown because…" copy. e.g. "Top vector match for 'spicy'". */
  matchReason: string;
}

export interface PreviewSection {
  /** The intent this section answers, e.g. "pizza", "milk tea". Single-intent
   *  queries produce one section whose intent equals the user's query. */
  intent: string;
  items: PreviewItem[];
}

export interface MenuPreview {
  /** Up to 5 sections, one per distinct retrieval intent. */
  sections: PreviewSection[];
}

/** Chip-strip tag derived from taxonomy. Array fields emit removable
 * tags (one per value); scalar fields emit a single non-removable tag. */
export interface SummaryTag {
  field: string;
  value: string;
  removable: boolean;
}

/**
 * One meal session's draft, wrapped with the meal-session metadata.
 * Multi-meal orders produce one PlanDraft per meal; single-meal orders
 * produce one. The wrapper carries the meal index so refinement actions
 * (swap/remove/qty/restaurant) know which meal they're acting on.
 */
export interface PlanDraft {
  mealSessionIndex: number;
  sessionName: string;
  sessionDate: string;
  eventTime: string;
  guestCount: number;
  draft: MenuDraft;
  ready: boolean;
}

// ── Intent-block types (catering chat v3) ───────────────────────────────────

export interface ClientIntent {
  intentId: string;
  phrase: string;
  category: 'main' | 'snack' | 'drink' | 'dessert' | null;
  /** Pack count of THE matched dish (e.g. "10 marinara pizzas" → 10).
   *  When set, the builder pins one item to this quantity. */
  quantity: number | null;
  /** Number of DIFFERENT items to surface ("3 different pizzas" → 3).
   *  When set, the builder slices top-N retrieval results. */
  variety: number | null;
  restaurantScope: string[] | null;
  excludes: string[] | null;
}

export interface IntentBlockGroupSection {
  title: string | null;
  order: number;
  itemIndexes: number[];
}

export interface IntentBlockItem {
  id: string;
  name: string;
  price: number;
  groupTitle: string | null;
  displayOrder: number;
  mealCategory: 'main' | 'snack' | 'drink' | 'dessert';
  description: string | null;
  imageUrl: string | null;
  reason: string | null;
  allergens: string[];
  dietaryFilters: string[];
  feedsPerUnit: number;
  /** Catering pack size (default 1). Client uses for default-qty rounding. */
  cateringQuantityUnit: number;
  /** Restaurant-set minimum packs per order for this item. effectiveQty
   *  clamps default-share computations up to this floor so the cart
   *  doesn't under-order below the restaurant's per-item minimum. */
  minOrderQuantity: number;
}

/** One restaurant's curated picks for an intent. Up to 5 per IntentBlockPart, ranked by candidate count. */
export interface ClientRestaurantPick {
  restaurant: {
    id: string;
    name: string;
    cuisineTags: string[];
    imageUrl: string | null;
    rating: number;
    /** From restaurant.cateringMinOrderSettings.required.minQuantity. 0 = no minimum. */
    minQuantity: number;
  };
  items: IntentBlockItem[];
  groupSections: IntentBlockGroupSection[];
  candidateCount: number;
  pickedReason: string | null;
}

/** Named shape for an intent-block message part, reused inside meal_session.intentBlocks. */
export interface IntentBlockPart {
  type: "intent_block";
  intentId: string;
  mealSessionIndex: number; // -1 for exploration mode
  intent: ClientIntent;
  /** Top-5 ranked restaurants. [0] is the default selection; the parent applies cohesion to choose which to display. */
  restaurantPicks: ClientRestaurantPick[];
}

export type MessagePart =
  | { type: "text"; text: string }
  | { type: "chips"; chips: Chip[] }
  | {
      type: "menu_plan";
      drafts: PlanDraft[];
      activeMealSessionIndex: number;
    }
  | { type: "menu_preview"; preview: MenuPreview }
  | {
      type: "clarifier";
      field: string;
      question: string;
      options: ChipOption[];
    }
  | {
      type: "feedback";
      retrieval_event_id: string;
      prompt: string;
      state: "pending" | "thumbs_up" | "thumbs_down";
    }
  | IntentBlockPart
  | MealSessionPart;

/**
 * Top-level "Your Event" panel snapshot. Replaces the legacy
 * summary_card MessagePart — that part was filtered out of the chat
 * thread anyway and required walking history to find, which produced
 * stale UI after a clear ("delete everything"). `response.summary`
 * always reflects current state.
 */
export interface SessionSummary {
  taxonomy: SharedTaxonomyView;
  editable: string[];
  tags: SummaryTag[];
}

/**
 * Aggregator part — one per meal session, intent blocks pre-sorted by
 * mealCategory. Mirrors the backend's `MealSessionPart`. Carries both
 * the per-intent restaurant picks (browse) and the committed draft
 * (cart) so the page-aside can render either without a separate part.
 */
export interface MealSessionPart {
  type: "meal_session";
  mealSessionIndex: number;
  sessionName: string;
  sessionDate: string | null;
  eventTime: string | null;
  guestCount: number | null;
  intentBlocks: IntentBlockPart[];
  /** The cart for this meal — null until the builder produces one. */
  draft: MenuDraft | null;
}

export interface ChatResponse {
  sessionId: string;
  status: ChatStatus;
  parts: MessagePart[];
  /** "Your Event" panel snapshot — taxonomy, editable fields, derived tags.
   *  Always present and always reflects current state. */
  summary: SessionSummary;
  /** Per-meal display views — one per planned meal. */
  mealSessions: ChatMealSessionView[];
  /** Which meal the user is currently focused on. */
  activeMealSessionIndex: number;
  message?: string;
  collectedFields: string[];
}
