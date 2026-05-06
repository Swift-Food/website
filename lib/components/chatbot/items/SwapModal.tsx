"use client";

import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { useEffect, useState } from "react";
import { Chip } from "../ui/Chip";
import { Reason } from "../ui/Reason";
import * as api from "../api";
import type { SwapOption } from "../api";

interface SwapModalProps {
  open: boolean;
  sessionId: string;
  itemId: string | null;
  itemName: string;
  onClose: () => void;
  onPick: (replacement: SwapOption) => void;
}

/**
 * Up to ten ranked alternatives in the same category, fetched on open.
 * Cards stagger in from below; tapping one calls onPick which the
 * parent uses to fire /menu-action swap. Picked card briefly scales
 * before the modal dismisses, giving the swap a satisfying "I chose
 * that" beat without dragging out the interaction.
 */
export function SwapModal({
  open,
  sessionId,
  itemId,
  itemName,
  onClose,
  onPick,
}: SwapModalProps) {
  const prefersReducedMotion = useReducedMotion();
  const [options, setOptions] = useState<SwapOption[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open || !itemId) {
      setOptions(null);
      setError(null);
      return;
    }
    let cancelled = false;
    setLoading(true);
    setError(null);
    api
      .getSwapOptions(sessionId, itemId)
      .then((opts) => {
        if (!cancelled) setOptions(opts);
      })
      .catch((e) => {
        if (!cancelled) setError(e instanceof Error ? e.message : "Couldn't load options");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [open, sessionId, itemId]);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.18 }}
          onClick={onClose}
          style={overlayStyle}
        >
          <motion.div
            initial={prefersReducedMotion ? undefined : { opacity: 0, y: 12, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={prefersReducedMotion ? undefined : { opacity: 0, y: 6, scale: 0.98 }}
            transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
            onClick={(e) => e.stopPropagation()}
            style={panelStyle}
          >
            <div className="small-caps" style={{ marginBottom: 4 }}>Swap this for</div>
            <div
              className="display-italic"
              style={{ fontSize: "0.92rem", color: "var(--ink-soft)", marginBottom: 14 }}
            >
              {itemName}
            </div>

            {loading && (
              <div style={{ padding: 24, textAlign: "center", color: "var(--ink-faint)", fontSize: "0.85rem" }}>
                Finding alternatives…
              </div>
            )}

            {error && (
              <div style={{ ...errorStyle, marginBottom: 12 }}>{error}</div>
            )}

            {options && options.length === 0 && (
              <div style={{ padding: 24, textAlign: "center", color: "var(--ink-faint)", fontSize: "0.85rem" }}>
                No other options available in this category at this restaurant.
              </div>
            )}

            {options && options.length > 0 && (
              <motion.ul
                initial="hidden"
                animate="visible"
                variants={{
                  hidden: {},
                  visible: { transition: { staggerChildren: 0.06, delayChildren: 0.04 } },
                }}
                style={{
                  listStyle: "none",
                  margin: 0,
                  padding: 0,
                  display: "flex",
                  flexDirection: "column",
                  gap: 8,
                  maxHeight: "60vh",
                  overflowY: "auto",
                  WebkitOverflowScrolling: "touch",
                }}
              >
                {options.map((opt) => (
                  <SwapCard key={opt.menuItemId} option={opt} onPick={() => onPick(opt)} />
                ))}
              </motion.ul>
            )}

            <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 14 }}>
              <Chip onClick={onClose}>Keep current</Chip>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function SwapCard({
  option,
  onPick,
}: {
  option: SwapOption;
  onPick: () => void;
}) {
  const prefersReducedMotion = useReducedMotion();
  const dietary = (option.dietaryFilters ?? []).filter(Boolean);
  const allergens = (option.allergens ?? []).filter(
    (a) => a && a.toLowerCase() !== "no specific allergens",
  );

  return (
    <motion.li
      variants={{
        hidden: { opacity: 0, y: 8 },
        visible: { opacity: 1, y: 0, transition: { duration: 0.22, ease: "easeOut" } },
      }}
      whileHover={prefersReducedMotion ? undefined : { y: -1 }}
      whileTap={{ scale: 0.99 }}
      onClick={onPick}
      style={{
        display: "flex",
        gap: 10,
        padding: "10px",
        borderRadius: 12,
        border: "1px solid var(--rule)",
        background: "var(--paper)",
        cursor: "pointer",
        alignItems: "center",
      }}
    >
      <div
        style={{
          width: 44,
          height: 44,
          borderRadius: 8,
          background: option.imageUrl
            ? `url(${option.imageUrl}) center/cover`
            : "linear-gradient(135deg, var(--paper-deep) 0%, var(--rule) 100%)",
          flexShrink: 0,
          border: "1px solid var(--rule)",
          position: "relative",
        }}
      >
        {!option.imageUrl && (
          <span
            className="display-italic"
            style={{
              position: "absolute",
              inset: 0,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "var(--ink-faint)",
              fontSize: "1.2rem",
            }}
          >
            {option.name.trim()[0]?.toUpperCase() ?? "?"}
          </span>
        )}
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div className="display" style={{ fontSize: "0.9rem", fontWeight: 600, color: "var(--ink)" }}>
          {option.name}
        </div>
        {(dietary.length > 0 || allergens.length > 0) && (
          <div style={{ display: "flex", flexWrap: "wrap", gap: 3, marginTop: 4 }}>
            {dietary.slice(0, 2).map((d) => (
              <span key={d} className="dietary-pill">{d.replace(/_/g, " ")}</span>
            ))}
            {allergens.slice(0, 2).map((a) => (
              <span key={a} className="allergen-pill">{a.toLowerCase()}</span>
            ))}
          </div>
        )}
      </div>
      <div style={{ textAlign: "right", flexShrink: 0 }}>
        <div className="display" style={{ fontSize: "0.9rem", fontWeight: 600, fontVariantNumeric: "tabular-nums" }}>
          £{option.totalPrice.toFixed(2)}
        </div>
        <div style={{ fontSize: "0.66rem", color: "var(--ink-faint)" }}>
          ×{option.quantity}
        </div>
      </div>
    </motion.li>
  );
}

const overlayStyle: React.CSSProperties = {
  position: "absolute",
  inset: 0,
  background: "rgba(20, 18, 16, 0.45)",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  padding: 16,
  zIndex: 30,
};

const panelStyle: React.CSSProperties = {
  background: "var(--paper)",
  borderRadius: 16,
  padding: 18,
  width: "100%",
  maxWidth: 360,
  boxShadow: "var(--shadow-lift)",
  border: "1px solid var(--rule)",
};

const errorStyle: React.CSSProperties = {
  fontSize: "0.85rem",
  color: "var(--ember)",
  background: "var(--ember-soft)",
  border: "1px solid var(--ember)",
  borderRadius: 10,
  padding: "8px 12px",
};
