"use client";

import { useState } from "react";
import { Clock, Users, Loader, AlertCircle, Info } from "lucide-react";

interface OrderSettingsCardProps {
  minimumDeliveryNoticeHours: number;
  maxPortionsPerOrder: number | null;
  enableMaxPortionsPerOrder: boolean;
  onNoticeHoursChange: (value: number) => void;
  onMaxPortionsToggle: (enabled: boolean) => void;
  onMaxPortionsChange: (value: number) => void;
  onSave: () => void;
  saving: boolean;
}

export const OrderSettingsCard = ({
  minimumDeliveryNoticeHours,
  maxPortionsPerOrder,
  enableMaxPortionsPerOrder,
  onNoticeHoursChange,
  onMaxPortionsToggle,
  onMaxPortionsChange,
  onSave,
  saving,
}: OrderSettingsCardProps) => {
  const [validationError, setValidationError] = useState("");

  const handleSave = () => {
    if (minimumDeliveryNoticeHours < 0) {
      setValidationError("Notice hours cannot be negative");
      return;
    }
    if (enableMaxPortionsPerOrder && (maxPortionsPerOrder === null || maxPortionsPerOrder < 1)) {
      setValidationError("Max portions per order must be at least 1");
      return;
    }
    setValidationError("");
    onSave();
  };

  // Format hours into a readable string
  const formatNoticeTime = (hours: number) => {
    if (hours === 0) return "No advance notice required";
    if (hours < 24) return `${hours} hour${hours !== 1 ? "s" : ""} notice`;
    const days = Math.floor(hours / 24);
    const remainingHours = hours % 24;
    if (remainingHours === 0) return `${days} day${days !== 1 ? "s" : ""} notice`;
    return `${days} day${days !== 1 ? "s" : ""} ${remainingHours} hour${remainingHours !== 1 ? "s" : ""} notice`;
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
        {/* Minimum Notice Hours */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Minimum Advance Notice
          </label>
          <p className="text-xs text-gray-500 mb-3">
            How much notice do you need before accepting an order?
          </p>

          <div className="flex items-center gap-4">
            <input
              type="number"
              min="0"
              max="168"
              value={minimumDeliveryNoticeHours}
              onChange={(e) => {
                const value = parseInt(e.target.value) || 0;
                onNoticeHoursChange(Math.min(value, 168)); // Max 7 days
                if (validationError) setValidationError("");
              }}
              className="w-24 px-4 py-2.5 text-center text-xl font-bold border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 bg-white transition-all"
              placeholder="24"
            />
            <span className="text-sm font-medium text-gray-600">hours</span>
          </div>

          {/* Preview */}
          <div className="flex items-center gap-2 mt-3 p-3 bg-blue-50 rounded-lg border border-blue-200">
            <Info size={16} className="text-blue-600 flex-shrink-0" />
            <span className="text-sm text-blue-800">
              Customers will see: <strong>&quot;{formatNoticeTime(minimumDeliveryNoticeHours)}&quot;</strong>
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
