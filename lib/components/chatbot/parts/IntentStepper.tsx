"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { DraftItemRow } from "../items/DraftItemRow";
import type {
  ClientRestaurantPick,
  DraftItem,
  IntentBlockPart,
  MealSessionPart,
} from "../types";

interface IntentStepperProps {
  /** All meal_session parts (one per meal). */
  mealSessionParts: MealSessionPart[];
  /** Currently active mealSessionIndex from the backend response. */
  activeMealSessionIndex: number;
  /** Switch the active meal — round-trips through the backend. */
  onPickMealSession: (mealSessionIndex: number) => void;
  /** Pick a different restaurant for the CURRENT intent only. The
   * backend scopes that one intent to the picked restaurant and
   * rebuilds the draft; other intents in the meal keep their existing
   * restaurants. */
  onPickRestaurant: (
    restaurantId: string,
    mealSessionIndex: number,
    intentId: string,
  ) => void;
  /** Open the SwapModal in the parent. */
  onSwap: (itemId: string, itemName: string, mealSessionIndex: number) => void;
  /** Remove a draft item. */
  onRemove: (itemId: string, mealSessionIndex: number) => void;
  /** Adjust a draft item's quantity. */
  onQtyChange: (itemId: string, qty: number, mealSessionIndex: number) => void;
  /** Commit the order — round-trips through /place-order. */
  onPlaceOrder: () => void;
  sending: boolean;
}

/**
 * Walks the user through the active meal session's intent blocks one at
 * a time. Always renders the cart's draft items for the current intent
 * via the rich DraftItemRow. The "Or try" alt-restaurant chips call
 * onPickRestaurant which round-trips through the backend; the new
 * response replaces the meal's draft and intent blocks for that
 * restaurant. There is no separate "browse" mode — the cart is the
 * source of truth for what's currently picked.
 *
 * Linear progress strip at the top, prev/next at the bottom. Chains
 * across meal sessions: Next at the last intent of the last meal
 * becomes "Add all to basket" (calls /place-order).
 */
export function IntentStepper({
  mealSessionParts,
  activeMealSessionIndex,
  onPickMealSession,
  onPickRestaurant,
  onSwap,
  onRemove,
  onQtyChange,
  onPlaceOrder,
  sending,
}: IntentStepperProps) {
  const [intentIndex, setIntentIndex] = useState(0);
  const pendingPrevRef = useRef(false);

  const activeMeal = useMemo(
    () =>
      mealSessionParts.find(
        (m) => m.mealSessionIndex === activeMealSessionIndex,
      ) ?? null,
    [mealSessionParts, activeMealSessionIndex],
  );
  const blocks: IntentBlockPart[] = activeMeal?.intentBlocks ?? [];

  useEffect(() => {
    if (pendingPrevRef.current) {
      pendingPrevRef.current = false;
      setIntentIndex(Math.max(0, blocks.length - 1));
    } else {
      setIntentIndex(0);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeMealSessionIndex]);

  if (!activeMeal) return null;
  if (blocks.length === 0) return <EmptyStepperState />;

  const safeIntentIdx = Math.min(intentIndex, blocks.length - 1);
  const block = blocks[safeIntentIdx];

  const draftItemsForIntent: DraftItem[] = (
    activeMeal.draft?.items ?? []
  ).filter(
    (it) => normalize(it.intentPhrase) === normalize(block.intent.phrase),
  );

  // Picked restaurant for this intent = the restaurant the draft items
  // come from. Falls back to intent block's first ranked pick when the
  // draft hasn't been built yet (e.g. headcount missing).
  const draftRestaurantId = draftItemsForIntent[0]?.restaurantId ?? null;
  const fallbackPick: ClientRestaurantPick | undefined =
    block.restaurantPicks[0];
  const pickedFromDraft =
    draftRestaurantId !== null
      ? activeMeal.draft?.restaurants.find((r) => r.id === draftRestaurantId) ??
        null
      : null;
  const pickedName =
    pickedFromDraft?.name ?? fallbackPick?.restaurant.name ?? "—";
  const pickedId = draftRestaurantId ?? fallbackPick?.restaurant.id ?? "";

  const alts = block.restaurantPicks.filter(
    (rp) => rp.restaurant.id !== pickedId,
  );

  const orderedMeals = mealSessionParts;
  const myPos = orderedMeals.findIndex(
    (m) => m.mealSessionIndex === activeMealSessionIndex,
  );
  const isFirstIntent = safeIntentIdx === 0;
  const isLastIntent = safeIntentIdx === blocks.length - 1;
  const isFirstMeal = myPos <= 0;
  const isLastMeal = myPos >= 0 && myPos === orderedMeals.length - 1;
  const atFinal = isLastIntent && isLastMeal;

  const prevLabel = !isFirstIntent
    ? capitalize(blocks[safeIntentIdx - 1].intent.phrase)
    : !isFirstMeal
      ? orderedMeals[myPos - 1].sessionName
      : null;
  const nextLabel = !isLastIntent
    ? capitalize(blocks[safeIntentIdx + 1].intent.phrase)
    : !isLastMeal
      ? orderedMeals[myPos + 1].sessionName
      : null;

  const handlePickAlt = (restaurantId: string) => {
    if (sending) return;
    onPickRestaurant(restaurantId, activeMealSessionIndex, block.intentId);
  };

  const handlePrev = () => {
    if (sending) return;
    if (!isFirstIntent) {
      setIntentIndex(safeIntentIdx - 1);
      return;
    }
    if (!isFirstMeal) {
      pendingPrevRef.current = true;
      onPickMealSession(orderedMeals[myPos - 1].mealSessionIndex);
    }
  };

  const handleNext = () => {
    if (sending) return;
    if (atFinal) {
      onPlaceOrder();
      return;
    }
    if (!isLastIntent) {
      setIntentIndex(safeIntentIdx + 1);
      return;
    }
    onPickMealSession(orderedMeals[myPos + 1].mealSessionIndex);
  };

  const totalIntentCount = orderedMeals.reduce(
    (sum, m) => sum + m.intentBlocks.length,
    0,
  );
  const allMealsTotal = orderedMeals.reduce(
    (sum, m) => sum + (m.draft?.pricing.subtotal ?? 0),
    0,
  );
  const totalFeeds = orderedMeals.reduce(
    (sum, m) => sum + (m.draft?.feedsPeople ?? 0),
    0,
  );

  return (
    <div
      style={{
        background: "var(--paper)",
        border: "1px solid var(--rule)",
        borderRadius: 16,
        overflow: "hidden",
        boxShadow: "var(--shadow-card)",
        display: "flex",
        flexDirection: "column",
        minHeight: 0,
      }}
    >
      <ProgressStrip
        total={blocks.length}
        currentIdx={safeIntentIdx}
        mealName={activeMeal.sessionName}
      />

      <AnimatePresence mode="wait">
        <motion.div
          key={`${activeMealSessionIndex}-${block.intentId}-${pickedId}`}
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -6 }}
          transition={{ duration: 0.22, ease: "easeOut" }}
          style={{ padding: "8px 18px 14px" }}
        >
          <h2
            className="display"
            style={{
              fontWeight: 400,
              fontSize: "1.7rem",
              lineHeight: 1.1,
              color: "var(--ink)",
              margin: 0,
              textTransform: "capitalize",
            }}
          >
            {block.intent.phrase}
          </h2>
          <div
            className="display-italic"
            style={{
              fontSize: "0.85rem",
              color: "var(--ink-soft)",
              marginTop: 4,
            }}
          >
            picked from{" "}
            <strong style={{ color: "var(--ink)", fontStyle: "normal" }}>
              {pickedName}
            </strong>
            {activeMeal.guestCount !== null &&
              ` · feeds ${activeMeal.guestCount}`}
          </div>

          {alts.length > 0 && (
            <div style={{ marginTop: 14 }}>
              <div className="small-caps" style={{ marginBottom: 6 }}>
                Or try
              </div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                {alts.map((rp) => (
                  <AltRestaurantChip
                    key={rp.restaurant.id}
                    name={rp.restaurant.name}
                    imageUrl={rp.restaurant.imageUrl}
                    candidateCount={rp.candidateCount}
                    disabled={sending}
                    onClick={() => handlePickAlt(rp.restaurant.id)}
                  />
                ))}
              </div>
            </div>
          )}

          {draftItemsForIntent.length > 0 ? (
            <ul style={{ margin: "16px 0 0", padding: 0, listStyle: "none" }}>
              {draftItemsForIntent.map((item) => (
                <DraftItemRow
                  key={item.id}
                  item={item}
                  onSwap={() =>
                    onSwap(item.id, item.name, activeMealSessionIndex)
                  }
                  onRemove={() => onRemove(item.id, activeMealSessionIndex)}
                  onQtyChange={(q) =>
                    onQtyChange(item.id, q, activeMealSessionIndex)
                  }
                />
              ))}
            </ul>
          ) : (
            <EmptyIntentState message="No items in this intent yet — keep chatting on the right." />
          )}
        </motion.div>
      </AnimatePresence>

      {atFinal && (
        <div
          style={{
            background: "var(--paper-deep)",
            padding: "12px 18px",
            borderTop: "1px solid var(--rule)",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "baseline",
          }}
        >
          <span style={{ fontSize: "0.82rem", color: "var(--ink-soft)" }}>
            {orderedMeals.length} meal
            {orderedMeals.length === 1 ? "" : "s"} · {totalIntentCount} intent
            {totalIntentCount === 1 ? "" : "s"}
            {totalFeeds > 0 ? ` · feeds ${totalFeeds}` : ""}
          </span>
          {allMealsTotal > 0 && (
            <span
              className="display"
              style={{
                fontWeight: 500,
                fontSize: "1.2rem",
                color: "var(--ink)",
                fontVariantNumeric: "tabular-nums",
              }}
            >
              £{allMealsTotal.toFixed(2)}
            </span>
          )}
        </div>
      )}

      <NavBar
        onPrev={handlePrev}
        onNext={handleNext}
        prevLabel={prevLabel}
        nextLabel={nextLabel}
        atFinal={atFinal}
        sending={sending}
        showPrev={!isFirstIntent || !isFirstMeal}
      />
    </div>
  );
}

// ---------- helpers ----------

function capitalize(s: string): string {
  if (!s) return s;
  return s.charAt(0).toUpperCase() + s.slice(1);
}

function normalize(s: string | null | undefined): string {
  return (s ?? "").trim().toLowerCase();
}

// ---------- subcomponents ----------

function ProgressStrip({
  total,
  currentIdx,
  mealName,
}: {
  total: number;
  currentIdx: number;
  mealName: string;
}) {
  return (
    <div
      style={{
        display: "flex",
        gap: 6,
        alignItems: "center",
        padding: "16px 18px 0",
      }}
    >
      {Array.from({ length: total }, (_, i) => (
        <div
          key={i}
          style={{
            height: 4,
            borderRadius: 2,
            flex: 1,
            background:
              i < currentIdx
                ? "var(--ink)"
                : i === currentIdx
                  ? "var(--brand)"
                  : "var(--rule)",
            transition: "background-color 0.2s ease",
          }}
        />
      ))}
      <span
        style={{
          color: "var(--ink-faint)",
          fontSize: "0.78rem",
          marginLeft: 8,
          whiteSpace: "nowrap",
        }}
      >
        {currentIdx + 1} of {total} · {mealName}
      </span>
    </div>
  );
}

function NavBar({
  onPrev,
  onNext,
  prevLabel,
  nextLabel,
  atFinal,
  sending,
  showPrev,
}: {
  onPrev: () => void;
  onNext: () => void;
  prevLabel: string | null;
  nextLabel: string | null;
  atFinal: boolean;
  sending: boolean;
  showPrev: boolean;
}) {
  return (
    <nav
      style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        padding: "14px 18px",
        borderTop: "1px solid var(--rule)",
        background: "var(--paper-deep)",
        gap: 10,
      }}
    >
      <button
        type="button"
        onClick={onPrev}
        disabled={!showPrev || sending}
        className="chip"
        style={{
          height: 40,
          padding: "0 18px",
          fontSize: "0.85rem",
          fontWeight: 500,
          visibility: showPrev ? "visible" : "hidden",
          cursor: sending ? "default" : "pointer",
          opacity: sending ? 0.6 : 1,
        }}
      >
        {prevLabel ? `← Previous: ${prevLabel}` : "← Previous"}
      </button>
      <button
        type="button"
        onClick={onNext}
        disabled={sending}
        className="chip chip-brand"
        style={{
          height: 40,
          padding: atFinal ? "0 22px" : "0 18px",
          fontSize: atFinal ? "0.95rem" : "0.85rem",
          fontWeight: 500,
          flex: atFinal ? 1 : 0,
          justifyContent: "center",
          cursor: sending ? "default" : "pointer",
          opacity: sending ? 0.7 : 1,
        }}
      >
        {atFinal
          ? "Add all to basket →"
          : nextLabel
            ? `Next: ${nextLabel} →`
            : "Next →"}
      </button>
    </nav>
  );
}

function AltRestaurantChip({
  name,
  imageUrl,
  candidateCount,
  disabled,
  onClick,
}: {
  name: string;
  imageUrl: string | null;
  candidateCount: number;
  disabled: boolean;
  onClick: () => void;
}) {
  const initial = (name?.trim()[0] ?? "?").toUpperCase();
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      className="chip"
      style={{
        height: 40,
        padding: "4px 14px 4px 4px",
        gap: 8,
        fontSize: "0.82rem",
        cursor: disabled ? "default" : "pointer",
        opacity: disabled ? 0.6 : 1,
      }}
    >
      <span
        aria-hidden="true"
        style={{
          width: 32,
          height: 32,
          borderRadius: "50%",
          background: imageUrl
            ? `url(${imageUrl}) center/cover`
            : "linear-gradient(135deg, var(--paper-deep) 0%, var(--rule) 100%)",
          flexShrink: 0,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          border: "1px solid var(--rule)",
          color: "var(--ink-faint)",
          fontFamily: "var(--font-display)",
          fontWeight: 500,
          fontSize: "0.78rem",
        }}
      >
        {!imageUrl && initial}
      </span>
      <span
        style={{
          display: "flex",
          flexDirection: "column",
          lineHeight: 1.1,
          alignItems: "flex-start",
        }}
      >
        <span style={{ color: "var(--ink)", fontWeight: 500 }}>{name}</span>
        <span
          style={{
            fontSize: "0.66rem",
            color: "var(--ink-faint)",
            marginTop: 2,
            letterSpacing: "0.02em",
          }}
        >
          {candidateCount} option{candidateCount === 1 ? "" : "s"}
        </span>
      </span>
    </button>
  );
}

function EmptyIntentState({ message }: { message: string }) {
  return (
    <div
      style={{
        marginTop: 16,
        padding: "16px 14px",
        background: "var(--paper-deep)",
        border: "1px dashed var(--rule)",
        borderRadius: 10,
        color: "var(--ink-faint)",
        fontFamily: "var(--font-display)",
        fontStyle: "italic",
        fontSize: "0.85rem",
        textAlign: "center",
      }}
    >
      {message}
    </div>
  );
}

function EmptyStepperState() {
  return (
    <div
      style={{
        background: "var(--paper)",
        border: "1px dashed var(--rule)",
        borderRadius: 16,
        padding: "32px 18px",
        textAlign: "center",
        color: "var(--ink-faint)",
      }}
    >
      <div className="display-italic" style={{ fontSize: "0.95rem" }}>
        No items yet for this meal — keep chatting on the right.
      </div>
    </div>
  );
}
