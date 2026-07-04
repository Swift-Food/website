"use client";

import { Loader } from "lucide-react";

interface Props {
  label?: string;
  saving: boolean;
  /** When false, button is greyed-out. Typical: no unsaved changes. */
  enabled: boolean;
  onClick: () => void;
  /** Optional message shown to the left of the button. */
  success?: string | null;
  error?: string | null;
  accent?: "blue" | "amber" | "purple";
}

const ACCENT: Record<NonNullable<Props["accent"]>, string> = {
  blue: "bg-blue-600 hover:bg-blue-700",
  amber: "bg-amber-500 hover:bg-amber-600",
  purple: "bg-purple-600 hover:bg-purple-700",
};

/**
 * Standard save row. Renders a button + optional inline success/error
 * messages so every card handles its own dirty/save UX identically.
 */
export const SaveBar = ({
  label = "Save Changes",
  saving,
  enabled,
  onClick,
  success,
  error,
  accent = "blue",
}: Props) => {
  const active = enabled && !saving;
  return (
    <div className="flex flex-col sm:flex-row sm:items-center gap-3">
      {error && (
        <div className="text-sm text-red-700 bg-red-50 border border-red-200 rounded-md px-3 py-2 flex-1">
          {error}
        </div>
      )}
      {!error && success && (
        <div className="text-sm text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-md px-3 py-2 flex-1">
          {success}
        </div>
      )}
      <button
        type="button"
        onClick={onClick}
        disabled={!active}
        className={`w-full sm:w-auto font-semibold py-2.5 px-6 rounded-lg transition-all flex items-center justify-center gap-2 shadow-sm ${
          active
            ? `${ACCENT[accent]} text-white`
            : "bg-gray-200 text-gray-400 cursor-not-allowed"
        }`}
      >
        {saving ? (
          <>
            <Loader size={18} className="animate-spin" />
            Saving…
          </>
        ) : (
          label
        )}
      </button>
    </div>
  );
};
