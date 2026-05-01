"use client";

import { motion, useReducedMotion } from "motion/react";

type Sender = "bot" | "user";

interface TextBubbleProps {
  sender: Sender;
  text: string;
}

/**
 * Single conversational bubble. User messages right-aligned in brand
 * pink; bot messages left-aligned on cream paper with a hairline
 * border. Subtle Y-fade entrance — no bounce, no zoom, just a quiet
 * arrival.
 */
export function TextBubble({ sender, text }: TextBubbleProps) {
  const prefersReducedMotion = useReducedMotion();
  const isUser = sender === "user";

  return (
    <motion.div
      initial={prefersReducedMotion ? undefined : { opacity: 0, y: 4 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2, ease: "easeOut" }}
      style={{
        display: "flex",
        justifyContent: isUser ? "flex-end" : "flex-start",
      }}
    >
      <div
        className={isUser ? "" : "display"}
        style={{
          maxWidth: "85%",
          padding: "10px 14px",
          borderRadius: "16px",
          fontSize: "0.95rem",
          lineHeight: 1.45,
          whiteSpace: "pre-wrap",
          wordBreak: "break-word",
          ...(isUser
            ? {
                backgroundColor: "var(--brand)",
                color: "white",
                borderBottomRightRadius: "4px",
                fontFamily: "var(--font-body)",
              }
            : {
                backgroundColor: "var(--paper)",
                color: "var(--ink)",
                border: "1px solid var(--rule)",
                borderBottomLeftRadius: "4px",
              }),
        }}
      >
        {text}
      </div>
    </motion.div>
  );
}
