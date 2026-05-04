"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import * as api from "./api";
import { ChatApiError, type SwapOption } from "./api";
import type { ThreadMessage } from "./MessageThread";
import type {
  ChatResponse,
  ChatStatus,
  Chip,
  CollectedTaxonomyView,
  MenuDraft,
  MessagePart,
} from "./types";

const STORAGE_KEY = "swift-food-chat-session";

export interface SummaryCardSnapshot {
  taxonomy: CollectedTaxonomyView;
  editable: string[];
}

export interface ChatSession {
  // state
  messages: ThreadMessage[];
  sending: boolean;
  bootstrapping: boolean;
  error: string | null;
  sessionId: string | null;
  status: ChatStatus | null;
  latestDraft: MenuDraft | null;
  latestSummaryCard: SummaryCardSnapshot | null;
  latestChips: Chip[] | null;

  // setters the consumer needs
  setError: (msg: string | null) => void;

  // actions
  sendText: (text: string) => Promise<void>;
  handleChip: (chip: Chip) => Promise<void>;
  applyEditField: (field: string, value: unknown) => Promise<void>;
  swap: (itemId: string, replacementMenuItemId: string) => Promise<void>;
  remove: (itemId: string) => Promise<void>;
  setQuantity: (itemId: string, quantity: number) => Promise<void>;
  pickRestaurant: (restaurantId: string) => Promise<void>;
  moreVariety: () => Promise<void>;
  placeOrder: () => Promise<void>;
  resetSession: () => Promise<void>;

  // helpers
  getSwapOptions: (itemId: string) => Promise<SwapOption[]>;
  getTaxonomyValueFor: (field: string) => unknown;
}

export interface UseChatSessionOptions {
  /**
   * When false, the hook will not bootstrap a session yet. Used by the
   * floating widget which only wants to start a conversation when the
   * panel is opened. The full-page surface passes true.
   */
  enabled?: boolean;
}

/**
 * Owns the chat session lifecycle: bootstrap from localStorage, send
 * messages, apply server responses, and run refinement actions
 * (swap/remove/qty/edit-field/pick-restaurant/place-order). UI surfaces
 * (floating widget, /catering-AI page) consume this hook and supply
 * their own layout, modals, and input chrome.
 */
export function useChatSession(
  options: UseChatSessionOptions = {},
): ChatSession {
  const { enabled = true } = options;

  const [messages, setMessages] = useState<ThreadMessage[]>([]);
  const [sending, setSending] = useState(false);
  const [bootstrapping, setBootstrapping] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [status, setStatus] = useState<ChatStatus | null>(null);

  const sessionIdRef = useRef<string | null>(null);
  const lastTaxonomyRef = useRef<Record<string, unknown>>({});

  const applyResponse = useCallback((data: ChatResponse, asReply: boolean) => {
    const parts = data.parts ?? legacyToParts(data);
    captureTaxonomy(parts, lastTaxonomyRef);
    setStatus(data.status ?? null);
    if (asReply) {
      setMessages((prev) => [
        ...prev,
        { id: `b-${Date.now()}`, sender: "bot", parts },
      ]);
    } else {
      setMessages([{ id: data.sessionId, sender: "bot", parts }]);
    }
  }, []);

  const createSession = useCallback(async () => {
    setBootstrapping(true);
    setError(null);
    try {
      const data = await api.createSession();
      sessionIdRef.current = data.sessionId;
      setSessionId(data.sessionId);
      window.localStorage.setItem(STORAGE_KEY, data.sessionId);
      applyResponse(data, false);
    } catch {
      setError("Couldn't start the chat. Please try again in a moment.");
    } finally {
      setBootstrapping(false);
    }
  }, [applyResponse]);

  const resumeSession = useCallback(
    async (sid: string) => {
      setBootstrapping(true);
      setError(null);
      try {
        const data = await api.getSession(sid);
        applyResponse(data, false);
      } catch (e) {
        if (e instanceof ChatApiError && e.status === 404) {
          window.localStorage.removeItem(STORAGE_KEY);
          sessionIdRef.current = null;
          setSessionId(null);
          await createSession();
          return;
        }
        setError("Couldn't reconnect to the chat. Please try again.");
      } finally {
        setBootstrapping(false);
      }
    },
    [applyResponse, createSession],
  );

  // Bootstrap on enabled = true
  useEffect(() => {
    if (!enabled || sessionIdRef.current || bootstrapping) return;
    const stored =
      typeof window !== "undefined"
        ? window.localStorage.getItem(STORAGE_KEY)
        : null;
    if (stored) {
      sessionIdRef.current = stored;
      setSessionId(stored);
      void resumeSession(stored);
    } else {
      void createSession();
    }
    // bootstrapping intentionally excluded — we only want this to fire
    // when `enabled` flips, not on every internal state change.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [enabled]);

  const callApiAndApply = useCallback(
    async (call: () => Promise<ChatResponse>) => {
      const sid = sessionIdRef.current;
      if (!sid) return;
      setSending(true);
      setError(null);
      try {
        const data = await call();
        applyResponse(data, true);
      } catch (e) {
        setError(e instanceof Error ? e.message : "Something went wrong.");
      } finally {
        setSending(false);
      }
    },
    [applyResponse],
  );

  const sendText = useCallback(
    async (text: string) => {
      const sid = sessionIdRef.current;
      const trimmed = text.trim();
      if (!sid || !trimmed) return;

      setMessages((prev) => [
        ...prev,
        {
          id: `u-${Date.now()}`,
          sender: "user",
          parts: [{ type: "text", text: trimmed }],
        },
      ]);
      setSending(true);
      setError(null);

      try {
        const data = await api.sendMessage(sid, trimmed);
        applyResponse(data, true);
      } catch (e) {
        setError(
          e instanceof Error ? e.message : "Something went wrong. Please try again.",
        );
      } finally {
        setSending(false);
      }
    },
    [applyResponse],
  );

  const applyEditField = useCallback(
    async (field: string, value: unknown) => {
      const sid = sessionIdRef.current;
      if (!sid) return;
      await callApiAndApply(() => api.editField(sid, field, value));
    },
    [callApiAndApply],
  );

  const swap = useCallback(
    async (itemId: string, replacementMenuItemId: string) => {
      const sid = sessionIdRef.current;
      if (!sid) return;
      await callApiAndApply(() =>
        api.menuAction(sid, {
          action: "swap",
          itemId,
          replacementMenuItemId,
        }),
      );
    },
    [callApiAndApply],
  );

  const remove = useCallback(
    async (itemId: string) => {
      const sid = sessionIdRef.current;
      if (!sid) return;
      await callApiAndApply(() =>
        api.menuAction(sid, { action: "remove", itemId }),
      );
    },
    [callApiAndApply],
  );

  const setQuantity = useCallback(
    async (itemId: string, quantity: number) => {
      const sid = sessionIdRef.current;
      if (!sid) return;
      await callApiAndApply(() =>
        api.menuAction(sid, { action: "set_quantity", itemId, quantity }),
      );
    },
    [callApiAndApply],
  );

  const pickRestaurant = useCallback(
    async (restaurantId: string) => {
      const sid = sessionIdRef.current;
      if (!sid) return;
      await callApiAndApply(() => api.pickRestaurant(sid, restaurantId));
    },
    [callApiAndApply],
  );

  const moreVariety = useCallback(async () => {
    const sid = sessionIdRef.current;
    if (!sid) return;
    await callApiAndApply(() => api.moreVariety(sid));
  }, [callApiAndApply]);

  const placeOrder = useCallback(async () => {
    const sid = sessionIdRef.current;
    if (!sid) return;
    // Hand off to /event-order with the chat session id. The page
    // resolves the draft and prefills CateringContext before mounting.
    // Use the FRONTEND's origin so this works in dev and prod
    // identically — the backend's place-order response is a hand-off
    // confirmation; the URL is the frontend's job.
    try {
      await api.placeOrder(sid);
      window.location.href = `/event-order?draftSessionId=${encodeURIComponent(sid)}`;
    } catch {
      setError("Couldn't move to checkout — try again in a moment.");
    }
  }, []);

  const handleChip = useCallback(
    async (chip: Chip) => {
      const sid = sessionIdRef.current;
      if (!sid) return;
      switch (chip.action) {
        case "send_text": {
          const txt = (chip.payload?.text as string) ?? chip.label;
          await sendText(txt);
          return;
        }
        case "confirm":
          await callApiAndApply(() => api.confirm(sid));
          return;
        case "more_variety":
          await moreVariety();
          return;
        case "place_order":
          await placeOrder();
          return;
        case "pick_restaurant": {
          const restaurantId = chip.payload?.restaurantId as string | undefined;
          if (restaurantId) await pickRestaurant(restaurantId);
          return;
        }
        case "edit_field":
          // edit_field opens a modal owned by the consumer; the hook
          // doesn't act on it directly. Consumer reads chip.payload.field
          // off the chip and calls applyEditField when the user saves.
          return;
        default:
          return;
      }
    },
    [sendText, callApiAndApply, moreVariety, placeOrder, pickRestaurant],
  );

  const resetSession = useCallback(async () => {
    window.localStorage.removeItem(STORAGE_KEY);
    sessionIdRef.current = null;
    setSessionId(null);
    setMessages([]);
    setError(null);
    setStatus(null);
    lastTaxonomyRef.current = {};
    await createSession();
  }, [createSession]);

  const getSwapOptions = useCallback(async (itemId: string) => {
    const sid = sessionIdRef.current;
    if (!sid) return [];
    return api.getSwapOptions(sid, itemId);
  }, []);

  const getTaxonomyValueFor = useCallback((field: string) => {
    return taxonomyValueFor(field, lastTaxonomyRef.current);
  }, []);

  const latestDraft = useMemo(() => findLatestDraft(messages), [messages]);
  const latestSummaryCard = useMemo(
    () => findLatestSummaryCard(messages),
    [messages],
  );
  const latestChips = useMemo(() => findLatestChips(messages), [messages]);

  return {
    messages,
    sending,
    bootstrapping,
    error,
    sessionId,
    status,
    latestDraft,
    latestSummaryCard,
    latestChips,
    setError,
    sendText,
    handleChip,
    applyEditField,
    swap,
    remove,
    setQuantity,
    pickRestaurant,
    moreVariety,
    placeOrder,
    resetSession,
    getSwapOptions,
    getTaxonomyValueFor,
  };
}

// ---------------- helpers ----------------

function captureTaxonomy(
  parts: MessagePart[],
  ref: { current: Record<string, unknown> },
) {
  for (const p of parts) {
    if (p.type === "summary_card") {
      ref.current = p.taxonomy as unknown as Record<string, unknown>;
    }
  }
}

function legacyToParts(data: ChatResponse): MessagePart[] {
  if (data.message) return [{ type: "text", text: data.message }];
  return [];
}

function taxonomyValueFor(
  field: string,
  taxonomy: Record<string, unknown>,
): unknown {
  const map: Record<string, string> = {
    event_datetime: "eventDateTime",
    headcount: "headcount",
    budget: "budget",
    meal_time: "mealTime",
    dietary_restrictions: "dietaryRestrictions",
    cuisine_preference: "cuisinePreference",
    allergens_to_exclude: "allergensToExclude",
    format_preference: "formatPreference",
    occasion: "occasion",
  };
  const key = map[field] ?? field;
  return taxonomy[key];
}

function findLatestDraft(messages: ThreadMessage[]): MenuDraft | null {
  for (let i = messages.length - 1; i >= 0; i--) {
    const parts = messages[i].parts;
    for (let j = parts.length - 1; j >= 0; j--) {
      const p = parts[j];
      if (p.type === "menu_draft") return p.draft;
    }
  }
  return null;
}

function findLatestSummaryCard(
  messages: ThreadMessage[],
): SummaryCardSnapshot | null {
  for (let i = messages.length - 1; i >= 0; i--) {
    const parts = messages[i].parts;
    for (let j = parts.length - 1; j >= 0; j--) {
      const p = parts[j];
      if (p.type === "summary_card") {
        return { taxonomy: p.taxonomy, editable: p.editable };
      }
    }
  }
  return null;
}

function findLatestChips(messages: ThreadMessage[]): Chip[] | null {
  for (let i = messages.length - 1; i >= 0; i--) {
    const parts = messages[i].parts;
    for (let j = parts.length - 1; j >= 0; j--) {
      const p = parts[j];
      if (p.type === "chips") return p.chips;
    }
  }
  return null;
}
