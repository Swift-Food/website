"use client";

import { ReactNode } from "react";

interface Props {
  title: string;
  subtitle?: string;
  enabled: boolean;
  onChange: (next: boolean) => void;
  /** Accent colour for the "on" state of the toggle. */
  accent?: "blue" | "amber" | "purple";
  /** Content shown when enabled — usually the input the toggle guards. */
  children?: ReactNode;
}

const ACCENT: Record<
  NonNullable<Props["accent"]>,
  { on: string; ring: string }
> = {
  blue: { on: "peer-checked:bg-blue-600", ring: "peer-focus:ring-blue-300" },
  amber: {
    on: "peer-checked:bg-amber-500",
    ring: "peer-focus:ring-amber-300",
  },
  purple: {
    on: "peer-checked:bg-purple-600",
    ring: "peer-focus:ring-purple-300",
  },
};

/**
 * Grey pill wrapping a labelled toggle. When on, expands to reveal children
 * (typically the guarded input). Used everywhere a setting is optional and
 * has a threshold beneath it.
 */
export const ToggleRow = ({
  title,
  subtitle,
  enabled,
  onChange,
  accent = "blue",
  children,
}: Props) => {
  const colors = ACCENT[accent];
  return (
    <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
      <div className="flex items-center justify-between mb-1">
        <div className="min-w-0 pr-3">
          <div className="text-sm font-semibold text-gray-900">{title}</div>
          {subtitle && (
            <div className="text-xs text-gray-500 mt-0.5">{subtitle}</div>
          )}
        </div>
        <label className="relative inline-flex items-center cursor-pointer flex-shrink-0">
          <input
            type="checkbox"
            checked={enabled}
            onChange={(e) => onChange(e.target.checked)}
            className="sr-only peer"
          />
          <div
            className={`w-11 h-6 bg-gray-300 ${colors.ring} peer-focus:ring-2 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all ${colors.on}`}
          />
        </label>
      </div>
      {enabled && children && <div className="pt-3">{children}</div>}
    </div>
  );
};
