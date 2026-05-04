'use client';

import { motion } from 'motion/react';
import { Chip } from '../ui/Chip';

interface Props {
  mealSessionIndex: number;
  mealSessionName: string;
  sharedFields: Array<{ field: string; rendered: string }>;
  onConfirm: (mealSessionIndex: number, accept: boolean) => void;
}

/**
 * Renders the "Apply same dietary/cuisine to <meal>?" prompt that fires
 * when a user adds a second meal to a session that already has shared
 * preferences populated. Two outcomes: yes-same → no per-meal override,
 * different → next user turn populates a per-meal override.
 */
export function InheritanceClarifierCard({
  mealSessionIndex,
  mealSessionName,
  sharedFields,
  onConfirm,
}: Props) {
  const list = sharedFields.map((f) => f.rendered).join(' · ');
  return (
    <motion.div
      initial={{ opacity: 0, y: 4 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.22, ease: 'easeOut' }}
      style={{
        background: 'var(--paper)',
        border: '1px solid var(--rule)',
        borderRadius: 14,
        padding: '12px 14px',
        boxShadow: 'var(--shadow-card)',
      }}
    >
      <div style={{ marginBottom: 10, fontSize: '0.95rem', lineHeight: 1.45 }}>
        Apply the same <strong>{list}</strong> to{' '}
        <strong>{mealSessionName}</strong>?
      </div>
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
        <Chip variant="brand" onClick={() => onConfirm(mealSessionIndex, true)}>
          Yes, same
        </Chip>
        <Chip onClick={() => onConfirm(mealSessionIndex, false)}>
          Different — let me say
        </Chip>
      </div>
    </motion.div>
  );
}
