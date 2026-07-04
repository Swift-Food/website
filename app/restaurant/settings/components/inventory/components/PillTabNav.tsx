"use client";

export interface TabDef<T extends string> {
  id: T;
  label: string;
}

interface Props<T extends string> {
  tabs: ReadonlyArray<TabDef<T>>;
  active: T;
  onChange: (next: T) => void;
  ariaLabel?: string;
}

/**
 * Segmented pill nav. Active pill sits on white with the theme accent colour;
 * inactive pills stay grey. Generic over the tab id union so callers don't lose
 * type safety on the active tab.
 */
export const PillTabNav = <T extends string>({
  tabs,
  active,
  onChange,
  ariaLabel,
}: Props<T>) => {
  return (
    <div
      role="tablist"
      aria-label={ariaLabel}
      className="inline-flex gap-1 p-1 bg-gray-100 rounded-xl w-full sm:w-auto"
    >
      {tabs.map((tab) => {
        const isActive = tab.id === active;
        return (
          <button
            key={tab.id}
            type="button"
            role="tab"
            aria-selected={isActive}
            onClick={() => onChange(tab.id)}
            className={`flex-1 sm:flex-none px-5 py-2.5 rounded-lg text-sm font-semibold transition-all ${
              isActive
                ? "bg-white text-blue-700 shadow-sm"
                : "text-gray-600 hover:text-gray-900"
            }`}
          >
            {tab.label}
          </button>
        );
      })}
    </div>
  );
};
