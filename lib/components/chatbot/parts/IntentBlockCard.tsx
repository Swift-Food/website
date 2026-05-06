"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import type {
  AlternativeRestaurant,
  IntentBlockGroupSection,
  IntentBlockItem,
  IntentBlockPart,
} from "../types";
import { swapIntentRestaurant } from "../api";

interface IntentBlockCardProps {
  sessionId: string;
  part: IntentBlockPart;
  onBlockReplaced: (updated: IntentBlockPart) => void;
  onAddItem?: (itemId: string) => void;
}

/**
 * One intent block: header, picked-restaurant strip, items grouped by
 * groupTitle into sections, alternative-restaurant chips beneath. Tapping
 * a chip swaps the entire block via the swap-restaurant endpoint.
 */
export function IntentBlockCard({
  sessionId,
  part,
  onBlockReplaced,
  onAddItem,
}: IntentBlockCardProps) {
  const [swapping, setSwapping] = useState<string | null>(null);

  const handleSwap = async (newRestaurantId: string) => {
    setSwapping(newRestaurantId);
    try {
      const res = await swapIntentRestaurant(
        sessionId,
        part.intentId,
        newRestaurantId,
      );
      const updated = res.parts.find(
        (p) => p.type === "intent_block" && p.intentId === part.intentId,
      );
      if (updated && updated.type === "intent_block") {
        onBlockReplaced(updated);
      }
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error("swap-restaurant failed", err);
    } finally {
      setSwapping(null);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.22 }}
      style={{
        backgroundColor: "var(--paper)",
        border: "1px solid var(--rule)",
        borderRadius: 12,
        padding: 16,
        marginBottom: 12,
        boxShadow: "var(--shadow-card)",
      }}
    >
      {/* Header */}
      <div
        style={{
          display: "flex",
          alignItems: "baseline",
          justifyContent: "space-between",
          marginBottom: 10,
        }}
      >
        <h3
          className="display"
          style={{
            margin: 0,
            fontSize: "1.25rem",
            color: "var(--ink)",
            textTransform: "capitalize",
          }}
        >
          {part.intent.phrase}
        </h3>
        {part.intent.category && (
          <span className="small-caps">{part.intent.category}</span>
        )}
      </div>

      {/* Picked-restaurant strip */}
      <div
        style={{
          fontSize: "0.85rem",
          color: "var(--ink-soft)",
          marginBottom: 14,
        }}
      >
        From{" "}
        <span style={{ color: "var(--ink)", fontWeight: 600 }}>
          {part.selectedRestaurant.name}
        </span>
        {part.selectedRestaurant.cuisineTags.length > 0 && (
          <span style={{ color: "var(--ink-faint)" }}>
            {" · "}
            {part.selectedRestaurant.cuisineTags.slice(0, 3).join(" · ")}
          </span>
        )}
        {part.pickedReason && (
          <div
            style={{
              fontSize: "0.75rem",
              color: "var(--ink-faint)",
              marginTop: 2,
              fontStyle: "italic",
            }}
          >
            {part.pickedReason}
          </div>
        )}
      </div>

      {/* Group sections */}
      <AnimatePresence mode="popLayout">
        {part.groupSections.map((section) => (
          <SectionBlock
            key={`${part.intentId}-${section.title ?? "_null"}`}
            section={section}
            items={part.items}
            onAddItem={onAddItem}
          />
        ))}
      </AnimatePresence>

      {/* Alternative restaurants */}
      {part.alternativeRestaurants.length >= 3 && (
        <AltRestaurantChips
          alts={part.alternativeRestaurants}
          intentPhrase={part.intent.phrase}
          swapping={swapping}
          onSwap={handleSwap}
        />
      )}
    </motion.div>
  );
}

function SectionBlock({
  section,
  items,
  onAddItem,
}: {
  section: IntentBlockGroupSection;
  items: IntentBlockItem[];
  onAddItem?: (itemId: string) => void;
}) {
  return (
    <motion.section
      layout
      initial={{ opacity: 0 }}
      animate={{ opacity: 1, transition: { duration: 0.18 } }}
      exit={{ opacity: 0, transition: { duration: 0.12 } }}
      style={{ marginBottom: 14 }}
    >
      {section.title && (
        <div className="small-caps" style={{ marginBottom: 6 }}>
          {section.title}
        </div>
      )}
      <ul style={{ margin: 0, padding: 0, listStyle: "none" }}>
        {section.itemIndexes.map((idx) => {
          const item = items[idx];
          return (
            <li
              key={item.id}
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                padding: "8px 10px",
                backgroundColor: "var(--paper-deep)",
                border: "1px solid var(--rule)",
                borderRadius: 8,
                marginBottom: 6,
              }}
            >
              <div style={{ flex: 1, minWidth: 0 }}>
                <div
                  style={{
                    color: "var(--ink)",
                    fontWeight: 500,
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                  }}
                >
                  {item.name}
                </div>
                {item.description && (
                  <div
                    style={{
                      fontSize: "0.75rem",
                      color: "var(--ink-faint)",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {item.description}
                  </div>
                )}
              </div>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 12,
                  flexShrink: 0,
                  marginLeft: 12,
                }}
              >
                <span style={{ fontVariantNumeric: "tabular-nums", fontSize: "0.85rem" }}>
                  £{item.price.toFixed(2)}
                </span>
                {onAddItem && (
                  <button
                    type="button"
                    onClick={() => onAddItem(item.id)}
                    style={{
                      fontSize: "0.75rem",
                      fontWeight: 500,
                      padding: "4px 10px",
                      borderRadius: 6,
                      border: "none",
                      backgroundColor: "var(--ink)",
                      color: "var(--paper)",
                      cursor: "pointer",
                    }}
                  >
                    Add
                  </button>
                )}
              </div>
            </li>
          );
        })}
      </ul>
    </motion.section>
  );
}

function AltRestaurantChips({
  alts,
  intentPhrase,
  swapping,
  onSwap,
}: {
  alts: AlternativeRestaurant[];
  intentPhrase: string;
  swapping: string | null;
  onSwap: (id: string) => void;
}) {
  return (
    <div
      style={{
        borderTop: "1px solid var(--rule)",
        paddingTop: 10,
        marginTop: 4,
      }}
    >
      <div className="small-caps" style={{ marginBottom: 6 }}>
        Other options for {intentPhrase}
      </div>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
        {alts.map((alt) => (
          <button
            key={alt.id}
            type="button"
            onClick={() => onSwap(alt.id)}
            disabled={swapping === alt.id}
            title={alt.reason ?? ""}
            style={{
              fontSize: "0.75rem",
              padding: "5px 12px",
              borderRadius: 999,
              border: "1px solid var(--rule)",
              backgroundColor: "var(--paper)",
              color: "var(--ink)",
              cursor: swapping === alt.id ? "wait" : "pointer",
              opacity: swapping === alt.id ? 0.5 : 1,
            }}
          >
            {alt.name}
            <span style={{ marginLeft: 4, color: "var(--ink-faint)" }}>
              · {alt.candidateCount}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}
