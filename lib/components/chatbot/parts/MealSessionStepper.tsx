"use client";

import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "motion/react";
import type { MessagePart } from "../types";
import { IntentBlockCard } from "./IntentBlockCard";
import { MenuDraftPanel } from "../page/MenuDraftPanel";
import { resolveSelections } from "../cohesion";

type MealSessionPartType = Extract<MessagePart, { type: "meal_session" }>;

interface MealSessionStepperProps {
  part: MealSessionPartType;
  onAddItem?: (itemId: string) => void;
  /** Cart actions, forwarded by MessageThread. When present, the cart renders inline at the bottom of the stepper (used by the floating widget). */
  onSwapItem?: (itemId: string, itemName: string, mealSessionIndex?: number) => void;
  onRemoveItem?: (itemId: string, mealSessionIndex?: number) => void;
  onQtyChange?: (itemId: string, qty: number, mealSessionIndex?: number) => void;
}

/**
 * Wraps the intent blocks for one meal session. Default = scroll mode
 * (all blocks visible, vertical). Optional step mode = one block at a
 * time with prev/next chevrons. Stepper state is local UI only.
 *
 * Owns the explicit-selection map for its blocks (intentId → restaurantId)
 * and runs resolveSelections() each render to apply same-restaurant cohesion
 * to displayed defaults. The IntentBlockCard children are dumb / controlled.
 */
export function MealSessionStepper({
  part,
  onAddItem,
  onSwapItem,
  onRemoveItem,
  onQtyChange,
}: MealSessionStepperProps) {
  const [stepMode, setStepMode] = useState(false);
  const [stepIdx, setStepIdx] = useState(0);
  const [explicit, setExplicit] = useState<Map<string, string>>(() => new Map());

  const resolved = useMemo(
    () => resolveSelections(part.intentBlocks, explicit),
    [part.intentBlocks, explicit],
  );

  const handleSelect = (intentId: string) => (restaurantId: string) =>
    setExplicit((prev) => new Map(prev).set(intentId, restaurantId));

  const blocks = part.intentBlocks;
  if (blocks.length === 0) return null;

  const safeStepIdx = Math.min(stepIdx, blocks.length - 1);
  const visible = stepMode ? [blocks[safeStepIdx]] : blocks;

  return (
    <div style={{ marginTop: 16, marginBottom: 16 }}>
      <header
        style={{
          display: "flex",
          alignItems: "baseline",
          justifyContent: "space-between",
          marginBottom: 8,
          padding: "0 4px",
        }}
      >
        <div>
          <div
            className="display"
            style={{ fontSize: "1.1rem", color: "var(--ink)" }}
          >
            {part.sessionName}
          </div>
          {(part.sessionDate || part.guestCount !== null) && (
            <div
              style={{
                fontSize: "0.75rem",
                color: "var(--ink-faint)",
                marginTop: 2,
              }}
            >
              {part.sessionDate}
              {part.eventTime && ` · ${part.eventTime}`}
              {part.guestCount !== null && ` · ${part.guestCount} guests`}
            </div>
          )}
        </div>
        {blocks.length > 1 && (
          <button
            type="button"
            onClick={() => {
              setStepMode((s) => !s);
              setStepIdx(0);
            }}
            style={{
              fontSize: "0.75rem",
              border: "none",
              background: "none",
              color: "var(--ink-soft)",
              cursor: "pointer",
              padding: "2px 6px",
            }}
          >
            {stepMode ? "Show all" : "Step through"}
          </button>
        )}
      </header>

      <AnimatePresence mode="wait">
        <motion.div
          key={stepMode ? `step-${safeStepIdx}` : "all"}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.18 }}
        >
          {visible.map((block) => (
            <IntentBlockCard
              key={block.intentId}
              part={block}
              selectedRestaurantId={
                resolved.get(block.intentId) ??
                block.restaurantPicks[0]?.restaurant.id ??
                ""
              }
              onSelectRestaurant={handleSelect(block.intentId)}
              onAddItem={onAddItem}
            />
          ))}
        </motion.div>
      </AnimatePresence>

      {stepMode && blocks.length > 1 && (
        <nav
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginTop: 6,
            padding: "0 4px",
          }}
        >
          <button
            type="button"
            onClick={() => setStepIdx((i) => Math.max(0, i - 1))}
            disabled={safeStepIdx === 0}
            style={{
              fontSize: "0.85rem",
              border: "none",
              background: "none",
              color: "var(--ink-soft)",
              cursor: safeStepIdx === 0 ? "default" : "pointer",
              opacity: safeStepIdx === 0 ? 0.3 : 1,
              padding: "4px 8px",
            }}
          >
            ← Prev
          </button>
          <span style={{ fontSize: "0.75rem", color: "var(--ink-faint)" }}>
            {safeStepIdx + 1} of {blocks.length}
          </span>
          <button
            type="button"
            onClick={() =>
              setStepIdx((i) => Math.min(blocks.length - 1, i + 1))
            }
            disabled={safeStepIdx === blocks.length - 1}
            style={{
              fontSize: "0.85rem",
              border: "none",
              background: "none",
              color: "var(--ink-soft)",
              cursor:
                safeStepIdx === blocks.length - 1 ? "default" : "pointer",
              opacity: safeStepIdx === blocks.length - 1 ? 0.3 : 1,
              padding: "4px 8px",
            }}
          >
            Next →
          </button>
        </nav>
      )}

      {part.draft && onSwapItem && onRemoveItem && onQtyChange && (
        <div style={{ marginTop: 14 }}>
          <MenuDraftPanel
            draft={part.draft}
            onSwap={(id, name) => onSwapItem(id, name, part.mealSessionIndex)}
            onRemove={(id) => onRemoveItem(id, part.mealSessionIndex)}
            onQtyChange={(id, qty) => onQtyChange(id, qty, part.mealSessionIndex)}
          />
        </div>
      )}
    </div>
  );
}
