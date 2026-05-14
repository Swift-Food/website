import type { ChatResponse } from "./types";
import type {
  HandoffItem,
  OrderDraftHandoff,
} from "@/lib/types/order-draft-handoff";

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "";

// Swift's own /catering-AI page authenticates to the partner-gated chat
// endpoints with its own publishable key. The "Swift Food" PartnerSpace
// (slug: swift-food) is treated as Swift's first-party caller — its key
// lives in NEXT_PUBLIC_SWIFT_CATERING_PUBLISHABLE_KEY. Same security model
// as Stripe pk_live_* — the partner's allowedOrigins allowlist is what
// enforces the boundary, not the key's secrecy.
const partnerHeaders = (): Record<string, string> => {
  const key = process.env.NEXT_PUBLIC_SWIFT_CATERING_PUBLISHABLE_KEY;
  return key ? { "X-Partner-Key": key } : {};
};

export class ChatApiError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.status = status;
  }
}

async function handle(res: Response): Promise<ChatResponse> {
  if (res.status === 409) {
    throw new ChatApiError(
      "Just a moment — your last message is still being processed.",
      409,
    );
  }
  if (res.status === 503) {
    let body: { message?: string } = {};
    try {
      body = await res.json();
    } catch {
      // Non-JSON body
    }
    throw new ChatApiError(
      body.message ??
        "Our AI is having a busy moment — give it 20–30 seconds and try again.",
      503,
    );
  }
  if (!res.ok) {
    throw new ChatApiError(`HTTP ${res.status}`, res.status);
  }
  return (await res.json()) as ChatResponse;
}

export async function createSession(): Promise<ChatResponse> {
  const res = await fetch(`${API_BASE}/catering-chat/session`, {
    method: "POST",
    headers: partnerHeaders(),
  });
  return handle(res);
}

export async function getSession(sid: string): Promise<ChatResponse> {
  const res = await fetch(`${API_BASE}/catering-chat/${sid}`, {
    headers: partnerHeaders(),
  });
  return handle(res);
}

import type { CartSnapshot } from "./cart/snapshot";

export async function sendMessage(
  sid: string,
  message: string,
  cartSnapshot?: CartSnapshot | null,
): Promise<ChatResponse> {
  const body: Record<string, unknown> = { message };
  if (cartSnapshot) body.cartSnapshot = cartSnapshot;
  const res = await fetch(`${API_BASE}/catering-chat/${sid}/message`, {
    method: "POST",
    headers: { "Content-Type": "application/json", ...partnerHeaders() },
    body: JSON.stringify(body),
  });
  return handle(res);
}

export async function editField(
  sid: string,
  field: string,
  value: unknown,
  mealSessionIndex?: number,
): Promise<ChatResponse> {
  const body: Record<string, unknown> = { field, value };
  if (mealSessionIndex !== undefined) body.mealSessionIndex = mealSessionIndex;
  const res = await fetch(`${API_BASE}/catering-chat/${sid}/edit-field`, {
    method: "POST",
    headers: { "Content-Type": "application/json", ...partnerHeaders() },
    body: JSON.stringify(body),
  });
  return handle(res);
}

export async function confirm(sid: string): Promise<ChatResponse> {
  const res = await fetch(`${API_BASE}/catering-chat/${sid}/confirm`, {
    method: "POST",
    headers: partnerHeaders(),
  });
  return handle(res);
}

export async function menuAction(
  sid: string,
  payload:
    | { action: "swap"; itemId: string; replacementMenuItemId: string; mealSessionIndex?: number }
    | { action: "remove"; itemId: string; mealSessionIndex?: number }
    | { action: "set_quantity"; itemId: string; quantity: number; mealSessionIndex?: number }
    | { action: "pick_meal_session"; mealSessionIndex: number }
    | { action: "confirm_inheritance"; mealSessionIndex: number; accept: boolean },
): Promise<ChatResponse> {
  const res = await fetch(`${API_BASE}/catering-chat/${sid}/menu-action`, {
    method: "POST",
    headers: { "Content-Type": "application/json", ...partnerHeaders() },
    body: JSON.stringify(payload),
  });
  return handle(res);
}

export interface SwapOption {
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
  quantity: number;
  totalPrice: number;
  reason: string;
}

export async function moreVariety(
  sid: string,
  mealSessionIndex?: number,
): Promise<ChatResponse> {
  const body: Record<string, unknown> = {};
  if (mealSessionIndex !== undefined) body.mealSessionIndex = mealSessionIndex;
  const res = await fetch(`${API_BASE}/catering-chat/${sid}/more-variety`, {
    method: "POST",
    headers: { "Content-Type": "application/json", ...partnerHeaders() },
    body: JSON.stringify(body),
  });
  return handle(res);
}

export interface BasketPick {
  intentId: string;
  restaurantId: string;
  intentPhrase: string;
  items: Array<{ menuItemId: string; quantity: number }>;
}

export interface AddToBasketRequest {
  mealSessionIndex?: number;
  picks: BasketPick[];
}

export interface AddToBasketResponse {
  orderId: string | null;
  redirectUrl: string;
  warnings: string[];
}

/**
 * Hand the cart off to the basket / event-order page. The actual order
 * is placed later on /event-order's checkout flow — this just verifies
 * picks, applies promotions, persists the draft, and returns a redirect.
 */
export async function addToBasket(
  sid: string,
  body: AddToBasketRequest,
): Promise<AddToBasketResponse> {
  const res = await fetch(`${API_BASE}/catering-chat/${sid}/add-to-basket`, {
    method: "POST",
    headers: { "Content-Type": "application/json", ...partnerHeaders() },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    let msg = `HTTP ${res.status}`;
    try {
      const j = await res.json();
      if (typeof j?.message === "string") msg = j.message;
    } catch {
      // leave default
    }
    throw new ChatApiError(msg, res.status);
  }
  return res.json();
}

export interface SwapOptionsByRestaurantRequest {
  restaurantId: string;
  category: string;
  excludeMenuItemIds: string[];
  intentPhrase?: string;
  intentExcludes?: string[];
}

export async function getSwapOptionsByRestaurant(
  sid: string,
  body: SwapOptionsByRestaurantRequest,
): Promise<SwapOption[]> {
  const res = await fetch(
    `${API_BASE}/catering-chat/${sid}/swap-options-by-restaurant`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json", ...partnerHeaders() },
      body: JSON.stringify(body),
    },
  );
  if (!res.ok) throw new ChatApiError(`HTTP ${res.status}`, res.status);
  return res.json();
}

/**
 * Single boundary transform: chat-API response → neutral handoff. The
 * order form never sees chat types; CateringContext never sees backend
 * types. Both sides depend only on OrderDraftHandoff.
 *
 * Returns null when the session isn't in a handoff-ready state (no
 * draft, missing required event fields). Caller decides what to render.
 */
export function chatSessionToHandoff(
  response: ChatResponse,
): OrderDraftHandoff | null {
  if (response.status !== "complete") return null;

  // The active meal's draft is the cart. Drafts now live per-meal on the
  // ChatMealSessionView (wire field on `response.mealSessions[i].draft`)
  // — the legacy `menu_plan` part wrapper has been removed.
  const activeMeal =
    response.mealSessions[response.activeMealSessionIndex] ??
    response.mealSessions[0];
  const draft = activeMeal?.draft;
  if (!draft) return null;

  const headcount = activeMeal?.guestCount ?? draft.feedsPeople ?? 1;
  // Combine sessionDate ("Friday 15 May 2026") with eventTime ("12:30 pm") so
  // splitEventDateTime can extract both a date and a time in one parse pass.
  // The backend formats sessionDate without a year when no year is present;
  // eventTime carries the clock portion. Without combining, the time is lost.
  const rawDateTime = activeMeal?.sessionDate
    ? activeMeal.eventTime
      ? `${activeMeal.sessionDate} at ${activeMeal.eventTime}`
      : activeMeal.sessionDate
    : null;
  const { date, time } = splitEventDateTime(rawDateTime);
  // Address isn't captured in the chat taxonomy — the order form
  // collects it after handoff.
  const address = "";

  // Synthesise a single notes string from shared taxonomy fields. extras
  // is a backend retrieval signal (raw dish/ingredient terms the LLM
  // extracted for vector search), not a user-authored note — don't
  // surface it on the order form.
  const t = response.summary.taxonomy;
  const noteParts: string[] = [];
  if (t.dietaryRestrictions.length > 0) {
    noteParts.push(`Dietary: ${t.dietaryRestrictions.join(", ")}`);
  }
  if (t.cuisinePreference && t.cuisinePreference.length > 0) {
    noteParts.push(`Cuisine: ${t.cuisinePreference.join(", ")}`);
  }
  if (t.occasion) noteParts.push(`Occasion: ${t.occasion}`);

  const items: HandoffItem[] = draft.items.map((d) => ({
    menuItemId: d.menuItemId,
    name: d.name,
    description: d.description,
    imageUrl: d.imageUrl,
    groupTitle: d.groupTitle,
    price: d.unitPrice.toFixed(2),
    feedsPerUnit: d.feedsPerUnit,
    cateringQuantityUnit: d.cateringQuantityUnit,
    quantity: d.quantity,
    allergens: d.allergens ?? [],
    dietaryFilters: d.dietaryFilters ?? [],
    restaurantId: d.restaurantId,
  }));

  return {
    source: "chatbot",
    event: {
      date,
      time,
      headcount,
      address,
      specialRequests: noteParts.join(" · "),
    },
    restaurants: draft.restaurants.map((r) => ({
      id: r.id,
      name: r.name,
      imageUrl: r.imageUrl,
    })),
    items,
  };
}

/**
 * Pull date and time out of the friendly form the chat API returns
 * (e.g. "Friday, 15 May 2026 at 12:30 pm"). The handoff requires ISO
 * YYYY-MM-DD date + HH:MM (24h) time so the order form's native
 * inputs accept them. Falls back to empty strings when parsing fails
 * — the form will treat them as unset.
 */
function splitEventDateTime(formatted: string | null): {
  date: string;
  time: string;
} {
  if (!formatted) return { date: "", time: "" };
  // The chat API returns a friendly form ("Friday, 15 May 2026 at
  // 12:30 pm"). JavaScript's Date() chokes on the literal "at"; strip
  // it (and try a couple of variants) before parsing. Mirrors the
  // backend's tolerantParseDate so the same inputs produce the same
  // round-trip result on either side.
  const candidates = [
    formatted,
    formatted.replace(/\s+at\s+/gi, " "),
    formatted.replace(/[,]/g, ""),
    formatted.replace(/\s+at\s+/gi, " ").replace(/[,]/g, ""),
  ];
  for (const c of candidates) {
    const parsed = new Date(c);
    if (Number.isNaN(parsed.getTime())) continue;
    const pad = (n: number) => String(n).padStart(2, "0");
    const date = `${parsed.getFullYear()}-${pad(parsed.getMonth() + 1)}-${pad(parsed.getDate())}`;
    const time = `${pad(parsed.getHours())}:${pad(parsed.getMinutes())}`;
    return { date, time };
  }
  return { date: "", time: "" };
}
