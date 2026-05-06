"use client";

import { TextBubble } from "./parts/TextBubble";
import { ChipGroup } from "./parts/ChipGroup";
import { SummaryCard } from "./parts/SummaryCard";
import { MenuPlanCard } from "./parts/MenuPlanCard";
import { MenuPreviewCard } from "./parts/MenuPreviewCard";
import type { Chip, MessagePart } from "./types";

export interface ThreadMessage {
  id: string;
  sender: "user" | "bot";
  parts: MessagePart[];
}

interface MessageThreadProps {
  messages: ThreadMessage[];
  onChip: (chip: Chip) => void;
  onEditField: (field: string, mealSessionIndex?: number) => void;
  onSwapItem?: (itemId: string, itemName: string, mealSessionIndex: number) => void;
  onRemoveItem?: (itemId: string, mealSessionIndex: number) => void;
  onQtyChange?: (itemId: string, qty: number, mealSessionIndex: number) => void;
  onPickRestaurant?: (restaurantId: string, mealSessionIndex: number) => void;
}

/**
 * Renders the chat thread as a stack of typed message parts. User
 * messages always render as a single TextBubble; bot messages may
 * contain text, summary cards, chip groups, menu drafts, or clarifiers
 * — each handled by its own component.
 */
export function MessageThread({
  messages,
  onChip,
  onEditField,
  onSwapItem,
  onRemoveItem,
  onQtyChange,
  onPickRestaurant,
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
              onChip={onChip}
              onEditField={onEditField}
              onSwapItem={onSwapItem}
              onRemoveItem={onRemoveItem}
              onQtyChange={onQtyChange}
              onPickRestaurant={onPickRestaurant}
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
  onChip,
  onEditField,
  onSwapItem,
  onRemoveItem,
  onQtyChange,
  onPickRestaurant,
}: {
  part: MessagePart;
  sender: "user" | "bot";
  onChip: (chip: Chip) => void;
  onEditField: (field: string, mealSessionIndex?: number) => void;
  onSwapItem?: (itemId: string, itemName: string, mealSessionIndex: number) => void;
  onRemoveItem?: (itemId: string, mealSessionIndex: number) => void;
  onQtyChange?: (itemId: string, qty: number, mealSessionIndex: number) => void;
  onPickRestaurant?: (restaurantId: string, mealSessionIndex: number) => void;
}) {
  if (part.type === "text") {
    return <TextBubble sender={sender} text={part.text} />;
  }
  if (part.type === "summary_card") {
    return (
      <SummaryCard
        taxonomy={part.taxonomy}
        editable={part.editable}
        onEdit={onEditField}
      />
    );
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
        onPickRestaurant={onPickRestaurant}
      />
    );
  }
  if (part.type === "menu_preview") {
    return <MenuPreviewCard preview={part.preview} />;
  }
  if (part.type === "feedback") {
    // Phase A6: thumbs-up/down on retrieval. No renderer wired yet.
    return null;
  }
  // clarifier — Phase 4
  return null;
}
