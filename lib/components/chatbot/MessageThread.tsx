"use client";

import { useState } from "react";
import { TextBubble } from "./parts/TextBubble";
import { ChipGroup } from "./parts/ChipGroup";
import { MenuPlanCard } from "./parts/MenuPlanCard";
import { MenuPreviewCard } from "./parts/MenuPreviewCard";
import { IntentBlockCard } from "./parts/IntentBlockCard";
import { MealSessionStepper } from "./parts/MealSessionStepper";
import type { Chip, MessagePart } from "./types";

export interface ThreadMessage {
  id: string;
  sender: "user" | "bot";
  parts: MessagePart[];
}

interface MessageThreadProps {
  messages: ThreadMessage[];
  sessionId: string | null;
  onChip: (chip: Chip) => void;
  onEditField: (field: string, mealSessionIndex?: number) => void;
  onSwapItem?: (itemId: string, itemName: string, mealSessionIndex: number) => void;
  onRemoveItem?: (itemId: string, mealSessionIndex: number) => void;
  onQtyChange?: (itemId: string, qty: number, mealSessionIndex: number) => void;
}

/**
 * Renders the chat thread as a stack of typed message parts. User
 * messages always render as a single TextBubble; bot messages may
 * contain text, summary cards, chip groups, menu drafts, or clarifiers
 * — each handled by its own component.
 */
export function MessageThread({
  messages,
  sessionId,
  onChip,
  onEditField,
  onSwapItem,
  onRemoveItem,
  onQtyChange,
}: MessageThreadProps) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
      {messages.map((msg) => (
        <div key={msg.id} style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {msg.parts.map((part, idx) => (
            <PartRenderer
              key={`${msg.id}-${idx}`}
              part={part}
              sender={msg.sender}
              sessionId={sessionId}
              onChip={onChip}
              onEditField={onEditField}
              onSwapItem={onSwapItem}
              onRemoveItem={onRemoveItem}
              onQtyChange={onQtyChange}
            />
          ))}
        </div>
      ))}
    </div>
  );
}

function PartRenderer({
  part,
  sender,
  sessionId,
  onChip,
  onEditField,
  onSwapItem,
  onRemoveItem,
  onQtyChange,
}: {
  part: MessagePart;
  sender: "user" | "bot";
  sessionId: string | null;
  onChip: (chip: Chip) => void;
  onEditField: (field: string, mealSessionIndex?: number) => void;
  onSwapItem?: (itemId: string, itemName: string, mealSessionIndex: number) => void;
  onRemoveItem?: (itemId: string, mealSessionIndex: number) => void;
  onQtyChange?: (itemId: string, qty: number, mealSessionIndex: number) => void;
}) {
  if (part.type === "text") {
    return <TextBubble sender={sender} text={part.text} />;
  }
  if (part.type === "chips") {
    return <ChipGroup chips={part.chips} onAction={onChip} />;
  }
  if (part.type === "menu_plan") {
    return (
      <MenuPlanCard
        drafts={part.drafts}
        activeMealSessionIndex={part.activeMealSessionIndex}
        onPickMealSession={(idx) =>
          onChip({ label: "", action: "pick_meal_session", payload: { mealSessionIndex: idx } })
        }
        onSwapItem={onSwapItem}
        onRemoveItem={onRemoveItem}
        onQtyChange={onQtyChange}
      />
    );
  }
  if (part.type === "menu_preview") {
    return <MenuPreviewCard preview={part.preview} />;
  }
  if (part.type === "meal_session") {
    return <MealSessionStepper part={part} />;
  }
  if (part.type === "intent_block") {
    return <StandaloneIntentBlock part={part} />;
  }
  if (part.type === "feedback") {
    // Phase A6: thumbs-up/down on retrieval. No renderer wired yet.
    return null;
  }
  // clarifier — Phase 4
  return null;
}

/**
 * Exploration-mode intent block (mealSessionIndex === -1) — single block,
 * no sibling cohesion, so it just owns its own selection state.
 */
function StandaloneIntentBlock({
  part,
}: {
  part: Extract<MessagePart, { type: "intent_block" }>;
}) {
  const [selectedId, setSelectedId] = useState<string>(
    part.restaurantPicks[0]?.restaurant.id ?? "",
  );
  return (
    <IntentBlockCard
      part={part}
      selectedRestaurantId={selectedId}
      onSelectRestaurant={setSelectedId}
    />
  );
}
