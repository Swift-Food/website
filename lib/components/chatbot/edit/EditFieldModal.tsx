"use client";

import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { useEffect, useState } from "react";
import { Chip } from "../ui/Chip";

interface EditFieldModalProps {
  open: boolean;
  field: string;
  initialValue?: unknown;
  onClose: () => void;
  onSave: (value: unknown) => void;
}

const DIETARY_VALUES = [
  "vegetarian", "vegan", "halal", "kosher", "gluten_free",
  "dairy_free", "nut_free", "peanut_free", "pescatarian",
  "low_calorie", "high_protein",
];

const CUISINE_VALUES = [
  "british", "italian", "chinese", "japanese", "korean", "indian",
  "middle_eastern", "american", "mediterranean", "thai", "mexican",
  "caribbean", "african", "eastern_european", "fusion", "other",
];

const FORMAT_VALUES = [
  "buffet", "set_menu", "individual_box", "canapes",
  "grazing_table", "family_style",
];

const MEAL_TIMES = ["breakfast", "lunch", "dinner"];

const FIELD_TITLES: Record<string, string> = {
  event_datetime: "When is your event?",
  headcount: "How many people?",
  meal_time: "Which meal?",
  budget: "What's your budget?",
  dietary_restrictions: "Any dietary needs?",
  cuisine_preference: "Cuisine preference",
  format_preference: "Serving format",
  occasion: "Occasion (optional)",
};

/**
 * Inline field editor. The control morphs based on the field type:
 *   - datetime → datetime-local input
 *   - number   → number input (headcount/budget)
 *   - enum     → chip selector (single or multi)
 *   - text     → textarea
 * Save triggers POST /:sid/edit-field via the parent.
 */
export function EditFieldModal({
  open,
  field,
  initialValue,
  onClose,
  onSave,
}: EditFieldModalProps) {
  const prefersReducedMotion = useReducedMotion();
  const [value, setValue] = useState<unknown>(initialValue);

  useEffect(() => {
    setValue(initialValue);
  }, [initialValue, field]);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.18 }}
          onClick={onClose}
          style={{
            position: "absolute",
            inset: 0,
            background: "rgba(20, 18, 16, 0.45)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: 16,
            zIndex: 30,
          }}
        >
          <motion.div
            initial={prefersReducedMotion ? undefined : { opacity: 0, scale: 0.96, y: 8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={prefersReducedMotion ? undefined : { opacity: 0, scale: 0.97, y: 4 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            onClick={(e) => e.stopPropagation()}
            style={{
              background: "var(--paper)",
              borderRadius: 16,
              padding: 18,
              width: "100%",
              maxWidth: 320,
              boxShadow: "var(--shadow-lift)",
              border: "1px solid var(--rule)",
            }}
          >
            <div className="display" style={{ fontSize: "1.05rem", fontWeight: 600, marginBottom: 12 }}>
              {FIELD_TITLES[field] ?? "Edit"}
            </div>

            <FieldEditor field={field} value={value} onChange={setValue} />

            <div
              style={{
                display: "flex",
                justifyContent: "flex-end",
                gap: 8,
                marginTop: 16,
              }}
            >
              <Chip onClick={onClose}>Cancel</Chip>
              <Chip
                variant="brand"
                onClick={() => {
                  onSave(value);
                  onClose();
                }}
              >
                Save
              </Chip>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function FieldEditor({
  field,
  value,
  onChange,
}: {
  field: string;
  value: unknown;
  onChange: (v: unknown) => void;
}) {
  if (field === "event_datetime") {
    return (
      <input
        type="datetime-local"
        value={toLocalDatetime((value as string) ?? "")}
        onChange={(e) => onChange(e.target.value)}
        style={inputStyle}
      />
    );
  }

  if (field === "headcount") {
    return (
      <input
        type="number"
        min={1}
        max={10000}
        value={(value as number) ?? ""}
        onChange={(e) => onChange(Number(e.target.value))}
        placeholder="e.g. 50"
        style={inputStyle}
      />
    );
  }

  if (field === "budget") {
    return (
      <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
        <span style={{ color: "var(--ink-soft)", fontSize: "1.1rem" }}>£</span>
        <input
          type="number"
          min={1}
          step={10}
          value={(value as number) ?? ""}
          onChange={(e) => onChange(Number(e.target.value))}
          placeholder="e.g. 750"
          style={{ ...inputStyle, flex: 1 }}
        />
      </div>
    );
  }

  if (field === "occasion") {
    return (
      <input
        type="text"
        value={(value as string) ?? ""}
        onChange={(e) => onChange(e.target.value)}
        placeholder="e.g. team lunch, conference"
        style={inputStyle}
      />
    );
  }

  if (field === "meal_time") {
    const current = (value as string) ?? "";
    return (
      <ChipMultiSelect
        options={MEAL_TIMES}
        selected={current ? [current] : []}
        onChange={(arr) => onChange(arr[0] ?? null)}
        single
      />
    );
  }

  if (field === "dietary_restrictions") {
    return (
      <ChipMultiSelect
        options={DIETARY_VALUES}
        selected={Array.isArray(value) ? (value as string[]) : []}
        onChange={onChange}
      />
    );
  }

  if (field === "cuisine_preference") {
    return (
      <ChipMultiSelect
        options={CUISINE_VALUES}
        selected={Array.isArray(value) ? (value as string[]) : []}
        onChange={onChange}
      />
    );
  }

  if (field === "format_preference") {
    return (
      <ChipMultiSelect
        options={FORMAT_VALUES}
        selected={Array.isArray(value) ? (value as string[]) : []}
        onChange={onChange}
      />
    );
  }

  return (
    <input
      type="text"
      value={(value as string) ?? ""}
      onChange={(e) => onChange(e.target.value)}
      style={inputStyle}
    />
  );
}

function ChipMultiSelect({
  options,
  selected,
  onChange,
  single,
}: {
  options: string[];
  selected: string[];
  onChange: (next: string[]) => void;
  single?: boolean;
}) {
  const set = new Set(selected);
  return (
    <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
      {options.map((opt) => {
        const active = set.has(opt);
        return (
          <Chip
            key={opt}
            variant={active ? "primary" : "default"}
            onClick={() => {
              if (single) {
                onChange(active ? [] : [opt]);
                return;
              }
              if (active) {
                onChange(selected.filter((s) => s !== opt));
              } else {
                onChange([...selected, opt]);
              }
            }}
          >
            {opt.replace(/_/g, " ")}
          </Chip>
        );
      })}
    </div>
  );
}

function toLocalDatetime(iso: string): string {
  if (!iso) return "";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  // Slice off seconds + tz portion for the input control
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

const inputStyle: React.CSSProperties = {
  width: "100%",
  padding: "10px 12px",
  borderRadius: 10,
  border: "1px solid var(--rule)",
  background: "var(--paper)",
  color: "var(--ink)",
  fontSize: "0.95rem",
  fontFamily: "var(--font-body)",
  outline: "none",
};
