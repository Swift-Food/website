"use client";

import { Plus, Trash2 } from "lucide-react";

interface EmailListInputProps {
  values: string[];
  onChange: (next: string[]) => void;
  placeholder?: string;
  maxCount?: number;
  ariaLabelPrefix?: string;
}

const inputClass =
  "w-full px-4 py-3 text-base border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent text-gray-900 bg-white placeholder:text-gray-400";

const isValidEmail = (raw: string): boolean => {
  if (!raw) return false;
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(raw.trim());
};

/**
 * Editable list of email addresses. Renders one input per address, with
 * a trash icon to remove each row and an "Add another" button that
 * appears once the last row is non-empty. Empty rows are filtered out
 * when we build the array we hand back — that keeps the caller's state
 * clean without forcing them to strip blanks themselves.
 */
export const EmailListInput = ({
  values,
  onChange,
  placeholder = "orders@restaurant.com",
  maxCount = 10,
  ariaLabelPrefix = "Email address",
}: EmailListInputProps) => {
  // Always show at least one input, even when the list is empty.
  const rows = values.length > 0 ? values : [""];

  const updateAt = (index: number, next: string) => {
    const draft = [...rows];
    draft[index] = next;
    onChange(draft.map((v) => v.trim()).filter((v) => v.length > 0));
  };

  const removeAt = (index: number) => {
    const draft = rows.filter((_, i) => i !== index);
    onChange(draft.map((v) => v.trim()).filter((v) => v.length > 0));
  };

  const addRow = () => {
    if (rows.length >= maxCount) return;
    // Push an empty slot in the "display" list without changing the
    // parent array — parent stays derived from non-empty values.
    onChange([...rows.filter((v) => v.trim().length > 0), ""].filter(
      (v, i, arr) => v.length > 0 || i === arr.length - 1,
    ));
  };

  const lastRowFilled = rows[rows.length - 1]?.trim().length > 0;
  const canAdd = lastRowFilled && rows.length < maxCount;

  return (
    <div className="space-y-3">
      {rows.map((value, index) => {
        const invalid = value.trim().length > 0 && !isValidEmail(value);
        return (
          <div key={index} className="flex items-start gap-2">
            <div className="flex-1">
              <input
                type="email"
                value={value}
                onChange={(e) => updateAt(index, e.target.value)}
                placeholder={placeholder}
                aria-label={`${ariaLabelPrefix} ${index + 1}`}
                className={`${inputClass} ${
                  invalid ? "border-red-400 focus:ring-red-500" : ""
                }`}
              />
              {invalid && (
                <p className="mt-1 text-xs text-red-600">
                  This doesn&apos;t look like a valid email address.
                </p>
              )}
            </div>
            {rows.length > 1 && (
              <button
                type="button"
                onClick={() => removeAt(index)}
                aria-label={`Remove ${ariaLabelPrefix.toLowerCase()} ${index + 1}`}
                className="mt-1 p-2.5 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
              >
                <Trash2 size={18} />
              </button>
            )}
          </div>
        );
      })}
      <button
        type="button"
        onClick={addRow}
        disabled={!canAdd}
        className="inline-flex items-center gap-1.5 text-sm font-medium text-purple-700 hover:text-purple-900 disabled:text-gray-400 disabled:cursor-not-allowed"
      >
        <Plus size={16} /> Add another email
      </button>
    </div>
  );
};
