import type { ChatResponse } from "./types";
import type { OrderDraftHandoff } from "@/lib/types/order-draft-handoff";

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
 * types. Both sides depend only on OrderDraftHandoff.
 *
 * KNOWN GAP (Task 14 follow-up): the legacy `menu_plan` part — which
 * carried the draft this transform read from — was removed in T7. The
 * cart now lives on the meal session, but no frontend renderer is
 * wired yet (see also `useChatSession.findActiveDraft`). Until that
 * cart panel lands and decides where the draft is sourced for handoff,
 * this transform always returns null and the order page surfaces the
 * "draft isn't ready" message.
 */
export function chatSessionToHandoff(
  _response: ChatResponse,
): OrderDraftHandoff | null {
  return null;
}
