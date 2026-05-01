"use client";

import { motion } from "motion/react";
import { PencilIcon } from "../ui/PencilIcon";
import type { CollectedTaxonomyView } from "../types";

interface SummaryCardProps {
  taxonomy: CollectedTaxonomyView;
  editable: string[];
  onEdit: (field: string) => void;
}

interface Row {
  field: string;
  label: string;
  value: string | null;
  emptyHint?: string;
}

/**
 * Editorial summary card. Each row is a labelled slot the user can tap
 * to edit. Empty/unfilled slots show an italic "not set yet" hint
 * rather than disappearing — the user can fill them by tapping the
 * pencil. Pink is reserved for the panel header; this card stays
 * cream/charcoal with the small-caps Fraunces label treatment.
 */
export function SummaryCard({ taxonomy, editable, onEdit }: SummaryCardProps) {
  const rows: Row[] = [
    {
      field: "event_datetime",
      label: "When",
      value: taxonomy.eventDateTime,
      emptyHint: "tap to add date and time",
    },
    {
      field: "address",
      label: "Where",
      value: taxonomy.address,
      emptyHint: "tap to add address",
    },
    {
      field: "headcount",
      label: "Headcount",
      value: formatHeadcountAndMeal(taxonomy),
      emptyHint: "tap to add",
    },
    {
      field: "budget",
      label: "Budget",
      value: taxonomy.budget !== null ? `£${taxonomy.budget}` : null,
      emptyHint: "tap to add",
    },
    {
      field: "dietary_restrictions",
      label: "Dietary",
      value: formatList(taxonomy.dietaryRestrictions, "none"),
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
    {
      field: "extras",
      label: "Notes",
      value: taxonomy.extras || null,
    },
  ];

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={{
        hidden: {},
        visible: { transition: { staggerChildren: 0.04, delayChildren: 0.05 } },
      }}
      style={{
        background: "var(--paper)",
        border: "1px solid var(--rule)",
        borderRadius: "14px",
        padding: "14px 16px",
        boxShadow: "var(--shadow-card)",
      }}
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
        />
      ))}
    </motion.div>
  );
}

function SummaryRow({
  row,
  editable,
  onEdit,
}: {
  row: Row;
  editable: boolean;
  onEdit: () => void;
}) {
  const isEmpty = !row.value || row.value.length === 0;
  if (isEmpty && !row.emptyHint) {
    // Don't render rows that are both empty and don't invite filling.
    return null;
  }

  return (
    <motion.div
      variants={{
        hidden: { opacity: 0, y: 4 },
        visible: { opacity: 1, y: 0, transition: { duration: 0.2, ease: "easeOut" } },
      }}
      className="summary-row"
    >
      <div className="summary-label">{row.label}</div>
      <div className="summary-value">
        {isEmpty ? (
          <span className="summary-value-empty">{row.emptyHint}</span>
        ) : (
          row.value
        )}
      </div>
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
    </motion.div>
  );
}

function formatHeadcountAndMeal(t: CollectedTaxonomyView): string | null {
  const parts: string[] = [];
  if (t.headcount !== null) parts.push(`${t.headcount} people`);
  if (t.mealTime) parts.push(t.mealTime.toLowerCase());
  return parts.length ? parts.join(" · ") : null;
}

function formatList(arr: string[] | null, emptyLabel: string): string | null {
  if (arr === null) return null; // never asked — let the empty hint surface
  if (arr.length === 0) return emptyLabel || null; // explicitly said "none"
  return arr.join(", ");
}
