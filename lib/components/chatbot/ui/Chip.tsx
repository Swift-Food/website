"use client";

import { motion, useReducedMotion } from "motion/react";
import type { ReactNode } from "react";

export type ChipVariant = "default" | "primary" | "brand";

interface ChipProps {
  onClick?: () => void;
  variant?: ChipVariant;
  disabled?: boolean;
  children: ReactNode;
}

/**
 * Pill primitive used for quick-replies, edit slot triggers, and menu
 * actions. Tap response is a refined spring scale — quick, satisfying,
 * never bouncy. Reduced-motion users get instant transitions.
 */
export function Chip({
  onClick,
  variant = "default",
  disabled,
  children,
}: ChipProps) {
  const prefersReducedMotion = useReducedMotion();
  const cls =
    variant === "primary"
      ? "chip chip-primary"
      : variant === "brand"
        ? "chip chip-brand"
        : "chip";

  return (
    <motion.button
      type="button"
      className={cls}
      onClick={onClick}
      disabled={disabled}
      whileTap={
        prefersReducedMotion
          ? undefined
          : { scale: 0.96, transition: { type: "spring", stiffness: 280, damping: 18 } }
      }
      whileHover={prefersReducedMotion ? undefined : { y: -1 }}
      style={{ opacity: disabled ? 0.5 : 1 }}
    >
      {children}
    </motion.button>
  );
}
