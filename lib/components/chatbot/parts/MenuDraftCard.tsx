"use client";

import { motion } from "motion/react";
import { DraftItemRow } from "../items/DraftItemRow";
import { Reason } from "../ui/Reason";
import { RestaurantSwitcher } from "../restaurant/RestaurantSwitcher";
import type { MenuDraft, DraftItem, MealCategory } from "../types";

interface MenuDraftCardProps {
  draft: MenuDraft;
  onSwap?: (itemId: string) => void;
  onRemove?: (itemId: string) => void;
  onQtyChange?: (itemId: string, qty: number) => void;
  onPickRestaurant?: (restaurantId: string) => void;
}

const CATEGORY_LABELS: Record<MealCategory, string> = {
  main: "Mains",
  snack: "Sides",
  drink: "Drinks",
  dessert: "Desserts",
};

const CATEGORY_ORDER: MealCategory[] = ["main", "snack", "drink", "dessert"];

/**
 * The centerpiece of the chatbot. Restaurant header, pricing block,
 * grouped item list, and footer chips. Items stagger in like cards
 * being dealt onto a table — coordinated with the panel's editorial
 * direction.
 */
export function MenuDraftCard({
  draft,
  onSwap,
  onRemove,
  onQtyChange,
  onPickRestaurant,
}: MenuDraftCardProps) {
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
    <div>
    <motion.div
      key={draft.id}
      initial="hidden"
      animate="visible"
      variants={{
        hidden: {},
        visible: { transition: { staggerChildren: 0.05, delayChildren: 0.08 } },
      }}
      style={{
        background: "var(--paper)",
        border: "1px solid var(--rule)",
        borderRadius: "16px",
        boxShadow: "var(--shadow-card)",
        overflow: "hidden",
      }}
    >
      <RestaurantHeader draft={draft} />
      <PricingBlock draft={draft} />

      <div style={{ padding: "0 16px" }}>
        {CATEGORY_ORDER.map((cat) => {
          const items = grouped[cat];
          if (items.length === 0) return null;
          return (
            <motion.div
              key={cat}
              variants={{
                hidden: { opacity: 0 },
                visible: { opacity: 1, transition: { duration: 0.18 } },
              }}
              style={{ paddingTop: 14, paddingBottom: 4 }}
            >
              <div className="small-caps" style={{ marginBottom: 4 }}>
                {CATEGORY_LABELS[cat]}
              </div>
              <ul style={{ margin: 0, padding: 0 }}>
                {items.map((item) => (
                  <DraftItemRow
                    key={item.id}
                    item={item}
                    onSwap={onSwap ? () => onSwap(item.id) : undefined}
                    onRemove={onRemove ? () => onRemove(item.id) : undefined}
                    onQtyChange={
                      onQtyChange
                        ? (q) => onQtyChange(item.id, q)
                        : undefined
                    }
                  />
                ))}
              </ul>
            </motion.div>
          );
        })}
      </div>
    </motion.div>
    {onPickRestaurant && (
      <RestaurantSwitcher
        current={draft.restaurant}
        alternatives={draft.alternatives}
        onPick={onPickRestaurant}
      />
    )}
    </div>
  );
}

function RestaurantHeader({ draft }: { draft: MenuDraft }) {
  const r = draft.restaurant;
  const photo = r.imageUrl;
  return (
    <div
      style={{
        display: "flex",
        gap: "12px",
        padding: "16px",
        borderBottom: "1px solid var(--rule)",
        alignItems: "flex-start",
      }}
    >
      <div
        style={{
          width: 64,
          height: 64,
          borderRadius: 12,
          background: photo ? `url(${photo}) center/cover` : "var(--paper-deep)",
          flexShrink: 0,
          border: "1px solid var(--rule)",
        }}
        aria-hidden="true"
      />
      <div style={{ flex: 1, minWidth: 0 }}>
        <div className="display" style={{ fontSize: "1.05rem", fontWeight: 600, color: "var(--ink)" }}>
          {r.name}
        </div>
        <div style={{ fontSize: "0.78rem", color: "var(--ink-soft)", marginTop: 2 }}>
          {[r.cuisine, `${r.rating.toFixed(1)}★`, `feeds ${draft.feedsPeople}`]
            .filter(Boolean)
            .join(" · ")}
        </div>
        {draft.pickedReason && (
          <div style={{ marginTop: 4 }}>
            <Reason>{draft.pickedReason}</Reason>
          </div>
        )}
      </div>
    </div>
  );
}

function PricingBlock({ draft }: { draft: MenuDraft }) {
  return (
    <div
      style={{
        padding: "12px 16px",
        background: "var(--paper-deep)",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "baseline",
        borderBottom: "1px solid var(--rule)",
      }}
    >
      <div>
        <div
          className="display"
          style={{ fontSize: "1.2rem", fontWeight: 600, color: "var(--ink)" }}
        >
          £{draft.pricing.subtotal.toFixed(2)}
        </div>
        <div style={{ fontSize: "0.72rem", color: "var(--ink-faint)" }}>
          £{draft.pricing.pricePerPerson.toFixed(2)}/person
        </div>
      </div>
      {draft.pricing.budgetRemaining > 0 && (
        <div style={{ textAlign: "right" }}>
          <div className="small-caps">Remaining</div>
          <div className="display" style={{ color: "var(--olive)", fontWeight: 600 }}>
            £{draft.pricing.budgetRemaining.toFixed(2)}
          </div>
        </div>
      )}
    </div>
  );
}
