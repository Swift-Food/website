"use client";

import { LucideIcon } from "lucide-react";
import { ReactNode } from "react";

interface Props {
  icon: LucideIcon;
  title: string;
  subtitle?: string;
  /**
   * Header accent — mapped to explicit Tailwind classes so JIT keeps them.
   * Add new values here rather than passing a raw class string.
   */
  accent?: "blue" | "amber" | "purple";
  children: ReactNode;
  footer?: ReactNode;
}

const ACCENT: Record<NonNullable<Props["accent"]>, { bg: string; subtitle: string }> = {
  blue: { bg: "bg-blue-600", subtitle: "text-blue-100" },
  amber: { bg: "bg-amber-500", subtitle: "text-amber-50" },
  purple: { bg: "bg-purple-600", subtitle: "text-purple-100" },
};

/**
 * Standard shell for a settings card: coloured header bar with icon + title,
 * a body slot, and an optional footer slot (usually a SaveBar). Kept as the
 * one canonical shape so every card in the dashboard reads the same.
 */
export const SettingsCard = ({
  icon: Icon,
  title,
  subtitle,
  accent = "blue",
  children,
  footer,
}: Props) => {
  const colors = ACCENT[accent];
  return (
    <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
      <div className={`${colors.bg} px-6 py-5`}>
        <div className="flex items-center gap-3">
          <div className="bg-white/20 backdrop-blur-sm rounded-lg p-2.5">
            <Icon className="text-white" size={24} />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white">{title}</h3>
            {subtitle && (
              <p className={`text-sm mt-0.5 ${colors.subtitle}`}>{subtitle}</p>
            )}
          </div>
        </div>
      </div>
      <div className="p-6 space-y-5">{children}</div>
      {footer && <div className="px-6 pb-6">{footer}</div>}
    </div>
  );
};
