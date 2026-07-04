"use client";

export interface SegmentedOption<T extends string> {
  value: T;
  label: string;
}

interface Props<T extends string> {
  options: ReadonlyArray<SegmentedOption<T>>;
  value: T;
  onChange: (next: T) => void;
  accent?: "blue" | "amber" | "purple";
  size?: "sm" | "md";
  ariaLabel?: string;
}

const ACCENT: Record<NonNullable<Props<string>["accent"]>, string> = {
  blue: "text-blue-700",
  amber: "text-amber-700",
  purple: "text-purple-700",
};

/**
 * Two-or-more-way segmented control. Active segment sits on white; the
 * strip itself is a soft grey pill. Ideal for "Default | Custom" toggles
 * inside a table row where a full tab bar would be too heavy.
 */
export const SegmentedToggle = <T extends string>({
  options,
  value,
  onChange,
  accent = "blue",
  size = "sm",
  ariaLabel,
}: Props<T>) => {
  const activeText = ACCENT[accent];
  const padding = size === "md" ? "px-4 py-2 text-sm" : "px-3 py-1.5 text-xs";
  return (
    <div
      role="radiogroup"
      aria-label={ariaLabel}
      className="inline-flex gap-0.5 p-0.5 bg-gray-100 rounded-lg"
    >
      {options.map((opt) => {
        const isActive = opt.value === value;
        return (
          <button
            key={opt.value}
            type="button"
            role="radio"
            aria-checked={isActive}
            onClick={() => onChange(opt.value)}
            className={`${padding} rounded-md font-semibold transition-all ${
              isActive
                ? `bg-white ${activeText} shadow-sm`
                : "text-gray-600 hover:text-gray-900"
            }`}
          >
            {opt.label}
          </button>
        );
      })}
    </div>
  );
};
