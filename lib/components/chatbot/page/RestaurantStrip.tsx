"use client";

import { motion, useReducedMotion } from "motion/react";
import { Reason } from "../ui/Reason";
import type { MenuDraft } from "../types";

interface RestaurantStripProps {
  draft: MenuDraft;
  onPick: (restaurantId: string) => void;
}

/**
 * Horizontal restaurant row at the top of the /catering-AI left column.
 * Shows the currently picked restaurant first (highlighted, non-tappable)
 * followed by sibling alternatives. Tapping a sibling triggers
 * `pick_restaurant` on the chat session, which swaps the draft.
 */
export function RestaurantStrip({ draft, onPick }: RestaurantStripProps) {
  const prefersReducedMotion = useReducedMotion();

  return (
    <motion.div
      initial={prefersReducedMotion ? undefined : { opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.24, ease: "easeOut" }}
      style={{
        borderBottom: "1px solid var(--rule)",
        background: "var(--paper)",
        padding: "16px 20px",
      }}
    >
      <div className="small-caps" style={{ marginBottom: 10 }}>
        Restaurants
      </div>
      <motion.div
        initial="hidden"
        animate="visible"
        variants={{
          hidden: {},
          visible: { transition: { staggerChildren: 0.05 } },
        }}
        style={{
          display: "flex",
          gap: 12,
          overflowX: "auto",
          paddingBottom: 4,
          scrollSnapType: "x mandatory",
          scrollbarWidth: "thin",
        }}
      >
        <RestaurantCard
          name={draft.restaurant.name}
          cuisine={draft.restaurant.cuisine}
          rating={draft.restaurant.rating}
          imageUrl={draft.restaurant.imageUrl}
          pricePerPerson={draft.pricing.pricePerPerson}
          reason={draft.pickedReason}
          isCurrent
        />
        {draft.alternatives.map((alt) => (
          <RestaurantCard
            key={alt.restaurant.id}
            name={alt.restaurant.name}
            cuisine={alt.restaurant.cuisine}
            rating={alt.restaurant.rating}
            imageUrl={alt.restaurant.imageUrl}
            pricePerPerson={alt.estimatedPricePerPerson}
            reason={alt.pickedReason}
            onPick={() => onPick(alt.restaurant.id)}
          />
        ))}
      </motion.div>
    </motion.div>
  );
}

interface RestaurantCardProps {
  name: string;
  cuisine: string | null;
  rating: number;
  imageUrl: string | null;
  pricePerPerson: number;
  reason: string;
  isCurrent?: boolean;
  onPick?: () => void;
}

function RestaurantCard({
  name,
  cuisine,
  rating,
  imageUrl,
  pricePerPerson,
  reason,
  isCurrent,
  onPick,
}: RestaurantCardProps) {
  const prefersReducedMotion = useReducedMotion();

  return (
    <motion.button
      type="button"
      onClick={onPick}
      disabled={isCurrent}
      variants={{
        hidden: { opacity: 0, y: 6, scale: 0.98 },
        visible: {
          opacity: 1,
          y: 0,
          scale: 1,
          transition: { duration: 0.22, ease: "easeOut" },
        },
      }}
      whileHover={prefersReducedMotion || isCurrent ? undefined : { y: -2 }}
      whileTap={isCurrent ? undefined : { scale: 0.98 }}
      style={{
        flexShrink: 0,
        width: 220,
        scrollSnapAlign: "start",
        textAlign: "left",
        background: isCurrent ? "var(--paper-deep)" : "var(--paper)",
        border: isCurrent
          ? "1.5px solid var(--ink)"
          : "1px solid var(--rule)",
        borderRadius: 14,
        padding: 12,
        cursor: isCurrent ? "default" : "pointer",
        display: "flex",
        flexDirection: "column",
        gap: 8,
        position: "relative",
      }}
    >
      {isCurrent && (
        <span
          className="small-caps"
          style={{
            position: "absolute",
            top: 8,
            right: 10,
            color: "var(--ink)",
            fontSize: "0.6rem",
          }}
        >
          Selected
        </span>
      )}
      <div
        style={{
          width: "100%",
          height: 96,
          borderRadius: 10,
          background: imageUrl
            ? `url(${imageUrl}) center/cover`
            : "linear-gradient(135deg, var(--paper-deep) 0%, var(--rule) 100%)",
          border: "1px solid var(--rule)",
          position: "relative",
        }}
        aria-hidden="true"
      >
        {!imageUrl && (
          <span
            className="display-italic"
            style={{
              position: "absolute",
              inset: 0,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "var(--ink-faint)",
              fontSize: "1.8rem",
            }}
          >
            {name.trim()[0]?.toUpperCase() ?? "?"}
          </span>
        )}
      </div>
      <div
        className="display"
        style={{ fontSize: "0.95rem", fontWeight: 600, color: "var(--ink)" }}
      >
        {name}
      </div>
      <div style={{ fontSize: "0.72rem", color: "var(--ink-soft)" }}>
        {[cuisine, `${rating.toFixed(1)}★`].filter(Boolean).join(" · ")}
      </div>
      <div
        className="display"
        style={{
          fontSize: "0.85rem",
          fontWeight: 600,
          color: "var(--ink)",
          fontVariantNumeric: "tabular-nums",
        }}
      >
        ~£{pricePerPerson.toFixed(2)}/pp
      </div>
      {reason && <Reason>{reason}</Reason>}
    </motion.button>
  );
}
