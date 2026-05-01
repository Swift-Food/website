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
  address: string | null;
  // Arrays are null when the field has never been asked, [] when the
  // user explicitly said "none". Differentiate so the summary card
  // can render "Dietary: not set yet" vs "Dietary: none".
  dietaryRestrictions: string[] | null;
  occasion: string | null;
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

export interface ChipOption {
  label: string;
  field: string;
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
}

export type MessagePart =
  | { type: "text"; text: string }
  | { type: "summary_card"; taxonomy: CollectedTaxonomyView; editable: string[] }
  | { type: "chips"; chips: Chip[] }
  | { type: "menu_draft"; draft: MenuDraft }
  | { type: "clarifier"; field: string; question: string; options: ChipOption[] };

export interface ChatResponse {
  sessionId: string;
  status: ChatStatus;
  parts: MessagePart[];
  draft?: MenuDraft;
  message?: string;
  collectedFields: string[];
}
