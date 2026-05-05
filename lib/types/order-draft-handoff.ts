/**
 * Neutral interface for "here's a partially-built order, hydrate the
 * order builder with it." Decouples the source of the draft (today:
 * the catering chatbot; tomorrow: a saved-drafts feature, an admin
 * tool, an embed) from the consumer (CateringContext).
 *
 * Fields are intentionally small and primitive — no class instances,
 * no `Date` objects, no methods. This is a pure data contract that
 * survives JSON serialisation and crosses module boundaries safely.
 *
 * Anyone producing a handoff is responsible for normalising their
 * native shape into this. CateringContext.hydrateFromHandoff consumes
 * it without caring where it came from.
 */
export interface OrderDraftHandoff {
  /** Where this draft came from. Used for telemetry / debugging only. */
  source: 'chatbot' | 'saved-draft' | 'admin';

  event: {
    /** ISO date YYYY-MM-DD. Pre-split from any datetime so the order form's date input maps directly. */
    date: string;
    /** HH:MM (24h). Empty string when the source had only a date. */
    time: string;
    headcount: number;
    address: string;
    /** Free-text notes synthesised from dietary / cuisine / occasion / extras. */
    specialRequests: string;
  };

  restaurants: { id: string; name: string; imageUrl: string | null }[];

  items: HandoffItem[];
}

export interface HandoffItem {
  /** Real DB id of the menu item — `menuItemId` from the chat draft, NOT the synthetic per-draft handle. */
  menuItemId: string;
  name: string;
  description: string | null;
  imageUrl: string | null;
  groupTitle: string | null;
  /** Decimal currency string ("12.00") to match the existing MenuItem.price contract. */
  price: string;
  feedsPerUnit: number;
  cateringQuantityUnit?: number;
  quantity: number;
  allergens: string[];
  dietaryFilters: string[];
  restaurantId: string;
}
