"use client";

import { useState } from "react";
import { Clock, Users, Loader, AlertCircle, Info, Calendar } from "lucide-react";
import { AdvanceNoticeSettings } from "@/types/inventory.types";

interface OrderSettingsCardProps {
  minimumDeliveryNoticeHours: number;
  maxPortionsPerOrder: number | null;
  enableMaxPortionsPerOrder: boolean;
  advanceNoticeSettings: AdvanceNoticeSettings | null;
  onNoticeHoursChange: (value: number) => void;
  onMaxPortionsToggle: (enabled: boolean) => void;
  onMaxPortionsChange: (value: number) => void;
  onAdvanceNoticeChange: (settings: AdvanceNoticeSettings | null) => void;
  onSave: () => void;
  saving: boolean;
}

export const OrderSettingsCard = ({
  minimumDeliveryNoticeHours,
  maxPortionsPerOrder,
  enableMaxPortionsPerOrder,
  advanceNoticeSettings,
  onNoticeHoursChange,
  onMaxPortionsToggle,
  onMaxPortionsChange,
  onAdvanceNoticeChange,
  onSave,
  saving,
}: OrderSettingsCardProps) => {
  const [validationError, setValidationError] = useState("");

  const noticeType = advanceNoticeSettings?.type ?? "hours";

  const handleNoticeTypeChange = (type: "hours" | "days_before_time") => {
    if (type === "hours") {
      onAdvanceNoticeChange({ type: "hours", hours: minimumDeliveryNoticeHours || 48 });
    } else {
      onAdvanceNoticeChange({ type: "days_before_time", days: 2, cutoffTime: "18:00" });
    }
    if (validationError) setValidationError("");
  };

  const handleHoursChange = (hours: number) => {
    const clamped = Math.min(hours, 168);
    onNoticeHoursChange(clamped);
    onAdvanceNoticeChange({ type: "hours", hours: clamped });
    if (validationError) setValidationError("");
  };

  const handleDaysChange = (days: number) => {
    const clamped = Math.min(Math.max(days, 1), 14);
    onAdvanceNoticeChange({
      ...advanceNoticeSettings!,
      type: "days_before_time",
      days: clamped,
    });
    if (validationError) setValidationError("");
  };

  const handleCutoffTimeChange = (cutoffTime: string) => {
    onAdvanceNoticeChange({
      ...advanceNoticeSettings!,
      type: "days_before_time",
      cutoffTime,
    });
    if (validationError) setValidationError("");
  };

  const handleSave = () => {
    if (noticeType === "hours") {
      const hours = advanceNoticeSettings?.hours ?? minimumDeliveryNoticeHours;
      if (hours < 0) {
        setValidationError("Notice hours cannot be negative");
        return;
      }
    } else {
      if (!advanceNoticeSettings?.days || advanceNoticeSettings.days < 1) {
        setValidationError("Days must be at least 1");
        return;
      }
      if (!advanceNoticeSettings?.cutoffTime) {
        setValidationError("Please set a cutoff time");
        return;
      }
    }
    if (enableMaxPortionsPerOrder && (maxPortionsPerOrder === null || maxPortionsPerOrder < 1)) {
      setValidationError("Max portions per order must be at least 1");
      return;
    }
    setValidationError("");
    onSave();
  };

  // Format for preview
  const formatNoticePreview = () => {
    if (noticeType === "hours") {
      const hours = advanceNoticeSettings?.hours ?? minimumDeliveryNoticeHours;
      if (hours === 0) return "No advance notice required";
      if (hours < 24) return `${hours} hour${hours !== 1 ? "s" : ""} notice`;
      const days = Math.floor(hours / 24);
      const remaining = hours % 24;
      if (remaining === 0) return `${days} day${days !== 1 ? "s" : ""} notice`;
      return `${days} day${days !== 1 ? "s" : ""} ${remaining} hour${remaining !== 1 ? "s" : ""} notice`;
    } else {
      const days = advanceNoticeSettings?.days ?? 2;
      const time = advanceNoticeSettings?.cutoffTime ?? "18:00";
      // Format time for display (e.g., "18:00" → "6:00 PM")
      const [h, m] = time.split(":").map(Number);
      const period = h >= 12 ? "PM" : "AM";
      const displayHour = h === 0 ? 12 : h > 12 ? h - 12 : h;
      const displayTime = `${displayHour}:${m.toString().padStart(2, "0")} ${period}`;
      return `Order ${days} day${days !== 1 ? "s" : ""} before (by ${displayTime.toLowerCase()})`;
    }
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
      {/* Header */}
      <div className="bg-blue-600 px-6 py-5">
        <div className="flex items-center gap-3">
          <div className="bg-white/20 backdrop-blur-sm rounded-lg p-2.5">
            <Clock className="text-white" size={24} />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white">Order Settings</h3>
            <p className="text-blue-100 text-sm mt-0.5">
              Configure order requirements
            </p>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-6 space-y-6">
        {/* Minimum Advance Notice */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Minimum Advance Notice
          </label>
          <p className="text-xs text-gray-500 mb-3">
            How much notice do you need before accepting an order?
          </p>

          {/* Notice Type Selector */}
          <div className="flex gap-2 mb-4">
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

          {/* Hours Mode */}
          {noticeType === "hours" && (
            <div className="flex items-center gap-4">
              <input
                type="number"
                min="0"
                max="168"
                value={advanceNoticeSettings?.hours ?? minimumDeliveryNoticeHours}
                onChange={(e) => handleHoursChange(parseInt(e.target.value) || 0)}
                className="w-24 px-4 py-2.5 text-center text-xl font-bold border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 bg-white transition-all"
                placeholder="24"
              />
              <span className="text-sm font-medium text-gray-600">hours before event</span>
            </div>
          )}

          {/* Days Before Time Mode */}
          {noticeType === "days_before_time" && (
            <div className="p-4 bg-gray-50 rounded-lg border border-gray-200 space-y-4">
              <div className="flex items-center gap-4">
                <input
                  type="number"
                  min="1"
                  max="14"
                  value={advanceNoticeSettings?.days ?? 2}
                  onChange={(e) => handleDaysChange(parseInt(e.target.value) || 1)}
                  className="w-20 px-3 py-2.5 text-center text-xl font-bold border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 bg-white transition-all"
                  placeholder="2"
                />
                <span className="text-sm font-medium text-gray-600">day(s) before</span>
                <input
                  type="time"
                  value={advanceNoticeSettings?.cutoffTime ?? "18:00"}
                  onChange={(e) => handleCutoffTimeChange(e.target.value)}
                  className="px-3 py-2.5 text-lg font-bold border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 bg-white transition-all"
                />
              </div>
              <p className="text-xs text-gray-500">
                E.g. &quot;2 days before 6:00 PM&quot; means orders for Wednesday must be placed by Monday 6:00 PM
              </p>
            </div>
          )}

          {/* Preview */}
          <div className="flex items-center gap-2 mt-3 p-3 bg-blue-50 rounded-lg border border-blue-200">
            <Info size={16} className="text-blue-600 flex-shrink-0" />
            <span className="text-sm text-blue-800">
              Customers will see: <strong>&quot;{formatNoticePreview()}&quot;</strong>
            </span>
          </div>
        </div>

        {/* Divider */}
        <div className="border-t border-gray-200" />

        {/* Max Portions Per Order */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <div>
              <label className="block text-sm font-semibold text-gray-700">
                Maximum Portions Per Order
              </label>
              <p className="text-xs text-gray-500 mt-0.5">
                Limit the number of portions in a single order
              </p>
            </div>
            <button
              type="button"
              onClick={() => onMaxPortionsToggle(!enableMaxPortionsPerOrder)}
              className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
                enableMaxPortionsPerOrder ? "bg-blue-600" : "bg-gray-200"
              }`}
            >
              <span
                className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                  enableMaxPortionsPerOrder ? "translate-x-5" : "translate-x-0"
                }`}
              />
            </button>
          </div>

          {enableMaxPortionsPerOrder && (
            <div className="mt-3 p-4 bg-gray-50 rounded-lg border border-gray-200">
              <div className="flex items-center gap-4">
                <div className="bg-white rounded-lg p-2 border border-gray-200">
                  <Users size={20} className="text-blue-600" />
                </div>
                <div className="flex items-center gap-3">
                  <input
                    type="number"
                    min="1"
                    value={maxPortionsPerOrder || ""}
                    onChange={(e) => {
                      const value = parseInt(e.target.value) || 0;
                      onMaxPortionsChange(value);
                      if (validationError) setValidationError("");
                    }}
                    className="w-24 px-3 py-2 text-center text-lg font-bold border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 bg-white transition-all"
                    placeholder="50"
                  />
                  <span className="text-sm font-medium text-gray-600">
                    portions max per order
                  </span>
                </div>
              </div>
              <p className="text-xs text-gray-500 mt-3">
                Orders exceeding this limit will need to be split into multiple orders
              </p>
            </div>
          )}
        </div>

        {/* Validation Error */}
        {validationError && (
          <div className="flex items-start gap-2 p-3 bg-red-50 border border-red-200 rounded-lg">
            <AlertCircle size={16} className="text-red-600 mt-0.5 flex-shrink-0" />
            <p className="text-xs text-red-700 font-medium">{validationError}</p>
          </div>
        )}

        {/* Save Button */}
        <div className="pt-2">
          <button
            onClick={handleSave}
            disabled={saving}
            className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2.5 px-6 rounded-lg transition-all disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-sm"
          >
            {saving ? (
              <>
                <Loader size={18} className="animate-spin" />
                Saving...
              </>
            ) : (
              "Save Order Settings"
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
