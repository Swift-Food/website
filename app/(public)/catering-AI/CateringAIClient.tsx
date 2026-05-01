"use client";

import "@/lib/components/chatbot/styles.css";
import { useEffect, useMemo, useRef, useState, FormEvent, KeyboardEvent } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { fraunces, geist } from "@/lib/components/chatbot/fonts";
import { MessageThread, type ThreadMessage } from "@/lib/components/chatbot/MessageThread";
import { EditFieldModal } from "@/lib/components/chatbot/edit/EditFieldModal";
import { SwapModal } from "@/lib/components/chatbot/items/SwapModal";
import { SummaryCard } from "@/lib/components/chatbot/parts/SummaryCard";
import { ChipGroup } from "@/lib/components/chatbot/parts/ChipGroup";
import { MenuDraftPanel } from "@/lib/components/chatbot/page/MenuDraftPanel";
import { RestaurantStrip } from "@/lib/components/chatbot/page/RestaurantStrip";
import { useChatSession } from "@/lib/components/chatbot/useChatSession";
import type { SwapOption } from "@/lib/components/chatbot/api";
import type { Chip, MessagePart } from "@/lib/components/chatbot/types";

/**
 * Full-page version of the catering chatbot at /catering-AI. Routes
 * message parts to two surfaces:
 *
 *   Left column   summary card (event details), restaurant strip,
 *                 menu items, sticky action bar (Confirm / Place order).
 *   Right column  chat thread — text + clarifier parts only, plus
 *                 conversational `send_text` chips. Form-state and
 *                 action chips never appear here, so editing a slot
 *                 doesn't pollute the conversation.
 */
export default function CateringAIClient() {
  const [input, setInput] = useState("");
  const [editField, setEditField] = useState<string | null>(null);
  const [editValue, setEditValue] = useState<unknown>(undefined);
  const [swapTarget, setSwapTarget] = useState<{ id: string; name: string } | null>(
    null,
  );
  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const inputRef = useRef<HTMLTextAreaElement | null>(null);
  const prefersReducedMotion = useReducedMotion();

  const chat = useChatSession({ enabled: true });
  const {
    messages,
    sending,
    bootstrapping,
    error,
    sessionId,
    latestDraft,
    latestSummaryCard,
    latestChips,
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

  // Filter the chat thread: keep text + clarifier + conversational
  // (send_text) chips. Drop summary, draft, and action chips — those
  // live in the left column.
  const chatMessages = useMemo<ThreadMessage[]>(
    () =>
      messages
        .map((m) => ({ ...m, parts: chatPartsOnly(m.parts) }))
        .filter((m) => m.parts.length > 0),
    [messages],
  );

  // Action chips (everything that isn't a conversational send_text).
  const actionChips = useMemo<Chip[]>(
    () => (latestChips ?? []).filter((c) => c.action !== "send_text"),
    [latestChips],
  );

  // Auto-scroll to newest message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatMessages, sending]);

  // Focus input on mount
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const hasLeftContent =
    latestDraft !== null || actionChips.length > 0;

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
    <div
      className={`${fontClass} swift-chat-design swift-chat-page`}
      style={{ height: "100dvh", minHeight: 560 }}
    >
      <div className="swift-chat-page-shell">
        <AnimatePresence initial={false}>
          {hasLeftContent && (
            <motion.aside
              key="left-aside"
              initial={
                prefersReducedMotion
                  ? { opacity: 0 }
                  : { opacity: 0, x: -48, width: 0 }
              }
              animate={
                prefersReducedMotion
                  ? { opacity: 1 }
                  : { opacity: 1, x: 0, width: "auto" }
              }
              exit={
                prefersReducedMotion
                  ? { opacity: 0 }
                  : { opacity: 0, x: -48, width: 0 }
              }
              transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
              className="swift-chat-page-aside"
              style={{ overflow: "hidden" }}
            >
              <div
                style={{
                  flex: 1,
                  minHeight: 0,
                  overflowY: "auto",
                  padding: "20px 24px 24px",
                  display: "flex",
                  flexDirection: "column",
                  gap: 18,
                }}
              >
                {latestDraft && (
                  <RestaurantStrip
                    draft={latestDraft}
                    onPick={(id) => void pickRestaurant(id)}
                  />
                )}
                {latestDraft && (
                  <MenuDraftPanel
                    draft={latestDraft}
                    onSwap={handleSwap}
                    onRemove={(id) => void remove(id)}
                    onQtyChange={(id, qty) => void setQuantity(id, qty)}
                  />
                )}
              </div>
              {actionChips.length > 0 && (
                <div
                  style={{
                    borderTop: "1px solid var(--rule)",
                    background: "var(--paper)",
                    padding: "12px 20px",
                  }}
                >
                  <ChipGroup chips={actionChips} onAction={handleChipClick} />
                </div>
              )}
            </motion.aside>
          )}
        </AnimatePresence>

        <motion.main
          layout
          transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
          className="swift-chat-page-main"
        >
          <PageHeader onRefresh={() => void resetSession()} />
          <div
            style={{
              flex: 1,
              minHeight: 0,
              display: "flex",
              flexDirection: "column",
              maxWidth: hasLeftContent ? "none" : 760,
              width: "100%",
              margin: "0 auto",
              transition: "max-width 0.45s cubic-bezier(0.22, 1, 0.36, 1)",
            }}
          >
            <div
              style={{
                flex: 1,
                overflowY: "auto",
              }}
            >
              {latestSummaryCard && (
                <div
                  style={{
                    position: "sticky",
                    top: 0,
                    zIndex: 5,
                    padding: "12px 20px 0",
                  }}
                >
                  <SummaryCard
                    taxonomy={latestSummaryCard.taxonomy}
                    editable={latestSummaryCard.editable}
                    onEdit={handleEditField}
                    collapsible
                  />
                </div>
              )}
              <div
                style={{
                  padding: "16px 24px",
                  display: "flex",
                  flexDirection: "column",
                  gap: 14,
                }}
              >
              {bootstrapping && chatMessages.length === 0 && (
                <div
                  style={{
                    textAlign: "center",
                    color: "var(--ink-faint)",
                    marginTop: 32,
                    fontSize: "0.9rem",
                  }}
                >
                  Connecting…
                </div>
              )}

              <MessageThread
                messages={chatMessages}
                onChip={handleChipClick}
                onEditField={handleEditField}
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
          </div>
        </motion.main>
      </div>

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
    </div>
  );
}

/**
 * Filter parts so the chat thread only carries text, clarifier, and
 * conversational `send_text` chips. Form state (summary_card,
 * menu_draft) and action chips are owned by the left column.
 */
function chatPartsOnly(parts: MessagePart[]): MessagePart[] {
  const result: MessagePart[] = [];
  for (const p of parts) {
    if (p.type === "text" || p.type === "clarifier") {
      result.push(p);
      continue;
    }
    if (p.type === "chips") {
      const conversational = p.chips.filter((c) => c.action === "send_text");
      if (conversational.length > 0) {
        result.push({ type: "chips", chips: conversational });
      }
    }
  }
  return result;
}

// ---------------- Sub-components ----------------

function PageHeader({ onRefresh }: { onRefresh: () => void }) {
  return (
    <div
      style={{
        background: "var(--brand)",
        color: "white",
        padding: "16px 24px",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        flexShrink: 0,
      }}
    >
      <div style={{ display: "flex", flexDirection: "column" }}>
        <div
          className="display"
          style={{
            fontSize: "1.2rem",
            fontWeight: 600,
            color: "white",
            letterSpacing: "0.01em",
          }}
        >
          Swift Food Helper
        </div>
        <div
          className="display-italic"
          style={{ fontSize: "0.82rem", color: "rgba(255,255,255,0.85)" }}
        >
          Let's craft your menu
        </div>
      </div>
      <button
        onClick={onRefresh}
        aria-label="Start a new chat"
        title="Start fresh"
        style={{
          padding: "8px 14px",
          borderRadius: 8,
          background: "rgba(255,255,255,0.15)",
          color: "white",
          border: 0,
          cursor: "pointer",
          fontSize: "0.85rem",
          display: "inline-flex",
          alignItems: "center",
          gap: 6,
        }}
      >
        <RefreshIcon /> Start fresh
      </button>
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
            transition={{
              duration: 0.9,
              repeat: Infinity,
              delay: i * 0.12,
              ease: "easeInOut",
            }}
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

function RefreshIcon() {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <polyline points="23 4 23 10 17 10" />
      <polyline points="1 20 1 14 7 14" />
      <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15" />
    </svg>
  );
}

function SendIcon() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <line x1="22" y1="2" x2="11" y2="13" />
      <polygon points="22 2 15 22 11 13 2 9 22 2" />
    </svg>
  );
}

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
  padding: "12px 16px",
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
