"use client";

import { motion } from "motion/react";
import type { MenuPreview, PreviewItem, PreviewSection } from "../types";

interface MenuPreviewCardProps {
  preview: MenuPreview;
}

const PLACEHOLDER_BG =
  "linear-gradient(135deg, var(--paper-deep) 0%, var(--rule) 100%)";

/**
 * Exploration-mode counterpart to MenuDraftCard. Renders one horizontally
 * scrolling row per retrieval intent ("pizza", "donuts", "water"). No qty,
 * no totals — items carry per-restaurant attribution and a soft match
 * reason for the user to browse before committing to a headcount.
 */
export function MenuPreviewCard({ preview }: MenuPreviewCardProps) {
  const sections = preview.sections.filter((s) => s.items.length > 0);
  if (sections.length === 0) return null;

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={{
        hidden: {},
        visible: { transition: { staggerChildren: 0.06, delayChildren: 0.05 } },
      }}
      style={{
        background: "var(--paper)",
        border: "1px solid var(--rule)",
        borderRadius: 16,
        boxShadow: "var(--shadow-card)",
        overflow: "hidden",
        padding: "14px 0",
      }}
    >
      {sections.map((section) => (
        <PreviewSectionRow key={section.intent} section={section} />
      ))}
    </motion.div>
  );
}

function PreviewSectionRow({ section }: { section: PreviewSection }) {
  return (
    <motion.div
      variants={{
        hidden: { opacity: 0, y: 6 },
        visible: { opacity: 1, y: 0, transition: { duration: 0.22, ease: "easeOut" } },
      }}
      style={{ marginBottom: 12 }}
    >
      <div
        className="display"
        style={{
          padding: "0 16px 8px",
          fontSize: "0.75rem",
          letterSpacing: "0.12em",
          textTransform: "uppercase",
          color: "var(--ink-soft)",
          fontWeight: 600,
        }}
      >
        {section.intent}
      </div>
      <div
        style={{
          display: "flex",
          gap: 10,
          padding: "0 16px",
          overflowX: "auto",
          scrollbarWidth: "thin",
        }}
      >
        {section.items.map((item) => (
          <PreviewItemCard key={item.menuItemId} item={item} />
        ))}
      </div>
    </motion.div>
  );
}

function PreviewItemCard({ item }: { item: PreviewItem }) {
  const dietary = (item.dietaryFilters ?? []).filter(Boolean).slice(0, 2);
  return (
    <motion.div
      variants={{
        hidden: { opacity: 0, scale: 0.97 },
        visible: { opacity: 1, scale: 1, transition: { duration: 0.18, ease: "easeOut" } },
      }}
      style={{
        flex: "0 0 168px",
        width: 168,
        background: "var(--paper)",
        border: "1px solid var(--rule)",
        borderRadius: 12,
        overflow: "hidden",
        display: "flex",
        flexDirection: "column",
      }}
    >
      <ItemPhoto src={item.imageUrl} fallback={item.name} />
      <div style={{ padding: "8px 10px 10px", display: "flex", flexDirection: "column", gap: 4 }}>
        <div
          className="display"
          style={{
            fontSize: "0.85rem",
            fontWeight: 600,
            color: "var(--ink)",
            lineHeight: 1.2,
            display: "-webkit-box",
            WebkitLineClamp: 2,
            WebkitBoxOrient: "vertical",
            overflow: "hidden",
          }}
        >
          {item.name}
        </div>
        <div
          style={{
            fontSize: "0.7rem",
            color: "var(--ink-faint)",
            fontStyle: "italic",
            whiteSpace: "nowrap",
            overflow: "hidden",
            textOverflow: "ellipsis",
          }}
        >
          {item.restaurant.name}
          {item.restaurant.cuisine ? ` · ${item.restaurant.cuisine}` : ""}
        </div>
        <div
          className="display"
          style={{
            fontSize: "0.85rem",
            fontWeight: 600,
            color: "var(--ink)",
            fontVariantNumeric: "tabular-nums",
            marginTop: 2,
          }}
        >
          £{item.unitPrice.toFixed(2)}
          <span style={{ fontSize: "0.65rem", color: "var(--ink-faint)", fontWeight: 400, marginLeft: 4 }}>
            · feeds {item.feedsPerUnit}
          </span>
        </div>
        {dietary.length > 0 && (
          <div style={{ display: "flex", flexWrap: "wrap", gap: 3, marginTop: 4 }}>
            {dietary.map((d) => (
              <span key={d} className="dietary-pill" style={{ fontSize: "0.62rem" }}>
                {d.replace(/_/g, " ")}
              </span>
            ))}
          </div>
        )}
      </div>
    </motion.div>
  );
}

function ItemPhoto({ src, fallback }: { src: string | null; fallback: string }) {
  const initial = (fallback ?? "?").trim()[0]?.toUpperCase() ?? "?";
  return (
    <div
      style={{
        width: "100%",
        height: 110,
        background: src ? `url(${src}) center/cover` : PLACEHOLDER_BG,
        position: "relative",
        flexShrink: 0,
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
            fontSize: "2rem",
            color: "var(--ink-faint)",
          }}
        >
          {initial}
        </span>
      )}
    </div>
  );
}
