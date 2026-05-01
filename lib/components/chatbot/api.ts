import type { ChatResponse } from "./types";

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
