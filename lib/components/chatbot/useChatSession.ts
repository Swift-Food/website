"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import * as api from "./api";
import { ChatApiError, type SwapOption } from "./api";
import type { ThreadMessage } from "./MessageThread";
import type {
  ChatResponse,
  ChatStatus,
  ChatMealSessionView,
  Chip,
  SharedTaxonomyView,
  MealSessionPart,
  MenuDraft,
  MessagePart,
} from "./types";

const STORAGE_KEY = "swift-food-chat-session";

export interface SummaryCardSnapshot {
  taxonomy: SharedTaxonomyView;
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
  latestMealSessions: ChatMealSessionView[];
  latestActiveMealSessionIndex: number;
  /** Most-recent `meal_session` part per mealSessionIndex, derived from
   * the message thread. The page-aside intent stepper consumes this to
   * render per-intent restaurant picks (intentBlocks) for the active meal. */
  latestMealSessionParts: MealSessionPart[];
  latestSummaryCard: SummaryCardSnapshot | null;
  latestChips: Chip[] | null;

  // setters the consumer needs
  setError: (msg: string | null) => void;

  // editing meal session tracking
  editingMealSessionIndex: number | undefined;
  setEditingMealSessionIndex: (idx: number | undefined) => void;

  // actions
  sendText: (text: string) => Promise<void>;
  handleChip: (chip: Chip) => Promise<void>;
  applyEditField: (field: string, value: unknown, mealSessionIndex?: number) => Promise<void>;
  swap: (itemId: string, replacementMenuItemId: string, mealSessionIndex?: number) => Promise<void>;
  remove: (itemId: string, mealSessionIndex?: number) => Promise<void>;
  setQuantity: (itemId: string, quantity: number, mealSessionIndex?: number) => Promise<void>;
  pickRestaurant: (restaurantId: string, mealSessionIndex?: number) => Promise<void>;
  moreVariety: (mealSessionIndex?: number) => Promise<void>;
  placeOrder: () => Promise<void>;
  resetSession: () => Promise<void>;
  pickMealSession: (mealSessionIndex: number) => Promise<void>;
  confirmInheritance: (mealSessionIndex: number, accept: boolean) => Promise<void>;

  // helpers
  getSwapOptions: (itemId: string, mealSessionIndex?: number) => Promise<SwapOption[]>;
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
 * (swap/remove/qty/edit-field/place-order). UI surfaces
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
  const [editingMealSessionIndex, setEditingMealSessionIndex] = useState<number | undefined>(undefined);
  /** Latest formatted meal-session views from the response. The active meal's draft is the cart that renders in the left aside. */
  const [latestMealSessions, setLatestMealSessions] = useState<ChatMealSessionView[]>([]);
  const [latestActiveMealSessionIndex, setLatestActiveMealSessionIndex] = useState(0);

  const sessionIdRef = useRef<string | null>(null);
  const lastTaxonomyRef = useRef<Record<string, unknown>>({});

  const applyResponse = useCallback((data: ChatResponse, asReply: boolean) => {
    const parts = data.parts ?? legacyToParts(data);
    captureTaxonomy(parts, lastTaxonomyRef);
    setStatus(data.status ?? null);
    setLatestMealSessions(data.mealSessions ?? []);
    setLatestActiveMealSessionIndex(data.activeMealSessionIndex ?? 0);
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
    async (field: string, value: unknown, mealSessionIndex?: number) => {
      const sid = sessionIdRef.current;
      if (!sid) return;
      await callApiAndApply(() => api.editField(sid, field, value, mealSessionIndex));
    },
    [callApiAndApply],
  );

  const swap = useCallback(
    async (itemId: string, replacementMenuItemId: string, mealSessionIndex?: number) => {
      const sid = sessionIdRef.current;
      if (!sid) return;
      await callApiAndApply(() =>
        api.menuAction(sid, {
          action: "swap",
          itemId,
          replacementMenuItemId,
          mealSessionIndex,
        }),
      );
    },
    [callApiAndApply],
  );

  const remove = useCallback(
    async (itemId: string, mealSessionIndex?: number) => {
      const sid = sessionIdRef.current;
      if (!sid) return;
      await callApiAndApply(() =>
        api.menuAction(sid, { action: "remove", itemId, mealSessionIndex }),
      );
    },
    [callApiAndApply],
  );

  const setQuantity = useCallback(
    async (itemId: string, quantity: number, mealSessionIndex?: number) => {
      const sid = sessionIdRef.current;
      if (!sid) return;
      await callApiAndApply(() =>
        api.menuAction(sid, { action: "set_quantity", itemId, quantity, mealSessionIndex }),
      );
    },
    [callApiAndApply],
  );

  const pickRestaurant = useCallback(
    async (restaurantId: string, mealSessionIndex?: number) => {
      const sid = sessionIdRef.current;
      if (!sid) return;
      await callApiAndApply(() =>
        api.pickRestaurant(sid, restaurantId, mealSessionIndex),
      );
    },
    [callApiAndApply],
  );

  const moreVariety = useCallback(async (mealSessionIndex?: number) => {
    const sid = sessionIdRef.current;
    if (!sid) return;
    await callApiAndApply(() => api.moreVariety(sid, mealSessionIndex));
  }, [callApiAndApply]);

  const pickMealSession = useCallback(
    async (mealSessionIndex: number) => {
      const sid = sessionIdRef.current;
      if (!sid) return;
      await callApiAndApply(() =>
        api.menuAction(sid, { action: "pick_meal_session", mealSessionIndex }),
      );
    },
    [callApiAndApply],
  );

  const confirmInheritance = useCallback(
    async (mealSessionIndex: number, accept: boolean) => {
      const sid = sessionIdRef.current;
      if (!sid) return;
      await callApiAndApply(() =>
        api.menuAction(sid, {
          action: "confirm_inheritance",
          mealSessionIndex,
          accept,
        }),
      );
    },
    [callApiAndApply],
  );

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
      if (chip.action === "pick_meal_session") {
        const idx = chip.payload?.mealSessionIndex;
        if (typeof idx === "number") await pickMealSession(idx);
        return;
      }
      if (chip.action === "confirm_inheritance") {
        const idx = chip.payload?.mealSessionIndex;
        const accept = chip.payload?.accept;
        if (typeof idx === "number" && typeof accept === "boolean") {
          await confirmInheritance(idx, accept);
        }
        return;
      }
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
        case "pick_restaurant":
          // pick_restaurant chip is legacy — the new per-intent block UI
          // handles restaurant switching client-side via cohesion. Backend
          // no longer emits this chip (T7 cleanup), but if a stale session
          // surfaces one, ignore rather than 404.
          return;
        case "edit_field":
          // edit_field opens a modal owned by the consumer; the hook
          // doesn't act on it directly. Consumer reads chip.payload.field
          // off the chip and calls applyEditField when the user saves.
          return;
        default:
          return;
      }
    },
    [sendText, callApiAndApply, moreVariety, placeOrder, pickMealSession, confirmInheritance],
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

  const getSwapOptions = useCallback(async (itemId: string, mealSessionIndex?: number) => {
    const sid = sessionIdRef.current;
    if (!sid) return [];
    return api.getSwapOptions(sid, itemId, mealSessionIndex);
  }, []);

  const getTaxonomyValueFor = useCallback((field: string) => {
    return taxonomyValueFor(field, lastTaxonomyRef.current);
  }, []);

  const latestDraft = useMemo(
    () => latestMealSessions[latestActiveMealSessionIndex]?.draft ?? null,
    [latestMealSessions, latestActiveMealSessionIndex],
  );
  const latestSummaryCard = useMemo(
    () => findLatestSummaryCard(messages),
    [messages],
  );
  const latestChips = useMemo(() => findLatestChips(messages), [messages]);
  const latestMealSessionParts = useMemo(
    () => findLatestMealSessionParts(messages),
    [messages],
  );

  return {
    messages,
    sending,
    bootstrapping,
    error,
    sessionId,
    status,
    latestDraft,
    latestMealSessions,
    latestActiveMealSessionIndex,
    latestMealSessionParts,
    latestSummaryCard,
    latestChips,
    editingMealSessionIndex,
    setEditingMealSessionIndex,
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
    pickMealSession,
    confirmInheritance,
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

/**
 * Walk the thread newest-first and keep the first `meal_session` part
 * seen for each mealSessionIndex — that is the freshest intentBlocks
 * data for that meal. Returned sorted by mealSessionIndex ascending.
 */
function findLatestMealSessionParts(
  messages: ThreadMessage[],
): MealSessionPart[] {
  const byIndex = new Map<number, MealSessionPart>();
  for (let i = messages.length - 1; i >= 0; i--) {
    for (const p of messages[i].parts) {
      if (p.type === "meal_session" && !byIndex.has(p.mealSessionIndex)) {
        byIndex.set(p.mealSessionIndex, p);
      }
    }
  }
  return [...byIndex.values()].sort(
    (a, b) => a.mealSessionIndex - b.mealSessionIndex,
  );
}

