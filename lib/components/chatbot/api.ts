import type { ChatResponse } from "./types";
import type { HandoffItem, OrderDraftHandoff } from "@/lib/types/order-draft-handoff";

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "";

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
  const res = await fetch(`${API_BASE}/catering-chat/session`, { method: "POST" });
  return handle(res);
}

export async function getSession(sid: string): Promise<ChatResponse> {
  const res = await fetch(`${API_BASE}/catering-chat/${sid}`);
  return handle(res);
}

export async function sendMessage(
  sid: string,
  message: string,
): Promise<ChatResponse> {
  const res = await fetch(`${API_BASE}/catering-chat/${sid}/message`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ message }),
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
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  return handle(res);
}

export async function confirm(sid: string): Promise<ChatResponse> {
  const res = await fetch(`${API_BASE}/catering-chat/${sid}/confirm`, {
    method: "POST",
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
    headers: { "Content-Type": "application/json" },
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

export async function getSwapOptions(
  sid: string,
  itemId: string,
  mealSessionIndex?: number,
): Promise<SwapOption[]> {
  let url = `${API_BASE}/catering-chat/${sid}/swap-options/${encodeURIComponent(itemId)}`;
  if (mealSessionIndex !== undefined) {
    url += `?mealSessionIndex=${encodeURIComponent(String(mealSessionIndex))}`;
  }
  const res = await fetch(url);
  if (!res.ok) throw new ChatApiError(`HTTP ${res.status}`, res.status);
  return res.json();
}

export async function moreVariety(
  sid: string,
  mealSessionIndex?: number,
): Promise<ChatResponse> {
  const body: Record<string, unknown> = {};
  if (mealSessionIndex !== undefined) body.mealSessionIndex = mealSessionIndex;
  const res = await fetch(`${API_BASE}/catering-chat/${sid}/more-variety`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  return handle(res);
}

export async function placeOrder(
  sid: string,
): Promise<{ orderId: string | null; redirectUrl: string }> {
  const res = await fetch(`${API_BASE}/catering-chat/${sid}/place-order`, {
    method: "POST",
  });
  if (!res.ok) throw new ChatApiError(`HTTP ${res.status}`, res.status);
  return res.json();
}

/**
 * Single boundary transform: chat-API response → neutral handoff. The
 * order form never sees chat types; CateringContext never sees backend
 * types. Both sides depend only on OrderDraftHandoff. Returns null when
 * the session isn't handoff-ready (no draft on the active meal).
 */
export function chatSessionToHandoff(
  response: ChatResponse,
): OrderDraftHandoff | null {
  if (response.status !== "complete") return null;

  const activeMeal =
    response.mealSessions[response.activeMealSessionIndex] ??
    response.mealSessions[0];
  const draft = activeMeal?.draft;
  if (!draft) return null;

  const headcount = activeMeal?.guestCount ?? draft.feedsPeople ?? 1;
  const rawDateTime = activeMeal?.sessionDate
    ? activeMeal.eventTime
      ? `${activeMeal.sessionDate} at ${activeMeal.eventTime}`
      : activeMeal.sessionDate
    : null;
  const { date, time } = splitEventDateTime(rawDateTime);

  const t = response.taxonomy;
  const noteParts: string[] = [];
  if (t.dietaryRestrictions.length > 0) noteParts.push(`Dietary: ${t.dietaryRestrictions.join(", ")}`);
  if (t.cuisinePreference && t.cuisinePreference.length > 0) noteParts.push(`Cuisine: ${t.cuisinePreference.join(", ")}`);
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
      address: "",
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

function splitEventDateTime(formatted: string | null): { date: string; time: string } {
  if (!formatted) return { date: "", time: "" };
  const candidates = [
    formatted,
    formatted.replace(/\s+at\s+/gi, " "),
    formatted.replace(/[,]/g, ""),
    formatted.replace(/\s+at\s+/gi, " ").replace(/[,]/g, ""),
  ];
  for (const c of candidates) {
    const parsed = new Date(c);
    if (Number.isNaN(parsed.getTime())) continue;
    const yyyy = parsed.getFullYear();
    const mm = String(parsed.getMonth() + 1).padStart(2, "0");
    const dd = String(parsed.getDate()).padStart(2, "0");
    const hh = String(parsed.getHours()).padStart(2, "0");
    const mi = String(parsed.getMinutes()).padStart(2, "0");
    const date = `${yyyy}-${mm}-${dd}`;
    const time = formatted.match(/\d{1,2}[:.]\d{2}/) ? `${hh}:${mi}` : "";
    return { date, time };
  }
  return { date: "", time: "" };
}
