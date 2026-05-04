/**
 * Frontend mirror of the backend's typed message-part contract. Kept
 * in sync manually — when the backend's message-part.types.ts changes
 * shape, this file gets the matching update.
 */

export type ChatStatus =
  | "collecting"
  | "awaiting_confirmation"
  | "complete"
  | "no_match"
  | "abandoned";

export interface CollectedTaxonomyView {
  headcount: number | null;
  budget: number | null;
  eventDateTime: string | null;
  mealTime: string | null;
  // Always an array (backend initialises to []). Empty means the user
  // hasn't specified or said "none" — render the same.
  dietaryRestrictions: string[];
  occasion: string | null;
  // Arrays are null when the field has never been asked, [] when the
  // user explicitly said "none". Differentiate so the summary card
  // can render "Cuisine: not set yet" vs "Cuisine: none".
  cuisinePreference: string[] | null;
  allergensToExclude: string[] | null;
  formatPreference: string[] | null;
  extras: string;
}

export type ChipAction =
  | "send_text"
  | "edit_field"
  | "confirm"
  | "menu_action"
  | "pick_restaurant"
  | "place_order"
  | "more_variety";

export interface Chip {
  label: string;
  action: ChipAction;
  payload?: Record<string, unknown>;
}

export type TaxonomyField =
  | "headcount"
  | "budget"
  | "event_datetime"
  | "meal_time"
  | "dietary_restrictions"
  | "occasion"
  | "cuisine_preference"
  | "allergens_to_exclude"
  | "format_preference"
  | "extras";

export interface ChipOption {
  label: string;
  /** Where this option's value is routed. */
  field: TaxonomyField | "extras_addition" | "ignore";
  value: unknown;
}

export type MealCategory = "main" | "snack" | "drink" | "dessert";

export interface RestaurantSummary {
  id: string;
  name: string;
  cuisine: string | null;
  rating: number;
  imageUrl: string | null;
}

export interface DraftItem {
  id: string;
  menuItemId: string;
  name: string;
  description: string | null;
  imageUrl: string | null;
  groupTitle: string | null;
  mealCategory: MealCategory;
  allergens: string[];
  dietaryFilters: string[];
  unitPrice: number;
  feedsPerUnit: number;
  quantity: number;
  totalPrice: number;
  reason: string;
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
  restaurant: RestaurantSummary;
  items: DraftItem[];
  pricing: DraftPricing;
  feedsPeople: number;
  pickedReason: string;
  alternatives: RestaurantCandidate[];
  /** Stringified bigint from retrieval_events.id. Used to wire feedback parts back to the retrieval event that produced this draft. */
  retrievalEventId?: string;
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
  allergens: string[];
  dietaryFilters: string[];
  unitPrice: number;
  feedsPerUnit: number;
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

export type MessagePart =
  | { type: "text"; text: string }
  | {
      type: "summary_card";
      taxonomy: CollectedTaxonomyView;
      editable: string[];
      tags: SummaryTag[];
    }
  | { type: "chips"; chips: Chip[] }
  | { type: "menu_draft"; draft: MenuDraft }
  | { type: "menu_preview"; preview: MenuPreview }
  | { type: "clarifier"; field: string; question: string; options: ChipOption[] }
  | {
      type: "feedback";
      retrieval_event_id: string;
      prompt: string;
      state: "pending" | "thumbs_up" | "thumbs_down";
    };

export interface ChatResponse {
  sessionId: string;
  status: ChatStatus;
  parts: MessagePart[];
  /**
   * Display-formatted view of the captured taxonomy. Always present
   * regardless of status — useful for inspecting captured fields
   * without depending on which parts are emitted.
   */
  taxonomy: CollectedTaxonomyView;
  draft?: MenuDraft;
  message?: string;
  collectedFields: string[];
}
