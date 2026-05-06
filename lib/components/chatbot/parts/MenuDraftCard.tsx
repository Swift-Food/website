"use client";

import { motion } from "motion/react";
import { DraftItemRow } from "../items/DraftItemRow";
import { Reason } from "../ui/Reason";
import { RestaurantSwitcher } from "../restaurant/RestaurantSwitcher";
import type { MenuDraft, DraftItem, MealCategory, RestaurantSummary, RestaurantSubtotal } from "../types";

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

/** Renders items grouped by category for a given item list. */
function ItemsByCategory({
  items,
  restaurantName,
  onSwap,
  onRemove,
  onQtyChange,
}: {
  items: DraftItem[];
  restaurantName?: string;
  onSwap?: (itemId: string) => void;
  onRemove?: (itemId: string) => void;
  onQtyChange?: (itemId: string, qty: number) => void;
}) {
  const grouped: Record<MealCategory, DraftItem[]> = {
    main: [],
    snack: [],
    drink: [],
    dessert: [],
  };
  for (const item of items) {
    if (grouped[item.mealCategory as MealCategory]) {
      grouped[item.mealCategory as MealCategory].push(item);
    }
  }

  return (
    <>
      {CATEGORY_ORDER.map((cat) => {
        const catItems = grouped[cat];
        if (catItems.length === 0) return null;
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
              {catItems.map((item) => (
                <DraftItemRow
                  key={item.id}
                  item={item}
                  restaurantName={restaurantName}
                  onSwap={onSwap ? () => onSwap(item.id) : undefined}
                  onRemove={onRemove ? () => onRemove(item.id) : undefined}
                  onQtyChange={
                    onQtyChange ? (q) => onQtyChange(item.id, q) : undefined
                  }
                />
              ))}
            </ul>
          </motion.div>
        );
      })}
    </>
  );
}

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
  const isMultiRestaurant = draft.restaurants.length > 1;

  if (isMultiRestaurant) {
    const byRestaurant = draft.restaurants.map((r) => ({
      restaurant: r,
      subtotal: draft.restaurantSubtotals.find((s) => s.restaurantId === r.id) ?? {
        restaurantId: r.id,
        restaurantName: r.name,
        itemCount: 0,
        subtotal: 0,
        meetsMinOrder: true,
      },
      items: draft.items.filter((i) => i.restaurantId === r.id),
    }));

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
          <PricingBlock draft={draft} />
          {byRestaurant.map((group) => (
            <div key={group.restaurant.id} style={{ borderTop: "1px solid var(--rule)" }}>
              <RestaurantGroupHeader
                restaurant={group.restaurant}
                subtotal={group.subtotal}
              />
              <div style={{ padding: "0 16px" }}>
                <ItemsByCategory
                  items={group.items}
                  restaurantName={group.restaurant.name}
                  onSwap={onSwap}
                  onRemove={onRemove}
                  onQtyChange={onQtyChange}
                />
              </div>
            </div>
          ))}
        </motion.div>
      </div>
    );
  }

  // Single-restaurant path — unchanged
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
        <ItemsByCategory
          items={draft.items}
          onSwap={onSwap}
          onRemove={onRemove}
          onQtyChange={onQtyChange}
        />
      </div>
    </motion.div>
    {onPickRestaurant && (
      <RestaurantSwitcher
        current={draft.restaurants[0]}
        alternatives={draft.alternatives}
        onPick={onPickRestaurant}
      />
    )}
    </div>
  );
}

function RestaurantHeader({ draft }: { draft: MenuDraft }) {
  const r = draft.restaurants[0];
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
          {[r.cuisine, `feeds ${draft.feedsPeople}`]
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

export function RestaurantGroupHeader({
  restaurant,
  subtotal,
}: {
  restaurant: RestaurantSummary;
  subtotal: RestaurantSubtotal;
}) {
  const photo = restaurant.imageUrl;
  return (
    <div
      style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        padding: "10px 16px",
        background: "var(--paper-deep)",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        {photo && (
          <div
            style={{
              width: 28,
              height: 28,
              borderRadius: 6,
              background: `url(${photo}) center/cover`,
              flexShrink: 0,
              border: "1px solid var(--rule)",
            }}
            aria-hidden="true"
          />
        )}
        <span className="display" style={{ fontWeight: 600, fontSize: "0.9rem", color: "var(--ink)" }}>
          {restaurant.name}
        </span>
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
        <span
          style={{
            background: "var(--paper)",
            border: "1px solid var(--rule)",
            borderRadius: 20,
            padding: "2px 8px",
            fontSize: "0.78rem",
            fontWeight: 600,
            color: "var(--ink)",
          }}
        >
          £{subtotal.subtotal.toFixed(2)}
        </span>
        {!subtotal.meetsMinOrder && subtotal.minOrderShortfall && (
          <span style={{ fontSize: "0.72rem", color: "var(--ink-soft)" }}>
            Add {subtotal.minOrderShortfall.missingItems} more item(s)
          </span>
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
