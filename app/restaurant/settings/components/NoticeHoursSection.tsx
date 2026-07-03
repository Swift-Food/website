"use client";

import { useEffect, useState } from "react";
import { ArrowLeft, Loader, AlertCircle, Check } from "lucide-react";
import { fetchWithAuth, API_BASE_URL } from "@/lib/api-client/auth-client";

interface Row {
  groupTitle: string;
  itemCount: number;
  noticeHoursOverride: number | null;
}

interface Response {
  restaurantDefaultNoticeHours: number;
  groups: Row[];
}

interface Props {
  restaurantId: string;
  onBack: () => void;
}

/**
 * Per-group notice-hours override editor. Restaurant sets how much
 * advance notice is needed for a specific menu group (e.g. 'Bundles'
 * needs 72h instead of the restaurant-wide 48h default). Blank =
 * inherit the restaurant default. Data is stored on
 * `restaurant.menuGroupSettings[groupTitle].noticeHoursOverride`.
 */
export const NoticeHoursSection = ({ restaurantId, onBack }: Props) => {
  const [data, setData] = useState<Response | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [savingKey, setSavingKey] = useState<string | null>(null);
  const [drafts, setDrafts] = useState<Record<string, string>>({});
  const [savedFlash, setSavedFlash] = useState<Record<string, number>>({});

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetchWithAuth(
          `${API_BASE_URL}/restaurants/${restaurantId}/notice-hours`,
        );
        if (!res.ok) throw new Error("Failed to load notice-hours config");
        const json: Response = await res.json();
        setData(json);
        const d: Record<string, string> = {};
        for (const r of json.groups) {
          d[r.groupTitle] =
            r.noticeHoursOverride == null ? "" : String(r.noticeHoursOverride);
        }
        setDrafts(d);
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : "Failed to load");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [restaurantId]);

  const upsert = async (row: Row) => {
    const raw = drafts[row.groupTitle] ?? "";
    setSavingKey(row.groupTitle);
    setError(null);
    try {
      const encoded = encodeURIComponent(row.groupTitle);
      if (raw.trim() === "") {
        const res = await fetchWithAuth(
          `${API_BASE_URL}/restaurants/${restaurantId}/notice-hours/${encoded}`,
          { method: "DELETE" },
        );
        if (!res.ok) throw new Error(`Failed to clear override (${res.status})`);
        setData((prev) =>
          prev
            ? {
                ...prev,
                groups: prev.groups.map((g) =>
                  g.groupTitle === row.groupTitle
                    ? { ...g, noticeHoursOverride: null }
                    : g,
                ),
              }
            : prev,
        );
      } else {
        const hours = Math.max(0, Math.floor(Number(raw)));
        if (!Number.isFinite(hours))
          throw new Error("Enter a whole number of hours");
        const res = await fetchWithAuth(
          `${API_BASE_URL}/restaurants/${restaurantId}/notice-hours/${encoded}`,
          {
            method: "PUT",
            body: JSON.stringify({ noticeHoursOverride: hours }),
          },
        );
        if (!res.ok) throw new Error(`Failed to save (${res.status})`);
        setData((prev) =>
          prev
            ? {
                ...prev,
                groups: prev.groups.map((g) =>
                  g.groupTitle === row.groupTitle
                    ? { ...g, noticeHoursOverride: hours }
                    : g,
                ),
              }
            : prev,
        );
      }
      setSavedFlash((prev) => ({ ...prev, [row.groupTitle]: Date.now() }));
      setTimeout(() => {
        setSavedFlash((prev) => {
          const next = { ...prev };
          delete next[row.groupTitle];
          return next;
        });
      }, 2000);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to save");
    } finally {
      setSavingKey(null);
    }
  };

  const defaultH = data?.restaurantDefaultNoticeHours ?? 48;

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <button
        onClick={onBack}
        className="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 mb-4"
      >
        <ArrowLeft size={16} /> Back to settings
      </button>

      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Notice hours per group</h1>
        <p className="text-sm text-gray-600 mt-1">
          Some menu groups need more preparation time than others. Set a longer
          notice for groups like large-batch bundles so customers can only
          order them for dates that give you enough time to prepare.
        </p>
        <p className="text-sm text-gray-600 mt-2">
          Restaurant-wide default:{" "}
          <span className="font-semibold text-gray-900">{defaultH} hours</span>.
          Leave a group blank to inherit this default. New groups you add later
          will inherit automatically.
        </p>
      </div>

      {loading && (
        <div className="flex items-center gap-2 text-gray-500 py-4">
          <Loader size={16} className="animate-spin" /> Loading…
        </div>
      )}

      {error && (
        <div className="mb-4 flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-800">
          <AlertCircle size={16} className="mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      {!loading && data && data.groups.length === 0 && (
        <div className="rounded-lg border border-gray-200 bg-gray-50 p-6 text-sm text-gray-600 italic">
          No menu groups yet. Once you have menu items with group titles set,
          they&apos;ll appear here to configure.
        </div>
      )}

      {!loading && data && data.groups.length > 0 && (
        <div className="rounded-lg border border-gray-200 bg-white divide-y divide-gray-100">
          {data.groups.map((row) => {
            const effective =
              row.noticeHoursOverride != null
                ? row.noticeHoursOverride
                : defaultH;
            const flashed = savedFlash[row.groupTitle];
            const isSaving = savingKey === row.groupTitle;
            return (
              <div
                key={row.groupTitle}
                className="flex flex-col sm:flex-row sm:items-center gap-3 p-4"
              >
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-gray-900">
                    {row.groupTitle}
                    <span className="ml-2 text-xs text-gray-500">
                      {row.itemCount}{" "}
                      {row.itemCount === 1 ? "item" : "items"}
                    </span>
                  </div>
                  <div className="text-xs text-gray-500 mt-0.5">
                    Effective notice: {effective} hours
                    {row.noticeHoursOverride == null && " (inherited)"}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    min={0}
                    step={1}
                    placeholder={`Inherit (${defaultH})`}
                    value={drafts[row.groupTitle] ?? ""}
                    onChange={(e) =>
                      setDrafts((prev) => ({
                        ...prev,
                        [row.groupTitle]: e.target.value,
                      }))
                    }
                    className="w-32 px-3 py-1.5 border border-gray-300 rounded-md text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <span className="text-xs text-gray-500">hours</span>
                  <button
                    onClick={() => upsert(row)}
                    disabled={isSaving}
                    className="px-3 py-1.5 rounded-md text-sm font-medium bg-blue-600 hover:bg-blue-700 text-white disabled:bg-gray-300 disabled:cursor-not-allowed"
                  >
                    {isSaving ? "Saving…" : "Save"}
                  </button>
                  {flashed && (
                    <span
                      className="flex items-center gap-1 text-xs text-emerald-700"
                      aria-live="polite"
                    >
                      <Check size={14} /> Saved
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default NoticeHoursSection;
