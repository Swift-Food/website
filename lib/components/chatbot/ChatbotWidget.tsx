"use client";

import "./styles.css";
import { useEffect, useRef, useState, FormEvent, KeyboardEvent } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { fraunces, geist } from "./fonts";
import { MessageThread } from "./MessageThread";
import { EditFieldModal } from "./edit/EditFieldModal";
import { SwapModal } from "./items/SwapModal";
import type { SwapOption } from "./api";
import type { Chip } from "./types";
import { useChatSession } from "./useChatSession";

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
  const [input, setInput] = useState("");
  const [editField, setEditField] = useState<string | null>(null);
  const [editValue, setEditValue] = useState<unknown>(undefined);
  const [swapTarget, setSwapTarget] = useState<{ id: string; name: string } | null>(null);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const inputRef = useRef<HTMLTextAreaElement | null>(null);
  const prefersReducedMotion = useReducedMotion();

  const chat = useChatSession({ enabled: open });
  const {
    messages,
    sending,
    bootstrapping,
    error,
    sessionId,
    sendText,
    handleChip,
    applyEditField,
    swap,
    remove,
    setQuantity,
    pickRestaurant,
    resetSession,
    getTaxonomyValueFor,
  } = chat;

  // Auto-scroll to newest message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, sending]);

  // Focus input on open
  useEffect(() => {
    if (open) inputRef.current?.focus();
  }, [open]);

  // Auto-grow textarea to fit content, capped at 4 lines.
  useEffect(() => {
    const el = inputRef.current;
    if (!el) return;
    el.style.height = "auto";
    const lineHeight = parseFloat(getComputedStyle(el).lineHeight) || 22;
    const verticalPadding = 20;
    const maxHeight = lineHeight * 4 + verticalPadding;
    el.style.height = `${Math.min(el.scrollHeight, maxHeight)}px`;
    el.style.overflowY = el.scrollHeight > maxHeight ? "auto" : "hidden";
  }, [input, open]);

  function handleChipClick(chip: Chip) {
    if (chip.action === "edit_field") {
      const field = chip.payload?.field as string | undefined;
      if (field) handleEditField(field);
      return;
    }
    void handleChip(chip);
  }

  function handleEditField(field: string) {
    setEditField(field);
    setEditValue(getTaxonomyValueFor(field));
  }

  async function handleEditSave(value: unknown) {
    if (!editField) return;
    const field = editField;
    setEditField(null);
    await applyEditField(field, value);
    inputRef.current?.focus();
  }

  function handleSwap(itemId: string, itemName: string) {
    setSwapTarget({ id: itemId, name: itemName });
  }

  async function handleSwapPick(replacement: SwapOption) {
    const target = swapTarget;
    if (!target) return;
    setSwapTarget(null);
    await swap(target.id, replacement.menuItemId);
  }

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (sending) return;
    void sendText(input);
    setInput("");
  }

  function handleKeyDown(e: KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      if (sending) return;
      void sendText(input);
      setInput("");
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
            <PanelHeader onRefresh={() => void resetSession()} onClose={() => setOpen(false)} />
            <hr className="hairline" />

            <div style={messagesContainerStyle}>
              {bootstrapping && messages.length === 0 && (
                <div style={{ textAlign: "center", color: "var(--ink-faint)", marginTop: 24, fontSize: "0.85rem" }}>
                  Connecting…
                </div>
              )}

              <MessageThread
                messages={messages}
                onChip={handleChipClick}
                onEditField={handleEditField}
                onSwapItem={handleSwap}
                onRemoveItem={(id) => void remove(id)}
                onQtyChange={(id, qty) => void setQuantity(id, qty)}
                onPickRestaurant={(id) => void pickRestaurant(id)}
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
                disabled={sending || bootstrapping || !sessionId}
                style={textareaStyle}
              />
              <button
                type="submit"
                disabled={sending || bootstrapping || !input.trim() || !sessionId}
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
              sessionId={sessionId ?? ""}
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
  outline: "none",
  overflowY: "hidden",
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
