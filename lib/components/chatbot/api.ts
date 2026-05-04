import type { ChatResponse } from "./types";
import type {
  HandoffItem,
  OrderDraftHandoff,
} from "@/lib/types/order-draft-handoff";

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
): Promise<ChatResponse> {
  const res = await fetch(`${API_BASE}/catering-chat/${sid}/edit-field`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ field, value }),
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
    | { action: "swap"; itemId: string; replacementMenuItemId: string }
    | { action: "remove"; itemId: string }
    | { action: "set_quantity"; itemId: string; quantity: number },
): Promise<ChatResponse> {
  const res = await fetch(`${API_BASE}/catering-chat/${sid}/menu-action`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  return handle(res);
}

export async function pickRestaurant(
  sid: string,
  restaurantId: string,
): Promise<ChatResponse> {
  const res = await fetch(`${API_BASE}/catering-chat/${sid}/pick-restaurant`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ restaurantId }),
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
): Promise<SwapOption[]> {
  const res = await fetch(
    `${API_BASE}/catering-chat/${sid}/swap-options/${encodeURIComponent(itemId)}`,
  );
  if (!res.ok) throw new ChatApiError(`HTTP ${res.status}`, res.status);
  return res.json();
}

export async function moreVariety(sid: string): Promise<ChatResponse> {
  const res = await fetch(`${API_BASE}/catering-chat/${sid}/more-variety`, {
    method: "POST",
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
 * types. Both sides depend only on OrderDraftHandoff.
 *
 * Returns null when the session isn't in a handoff-ready state (no
 * draft, missing required event fields). Caller decides what to render.
 */
export function chatSessionToHandoff(
  response: ChatResponse,
): OrderDraftHandoff | null {
  if (response.status !== "complete" || !response.draft) return null;

  const t = response.taxonomy ?? {};
  const headcount =
    typeof (t as any).headcount === "number" ? (t as any).headcount : 0;
  // Address isn't captured in the chat taxonomy — the order form
  // collects it after handoff. Always empty here.
  const address = "";
  const draft = response.draft;

  const { date, time } = splitEventDateTime((t as any).eventDateTime);

  // Synthesise a single notes string from the structured fields the
  // order form doesn't have first-class slots for. The order form
  // surfaces this in a free-text "Special requests" field.
  // extras is a backend retrieval signal (raw dish/ingredient terms the
  // LLM extracted for vector search), not a user-authored note — don't
  // surface it on the order form.
  const noteParts: string[] = [];
  const dietary = (t as any).dietaryRestrictions as string[] | null;
  const cuisine = (t as any).cuisinePreference as string[] | null;
  const occasion = (t as any).occasion as string | null;
  if (Array.isArray(dietary) && dietary.length > 0) {
    noteParts.push(`Dietary: ${dietary.join(", ")}`);
  }
  if (Array.isArray(cuisine) && cuisine.length > 0) {
    noteParts.push(`Cuisine: ${cuisine.join(", ")}`);
  }
  if (occasion) noteParts.push(`Occasion: ${occasion}`);

  const items: HandoffItem[] = draft.items.map((d) => ({
    menuItemId: d.menuItemId,
    name: d.name,
    description: d.description,
    imageUrl: d.imageUrl,
    groupTitle: d.groupTitle,
    price: d.unitPrice.toFixed(2),
    feedsPerUnit: d.feedsPerUnit,
    quantity: d.quantity,
    allergens: d.allergens ?? [],
    dietaryFilters: d.dietaryFilters ?? [],
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
    restaurant: {
      id: draft.restaurant.id,
      name: draft.restaurant.name,
      imageUrl: draft.restaurant.imageUrl,
    },
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
