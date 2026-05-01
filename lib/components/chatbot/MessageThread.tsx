"use client";

import { TextBubble } from "./parts/TextBubble";
import { ChipGroup } from "./parts/ChipGroup";
import { SummaryCard } from "./parts/SummaryCard";
import { MenuDraftCard } from "./parts/MenuDraftCard";
import type { Chip, MessagePart } from "./types";

export interface ThreadMessage {
  id: string;
  sender: "user" | "bot";
  parts: MessagePart[];
}

interface MessageThreadProps {
  messages: ThreadMessage[];
  onChip: (chip: Chip) => void;
  onEditField: (field: string) => void;
  onSwapItem?: (itemId: string, itemName: string) => void;
  onRemoveItem?: (itemId: string) => void;
  onQtyChange?: (itemId: string, qty: number) => void;
  onPickRestaurant?: (restaurantId: string) => void;
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
  onEditField: (field: string) => void;
  onSwapItem?: (itemId: string, itemName: string) => void;
  onRemoveItem?: (itemId: string) => void;
  onQtyChange?: (itemId: string, qty: number) => void;
  onPickRestaurant?: (restaurantId: string) => void;
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
  if (part.type === "menu_draft") {
    return (
      <MenuDraftCard
        draft={part.draft}
        onSwap={
          onSwapItem
            ? (itemId) => {
                const item = part.draft.items.find((i) => i.id === itemId);
                onSwapItem(itemId, item?.name ?? "this item");
              }
            : undefined
        }
        onRemove={onRemoveItem}
        onQtyChange={onQtyChange}
        onPickRestaurant={onPickRestaurant}
      />
    );
  }
  // clarifier — Phase 4
  return null;
}
