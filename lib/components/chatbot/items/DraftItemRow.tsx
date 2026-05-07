"use client";

import { motion } from "motion/react";
import { Reason } from "../ui/Reason";
import type { DraftItem } from "../types";

interface DraftItemRowProps {
  item: DraftItem;
  restaurantName?: string;
  onSwap?: () => void;
  onRemove?: () => void;
  onQtyChange?: (next: number) => void;
}

const PLACEHOLDER_BG =
  "linear-gradient(135deg, var(--paper-deep) 0%, var(--rule) 100%)";

/**
 * Single item card inside the menu draft. Layout:
 *   [photo] [name + reason + dietary/allergen pills] [qty/price stack]
 * Below that, a quiet row of action buttons (Swap / Remove / qty±).
 * Photo falls back to a typographic placeholder using the item's first
 * letter when no image URL is present.
 */
export function DraftItemRow({
  item,
  restaurantName,
  onSwap,
  onRemove,
  onQtyChange,
}: DraftItemRowProps) {
  const dietary = (item.dietaryFilters ?? []).filter(Boolean);
  const allergens = (item.allergens ?? []).filter(
    (a) => a && a.toLowerCase() !== "no specific allergens",
  );

  return (
    <motion.li
      variants={{
        hidden: { opacity: 0, y: 6, scale: 0.98 },
        visible: {
          opacity: 1,
          y: 0,
          scale: 1,
          transition: { duration: 0.22, ease: "easeOut" },
        },
      }}
      style={{
        display: "flex",
        gap: "12px",
        padding: "12px 0",
        borderBottom: "1px solid var(--rule)",
        listStyle: "none",
      }}
    >
      <ItemPhoto src={item.imageUrl} fallback={item.name} />

      <div style={{ flex: 1, minWidth: 0 }}>
        <div className="display" style={{ fontSize: "0.95rem", fontWeight: 600, color: "var(--ink)" }}>
          {item.name}
        </div>
        {restaurantName && (
          <span className="item-restaurant-badge">from {restaurantName}</span>
        )}
        {item.description && (
          <div
            style={{
              fontSize: "0.78rem",
              color: "var(--ink-soft)",
              lineHeight: 1.4,
              marginTop: 4,
            }}
          >
            {item.description}
          </div>
        )}
        {item.reason && (
          <div style={{ marginTop: 4 }}>
            <Reason>{item.reason}</Reason>
          </div>
        )}
        {(dietary.length > 0 || allergens.length > 0) && (
          <div style={{ display: "flex", flexWrap: "wrap", gap: 4, marginTop: 6 }}>
            {dietary.map((d) => (
              <span key={`d-${d}`} className="dietary-pill">
                {d.replace(/_/g, " ")}
              </span>
            ))}
            {allergens.slice(0, 3).map((a) => (
              <span key={`a-${a}`} className="allergen-pill">
                {a.toLowerCase()}
              </span>
            ))}
            {allergens.length > 3 && (
              <span className="allergen-pill">+{allergens.length - 3}</span>
            )}
          </div>
        )}
        {(onSwap || onRemove) && (
          <div style={{ display: "flex", gap: 6, marginTop: 8 }}>
            {onSwap && (
              <button type="button" className="chip" onClick={onSwap} style={{ height: 26, fontSize: "0.75rem" }}>
                Swap
              </button>
            )}
            {onRemove && (
              <button type="button" className="chip" onClick={onRemove} style={{ height: 26, fontSize: "0.75rem" }}>
                Remove
              </button>
            )}
          </div>
        )}
      </div>

      <div
        style={{
          textAlign: "right",
          display: "flex",
          flexDirection: "column",
          alignItems: "flex-end",
          flexShrink: 0,
          gap: 6,
        }}
      >
        <div
          className="display"
          style={{
            fontVariantNumeric: "tabular-nums",
            color: "var(--ink)",
            fontSize: "0.95rem",
            fontWeight: 600,
          }}
        >
          £{item.totalPrice.toFixed(2)}
        </div>
        <div style={{ fontSize: "0.7rem", color: "var(--ink-faint)" }}>
          £{item.unitPrice.toFixed(2)} ea · feeds {item.feedsPerUnit}
        </div>
        {onQtyChange ? (
          <QtyStepper value={item.quantity} onChange={onQtyChange} />
        ) : (
          <div style={{ fontSize: "0.78rem", color: "var(--ink-soft)" }}>
            ×{item.quantity}
          </div>
        )}
      </div>
    </motion.li>
  );
}

function ItemPhoto({
  src,
  fallback,
}: {
  src: string | null;
  fallback: string;
}) {
  const initial = (fallback ?? "?").trim()[0]?.toUpperCase() ?? "?";
  return (
    <div
      style={{
        width: 56,
        height: 56,
        borderRadius: 10,
        background: src ? `url(${src}) center/cover` : PLACEHOLDER_BG,
        flexShrink: 0,
        position: "relative",
        overflow: "hidden",
        border: "1px solid var(--rule)",
      }}
      aria-hidden="true"
    >
      {!src && (
        <span
          className="display-italic"
          style={{
            position: "absolute",
            inset: 0,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: "1.6rem",
            color: "var(--ink-faint)",
          }}
        >
          {initial}
        </span>
      )}
    </div>
  );
}

function QtyStepper({
  value,
  onChange,
}: {
  value: number;
  onChange: (v: number) => void;
}) {
  return (
    <motion.div
      key={value}
      initial={{ scale: 1.05 }}
      animate={{ scale: 1, transition: { duration: 0.12, ease: "easeOut" } }}
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 4,
        background: "var(--paper-deep)",
        borderRadius: 999,
        padding: "1px 4px",
      }}
    >
      <button
        type="button"
        onClick={() => onChange(Math.max(1, value - 1))}
        aria-label="Decrease quantity"
        style={qtyBtnStyle}
      >
        −
      </button>
      <span
        style={{
          fontVariantNumeric: "tabular-nums",
          fontSize: "0.8rem",
          minWidth: 22,
          textAlign: "center",
        }}
      >
        ×{value}
      </span>
      <button
        type="button"
        onClick={() => onChange(value + 1)}
        aria-label="Increase quantity"
        style={qtyBtnStyle}
      >
        +
      </button>
    </motion.div>
  );
}

const qtyBtnStyle: React.CSSProperties = {
  width: 22,
  height: 22,
  borderRadius: 999,
  background: "transparent",
  color: "var(--ink-soft)",
  border: 0,
  cursor: "pointer",
  fontSize: "0.95rem",
  lineHeight: 1,
};
