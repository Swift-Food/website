"use client";

import { useEffect, useState } from "react";
import { restaurantApi } from "@/services/api/restaurant.api";
import { fetchWithAuth, API_BASE_URL } from "@/lib/api-client/auth-client";
import { AdvanceNoticeSettings } from "@/types/inventory.types";

export interface NoticeHoursGroupItem {
  id: string;
  name: string;
  /** Optional preview fields — present after backend v2584+. */
  description?: string | null;
  price?: number;
  images?: string[];
  prepTime?: number | null;
  feedsPerUnit?: number | null;
  dietaryFilters?: string[];
  allergens?: string[];
}

export interface NoticeHoursGroupRow {
  groupTitle: string;
  itemCount: number;
  /** Present after backend v2583+. Older responses may omit this. */
  items?: NoticeHoursGroupItem[];
  noticeHoursOverride: number | null;
}

interface Snapshot {
  minimumDeliveryNoticeHours: number;
  advanceNoticeSettings: AdvanceNoticeSettings | null;
  maxPortionsPerOrder: number | null;
  enableMaxPortionsPerOrder: boolean;
  groupOverrides: Record<string, number | null>;
}

const groupSnapshotFromRows = (rows: NoticeHoursGroupRow[]): Record<string, number | null> => {
  const out: Record<string, number | null> = {};
  for (const r of rows) out[r.groupTitle] = r.noticeHoursOverride;
  return out;
};

const groupSnapshotFromDrafts = (
  rows: NoticeHoursGroupRow[],
  drafts: Record<string, string>,
): Record<string, number | null> => {
  const out: Record<string, number | null> = {};
  for (const r of rows) {
    const raw = (drafts[r.groupTitle] ?? "").trim();
    if (raw === "") {
      out[r.groupTitle] = null;
    } else {
      const n = Math.max(0, Math.floor(Number(raw)));
      out[r.groupTitle] = Number.isFinite(n) ? n : null;
    }
  }
  return out;
};

/**
 * State + persistence for the Order Timing tab.
 *
 * Owns the restaurant-wide default notice, the two-mode advance-notice
 * shape, max portions per order, and per-group overrides. Save batches
 * the order-settings PATCH with N per-group PUT/DELETEs in parallel so
 * the UI presents "one save" to the user.
 */
export const useOrderTimingState = (restaurantId: string) => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const [minimumDeliveryNoticeHours, setMinimumDeliveryNoticeHours] = useState<number>(24);
  const [advanceNoticeSettings, setAdvanceNoticeSettings] = useState<AdvanceNoticeSettings | null>(null);
  const [maxPortionsPerOrder, setMaxPortionsPerOrder] = useState<number | null>(null);
  const [enableMaxPortionsPerOrder, setEnableMaxPortionsPerOrder] = useState(false);
  const [noticeGroups, setNoticeGroups] = useState<NoticeHoursGroupRow[]>([]);
  const [noticeGroupDrafts, setNoticeGroupDrafts] = useState<Record<string, string>>({});

  const [snapshot, setSnapshot] = useState<Snapshot | null>(null);

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const details = await restaurantApi.getRestaurantDetails(restaurantId);
      const defaultHours: number = details.minimumDeliveryNoticeHours ?? 0;
      const advance: AdvanceNoticeSettings | null =
        details.advanceNoticeSettings ??
        (details.minimumDeliveryNoticeHours
          ? { type: "hours", hours: details.minimumDeliveryNoticeHours }
          : null);
      const maxPerOrder: number | null =
        details.maxPortionsPerOrder ?? null;
      const enableMax = maxPerOrder != null;

      setMinimumDeliveryNoticeHours(defaultHours);
      setAdvanceNoticeSettings(advance);
      setMaxPortionsPerOrder(maxPerOrder);
      setEnableMaxPortionsPerOrder(enableMax);

      let groups: NoticeHoursGroupRow[] = [];
      try {
        const res = await fetchWithAuth(
          `${API_BASE_URL}/restaurants/${restaurantId}/notice-hours`,
        );
        if (res.ok) {
          const json = (await res.json()) as {
            restaurantDefaultNoticeHours: number;
            groups: NoticeHoursGroupRow[];
          };
          groups = json.groups;
        }
      } catch (err) {
        console.warn("Failed to load notice-hours groups:", err);
      }
      setNoticeGroups(groups);
      const drafts: Record<string, string> = {};
      for (const g of groups) {
        drafts[g.groupTitle] =
          g.noticeHoursOverride == null ? "" : String(g.noticeHoursOverride);
      }
      setNoticeGroupDrafts(drafts);

      setSnapshot({
        minimumDeliveryNoticeHours: defaultHours,
        advanceNoticeSettings: advance,
        maxPortionsPerOrder: maxPerOrder,
        enableMaxPortionsPerOrder: enableMax,
        groupOverrides: groupSnapshotFromRows(groups),
      });
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to load timing settings");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [restaurantId]);

  const setGroupDraft = (groupTitle: string, value: string) => {
    setNoticeGroupDrafts((prev) => ({ ...prev, [groupTitle]: value }));
  };

  const hasChanges = (() => {
    if (!snapshot) return false;
    if (snapshot.minimumDeliveryNoticeHours !== minimumDeliveryNoticeHours) return true;
    if (JSON.stringify(snapshot.advanceNoticeSettings) !== JSON.stringify(advanceNoticeSettings)) return true;
    if (snapshot.maxPortionsPerOrder !== (enableMaxPortionsPerOrder ? maxPortionsPerOrder : null)) return true;
    if (snapshot.enableMaxPortionsPerOrder !== enableMaxPortionsPerOrder) return true;
    const nextGroups = groupSnapshotFromDrafts(noticeGroups, noticeGroupDrafts);
    for (const g of noticeGroups) {
      if (snapshot.groupOverrides[g.groupTitle] !== nextGroups[g.groupTitle]) return true;
    }
    return false;
  })();

  const save = async () => {
    setSaving(true);
    setError(null);
    setSuccess(null);
    try {
      await restaurantApi.updateOrderSettings(restaurantId, {
        minimumDeliveryNoticeHours,
        maxPortionsPerOrder: enableMaxPortionsPerOrder ? maxPortionsPerOrder : null,
        advanceNoticeSettings,
      });

      // Diff group drafts against server snapshot; PUT changes, DELETE removals.
      const groupWrites = noticeGroups
        .map((row) => {
          const draft = (noticeGroupDrafts[row.groupTitle] ?? "").trim();
          const encoded = encodeURIComponent(row.groupTitle);
          if (draft === "") {
            if (row.noticeHoursOverride == null) return null;
            return fetchWithAuth(
              `${API_BASE_URL}/restaurants/${restaurantId}/notice-hours/${encoded}`,
              { method: "DELETE" },
            );
          }
          const hours = Math.max(0, Math.floor(Number(draft)));
          if (!Number.isFinite(hours)) return null;
          if (hours === row.noticeHoursOverride) return null;
          return fetchWithAuth(
            `${API_BASE_URL}/restaurants/${restaurantId}/notice-hours/${encoded}`,
            {
              method: "PUT",
              body: JSON.stringify({ noticeHoursOverride: hours }),
            },
          );
        })
        .filter((req): req is Promise<Response> => req != null);

      if (groupWrites.length > 0) {
        const responses = await Promise.all(groupWrites);
        const failed = responses.filter((r) => !r.ok);
        if (failed.length > 0) {
          throw new Error(
            `Some per-group overrides failed to save (${failed.length} of ${responses.length}).`,
          );
        }
      }

      setSuccess("Timing settings saved.");
      setTimeout(() => setSuccess(null), 3000);
      await load();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to save timing settings");
    } finally {
      setSaving(false);
    }
  };

  return {
    loading,
    saving,
    error,
    success,
    hasChanges,

    minimumDeliveryNoticeHours,
    advanceNoticeSettings,
    maxPortionsPerOrder,
    enableMaxPortionsPerOrder,
    noticeGroups,
    noticeGroupDrafts,

    setMinimumDeliveryNoticeHours,
    setAdvanceNoticeSettings,
    setMaxPortionsPerOrder,
    setEnableMaxPortionsPerOrder,
    setGroupDraft,

    save,
  };
};
