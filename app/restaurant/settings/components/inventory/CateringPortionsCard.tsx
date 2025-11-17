"use client";

import { useState, useEffect } from "react";
import { Package, Clock, Loader, AlertCircle } from "lucide-react";

interface CateringPortionsCardProps {
  maxPortions: number;
  currentData: any;
  onMaxChange: (value: number) => void;
  onSave: () => void;
  saving: boolean;
}

export const CateringPortionsCard = ({
  maxPortions,
  currentData,
  onMaxChange,
  onSave,
  saving,
}: CateringPortionsCardProps) => {
  const [validationError, setValidationError] = useState("");
  const [initialMaxPortions, setInitialMaxPortions] = useState(maxPortions);

  useEffect(() => {
    setInitialMaxPortions(maxPortions);
  }, [currentData]);

  const hasChanges = initialMaxPortions !== maxPortions;

  const handleSave = () => {
    if (maxPortions < 10) {
      setValidationError("Minimum portion limit is 10. Please enter at least 10 portions.");
      return;
    }
    setValidationError("");
    onSave();
  };
  return (
    <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
      {/* Header */}
      <div className="bg-emerald-600 px-6 py-5">
        <div className="flex items-center gap-3">
          <div className="bg-white/20 backdrop-blur-sm rounded-lg p-2.5">
            <Package className="text-white" size={24} />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white">
              Daily Catering Limit
            </h3>
            <p className="text-emerald-100 text-sm mt-0.5">
              Set maximum portions per day
            </p>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-6 space-y-5">
        {/* Current Status */}
        {currentData && (
          <div className="bg-gradient-to-br from-emerald-50 to-emerald-50/50 rounded-lg p-5 border border-emerald-200/50">
            <div className="flex items-center justify-between mb-4">
              <div>
                <div className="text-xs font-semibold text-emerald-700 uppercase tracking-wide mb-1">
                  Today&apos;s Portions Ordered
                </div>
                <div className="text-2xl font-bold text-gray-900">
                  {currentData.cateringPortionsToday}
                  <span className="text-lg text-gray-500 font-normal"> / {currentData.maximumCateringPortionsPerDay}</span>
                </div>
              </div>
              <div className="text-right">
                <div className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">
                  Remaining
                </div>
                <div className="text-2xl font-bold text-emerald-600">
                  {currentData.remainingPortions}
                </div>
              </div>
            </div>

            {/* Progress Bar */}
            <div className="relative">
              <div className="w-full bg-white rounded-full h-2.5 overflow-hidden shadow-inner">
                <div
                  className={`h-2.5 rounded-full transition-all duration-500 ${
                    (currentData.cateringPortionsToday / currentData.maximumCateringPortionsPerDay) * 100 > 90
                      ? "bg-gradient-to-r from-red-500 to-red-600"
                      : (currentData.cateringPortionsToday / currentData.maximumCateringPortionsPerDay) * 100 > 70
                      ? "bg-gradient-to-r from-yellow-400 to-yellow-500"
                      : "bg-gradient-to-r from-green-500 to-green-600"
                  }`}
                  style={{
                    width: `${Math.min(
                      (currentData.cateringPortionsToday / currentData.maximumCateringPortionsPerDay) * 100,
                      100
                    )}%`,
                  }}
                />
              </div>
              <div className="flex justify-end mt-2">
                <span className="text-xs font-medium text-gray-600">
                  {Math.round((currentData.cateringPortionsToday / currentData.maximumCateringPortionsPerDay) * 100)}% capacity
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Input */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Maximum Portions Per Day
          </label>
          <div className="flex items-center gap-4">
            <input
              type="number"
              min="1"
              value={maxPortions}
              onChange={(e) => {
                const value = parseInt(e.target.value) || 0;
                onMaxChange(value);
                if (validationError) setValidationError("");
              }}
              className={`w-32 px-4 py-2.5 text-center text-xl font-bold border-2 rounded-lg focus:ring-2 text-gray-900 bg-white transition-all ${
                validationError
                  ? "border-red-300 focus:ring-red-500 focus:border-red-500"
                  : "border-gray-300 focus:ring-emerald-500 focus:border-emerald-500"
              }`}
              placeholder="150"
            />
            <span className="text-sm font-medium text-gray-600">portions per day</span>
          </div>
          {validationError ? (
            <div className="flex items-start gap-2 mt-2 p-3 bg-red-50 border border-red-200 rounded-lg">
              <AlertCircle size={16} className="text-red-600 mt-0.5 flex-shrink-0" />
              <p className="text-xs text-red-700 font-medium">{validationError}</p>
            </div>
          ) : (
            <p className="text-xs text-gray-500 mt-2 ml-0.5">
              Orders exceeding this limit will be automatically rejected
            </p>
          )}
        </div>

        {/* Reset Info */}
        <div className="flex items-start gap-3 p-3.5 bg-gray-50 rounded-lg border border-gray-200">
          <Clock size={16} className="text-gray-600 mt-0.5 flex-shrink-0" />
          <div className="text-xs text-gray-700">
            <span className="font-semibold text-gray-900">Auto-reset:</span> Every day at 12:00 AM (midnight) UTC
          </div>
        </div>

        {/* Save Button */}
        <div className="pt-2">
          <button
            onClick={handleSave}
            disabled={saving}
            className="w-full sm:w-auto bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-2.5 px-6 rounded-lg transition-all disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-sm"
          >
            {saving ? (
              <>
                <Loader size={18} className="animate-spin" />
                Saving...
              </>
            ) : (
              "Save Changes"
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
