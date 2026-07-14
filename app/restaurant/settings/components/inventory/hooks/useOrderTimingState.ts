"use client";

import { useEffect, useState } from "react";
import { restaurantApi } from "@/services/api/restaurant.api";
import { fetchWithAuth, API_BASE_URL } from "@/lib/api-client/auth-client";
import { AdvanceNoticeSettings } from "@/types/inventory.types";

export interface BusinessDayCutoff {
  /** How many business days (Mon–Fri) before delivery orders close. */
  businessDaysBefore: number;
  /** 'HH:MM' — time of day on the deadline date. */
  cutoffTime: string;
}

export type GroupMode = "default" | "hours" | "business_days";

export interface NoticeHoursGroupItem {
  id: string;
  name: string;
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
  items?: NoticeHoursGroupItem[];
  noticeHoursOverride: number | null;
  businessDayCutoff?: BusinessDayCutoff | null;
}

interface Snapshot {
  minimumDeliveryNoticeHours: number;
  advanceNoticeSettings: AdvanceNoticeSettings | null;
  maxPortionsPerOrder: number | null;
  enableMaxPortionsPerOrder: boolean;
  groupOverrides: Record<string, number | null>;
  groupBusinessCutoffs: Record<string, BusinessDayCutoff | null>;
}

const DEFAULT_BUSINESS_CUTOFF: BusinessDayCutoff = {
  businessDaysBefore: 1,
  cutoffTime: "14:00",
};

function snapshotBusinessCutoffs(
  rows: NoticeHoursGroupRow[],
): Record<string, BusinessDayCutoff | null> {
  const out: Record<string, BusinessDayCutoff | null> = {};
  for (const r of rows) out[r.groupTitle] = r.businessDayCutoff ?? null;
  return out;
}

function snapshotHours(rows: NoticeHoursGroupRow[]): Record<string, number | null> {
  const out: Record<string, number | null> = {};
  for (const r of rows) out[r.groupTitle] = r.noticeHoursOverride;
  return out;
}

/**
 * State + persistence for the Order Timing tab. Owns restaurant-wide default
 * notice, advance-notice shape, max portions per order, per-group hours
 * overrides, and per-group business-day cutoffs. Save batches all writes in
 * parallel so the UI presents "one save" to the user.
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
  const [groupBusinessCutoffDrafts, setGroupBusinessCutoffDrafts] = useState<
    Record<string, BusinessDayCutoff>
  >({});
  // Explicit mode per group — not derived, so switching modes always sticks
  const [groupModeDrafts, setGroupModeDrafts] = useState<Record<string, GroupMode>>({});

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
      const maxPerOrder: number | null = details.maxPortionsPerOrder ?? null;
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

      const hourDrafts: Record<string, string> = {};
      const cutoffDrafts: Record<string, BusinessDayCutoff> = {};
      const modeDrafts: Record<string, GroupMode> = {};
      for (const g of groups) {
        hourDrafts[g.groupTitle] =
          g.noticeHoursOverride == null ? "" : String(g.noticeHoursOverride);
        cutoffDrafts[g.groupTitle] = g.businessDayCutoff ?? { ...DEFAULT_BUSINESS_CUTOFF };
        if (g.businessDayCutoff) {
          modeDrafts[g.groupTitle] = "business_days";
        } else if (g.noticeHoursOverride != null) {
          modeDrafts[g.groupTitle] = "hours";
        } else {
          modeDrafts[g.groupTitle] = "default";
        }
      }
      setNoticeGroupDrafts(hourDrafts);
      setGroupBusinessCutoffDrafts(cutoffDrafts);
      setGroupModeDrafts(modeDrafts);

      setSnapshot({
        minimumDeliveryNoticeHours: defaultHours,
        advanceNoticeSettings: advance,
        maxPortionsPerOrder: maxPerOrder,
        enableMaxPortionsPerOrder: enableMax,
        groupOverrides: snapshotHours(groups),
        groupBusinessCutoffs: snapshotBusinessCutoffs(groups),
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

  const setGroupMode = (groupTitle: string, mode: GroupMode) => {
    setGroupModeDrafts((prev) => ({ ...prev, [groupTitle]: mode }));
  };

  const setGroupBusinessCutoff = (
    groupTitle: string,
    patch: Partial<BusinessDayCutoff>,
  ) => {
    setGroupBusinessCutoffDrafts((prev) => ({
      ...prev,
      [groupTitle]: {
        ...(prev[groupTitle] ?? DEFAULT_BUSINESS_CUTOFF),
        ...patch,
      },
    }));
  };

  /** What each group's draft resolves to under its current mode. */
  const resolveGroupDraft = (
    groupTitle: string,
  ): { hours: number | null; cutoff: BusinessDayCutoff | null } => {
    const mode = groupModeDrafts[groupTitle] ?? "default";
    if (mode === "hours") {
      const raw = (noticeGroupDrafts[groupTitle] ?? "").trim();
      return {
        hours: raw === "" ? null : Math.max(0, Math.floor(Number(raw))),
        cutoff: null,
      };
    }
    if (mode === "business_days") {
      return {
        hours: null,
        cutoff: groupBusinessCutoffDrafts[groupTitle] ?? { ...DEFAULT_BUSINESS_CUTOFF },
      };
    }
    return { hours: null, cutoff: null };
  };

  const hasChanges = (() => {
    if (!snapshot) return false;
    if (snapshot.minimumDeliveryNoticeHours !== minimumDeliveryNoticeHours) return true;
    if (JSON.stringify(snapshot.advanceNoticeSettings) !== JSON.stringify(advanceNoticeSettings)) return true;
    if (snapshot.maxPortionsPerOrder !== (enableMaxPortionsPerOrder ? maxPortionsPerOrder : null)) return true;
    if (snapshot.enableMaxPortionsPerOrder !== enableMaxPortionsPerOrder) return true;
    for (const g of noticeGroups) {
      const { hours, cutoff } = resolveGroupDraft(g.groupTitle);
      if (hours !== snapshot.groupOverrides[g.groupTitle]) return true;
      if (JSON.stringify(cutoff) !== JSON.stringify(snapshot.groupBusinessCutoffs[g.groupTitle])) return true;
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

      const groupWrites = noticeGroups
        .map((row) => {
          const { hours: draftHours, cutoff: draftCutoff } = resolveGroupDraft(row.groupTitle);
          const encoded = encodeURIComponent(row.groupTitle);

          const hoursChanged = draftHours !== row.noticeHoursOverride;
          const cutoffChanged =
            JSON.stringify(draftCutoff) !== JSON.stringify(row.businessDayCutoff ?? null);

          if (!hoursChanged && !cutoffChanged) return null;

          // Full clear → DELETE
          if (draftHours === null && draftCutoff === null) {
            if (row.noticeHoursOverride == null && !row.businessDayCutoff) return null;
            return fetchWithAuth(
              `${API_BASE_URL}/restaurants/${restaurantId}/notice-hours/${encoded}`,
              { method: "DELETE" },
            );
          }

          const body: Record<string, unknown> = {};
          if (hoursChanged) body.noticeHoursOverride = draftHours;
          if (cutoffChanged) body.businessDayCutoff = draftCutoff;

          return fetchWithAuth(
            `${API_BASE_URL}/restaurants/${restaurantId}/notice-hours/${encoded}`,
            { method: "PUT", body: JSON.stringify(body) },
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
    groupBusinessCutoffDrafts,
    groupModeDrafts,

    setMinimumDeliveryNoticeHours,
    setAdvanceNoticeSettings,
    setMaxPortionsPerOrder,
    setEnableMaxPortionsPerOrder,
    setGroupDraft,
    setGroupMode,
    setGroupBusinessCutoff,

    save,
  };
};
