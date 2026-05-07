"use client";

import { useState } from "react";
import { AnimatePresence, motion, type Variants } from "motion/react";
import { PencilIcon } from "../ui/PencilIcon";
import type { SharedTaxonomyView } from "../types";

interface SummaryCardProps {
  taxonomy: SharedTaxonomyView;
  editable: string[];
  onEdit: (field: string) => void;
  /**
   * When true, renders the "Your event" header as a toggle button and
   * animates the row list collapsed/expanded. The floating widget
   * leaves this off (rows always visible inline in the chat thread);
   * the /catering-AI page turns it on so the card can shrink to a
   * one-line bar at the top of the chat column.
   */
  collapsible?: boolean;
  defaultOpen?: boolean;
}

interface Row {
  field: string;
  label: string;
  value: string | null;
}

const cardStyle: React.CSSProperties = {
  background: "var(--paper)",
  border: "1px solid var(--rule)",
  borderRadius: 14,
  padding: "14px 16px",
  boxShadow: "var(--shadow-card)",
};

// Glass variant — used when the card sits at the top of the chat
// column on /catering-AI. The card is position:sticky inside the chat
// scroll container, so messages actually pass under it. Low alpha +
// real blur gives it a frosted-pane look. Inner highlight + soft
// shadow sells the depth.
const glassCardStyle: React.CSSProperties = {
  background: "rgba(251, 247, 244, 0.32)",
  border: "1px solid rgba(255, 255, 255, 0.55)",
  borderRadius: 14,
  padding: "14px 16px",
  boxShadow:
    "inset 0 1px 0 rgba(255,255,255,0.6), 0 1px 2px rgba(26,26,26,0.04), 0 8px 24px rgba(26,26,26,0.08)",
  backdropFilter: "blur(12px) saturate(140%)",
  WebkitBackdropFilter: "blur(12px) saturate(140%)",
};

/**
 * Editorial summary card. Only renders rows that have a populated value —
 * null, empty string, and empty arrays are skipped entirely. If no rows
 * have values after filtering, the card renders nothing (returns null).
 * Pink is reserved for the panel header; this card stays cream/charcoal
 * with the small-caps Fraunces label treatment.
 */
export function SummaryCard({
  taxonomy,
  editable,
  onEdit,
  collapsible = false,
  defaultOpen = true,
}: SummaryCardProps) {
  const [open, setOpen] = useState(defaultOpen);

  // Per-meal fields (when, headcount, meal_time) live on each
  // meal_session part now — they're per-meal in the multi-session
  // model, not event-wide. SummaryCard renders only event-wide fields.
  const allRows: Row[] = [
    {
      field: "budget",
      label: "Budget",
      value: taxonomy.budget !== null ? `£${taxonomy.budget}` : null,
    },
    {
      field: "dietary_restrictions",
      label: "Dietary",
      value:
        taxonomy.dietaryRestrictions.length > 0
          ? taxonomy.dietaryRestrictions.join(", ")
          : null,
    },
    {
      field: "cuisine_preference",
      label: "Cuisine",
      value: formatList(taxonomy.cuisinePreference, ""),
    },
    {
      field: "format_preference",
      label: "Format",
      value: formatList(taxonomy.formatPreference, ""),
    },
    {
      field: "occasion",
      label: "Occasion",
      value: taxonomy.occasion,
    },
  ];

  // Only show rows with a populated value.
  const rows = allRows.filter(
    (row) =>
      row.value !== null &&
      row.value !== "" &&
      (!Array.isArray(row.value) || row.value.length > 0),
  );

  // If nothing is populated, render nothing at all.
  if (rows.length === 0) return null;

  if (collapsible) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 4 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.22, ease: "easeOut" }}
        style={glassCardStyle}
      >
        <button
          type="button"
          onClick={() => setOpen((o) => !o)}
          aria-expanded={open}
          aria-label={open ? "Collapse event details" : "Expand event details"}
          style={{
            width: "100%",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            background: "transparent",
            border: 0,
            padding: 0,
            cursor: "pointer",
            color: "inherit",
            textAlign: "left",
          }}
        >
          <span className="small-caps">Your event</span>
          <Chevron open={open} />
        </button>
        <AnimatePresence initial={false}>
          {open && (
            <motion.div
              key="rows"
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
              style={{ overflow: "hidden" }}
            >
              <div style={{ marginTop: 8 }}>
                {rows.map((row) => (
                  <SummaryRow
                    key={row.field}
                    row={row}
                    editable={editable.includes(row.field)}
                    onEdit={() => onEdit(row.field)}
                    animated={false}
                  />
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={{
        hidden: {},
        visible: { transition: { staggerChildren: 0.04, delayChildren: 0.05 } },
      }}
      style={cardStyle}
    >
      <div className="small-caps" style={{ marginBottom: 6 }}>
        Your event
      </div>
      {rows.map((row) => (
        <SummaryRow
          key={row.field}
          row={row}
          editable={editable.includes(row.field)}
          onEdit={() => onEdit(row.field)}
          animated
        />
      ))}
    </motion.div>
  );
}

function SummaryRow({
  row,
  editable,
  onEdit,
  animated,
}: {
  row: Row;
  editable: boolean;
  onEdit: () => void;
  animated: boolean;
}) {
  // Rows are pre-filtered to only populated values before reaching here,
  // but guard defensively in case the component is called directly.
  if (!row.value || row.value.length === 0) return null;

  const inner = (
    <>
      <div className="summary-label">{row.label}</div>
      <div className="summary-value">{row.value}</div>
      {editable && (
        <button
          type="button"
          className="pencil-btn"
          onClick={onEdit}
          aria-label={`Edit ${row.label.toLowerCase()}`}
        >
          <PencilIcon />
        </button>
      )}
    </>
  );

  if (animated) {
    return (
      <motion.div className="summary-row" variants={ROW_VARIANTS}>
        {inner}
      </motion.div>
    );
  }
  return <div className="summary-row">{inner}</div>;
}

const ROW_VARIANTS: Variants = {
  hidden: { opacity: 0, y: 4 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.2, ease: "easeOut" },
  },
};

function Chevron({ open }: { open: boolean }) {
  return (
    <motion.svg
      animate={{ rotate: open ? 180 : 0 }}
      transition={{ duration: 0.2, ease: "easeOut" }}
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      style={{ color: "var(--ink-faint)", flexShrink: 0 }}
    >
      <polyline points="6 9 12 15 18 9" />
    </motion.svg>
  );
}

function formatList(arr: string[] | null, emptyLabel: string): string | null {
  if (arr === null) return null; // never asked — let the empty hint surface
  if (arr.length === 0) return emptyLabel || null; // explicitly said "none"
  return arr.join(", ");
}
