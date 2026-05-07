'use client';

import { motion } from 'motion/react';
import { MenuDraftCard } from './MenuDraftCard';
import type { PlanDraft } from '../types';

interface MenuPlanCardProps {
  drafts: PlanDraft[];
  activeMealSessionIndex: number;
  onPickMealSession: (mealSessionIndex: number) => void;
  onSwapItem?: (itemId: string, itemName: string, mealSessionIndex: number) => void;
  onRemoveItem?: (itemId: string, mealSessionIndex: number) => void;
  onQtyChange?: (itemId: string, qty: number, mealSessionIndex: number) => void;
}

/**
 * Renders a multi-meal menu plan. Single-meal plans (drafts.length === 1)
 * render compact (no headers, just the existing MenuDraftCard). Multi-meal
 * plans render stacked with section headers showing meal name / time /
 * headcount, and an active-meal indicator on the active card.
 */
export function MenuPlanCard({
  drafts,
  activeMealSessionIndex,
  onPickMealSession,
  onSwapItem,
  onRemoveItem,
  onQtyChange,
}: MenuPlanCardProps) {
  if (drafts.length === 0) return null;

  if (drafts.length === 1) {
    const d = drafts[0];
    return (
      <MenuDraftCard
        draft={d.draft}
        onSwap={
          onSwapItem
            ? (itemId) => {
                const item = d.draft.items.find((i) => i.id === itemId);
                onSwapItem(itemId, item?.name ?? 'this item', d.mealSessionIndex);
              }
            : undefined
        }
        onRemove={
          onRemoveItem
            ? (itemId) => onRemoveItem(itemId, d.mealSessionIndex)
            : undefined
        }
        onQtyChange={
          onQtyChange
            ? (itemId, qty) => onQtyChange(itemId, qty, d.mealSessionIndex)
            : undefined
        }
      />
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      {drafts.map((d) => {
        const isActive = d.mealSessionIndex === activeMealSessionIndex;
        return (
          <motion.section
            key={d.mealSessionIndex}
            onClick={() => !isActive && onPickMealSession(d.mealSessionIndex)}
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.22, ease: 'easeOut' }}
            style={{
              border: isActive ? '2px solid var(--brand)' : '1px solid var(--rule)',
              borderRadius: 16,
              padding: 12,
              cursor: isActive ? 'default' : 'pointer',
              background: isActive ? 'transparent' : 'var(--paper-soft, var(--paper))',
              transition: 'border-color 0.18s ease',
            }}
            aria-current={isActive ? 'true' : undefined}
          >
            <header
              className="small-caps"
              style={{ marginBottom: 10, opacity: 0.7, fontSize: '0.85rem' }}
            >
              {d.sessionName}
              {d.eventTime ? ` · ${d.eventTime}` : ''}
              {d.guestCount > 0 ? ` · ${d.guestCount} ppl` : ''}
            </header>
            <MenuDraftCard
              draft={d.draft}
              onSwap={
                isActive && onSwapItem
                  ? (itemId) => {
                      const item = d.draft.items.find((i) => i.id === itemId);
                      onSwapItem(itemId, item?.name ?? 'this item', d.mealSessionIndex);
                    }
                  : undefined
              }
              onRemove={
                isActive && onRemoveItem
                  ? (itemId) => onRemoveItem(itemId, d.mealSessionIndex)
                  : undefined
              }
              onQtyChange={
                isActive && onQtyChange
                  ? (itemId, qty) => onQtyChange(itemId, qty, d.mealSessionIndex)
                  : undefined
              }
            />
          </motion.section>
        );
      })}
    </div>
  );
}
