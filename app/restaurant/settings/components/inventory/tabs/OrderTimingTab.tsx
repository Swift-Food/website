"use client";

import { Clock, Users, Calendar, Loader } from "lucide-react";
import { SettingsCard } from "../components/SettingsCard";
import { NumberFieldWithUnit } from "../components/NumberFieldWithUnit";
import { PreviewCallout } from "../components/PreviewCallout";
import { ToggleRow } from "../components/ToggleRow";
import { SaveBar } from "../components/SaveBar";
import { useOrderTimingState } from "../hooks/useOrderTimingState";

interface Props {
  restaurantId: string;
}

/**
 * Order Timing tab — everything about WHEN a customer can order:
 * restaurant-wide default notice, per-menu-group overrides, and the
 * maximum size of a single order.
 */
export const OrderTimingTab = ({ restaurantId }: Props) => {
  const state = useOrderTimingState(restaurantId);

  if (state.loading) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-8 flex items-center justify-center gap-3 text-gray-600">
        <Loader className="animate-spin" size={20} />
        <span>Loading timing settings…</span>
      </div>
    );
  }

  const {
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
  } = state;

  const noticeType = advanceNoticeSettings?.type ?? "hours";

  const handleNoticeTypeChange = (type: "hours" | "days_before_time") => {
    if (type === "hours") {
      setAdvanceNoticeSettings({ type: "hours", hours: minimumDeliveryNoticeHours || 48 });
    } else {
      setAdvanceNoticeSettings({ type: "days_before_time", days: 2, cutoffTime: "18:00" });
    }
  };

  const setHours = (hours: number) => {
    const clamped = Math.max(0, Math.min(hours, 168));
    setMinimumDeliveryNoticeHours(clamped);
    setAdvanceNoticeSettings({ type: "hours", hours: clamped });
  };

  const setDays = (days: number) => {
    const clamped = Math.min(Math.max(days, 1), 14);
    if (advanceNoticeSettings?.type === "days_before_time") {
      setAdvanceNoticeSettings({ ...advanceNoticeSettings, days: clamped });
    }
  };

  const setCutoffTime = (cutoffTime: string) => {
    if (advanceNoticeSettings?.type === "days_before_time") {
      setAdvanceNoticeSettings({ ...advanceNoticeSettings, cutoffTime });
    }
  };

  const activeHours =
    advanceNoticeSettings?.type === "hours"
      ? (advanceNoticeSettings.hours ?? minimumDeliveryNoticeHours)
      : minimumDeliveryNoticeHours;

  const activeDays =
    advanceNoticeSettings?.type === "days_before_time"
      ? (advanceNoticeSettings.days ?? 2)
      : 2;

  const activeCutoffTime =
    advanceNoticeSettings?.type === "days_before_time"
      ? (advanceNoticeSettings.cutoffTime ?? "18:00")
      : "18:00";

  const formatPreview = (): string => {
    if (noticeType === "hours") {
      const hours = activeHours;
      if (hours === 0) return "No advance notice required";
      if (hours < 24) return `${hours} hour${hours !== 1 ? "s" : ""} notice`;
      const days = Math.floor(hours / 24);
      const remaining = hours % 24;
      if (remaining === 0) return `${days} day${days !== 1 ? "s" : ""} notice`;
      return `${days} day${days !== 1 ? "s" : ""} ${remaining} hour${remaining !== 1 ? "s" : ""} notice`;
    }
    if (advanceNoticeSettings?.type === "days_before_time") {
      const days = activeDays;
      const [h, m] = activeCutoffTime.split(":").map(Number);
      const period = (h ?? 0) >= 12 ? "PM" : "AM";
      const rawHour = h ?? 0;
      const displayHour = rawHour === 0 ? 12 : rawHour > 12 ? rawHour - 12 : rawHour;
      const displayTime = `${displayHour}:${(m ?? 0).toString().padStart(2, "0")} ${period}`;
      return `Order ${days} day${days !== 1 ? "s" : ""} before (by ${displayTime.toLowerCase()})`;
    }
    return "";
  };

  return (
    <SettingsCard
      icon={Clock}
      title="Order Timing"
      subtitle="When customers can order — and how big each order can be"
      accent="blue"
      footer={
        <SaveBar
          label="Save Timing"
          saving={state.saving}
          enabled={state.hasChanges}
          onClick={state.save}
          success={state.success}
          error={state.error}
        />
      }
    >
      {/* Minimum Advance Notice */}
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-1">
          Minimum advance notice
        </label>
        <p className="text-xs text-gray-500 mb-3">
          How much notice do you need before accepting an order?
        </p>

        <div className="flex flex-wrap gap-2 mb-4">
          <button
            type="button"
            onClick={() => handleNoticeTypeChange("hours")}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-lg border-2 text-sm font-medium transition-all ${
              noticeType === "hours"
                ? "border-blue-500 bg-blue-50 text-blue-700"
                : "border-gray-200 bg-white text-gray-600 hover:border-gray-300"
            }`}
          >
            <Clock size={16} />
            Hours before event
          </button>
          <button
            type="button"
            onClick={() => handleNoticeTypeChange("days_before_time")}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-lg border-2 text-sm font-medium transition-all ${
              noticeType === "days_before_time"
                ? "border-blue-500 bg-blue-50 text-blue-700"
                : "border-gray-200 bg-white text-gray-600 hover:border-gray-300"
            }`}
          >
            <Calendar size={16} />
            Days before cutoff time
          </button>
        </div>

        {noticeType === "hours" && (
          <NumberFieldWithUnit
            value={activeHours}
            onChange={setHours}
            min={0}
            max={168}
            unitLabel="hours before event"
            placeholder="24"
            accent="blue"
            ariaLabel="Minimum advance notice hours"
          />
        )}

        {noticeType === "days_before_time" && (
          <div className="p-4 bg-gray-50 rounded-lg border border-gray-200 space-y-4">
            <div className="flex flex-wrap items-center gap-4">
              <div className="flex items-center gap-3">
                <input
                  type="number"
                  min={1}
                  max={14}
                  value={activeDays}
                  onChange={(e) => setDays(parseInt(e.target.value) || 1)}
                  className="w-20 px-3 py-2.5 text-center text-xl font-bold border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 bg-white transition-all"
                />
                <span className="text-sm font-medium text-gray-600">day(s) before</span>
              </div>
              <input
                type="time"
                value={activeCutoffTime}
                onChange={(e) => setCutoffTime(e.target.value)}
                className="px-3 py-2.5 text-lg font-bold border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 bg-white transition-all"
              />
            </div>
            <p className="text-xs text-gray-500">
              E.g. &quot;2 days before 6:00 PM&quot; means orders for Wednesday must be placed by Monday 6:00 PM.
            </p>
          </div>
        )}

        <PreviewCallout>
          Customers will see: <strong>&quot;{formatPreview()}&quot;</strong>
        </PreviewCallout>
      </div>

      {/* Per-group notice overrides */}
      {noticeGroups.length > 0 && (
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1">
            Longer notice for specific menu groups
          </label>
          <p className="text-xs text-gray-500 mb-3">
            Most groups use your default above. Set a longer notice for groups
            that need more prep time (like large-batch bundles or cakes).
            Leave blank to inherit the default.
          </p>
          <div className="rounded-lg border border-gray-200 divide-y divide-gray-100 bg-white overflow-hidden">
            {noticeGroups.map((row) => {
              const draftRaw = noticeGroupDrafts[row.groupTitle] ?? "";
              const isCustom = draftRaw.trim().length > 0;
              return (
                <div
                  key={row.groupTitle}
                  className="flex items-center gap-3 px-4 py-2.5"
                >
                  <div className="min-w-0 flex-1">
                    <div className="text-sm font-semibold text-gray-900 truncate">
                      {row.groupTitle}
                    </div>
                    <div className="text-xs text-gray-500">
                      {row.itemCount}{" "}
                      {row.itemCount === 1 ? "item" : "items"}
                    </div>
                  </div>
                  <input
                    type="number"
                    min={0}
                    step={1}
                    inputMode="numeric"
                    value={draftRaw}
                    onChange={(e) => setGroupDraft(row.groupTitle, e.target.value)}
                    aria-label={`Notice hours for ${row.groupTitle}`}
                    className="w-16 px-2 py-1.5 text-center text-sm font-semibold border-2 border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 bg-white transition-all"
                  />
                  <span
                    className={`text-xs whitespace-nowrap w-20 ${isCustom ? "font-medium text-gray-700" : "text-gray-400 italic"}`}
                  >
                    {isCustom ? "hours" : "uses default"}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Max portions per order */}
      <ToggleRow
        title="Cap the size of a single order"
        subtitle="Reject orders above this many portions"
        enabled={enableMaxPortionsPerOrder}
        onChange={(next) => {
          setEnableMaxPortionsPerOrder(next);
          if (!next) setMaxPortionsPerOrder(null);
          else if (maxPortionsPerOrder == null) setMaxPortionsPerOrder(50);
        }}
        accent="blue"
      >
        <div className="flex items-center gap-3">
          <Users size={18} className="text-blue-600" />
          <NumberFieldWithUnit
            value={maxPortionsPerOrder ?? 50}
            onChange={setMaxPortionsPerOrder}
            min={1}
            unitLabel="portions max per order"
            placeholder="50"
            accent="blue"
            ariaLabel="Max portions per order"
          />
        </div>
      </ToggleRow>
    </SettingsCard>
  );
};
