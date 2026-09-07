"use client";

import { useEffect, useMemo, useState } from "react";
import { X, Clock, CalendarRange, Loader } from "lucide-react";
import { cateringService } from "@/services/api/catering.api";
import {
  AvailabilityDraft,
  GroupAvailability,
  PRESET_WINDOWS,
  SHORT_DAY,
  WEEK,
  Weekday,
  draftFromAvailability,
  draftToAvailability,
  formatGroupAvailability,
  validateDraft,
} from "@/lib/utils/group-availability";

interface Props {
  restaurantId: string;
  groupName: string;
  availability: GroupAvailability | null;
  onClose: () => void;
  onSaved: (groupName: string, availability: GroupAvailability | null) => void;
}

/**
 * Editor for a menu group's ordering window: a time of day, a season, or
 * both. Reached from the clock button beside the group name.
 *
 * Both sections start switched off, which is the current behaviour for
 * every group — a group with nothing set is available for any delivery.
 */
export const GroupAvailabilityModal = ({
  restaurantId,
  groupName,
  availability,
  onClose,
  onSaved,
}: Props) => {
  const [draft, setDraft] = useState<AvailabilityDraft>(() =>
    draftFromAvailability(availability)
  );
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" && !saving) onClose();
    };
    window.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [onClose, saving]);

  const payload = useMemo(() => draftToAvailability(draft), [draft]);
  const summary = formatGroupAvailability(payload);
  const problem = validateDraft(draft);

  const setDay = (day: Weekday, patch: Partial<AvailabilityDraft["days"][Weekday]>) =>
    setDraft((d) => ({
      ...d,
      days: { ...d.days, [day]: { ...d.days[day], ...patch } },
    }));

  const applyPreset = (open: string, close: string) =>
    setDraft((d) => ({
      ...d,
      days: Object.fromEntries(
        WEEK.map((day) => [
          day,
          d.days[day].enabled ? { ...d.days[day], open, close } : d.days[day],
        ])
      ) as AvailabilityDraft["days"],
    }));

  const handleSave = async () => {
    if (problem) {
      setError(problem);
      return;
    }
    setSaving(true);
    setError(null);
    try {
      await cateringService.setGroupAvailability(restaurantId, groupName, payload);
      onSaved(groupName, payload);
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save availability");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="group-availability-title"
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50 backdrop-blur-sm p-0 sm:p-4"
      onClick={() => !saving && onClose()}
    >
      <div
        className="w-full sm:max-w-lg bg-white rounded-t-2xl sm:rounded-2xl shadow-xl overflow-hidden max-h-[92vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-start justify-between px-6 py-4 border-b border-gray-200">
          <div className="min-w-0 pr-3">
            <h2
              id="group-availability-title"
              className="text-lg font-bold text-gray-900 truncate"
            >
              Availability — {groupName}
            </h2>
            <p className="text-xs text-gray-500 mt-0.5">
              Limit when this group can be delivered. Leave both off and it is
              available for any delivery.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={saving}
            className="text-gray-400 hover:text-gray-600 p-1 rounded flex-shrink-0"
            aria-label="Close"
          >
            <X size={20} />
          </button>
        </div>

        {/* Body */}
        <div className="px-6 py-5 space-y-5 overflow-y-auto">
          {/* Time of day */}
          <div className="bg-gray-50 rounded-lg border border-gray-200">
            <div className="flex items-center justify-between p-4">
              <div className="flex items-center gap-2.5 min-w-0 pr-3">
                <Clock size={18} className="text-blue-600 flex-shrink-0" />
                <div className="min-w-0">
                  <div className="text-sm font-semibold text-gray-900">
                    Time of day
                  </div>
                  <div className="text-xs text-gray-500 mt-0.5">
                    e.g. breakfast, only for 07:00–11:00 deliveries
                  </div>
                </div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer flex-shrink-0">
                <input
                  type="checkbox"
                  checked={draft.timeEnabled}
                  onChange={(e) =>
                    setDraft((d) => ({ ...d, timeEnabled: e.target.checked }))
                  }
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-300 rounded-full peer peer-focus:ring-2 peer-focus:ring-blue-300 peer-checked:bg-blue-600 peer-checked:after:translate-x-5 after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all" />
              </label>
            </div>

            {draft.timeEnabled && (
              <div className="px-4 pb-4 space-y-3">
                <div className="flex flex-wrap gap-2">
                  {PRESET_WINDOWS.map((p) => (
                    <button
                      key={p.label}
                      type="button"
                      onClick={() => applyPreset(p.open, p.close)}
                      className="text-xs font-medium px-2.5 py-1.5 rounded-full border border-gray-300 bg-white text-gray-700 hover:bg-blue-50 hover:border-blue-300 hover:text-blue-700 transition-colors"
                    >
                      {p.label}
                    </button>
                  ))}
                </div>

                <div className="space-y-1.5">
                  {WEEK.map((day) => {
                    const row = draft.days[day];
                    return (
                      <div key={day} className="flex items-center gap-3">
                        <label className="flex items-center gap-2 w-20 flex-shrink-0 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={row.enabled}
                            onChange={(e) =>
                              setDay(day, { enabled: e.target.checked })
                            }
                            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                          />
                          <span
                            className={`text-sm ${
                              row.enabled
                                ? "text-gray-900 font-medium"
                                : "text-gray-400"
                            }`}
                          >
                            {SHORT_DAY[day]}
                          </span>
                        </label>
                        <input
                          type="time"
                          value={row.open}
                          disabled={!row.enabled}
                          onChange={(e) => setDay(day, { open: e.target.value })}
                          className="border border-gray-300 rounded-md px-2 py-1 text-sm disabled:bg-gray-100 disabled:text-gray-400 focus:outline-none focus:ring-1 focus:ring-blue-500"
                        />
                        <span
                          className={`text-sm ${
                            row.enabled ? "text-gray-500" : "text-gray-300"
                          }`}
                        >
                          to
                        </span>
                        <input
                          type="time"
                          value={row.close}
                          disabled={!row.enabled}
                          onChange={(e) => setDay(day, { close: e.target.value })}
                          className="border border-gray-300 rounded-md px-2 py-1 text-sm disabled:bg-gray-100 disabled:text-gray-400 focus:outline-none focus:ring-1 focus:ring-blue-500"
                        />
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Dates */}
          <div className="bg-gray-50 rounded-lg border border-gray-200">
            <div className="flex items-center justify-between p-4">
              <div className="flex items-center gap-2.5 min-w-0 pr-3">
                <CalendarRange size={18} className="text-purple-600 flex-shrink-0" />
                <div className="min-w-0">
                  <div className="text-sm font-semibold text-gray-900">Dates</div>
                  <div className="text-xs text-gray-500 mt-0.5">
                    e.g. a Christmas menu, only for December deliveries
                  </div>
                </div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer flex-shrink-0">
                <input
                  type="checkbox"
                  checked={draft.dateEnabled}
                  onChange={(e) =>
                    setDraft((d) => ({ ...d, dateEnabled: e.target.checked }))
                  }
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-300 rounded-full peer peer-focus:ring-2 peer-focus:ring-purple-300 peer-checked:bg-purple-600 peer-checked:after:translate-x-5 after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all" />
              </label>
            </div>

            {draft.dateEnabled && (
              <div className="px-4 pb-4 space-y-3">
                <div className="flex items-center gap-3">
                  <label className="text-sm text-gray-600 w-12 flex-shrink-0">
                    From
                  </label>
                  <input
                    type="date"
                    value={draft.start}
                    onChange={(e) =>
                      setDraft((d) => ({ ...d, start: e.target.value }))
                    }
                    className="border border-gray-300 rounded-md px-2 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-purple-500"
                  />
                </div>
                <div className="flex items-center gap-3">
                  <label className="text-sm text-gray-600 w-12 flex-shrink-0">
                    To
                  </label>
                  <input
                    type="date"
                    value={draft.end}
                    onChange={(e) => setDraft((d) => ({ ...d, end: e.target.value }))}
                    className="border border-gray-300 rounded-md px-2 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-purple-500"
                  />
                </div>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={draft.repeatsAnnually}
                    onChange={(e) =>
                      setDraft((d) => ({ ...d, repeatsAnnually: e.target.checked }))
                    }
                    className="rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                  />
                  <span className="text-sm text-gray-700">
                    Repeat every year
                    <span className="text-gray-500">
                      {" "}
                      — set a Christmas menu once and it comes back each December
                    </span>
                  </span>
                </label>
              </div>
            )}
          </div>

          {error && (
            <div className="text-sm text-red-700 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
              {error}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-200 bg-white">
          <div className="text-sm text-gray-600 mb-3 min-h-[1.25rem]">
            {problem ? (
              <span className="text-amber-700">{problem}</span>
            ) : summary ? (
              <>
                Available for deliveries{" "}
                <span className="font-medium text-gray-900">{summary}</span>
              </>
            ) : (
              "Available for any delivery."
            )}
          </div>
          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              disabled={saving}
              className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSave}
              disabled={saving || !!problem}
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors disabled:opacity-50 flex items-center gap-2"
            >
              {saving && <Loader size={14} className="animate-spin" />}
              Save
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
