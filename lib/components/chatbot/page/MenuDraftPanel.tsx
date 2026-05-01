"use client";

import { motion } from "motion/react";
import { DraftItemRow } from "../items/DraftItemRow";
import type { DraftItem, MealCategory, MenuDraft } from "../types";

interface MenuDraftPanelProps {
  draft: MenuDraft;
  onSwap: (itemId: string, itemName: string) => void;
  onRemove: (itemId: string) => void;
  onQtyChange: (itemId: string, qty: number) => void;
}

const CATEGORY_LABELS: Record<MealCategory, string> = {
  main: "Mains",
  snack: "Sides",
  drink: "Drinks",
  dessert: "Desserts",
};

const CATEGORY_ORDER: MealCategory[] = ["main", "snack", "drink", "dessert"];

/**
 * Pricing block + grouped item list for the picked restaurant. Pure
 * content — no fixed height, no internal scroll. The page-aside owns
 * the scroll context so summary card, restaurant strip, and items
 * scroll as one continuous column.
 */
export function MenuDraftPanel({
  draft,
  onSwap,
  onRemove,
  onQtyChange,
}: MenuDraftPanelProps) {
  const grouped: Record<MealCategory, DraftItem[]> = {
    main: [],
    snack: [],
    drink: [],
    dessert: [],
  };
  for (const item of draft.items) {
    if (grouped[item.mealCategory]) grouped[item.mealCategory].push(item);
  }

  return (
    <motion.div
      key={draft.id}
      initial="hidden"
      animate="visible"
      variants={{
        hidden: {},
        visible: { transition: { staggerChildren: 0.04, delayChildren: 0.06 } },
      }}
    >
      <PricingBlock draft={draft} />
      {CATEGORY_ORDER.map((cat) => {
        const items = grouped[cat];
        if (items.length === 0) return null;
        return (
          <motion.section
            key={cat}
            variants={{
              hidden: { opacity: 0 },
              visible: { opacity: 1, transition: { duration: 0.2 } },
            }}
            style={{ marginTop: 22 }}
          >
            <div
              className="small-caps"
              style={{
                marginBottom: 6,
                fontSize: "0.72rem",
                letterSpacing: "0.18em",
              }}
            >
              {CATEGORY_LABELS[cat]}
            </div>
            <ul style={{ margin: 0, padding: 0, listStyle: "none" }}>
              {items.map((item) => (
                <DraftItemRow
                  key={item.id}
                  item={item}
                  onSwap={() => onSwap(item.id, item.name)}
                  onRemove={() => onRemove(item.id)}
                  onQtyChange={(q) => onQtyChange(item.id, q)}
                />
              ))}
            </ul>
          </motion.section>
        );
      })}
    </motion.div>
  );
}

function PricingBlock({ draft }: { draft: MenuDraft }) {
  return (
    <div
      style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "baseline",
        padding: "14px 16px",
        background: "var(--paper-deep)",
        borderRadius: 12,
        border: "1px solid var(--rule)",
      }}
    >
      <div>
        <div
          className="display"
          style={{
            fontSize: "1.6rem",
            fontWeight: 600,
            color: "var(--ink)",
            fontVariantNumeric: "tabular-nums",
          }}
        >
          £{draft.pricing.subtotal.toFixed(2)}
        </div>
        <div style={{ fontSize: "0.78rem", color: "var(--ink-faint)" }}>
          £{draft.pricing.pricePerPerson.toFixed(2)}/person · feeds{" "}
          {draft.feedsPeople}
        </div>
      </div>
      {draft.pricing.budgetRemaining > 0 && (
        <div style={{ textAlign: "right" }}>
          <div className="small-caps">Remaining</div>
          <div
            className="display"
            style={{
              color: "var(--olive)",
              fontWeight: 600,
              fontVariantNumeric: "tabular-nums",
              fontSize: "1.05rem",
            }}
          >
            £{draft.pricing.budgetRemaining.toFixed(2)}
          </div>
        </div>
      )}
    </div>
  );
}
