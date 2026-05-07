"use client";

import { motion } from "motion/react";
import type { ChatMealSessionView } from "../types";

interface MealSessionTabsProps {
  mealSessions: ChatMealSessionView[];
  activeIndex: number;
  onPick: (mealSessionIndex: number) => void;
}

/**
 * Numbered card-style tabs across the top of the builder column. One
 * tab per meal session (Lunch / Dinner / etc). Active tab uses brand
 * pink. Each tab shows: numbered badge · session name · date and time.
 * Clicking a non-active tab calls onPick(index) which round-trips
 * through pickMealSession to set activeMealSessionIndex on the server.
 */
export function MealSessionTabs({
  mealSessions,
  activeIndex,
  onPick,
}: MealSessionTabsProps) {
  if (mealSessions.length === 0) return null;

  return (
    <div
      style={{
        display: "flex",
        gap: 10,
        flexWrap: "wrap",
        alignItems: "stretch",
      }}
    >
      {mealSessions.map((m, i) => (
        <MealSessionTab
          key={m.index}
          meal={m}
          number={i + 1}
          active={i === activeIndex}
          onClick={() => i !== activeIndex && onPick(m.index)}
        />
      ))}
    </div>
  );
}

function MealSessionTab({
  meal,
  number,
  active,
  onClick,
}: {
  meal: ChatMealSessionView;
  number: number;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <motion.button
      type="button"
      onClick={onClick}
      initial={false}
      animate={{
        backgroundColor: active ? "var(--brand)" : "var(--paper)",
        borderColor: active ? "var(--brand)" : "var(--rule)",
      }}
      transition={{ duration: 0.18, ease: "easeOut" }}
      whileHover={active ? undefined : { borderColor: "var(--ink-faint)" }}
      style={{
        display: "flex",
        alignItems: "center",
        gap: 12,
        padding: "10px 14px 10px 10px",
        borderRadius: 12,
        borderWidth: 1,
        borderStyle: "solid",
        cursor: active ? "default" : "pointer",
        minWidth: 200,
        textAlign: "left",
        boxShadow: active ? "var(--shadow-card)" : "none",
        color: active ? "white" : "var(--ink)",
        fontFamily: "var(--font-body)",
      }}
      aria-current={active ? "true" : undefined}
    >
      <span
        style={{
          display: "inline-flex",
          alignItems: "center",
          justifyContent: "center",
          width: 36,
          height: 36,
          borderRadius: 10,
          background: active ? "rgba(255,255,255,0.18)" : "var(--paper-deep)",
          color: active ? "white" : "var(--ink-soft)",
          fontFamily: "var(--font-display)",
          fontWeight: 500,
          fontSize: "1.15rem",
          flexShrink: 0,
          lineHeight: 1,
        }}
      >
        {number}
      </span>
      <span
        style={{
          display: "flex",
          flexDirection: "column",
          lineHeight: 1.15,
          minWidth: 0,
        }}
      >
        <span
          className="display"
          style={{
            fontWeight: 500,
            fontSize: "1rem",
            whiteSpace: "nowrap",
            overflow: "hidden",
            textOverflow: "ellipsis",
          }}
        >
          {meal.sessionName}
        </span>
        <span
          style={{
            fontSize: "0.72rem",
            color: active ? "rgba(255,255,255,0.85)" : "var(--ink-faint)",
            marginTop: 2,
            letterSpacing: "0.01em",
            whiteSpace: "nowrap",
            overflow: "hidden",
            textOverflow: "ellipsis",
          }}
        >
          {[meal.sessionDate, meal.eventTime].filter(Boolean).join(", ")}
        </span>
      </span>
    </motion.button>
  );
}
