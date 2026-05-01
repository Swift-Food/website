"use client";

import "./styles.css";
import { useEffect, useRef, useState, FormEvent, KeyboardEvent } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { fraunces, geist } from "./fonts";
import { MessageThread, ThreadMessage } from "./MessageThread";
import { EditFieldModal } from "./edit/EditFieldModal";
import { SwapModal } from "./items/SwapModal";
import * as api from "./api";
import { ChatApiError } from "./api";
import type { SwapOption } from "./api";
import type { Chip, ChatResponse, MessagePart } from "./types";

const STORAGE_KEY = "swift-food-chat-session";

/**
 * Editorial Menu Card chatbot. Cream paper panel, charcoal ink, brand
 * pink reserved for the header bar and primary CTAs. The conversation
 * thread renders typed parts (text bubbles, summary cards, chips, menu
 * drafts) inline. Refinement actions (swap/remove/qty/edit-field)
 * round-trip to deterministic backend endpoints — the LLM is only
 * involved when the user types free text.
 */
export default function ChatbotWidget() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<ThreadMessage[]>([]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [bootstrapping, setBootstrapping] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [editField, setEditField] = useState<string | null>(null);
  const [editValue, setEditValue] = useState<unknown>(undefined);
  const [swapTarget, setSwapTarget] = useState<{ id: string; name: string } | null>(null);
  const sessionIdRef = useRef<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const inputRef = useRef<HTMLTextAreaElement | null>(null);
  const lastTaxonomyRef = useRef<Record<string, unknown>>({});
  const prefersReducedMotion = useReducedMotion();

  // Auto-scroll to newest message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, sending]);

  // Focus input on open
  useEffect(() => {
    if (open) inputRef.current?.focus();
  }, [open]);

  // Bootstrap session on first open
  useEffect(() => {
    if (!open || sessionIdRef.current || bootstrapping) return;
    const stored =
      typeof window !== "undefined"
        ? window.localStorage.getItem(STORAGE_KEY)
        : null;
    if (stored) {
      sessionIdRef.current = stored;
      void resumeSession(stored);
    } else {
      void createSession();
    }
  }, [open]); // eslint-disable-line react-hooks/exhaustive-deps

  function applyResponse(data: ChatResponse, asReply: boolean) {
    const parts = data.parts ?? legacyToParts(data);
    captureTaxonomy(parts);
    if (asReply) {
      setMessages((prev) => [
        ...prev,
        { id: `b-${Date.now()}`, sender: "bot", parts },
      ]);
    } else {
      setMessages([{ id: data.sessionId, sender: "bot", parts }]);
    }
  }

  function captureTaxonomy(parts: MessagePart[]) {
    for (const p of parts) {
      if (p.type === "summary_card") {
        lastTaxonomyRef.current = (p.taxonomy as unknown) as Record<string, unknown>;
      }
    }
  }

  async function createSession() {
    setBootstrapping(true);
    setError(null);
    try {
      const data = await api.createSession();
      sessionIdRef.current = data.sessionId;
      window.localStorage.setItem(STORAGE_KEY, data.sessionId);
      applyResponse(data, false);
    } catch (e) {
      setError("Couldn't start the chat. Please try again in a moment.");
    } finally {
      setBootstrapping(false);
    }
  }

  async function resumeSession(sid: string) {
    setBootstrapping(true);
    setError(null);
    try {
      const data = await api.getSession(sid);
      applyResponse(data, false);
    } catch (e) {
      if (e instanceof ChatApiError && e.status === 404) {
        window.localStorage.removeItem(STORAGE_KEY);
        sessionIdRef.current = null;
        await createSession();
        return;
      }
      setError("Couldn't reconnect to the chat. Please try again.");
    } finally {
      setBootstrapping(false);
    }
  }

  async function sendMessage(text: string) {
    const sid = sessionIdRef.current;
    if (!sid || !text.trim()) return;

    setMessages((prev) => [
      ...prev,
      {
        id: `u-${Date.now()}`,
        sender: "user",
        parts: [{ type: "text", text: text.trim() }],
      },
    ]);
    setInput("");
    setSending(true);
    setError(null);

    try {
      const data = await api.sendMessage(sid, text.trim());
      applyResponse(data, true);
    } catch (e) {
      const msg =
        e instanceof Error ? e.message : "Something went wrong. Please try again.";
      setError(msg);
    } finally {
      setSending(false);
      inputRef.current?.focus();
    }
  }

  async function callApiAndApply(call: () => Promise<ChatResponse>) {
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
  }

  async function handleChip(chip: Chip) {
    const sid = sessionIdRef.current;
    if (!sid) return;
    if (chip.action === "send_text") {
      const txt = (chip.payload?.text as string) ?? chip.label;
      void sendMessage(txt);
      return;
    }
    if (chip.action === "confirm") {
      await callApiAndApply(() => api.confirm(sid));
      return;
    }
    if (chip.action === "edit_field") {
      const field = chip.payload?.field as string;
      if (field) handleEditField(field);
      return;
    }
    if (chip.action === "more_variety") {
      await callApiAndApply(() => api.moreVariety(sid));
      return;
    }
    if (chip.action === "place_order") {
      try {
        const { redirectUrl } = await api.placeOrder(sid);
        if (redirectUrl) window.location.href = redirectUrl;
      } catch (e) {
        setError("Couldn't move to checkout — try again in a moment.");
      }
      return;
    }
    if (chip.action === "pick_restaurant") {
      const restaurantId = chip.payload?.restaurantId as string;
      if (restaurantId) {
        await callApiAndApply(() => api.pickRestaurant(sid, restaurantId));
      }
      return;
    }
  }

  function handleEditField(field: string) {
    setEditField(field);
    setEditValue(taxonomyValueFor(field, lastTaxonomyRef.current));
  }

  async function handleEditSave(value: unknown) {
    const sid = sessionIdRef.current;
    if (!sid || !editField) return;
    setSending(true);
    setError(null);
    try {
      const data = await api.editField(sid, editField, value);
      applyResponse(data, true);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Couldn't save the change.");
    } finally {
      setSending(false);
      setEditField(null);
    }
  }

  function handleSwap(itemId: string, itemName: string) {
    setSwapTarget({ id: itemId, name: itemName });
  }

  async function handleSwapPick(replacement: SwapOption) {
    const sid = sessionIdRef.current;
    const target = swapTarget;
    if (!sid || !target) return;
    setSwapTarget(null);
    await callApiAndApply(() =>
      api.menuAction(sid, {
        action: "swap",
        itemId: target.id,
        replacementMenuItemId: replacement.menuItemId,
      }),
    );
  }

  async function handlePickRestaurant(restaurantId: string) {
    const sid = sessionIdRef.current;
    if (!sid) return;
    await callApiAndApply(() => api.pickRestaurant(sid, restaurantId));
  }

  async function handleRemove(itemId: string) {
    const sid = sessionIdRef.current;
    if (!sid) return;
    await callApiAndApply(() => api.menuAction(sid, { action: "remove", itemId }));
  }

  async function handleQtyChange(itemId: string, quantity: number) {
    const sid = sessionIdRef.current;
    if (!sid) return;
    await callApiAndApply(() =>
      api.menuAction(sid, { action: "set_quantity", itemId, quantity }),
    );
  }

  function startFresh() {
    window.localStorage.removeItem(STORAGE_KEY);
    sessionIdRef.current = null;
    setMessages([]);
    setError(null);
    void createSession();
  }

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!sending) void sendMessage(input);
  }

  function handleKeyDown(e: KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      if (!sending) void sendMessage(input);
    }
  }

  const fontClass = `${fraunces.variable} ${geist.variable}`;

  return (
    <div className={fontClass}>
      <AnimatePresence>
        {!open && (
          <motion.button
            key="launcher"
            aria-label="Open chat"
            onClick={() => setOpen(true)}
            initial={prefersReducedMotion ? undefined : { scale: 0, rotate: -10 }}
            animate={{ scale: 1, rotate: 0 }}
            exit={prefersReducedMotion ? undefined : { scale: 0, opacity: 0 }}
            whileHover={prefersReducedMotion ? undefined : { scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            transition={{ type: "spring", stiffness: 220, damping: 18 }}
            style={{
              position: "fixed",
              bottom: 24,
              right: 24,
              zIndex: 50,
              width: 56,
              height: 56,
              borderRadius: "50%",
              backgroundColor: "var(--brand, #fa43ad)",
              color: "white",
              border: 0,
              boxShadow: "0 4px 16px rgba(250, 67, 173, 0.35)",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <ChatIcon />
          </motion.button>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {open && (
          <motion.div
            key="panel"
            initial={prefersReducedMotion ? undefined : { opacity: 0, y: 12, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={prefersReducedMotion ? undefined : { opacity: 0, y: 8, scale: 0.99 }}
            transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
            className="swift-chat-panel"
            role="dialog"
            aria-label="Swift Food chat"
            style={panelStyle}
          >
            <PanelHeader onRefresh={startFresh} onClose={() => setOpen(false)} />
            <hr className="hairline" />

            <div style={messagesContainerStyle}>
              {bootstrapping && messages.length === 0 && (
                <div style={{ textAlign: "center", color: "var(--ink-faint)", marginTop: 24, fontSize: "0.85rem" }}>
                  Connecting…
                </div>
              )}

              <MessageThread
                messages={messages}
                onChip={handleChip}
                onEditField={handleEditField}
                onSwapItem={handleSwap}
                onRemoveItem={handleRemove}
                onQtyChange={handleQtyChange}
                onPickRestaurant={handlePickRestaurant}
              />

              {sending && <TypingIndicator />}

              {error && (
                <motion.div
                  initial={{ opacity: 0, y: 4 }}
                  animate={{ opacity: 1, y: 0 }}
                  style={errorBoxStyle}
                >
                  {error}
                </motion.div>
              )}
              <div ref={messagesEndRef} />
            </div>

            <hr className="hairline" />
            <form onSubmit={handleSubmit} style={inputBarStyle}>
              <textarea
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Tell me about your event…"
                rows={1}
                disabled={sending || bootstrapping || !sessionIdRef.current}
                style={textareaStyle}
              />
              <button
                type="submit"
                disabled={
                  sending || bootstrapping || !input.trim() || !sessionIdRef.current
                }
                aria-label="Send message"
                style={sendButtonStyle}
              >
                <SendIcon />
              </button>
            </form>

            <EditFieldModal
              open={editField !== null}
              field={editField ?? ""}
              initialValue={editValue}
              onClose={() => setEditField(null)}
              onSave={handleEditSave}
            />
            <SwapModal
              open={swapTarget !== null}
              sessionId={sessionIdRef.current ?? ""}
              itemId={swapTarget?.id ?? null}
              itemName={swapTarget?.name ?? ""}
              onClose={() => setSwapTarget(null)}
              onPick={handleSwapPick}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ---------------- Sub-components ----------------

function PanelHeader({
  onRefresh,
  onClose,
}: {
  onRefresh: () => void;
  onClose: () => void;
}) {
  return (
    <div style={headerStyle}>
      <div style={{ display: "flex", flexDirection: "column" }}>
        <div className="display" style={{ fontSize: "1.05rem", fontWeight: 600, color: "white", letterSpacing: "0.01em" }}>
          Swift Food Helper
        </div>
        <div className="display-italic" style={{ fontSize: "0.78rem", color: "rgba(255,255,255,0.85)" }}>
          Let's craft your menu
        </div>
      </div>
      <div style={{ display: "flex", gap: 6 }}>
        <button onClick={onRefresh} aria-label="Start a new chat" style={iconButtonStyle} title="Start fresh">
          <RefreshIcon />
        </button>
        <button onClick={onClose} aria-label="Close chat" style={iconButtonStyle}>
          <CloseIcon />
        </button>
      </div>
    </div>
  );
}

function TypingIndicator() {
  return (
    <div style={{ display: "flex", justifyContent: "flex-start" }}>
      <div
        style={{
          background: "var(--paper)",
          border: "1px solid var(--rule)",
          borderRadius: 16,
          borderBottomLeftRadius: 4,
          padding: "10px 14px",
          display: "flex",
          gap: 4,
        }}
      >
        {[0, 1, 2].map((i) => (
          <motion.span
            key={i}
            animate={{ y: [0, -3, 0] }}
            transition={{ duration: 0.9, repeat: Infinity, delay: i * 0.12, ease: "easeInOut" }}
            style={{
              width: 6,
              height: 6,
              borderRadius: "50%",
              background: "var(--ink-faint)",
            }}
          />
        ))}
      </div>
    </div>
  );
}

function legacyToParts(data: ChatResponse): MessagePart[] {
  // Backwards-compat fallback in case the backend response lacks parts
  // (shouldn't happen on the v3 branch, but guards against deploy skew).
  if (data.message) return [{ type: "text", text: data.message }];
  return [];
}

function taxonomyValueFor(field: string, taxonomy: Record<string, unknown>): unknown {
  const map: Record<string, string> = {
    event_datetime: "eventDateTime",
    address: "address",
    headcount: "headcount",
    budget: "budget",
    meal_time: "mealTime",
    dietary_restrictions: "dietaryRestrictions",
    cuisine_preference: "cuisinePreference",
    format_preference: "formatPreference",
    occasion: "occasion",
    extras: "extras",
  };
  const key = map[field] ?? field;
  return taxonomy[key];
}

// ---------------- Icons ----------------

function ChatIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
    </svg>
  );
}

function CloseIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="18" y1="6" x2="6" y2="18" />
      <line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  );
}

function RefreshIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="23 4 23 10 17 10" />
      <polyline points="1 20 1 14 7 14" />
      <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15" />
    </svg>
  );
}

function SendIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="22" y1="2" x2="11" y2="13" />
      <polygon points="22 2 15 22 11 13 2 9 22 2" />
    </svg>
  );
}

// ---------------- Inline styles ----------------

const panelStyle: React.CSSProperties = {
  position: "fixed",
  zIndex: 50,
  display: "flex",
  flexDirection: "column",
  overflow: "hidden",
  border: "1px solid var(--rule)",
  boxShadow: "var(--shadow-lift)",
};

const headerStyle: React.CSSProperties = {
  background: "var(--brand)",
  color: "white",
  padding: "14px 16px",
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
};

const iconButtonStyle: React.CSSProperties = {
  width: 28,
  height: 28,
  borderRadius: 6,
  background: "rgba(255,255,255,0.12)",
  color: "white",
  border: 0,
  cursor: "pointer",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
};

const messagesContainerStyle: React.CSSProperties = {
  flex: 1,
  overflowY: "auto",
  padding: "16px",
  display: "flex",
  flexDirection: "column",
  gap: 12,
  position: "relative",
};

const errorBoxStyle: React.CSSProperties = {
  fontSize: "0.85rem",
  color: "var(--ember)",
  background: "var(--ember-soft)",
  border: "1px solid var(--ember)",
  borderRadius: 10,
  padding: "8px 12px",
};

const inputBarStyle: React.CSSProperties = {
  display: "flex",
  alignItems: "flex-end",
  gap: 8,
  padding: "10px 12px",
  background: "var(--paper)",
};

const textareaStyle: React.CSSProperties = {
  flex: 1,
  resize: "none",
  borderRadius: 10,
  border: "1px solid var(--rule)",
  background: "var(--paper)",
  color: "var(--ink)",
  padding: "10px 12px",
  fontSize: "0.95rem",
  fontFamily: "var(--font-body)",
  minHeight: 42,
  maxHeight: 130,
  outline: "none",
};

const sendButtonStyle: React.CSSProperties = {
  width: 42,
  height: 42,
  borderRadius: 10,
  background: "var(--brand)",
  color: "white",
  border: 0,
  cursor: "pointer",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  flexShrink: 0,
};
