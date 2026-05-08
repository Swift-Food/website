"use client";

import { motion } from "motion/react";
import { Chip } from "../ui/Chip";
import type { Chip as ChipType, ChipAction } from "../types";

interface ChipGroupProps {
  chips: ChipType[];
  onAction: (chip: ChipType) => void;
}

/**
 * Quick-reply chip strip. Renders horizontally with wrap; chips
 * stagger in 40ms apart. Variant is determined by the chip's action:
 * primary actions like `confirm` and `add_to_basket` get the brand
 * treatment, everything else stays neutral.
 */
export function ChipGroup({ chips, onAction }: ChipGroupProps) {
  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={{
        hidden: {},
        visible: {
          transition: { staggerChildren: 0.04, delayChildren: 0.05 },
        },
      }}
      style={{
        display: "flex",
        flexWrap: "wrap",
        gap: "8px",
        marginTop: "4px",
      }}
    >
      {chips.map((chip, idx) => (
        <motion.div
          key={`${chip.label}-${idx}`}
          variants={{
            hidden: { opacity: 0, y: 6 },
            visible: { opacity: 1, y: 0, transition: { duration: 0.18, ease: "easeOut" } },
          }}
        >
          <Chip
            variant={variantFor(chip.action)}
            onClick={() => onAction(chip)}
          >
            {chip.label}
          </Chip>
        </motion.div>
      ))}
    </motion.div>
  );
}

function variantFor(action: ChipAction): "default" | "primary" | "brand" {
  if (action === "confirm" || action === "add_to_basket") return "brand";
  if (action === "more_variety") return "primary";
  return "default";
}
