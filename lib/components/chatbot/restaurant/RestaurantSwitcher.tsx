"use client";

import { motion, useReducedMotion } from "motion/react";
import { Reason } from "../ui/Reason";
import type { RestaurantCandidate, RestaurantSummary } from "../types";

interface RestaurantSwitcherProps {
  current: RestaurantSummary;
  alternatives: RestaurantCandidate[];
  onPick: (restaurantId: string) => void;
}

/**
 * Horizontal strip of sibling restaurants surfaced alongside the
 * primary draft. Each card carries thumbnail, name (Fraunces), price
 * estimate, and the italic "picked because" reason. Snap-scrolling on
 * mobile keeps cards anchored to the viewport. Tapping triggers a
 * cross-fade in the parent's MenuDraftCard.
 *
 * Hidden when there are no alternatives — we don't display an empty
 * shelf.
 */
export function RestaurantSwitcher({
  current,
  alternatives,
  onPick,
}: RestaurantSwitcherProps) {
  if (alternatives.length === 0) return null;
  const prefersReducedMotion = useReducedMotion();

  return (
    <motion.div
      initial={prefersReducedMotion ? undefined : { opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.24, ease: "easeOut", delay: 0.1 }}
      style={{ marginTop: 12 }}
    >
      <div className="small-caps" style={{ marginBottom: 6, paddingLeft: 2 }}>
        Or try one of these
      </div>
      <motion.div
        initial="hidden"
        animate="visible"
        variants={{
          hidden: {},
          visible: { transition: { staggerChildren: 0.06 } },
        }}
        style={{
          display: "flex",
          gap: 10,
          overflowX: "auto",
          padding: "4px 0 8px 0",
          scrollSnapType: "x mandatory",
          scrollbarWidth: "none",
        }}
      >
        {alternatives.map((alt) => (
          <CandidateCard
            key={alt.restaurant.id}
            candidate={alt}
            onPick={() => onPick(alt.restaurant.id)}
          />
        ))}
      </motion.div>
    </motion.div>
  );
}

function CandidateCard({
  candidate,
  onPick,
}: {
  candidate: RestaurantCandidate;
  onPick: () => void;
}) {
  const prefersReducedMotion = useReducedMotion();
  const r = candidate.restaurant;

  return (
    <motion.button
      type="button"
      onClick={onPick}
      variants={{
        hidden: { opacity: 0, y: 6, scale: 0.98 },
        visible: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.22, ease: "easeOut" } },
      }}
      whileHover={prefersReducedMotion ? undefined : { y: -2 }}
      whileTap={{ scale: 0.98 }}
      style={{
        flexShrink: 0,
        width: 200,
        scrollSnapAlign: "start",
        textAlign: "left",
        background: "var(--paper)",
        border: "1px solid var(--rule)",
        borderRadius: 12,
        padding: 10,
        cursor: "pointer",
        display: "flex",
        flexDirection: "column",
        gap: 8,
        boxShadow: "var(--shadow-card)",
      }}
    >
      <div
        style={{
          width: "100%",
          height: 80,
          borderRadius: 8,
          background: r.imageUrl
            ? `url(${r.imageUrl}) center/cover`
            : "linear-gradient(135deg, var(--paper-deep) 0%, var(--rule) 100%)",
          border: "1px solid var(--rule)",
          position: "relative",
        }}
        aria-hidden="true"
      >
        {!r.imageUrl && (
          <span
            className="display-italic"
            style={{
              position: "absolute",
              inset: 0,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "var(--ink-faint)",
              fontSize: "1.6rem",
            }}
          >
            {r.name.trim()[0]?.toUpperCase() ?? "?"}
          </span>
        )}
      </div>
      <div className="display" style={{ fontSize: "0.92rem", fontWeight: 600, color: "var(--ink)" }}>
        {r.name}
      </div>
      <div style={{ fontSize: "0.72rem", color: "var(--ink-soft)" }}>
        {r.cuisine ?? ""}
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
        ~£{candidate.estimatedPricePerPerson.toFixed(2)}/pp
      </div>
      {candidate.pickedReason && (
        <Reason>{candidate.pickedReason}</Reason>
      )}
    </motion.button>
  );
}
