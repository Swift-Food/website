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
  /** The cart for this meal. Null until the builder runs and produces one. */
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
  | "pick_restaurant"
  | "place_order"
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

/** Chip-strip tag derived from taxonomy. Array fields emit removable
 * tags (one per value); scalar fields emit a single non-removable tag. */
export interface SummaryTag {
  field: string;
  value: string;
  removable: boolean;
}

// ── Intent-block types (catering chat v3) ───────────────────────────────────

export interface ClientIntent {
  intentId: string;
  phrase: string;
  category: 'main' | 'snack' | 'drink' | 'dessert' | null;
  count: number | null;
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
}

/** One restaurant's curated picks for an intent. Up to 5 per IntentBlockPart, ranked by candidate count. */
export interface ClientRestaurantPick {
  restaurant: {
    id: string;
    name: string;
    cuisineTags: string[];
    imageUrl: string | null;
    rating: number;
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
  | {
      type: "summary_card";
      taxonomy: SharedTaxonomyView;
      editable: string[];
      tags: SummaryTag[];
    }
  | { type: "chips"; chips: Chip[] }
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
  | {
      type: "meal_session";
      mealSessionIndex: number;
      sessionName: string;
      sessionDate: string | null;
      eventTime: string | null;
      guestCount: number | null;
      intentBlocks: IntentBlockPart[];
    };

export interface ChatResponse {
  sessionId: string;
  status: ChatStatus;
  parts: MessagePart[];
  /** Display-formatted view of the shared (event-wide) taxonomy. */
  taxonomy: SharedTaxonomyView;
  /** Per-meal display views — one per planned meal. */
  mealSessions: ChatMealSessionView[];
  /** Which meal the user is currently focused on. */
  activeMealSessionIndex: number;
  message?: string;
  collectedFields: string[];
}
