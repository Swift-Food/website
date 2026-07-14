"use client";

import { useState } from "react";
import {
  Clock,
  Users,
  Calendar,
  Loader,
  ChevronRight,
  ImageOff,
  ArrowRight,
} from "lucide-react";
import { SettingsCard } from "../components/SettingsCard";
import { NumberFieldWithUnit } from "../components/NumberFieldWithUnit";
import { PreviewCallout } from "../components/PreviewCallout";
import { ToggleRow } from "../components/ToggleRow";
import { SaveBar } from "../components/SaveBar";
import { SegmentedToggle } from "../components/SegmentedToggle";
import {
  MenuItemPreviewModal,
  formatPrice,
} from "../components/MenuItemPreviewModal";
import {
  useOrderTimingState,
  type BusinessDayCutoff,
  type NoticeHoursGroupItem,
} from "../hooks/useOrderTimingState";

interface Props {
  restaurantId: string;
}

// ---------------------------------------------------------------------------
// Business-day cutoff helpers
// ---------------------------------------------------------------------------

const DAY_ABBR_BY_INDEX = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

function formatCutoffTime(hhmm: string): string {
  const [h, m] = hhmm.split(":").map(Number);
  const hour = h ?? 0;
  const period = hour >= 12 ? "PM" : "AM";
  const display = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;
  return `${display}:${String(m ?? 0).padStart(2, "0")} ${period}`;
}

/** Deadline weekday for a delivery day: step back N business days (skip Sat/Sun). */
function deadlineDayIndex(deliveryIdx: number, businessDaysBefore: number): number {
  let idx = deliveryIdx;
  let remaining = businessDaysBefore;
  while (remaining > 0) {
    idx = (idx + 6) % 7;
    if (idx !== 0 && idx !== 6) remaining--;
  }
  return idx;
}

// ---------------------------------------------------------------------------
// BusinessDayCutoffEditor component
// ---------------------------------------------------------------------------

interface BusinessDayCutoffEditorProps {
  draft: BusinessDayCutoff;
  onChange: (patch: Partial<BusinessDayCutoff>) => void;
}

/** Delivery days in display order: Mon..Fri then Sat/Sun. */
const PREVIEW_ORDER = [1, 2, 3, 4, 5, 6, 0];

function BusinessDayCutoffEditor({ draft, onChange }: BusinessDayCutoffEditorProps) {
  return (
    <div className="mt-3 rounded-xl border border-gray-200 bg-white overflow-hidden shadow-sm">
      {/* Header */}
      <div className="flex items-center gap-2 px-4 py-2.5 bg-gray-50 border-b border-gray-200">
        <Calendar size={13} className="text-gray-400" />
        <span className="text-xs font-semibold text-gray-600 tracking-wide uppercase">
          Business-day cut-off
        </span>
      </div>

      {/* Rule inputs */}
      <div className="px-4 py-3 flex items-center gap-2 flex-wrap">
        <span className="text-sm text-gray-600">Orders close</span>
        <input
          type="number"
          min={1}
          max={10}
          value={draft.businessDaysBefore}
          onChange={(e) => {
            const v = Math.max(1, Math.min(10, parseInt(e.target.value) || 1));
            onChange({ businessDaysBefore: v });
          }}
          aria-label="Business days before delivery"
          className="w-12 px-1.5 py-1.5 text-center text-sm font-bold rounded-md border-2 border-blue-200 text-blue-800 bg-white transition-all focus:outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-300"
        />
        <span className="text-sm text-gray-600">
          business day{draft.businessDaysBefore !== 1 ? "s" : ""} before delivery, at
        </span>
        <input
          type="time"
          value={draft.cutoffTime}
          onChange={(e) => onChange({ cutoffTime: e.target.value })}
          aria-label="Cut-off time"
          className="px-2 py-1.5 text-sm font-semibold rounded-md border-2 border-blue-200 text-blue-800 bg-white transition-all focus:outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-300"
        />
      </div>

      {/* Live mapping: delivery day → deadline */}
      <div className="px-4 pb-3">
        <div className="flex flex-wrap gap-1.5">
          {PREVIEW_ORDER.map((deliveryIdx) => {
            const isWeekend = deliveryIdx === 0 || deliveryIdx === 6;
            const dIdx = deadlineDayIndex(deliveryIdx, draft.businessDaysBefore);
            return (
              <span
                key={deliveryIdx}
                className={[
                  "inline-flex items-center gap-1 px-2 py-1 rounded-md text-[11px] font-medium whitespace-nowrap",
                  isWeekend
                    ? "bg-amber-50 text-amber-700 border border-amber-100"
                    : "bg-gray-50 text-gray-600 border border-gray-100",
                ].join(" ")}
              >
                <span className="font-bold">{DAY_ABBR_BY_INDEX[deliveryIdx]}</span>
                <ArrowRight size={9} className="opacity-50" />
                <span>
                  {DAY_ABBR_BY_INDEX[dIdx]} {formatCutoffTime(draft.cutoffTime)}
                </span>
              </span>
            );
          })}
        </div>
      </div>

      {/* Footer hint */}
      <div className="px-4 py-2 bg-gray-50 border-t border-gray-100">
        <p className="text-[10px] text-gray-400 leading-relaxed">
          Business days are Mon–Fri, so weekend and Monday deliveries all cut off on Friday.
        </p>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Main tab component
// ---------------------------------------------------------------------------

export const OrderTimingTab = ({ restaurantId }: Props) => {
  const state = useOrderTimingState(restaurantId);
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(new Set());
  const [previewItem, setPreviewItem] = useState<{
    item: NoticeHoursGroupItem;
    groupTitle: string;
  } | null>(null);

  const toggleExpanded = (groupTitle: string) => {
    setExpandedGroups((prev) => {
      const next = new Set(prev);
      if (next.has(groupTitle)) next.delete(groupTitle);
      else next.add(groupTitle);
      return next;
    });
  };

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
    groupBusinessCutoffDrafts,
    groupModeDrafts,
    setMinimumDeliveryNoticeHours,
    setAdvanceNoticeSettings,
    setMaxPortionsPerOrder,
    setEnableMaxPortionsPerOrder,
    setGroupDraft,
    setGroupMode,
    setGroupBusinessCutoff,
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
      subtitle="Advance notice, business-day cut-offs, and order size limits"
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
            Group order cut-offs
          </label>
          <p className="text-xs text-gray-500 mb-3">
            Override the default for specific menu groups — set a fixed advance
            notice in hours, or a business-day cut-off for groups whose orders
            must be placed by a deadline on the previous working day.
          </p>
          <div className="rounded-lg border border-gray-200 divide-y divide-gray-100 bg-white overflow-hidden">
            {noticeGroups.map((row) => {
              const draftRaw = noticeGroupDrafts[row.groupTitle] ?? "";
              const businessCutoffDraft = groupBusinessCutoffDrafts[row.groupTitle];
              const isExpanded = expandedGroups.has(row.groupTitle);
              const defaultHoursLabel = `${minimumDeliveryNoticeHours}h`;
              const groupMode = groupModeDrafts[row.groupTitle] ?? "default";

              const setMode = (mode: "default" | "hours" | "business_days") => {
                setGroupMode(row.groupTitle, mode);
                if (mode === "default") {
                  setGroupDraft(row.groupTitle, "");
                } else if (mode === "hours") {
                  if ((noticeGroupDrafts[row.groupTitle] ?? "").trim() === "") {
                    setGroupDraft(row.groupTitle, String(minimumDeliveryNoticeHours));
                  }
                } else {
                  setGroupDraft(row.groupTitle, "");
                }
              };

              return (
                <div key={row.groupTitle}>
                  <div className="flex flex-col gap-0 px-3 sm:px-4 py-3">
                    <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                      <button
                        type="button"
                        onClick={() => toggleExpanded(row.groupTitle)}
                        className="flex items-center gap-2 min-w-0 flex-1 text-left hover:opacity-80 transition-opacity"
                        aria-expanded={isExpanded}
                        aria-controls={`items-${row.groupTitle}`}
                      >
                        <ChevronRight
                          size={16}
                          className={`text-gray-400 flex-shrink-0 transition-transform ${isExpanded ? "rotate-90" : ""}`}
                        />
                        <div className="min-w-0 flex-1">
                          <div className="text-sm font-semibold text-gray-900 truncate">
                            {row.groupTitle}
                          </div>
                          <div className="text-xs text-gray-500">
                            {row.itemCount}{" "}
                            {row.itemCount === 1 ? "item" : "items"}
                          </div>
                        </div>
                      </button>
                      <div className="flex items-center gap-2 sm:flex-shrink-0">
                        <SegmentedToggle
                          options={[
                            { value: "default", label: `Default (${defaultHoursLabel})` },
                            { value: "hours", label: "Hours" },
                            { value: "business_days", label: "Business days" },
                          ]}
                          value={groupMode}
                          onChange={setMode}
                          accent="blue"
                          ariaLabel={`Notice mode for ${row.groupTitle}`}
                        />
                        {groupMode === "hours" && (
                          <div className="flex items-center gap-1.5">
                            <input
                              type="number"
                              min={0}
                              step={1}
                              inputMode="numeric"
                              value={draftRaw}
                              onChange={(e) =>
                                setGroupDraft(row.groupTitle, e.target.value)
                              }
                              aria-label={`Notice hours for ${row.groupTitle}`}
                              className="w-16 px-2 py-1.5 text-center text-sm font-bold border-2 border-blue-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 bg-white transition-all"
                              autoFocus
                            />
                            <span className="text-xs font-medium text-gray-600">
                              hours
                            </span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Business-day cut-off editor — renders inline when selected */}
                    {groupMode === "business_days" && businessCutoffDraft && (
                      <BusinessDayCutoffEditor
                        draft={businessCutoffDraft}
                        onChange={(patch) =>
                          setGroupBusinessCutoff(row.groupTitle, patch)
                        }
                      />
                    )}
                  </div>

                  {/* Item list expansion */}
                  {isExpanded && (
                    <div
                      id={`items-${row.groupTitle}`}
                      className="px-3 sm:px-4 pb-4 pt-1 pl-9 sm:pl-10 bg-gradient-to-b from-blue-50/40 to-transparent"
                    >
                      {row.items && row.items.length > 0 ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                          {row.items.map((item) => {
                            const image = item.images?.[0];
                            const price = formatPrice(item.price);
                            return (
                              <button
                                key={item.id}
                                type="button"
                                onClick={() =>
                                  setPreviewItem({
                                    item,
                                    groupTitle: row.groupTitle,
                                  })
                                }
                                className="group flex items-center gap-3 p-2 pr-3 text-left bg-white rounded-lg border border-gray-200 hover:border-blue-400 hover:shadow-md transition-all"
                              >
                                <div className="w-14 h-14 flex-shrink-0 rounded-md bg-gray-100 overflow-hidden relative">
                                  {image ? (
                                    // eslint-disable-next-line @next/next/no-img-element
                                    <img
                                      src={image}
                                      alt=""
                                      className="w-full h-full object-cover"
                                    />
                                  ) : (
                                    <div className="w-full h-full flex items-center justify-center text-gray-300">
                                      <ImageOff size={20} />
                                    </div>
                                  )}
                                </div>
                                <div className="min-w-0 flex-1">
                                  <div className="text-sm font-semibold text-gray-900 truncate group-hover:text-blue-700 transition-colors">
                                    {item.name}
                                  </div>
                                  {price && (
                                    <div className="text-xs font-semibold text-gray-700 mt-0.5">
                                      {price}
                                    </div>
                                  )}
                                </div>
                              </button>
                            );
                          })}
                        </div>
                      ) : row.itemCount === 0 ? (
                        <div className="text-xs text-gray-400 italic">
                          No active items in this group
                        </div>
                      ) : (
                        <div className="text-xs text-gray-400 italic">
                          Item list not available yet
                        </div>
                      )}
                    </div>
                  )}
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

      <MenuItemPreviewModal
        item={previewItem?.item ?? null}
        groupTitle={previewItem?.groupTitle ?? ""}
        restaurantId={restaurantId}
        onClose={() => setPreviewItem(null)}
      />
    </SettingsCard>
  );
};
