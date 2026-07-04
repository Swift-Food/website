"use client";

import { ReactNode } from "react";

interface Props {
  value: number;
  onChange: (next: number) => void;
  min?: number;
  max?: number;
  step?: number;
  placeholder?: string;
  /** Unit label rendered after the input (e.g. "hours before event"). */
  unitLabel: ReactNode;
  /** Optional prefix rendered before the input (e.g. currency "GBP"). */
  prefix?: ReactNode;
  /** Accent colour for focus ring. */
  accent?: "blue" | "amber" | "purple";
  ariaLabel?: string;
}

const ACCENT: Record<NonNullable<Props["accent"]>, string> = {
  blue: "focus:ring-blue-500 focus:border-blue-500",
  amber: "focus:ring-amber-500 focus:border-amber-500",
  purple: "focus:ring-purple-500 focus:border-purple-500",
};

/**
 * Big centered number input paired with a unit label — used across every
 * settings card for a single numeric threshold (notice hours, portions, £
 * amounts).
 */
export const NumberFieldWithUnit = ({
  value,
  onChange,
  min = 0,
  max,
  step = 1,
  placeholder,
  unitLabel,
  prefix,
  accent = "blue",
  ariaLabel,
}: Props) => {
  return (
    <div className="flex items-center gap-3">
      {prefix && (
        <span className="text-xl font-bold text-gray-900">{prefix}</span>
      )}
      <input
        type="number"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => {
          const raw = step >= 1 ? parseInt(e.target.value) : parseFloat(e.target.value);
          onChange(Number.isFinite(raw) ? raw : 0);
        }}
        placeholder={placeholder}
        aria-label={ariaLabel}
        className={`w-32 px-4 py-2.5 text-center text-xl font-bold border-2 border-gray-300 rounded-lg focus:ring-2 text-gray-900 bg-white transition-all ${ACCENT[accent]}`}
      />
      <span className="text-sm font-medium text-gray-600">{unitLabel}</span>
    </div>
  );
};
