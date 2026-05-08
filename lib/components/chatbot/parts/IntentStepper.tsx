"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { DraftItemRow } from "../items/DraftItemRow";
import type {
  ClientRestaurantPick,
  DraftItem,
  IntentBlockItem,
  IntentBlockPart,
  MealSessionPart,
} from "../types";
import type { UseCart } from "../cart/useCart";
import { computeDefaultQty } from "../cart/computeQty";

export interface IntentStepperSwapTarget {
  intentId: string;
  itemId: string;
  itemName: string;
  restaurantId: string;
  category: string;
  intentPhrase: string;
  intentExcludes: string[] | null;
}

interface IntentStepperProps {
  /** All meal_session parts (one per meal). */
  mealSessionParts: MealSessionPart[];
  /** Currently active mealSessionIndex from the backend response. */
  activeMealSessionIndex: number;
  /** Switch the active meal — round-trips through the backend. */
  onPickMealSession: (mealSessionIndex: number) => void;
  /** "Add all to basket" — the parent gathers picks from `cart` and POSTs them. */
  onPlaceOrder: () => void;
  /** Open the SwapModal in the parent. The parent fetches options via the
   *  stateless /swap-options-by-restaurant endpoint and then applies the
   *  chosen replacement to `cart` directly. */
  onSwap: (target: IntentStepperSwapTarget) => void;
  /** Cart hook handle from the parent. Restaurant switching, qty changes,
   *  removals, and swap-applies are all client mutations through this. */
  cart: UseCart;
  sending: boolean;
}

/**
 * Walks the user through the active meal's intent blocks one at a time.
 * Renders the items for the cart-selected restaurant per intent. Chip
 * switches are pure client state changes — no backend round-trip — so
 * the user can flip between alternatives instantly. Quantities default
 * via computeDefaultQty (mirroring the backend re-portion math) and can
 * be overridden per item.
 *
 * The `Add all to basket` button at the end of the last intent of the
 * last meal calls onPlaceOrder, which posts the full cart to the
 * backend's /place-order for verification.
 */
export function IntentStepper({
  mealSessionParts,
  activeMealSessionIndex,
  onPickMealSession,
  onPlaceOrder,
  onSwap,
  cart,
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

  // Cart-derived selection. null fallback → use the IntentBlock's default
  // pick (restaurantPicks[0]). Once the user clicks an alt chip, the cart
  // remembers it.
  const selectedRestaurantId =
    cart.getSelectedRestaurantId(block.intentId) ??
    block.restaurantPicks[0]?.restaurant.id ??
    null;
  const pickIdx = Math.max(
    0,
    block.restaurantPicks.findIndex(
      (rp) => rp.restaurant.id === selectedRestaurantId,
    ),
  );
  const selected: ClientRestaurantPick | undefined = block.restaurantPicks[pickIdx];

  // For the qty share calc: how many other intents in this meal share
  // the same mealCategory? 3 mains for 50 people → 17 each.
  const intentsInSameCategory = activeMeal.intentBlocks.filter(
    (b) => b.intent.category === block.intent.category,
  ).length;

  const cartIntent = cart.cart[block.intentId];
  const removedSet = new Set(cartIntent?.removedItemIds ?? []);

  // Compose the items to render. Source = picked restaurant's items,
  // minus removed, plus swapped-in (each swap-in keyed under the OLD
  // item's id so it occupies the slot of the item it replaced — but
  // when we render we use the new item's content).
  const displayedItems = useMemo(() => {
    if (!selected) return [];
    const headcount = activeMeal.guestCount ?? 1;
    const fromBlock = selected.items.filter((it) => !removedSet.has(it.id));
    const swappedIn = Object.values(cartIntent?.swappedIn ?? {});
    const all: IntentBlockItem[] = [...fromBlock, ...swappedIn];
    return all.map((it) => {
      const overrideQty = cartIntent?.qtyOverrides[it.id];
      const qty =
        overrideQty ??
        computeDefaultQty(
          headcount,
          Math.max(1, intentsInSameCategory),
          it.feedsPerUnit,
          it.cateringQuantityUnit,
        );
      const totalPrice = Number((it.price * qty).toFixed(2));
      return { ...it, quantity: qty, totalPrice };
    });
  }, [selected, cartIntent, activeMeal, intentsInSameCategory, removedSet]);

  const pickedName = selected?.restaurant.name ?? "—";
  const pickedId = selected?.restaurant.id ?? "";
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
    // Pure client-side mutation — instant. No round-trip.
    cart.setRestaurant(block.intentId, restaurantId);
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

  // Total across ALL meals — derived from cart picks instead of draft.
  const totalIntentCount = orderedMeals.reduce(
    (sum, m) => sum + m.intentBlocks.length,
    0,
  );
  const totalFeeds = orderedMeals.reduce(
    (sum, m) => sum + (m.guestCount ?? 0),
    0,
  );
  const allMealsTotal = useMemo(() => {
    let total = 0;
    for (const meal of orderedMeals) {
      const head = meal.guestCount ?? 1;
      for (const b of meal.intentBlocks) {
        const sel =
          cart.getSelectedRestaurantId(b.intentId) ??
          b.restaurantPicks[0]?.restaurant.id;
        const pick = b.restaurantPicks.find((rp) => rp.restaurant.id === sel);
        if (!pick) continue;
        const ci = cart.cart[b.intentId];
        const rs = new Set(ci?.removedItemIds ?? []);
        const inCat = meal.intentBlocks.filter(
          (other) => other.intent.category === b.intent.category,
        ).length;
        const items = [
          ...pick.items.filter((it) => !rs.has(it.id)),
          ...Object.values(ci?.swappedIn ?? {}),
        ];
        for (const it of items) {
          const qty =
            ci?.qtyOverrides[it.id] ??
            computeDefaultQty(head, Math.max(1, inCat), it.feedsPerUnit, it.cateringQuantityUnit);
          total += it.price * qty;
        }
      }
    }
    return Number(total.toFixed(2));
  }, [orderedMeals, cart]);

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
                    disabled={false}
                    onClick={() => handlePickAlt(rp.restaurant.id)}
                  />
                ))}
              </div>
            </div>
          )}

          {displayedItems.length > 0 ? (
            <ul style={{ margin: "16px 0 0", padding: 0, listStyle: "none" }}>
              {displayedItems.map((item) => (
                <DraftItemRow
                  key={item.id}
                  item={
                    {
                      ...item,
                      unitPrice: item.price,
                      menuItemId: item.id,
                      restaurantId: selected!.restaurant.id,
                      intentPhrase: block.intent.phrase,
                      reason: item.reason ?? "",
                    } as unknown as DraftItem
                  }
                  onSwap={() =>
                    onSwap({
                      intentId: block.intentId,
                      itemId: item.id,
                      itemName: item.name,
                      restaurantId: selected!.restaurant.id,
                      category: item.mealCategory,
                      intentPhrase: block.intent.phrase,
                      intentExcludes: block.intent.excludes,
                    })
                  }
                  onRemove={() => cart.removeItem(block.intentId, item.id)}
                  onQtyChange={(q) =>
                    cart.setQty(block.intentId, item.id, q)
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
