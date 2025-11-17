"use client";

import { TrendingUp, Loader, Info, Plus, X } from "lucide-react";

interface IngredientItem {
  id: string;
  name: string;
  maxPerSession: number;
  remaining?: number;
}

interface CorporateInventoryCardProps {
  sessionResetPeriod: "daily" | "lunch_dinner" | null;
  maxPortionsPerSession: number | null;
  enablePortionLimit: boolean;
  enableIngredientTracking: boolean;
  ingredients: IngredientItem[];
  newIngredientName: string;
  newIngredientMax: number;
  onResetPeriodChange: (period: "daily" | "lunch_dinner" | null) => void;
  onPortionLimitToggle: (enabled: boolean) => void;
  onMaxPortionsChange: (value: number) => void;
  onIngredientTrackingToggle: (enabled: boolean) => void;
  onIngredientAdd: () => void;
  onIngredientRemove: (id: string) => void;
  onIngredientUpdate: (id: string, max: number) => void;
  onNewIngredientNameChange: (name: string) => void;
  onNewIngredientMaxChange: (max: number) => void;
  onSave: () => void;
  saving: boolean;
}

export const CorporateInventoryCard = ({
  sessionResetPeriod,
  maxPortionsPerSession,
  enablePortionLimit,
  enableIngredientTracking,
  ingredients,
  newIngredientName,
  newIngredientMax,
  onResetPeriodChange,
  onPortionLimitToggle,
  onMaxPortionsChange,
  onIngredientTrackingToggle,
  onIngredientAdd,
  onIngredientRemove,
  onIngredientUpdate,
  onNewIngredientNameChange,
  onNewIngredientMaxChange,
  onSave,
  saving,
}: CorporateInventoryCardProps) => {
  return (
    <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
      {/* Header */}
      <div className="bg-emerald-600 px-6 py-5">
        <div className="flex items-center gap-3">
          <div className="bg-white/20 backdrop-blur-sm rounded-lg p-2.5">
            <TrendingUp className="text-white" size={24} />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white">
              Corporate Session Inventory
            </h3>
            <p className="text-emerald-100 text-sm mt-0.5">
              Manage portions and ingredients per session
            </p>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-6 space-y-6">
        {/* Session Reset Period */}
        <div>
          <label className="block text-sm font-bold text-gray-900 mb-4">
            Session Reset Schedule
          </label>

          <div className="space-y-3">
            <label className="flex items-start p-4 border-2 border-gray-200 rounded-xl cursor-pointer hover:bg-gray-50 transition-colors has-[:checked]:border-emerald-500 has-[:checked]:bg-emerald-50">
              <input
                type="radio"
                name="resetPeriod"
                value="daily"
                checked={sessionResetPeriod === "daily"}
                onChange={() => onResetPeriodChange("daily")}
                className="mt-1 mr-3"
              />
              <div>
                <div className="font-semibold text-gray-900">Daily (Midnight)</div>
                <div className="text-sm text-gray-600 mt-0.5">Reset once per day at 00:00</div>
              </div>
            </label>

            <label className="flex items-start p-4 border-2 border-gray-200 rounded-xl cursor-pointer hover:bg-gray-50 transition-colors has-[:checked]:border-emerald-500 has-[:checked]:bg-emerald-50">
              <input
                type="radio"
                name="resetPeriod"
                value="lunch_dinner"
                checked={sessionResetPeriod === "lunch_dinner"}
                onChange={() => onResetPeriodChange("lunch_dinner")}
                className="mt-1 mr-3"
              />
              <div>
                <div className="font-semibold text-gray-900">Lunch & Dinner</div>
                <div className="text-sm text-gray-600 mt-0.5">Reset at 12:00 (lunch) and 18:00 (dinner)</div>
              </div>
            </label>

            <label className="flex items-start p-4 border-2 border-gray-200 rounded-xl cursor-pointer hover:bg-gray-50 transition-colors has-[:checked]:border-emerald-500 has-[:checked]:bg-emerald-50">
              <input
                type="radio"
                name="resetPeriod"
                value="disabled"
                checked={sessionResetPeriod === null}
                onChange={() => onResetPeriodChange(null)}
                className="mt-1 mr-3"
              />
              <div>
                <div className="font-semibold text-gray-900">Disabled</div>
                <div className="text-sm text-gray-600 mt-0.5">No inventory tracking</div>
              </div>
            </label>
          </div>
        </div>

        {/* Max Portions Per Session */}
        {sessionResetPeriod && (
          <>
            <div className="border-t border-gray-100 pt-6">
              <div className="flex items-center justify-between mb-4">
                <label className="text-sm font-bold text-gray-900">
                  Max Portions Per Session
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={enablePortionLimit}
                    onChange={(e) => onPortionLimitToggle(e.target.checked)}
                    className="rounded"
                  />
                  <span className="text-sm font-medium text-gray-600">Enable</span>
                </label>
              </div>

              {enablePortionLimit && (
                <div className="flex items-center gap-3">
                  <input
                    type="number"
                    min="0"
                    value={maxPortionsPerSession ?? 100}
                    onChange={(e) => onMaxPortionsChange(parseInt(e.target.value) || 0)}
                    className="w-40 px-4 py-3 text-lg font-semibold border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-gray-900 bg-white"
                    placeholder="100"
                  />
                  <span className="text-sm text-gray-500">portions</span>
                </div>
              )}
            </div>

            {/* Limited Ingredients */}
            <div className="border-t border-gray-100 pt-6">
              <div className="flex items-center justify-between mb-4">
                <label className="text-sm font-bold text-gray-900">
                  Limited Ingredients
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={enableIngredientTracking}
                    onChange={(e) => onIngredientTrackingToggle(e.target.checked)}
                    className="rounded"
                  />
                  <span className="text-sm font-medium text-gray-600">Enable</span>
                </label>
              </div>

              {enableIngredientTracking && (
                <div className="space-y-4">
                  {/* Existing Ingredients */}
                  {ingredients.length > 0 && (
                    <div className="space-y-2">
                      {ingredients.map((ingredient) => (
                        <div
                          key={ingredient.id}
                          className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg border border-gray-100"
                        >
                          <div className="flex-1">
                            <div className="font-semibold text-gray-900 capitalize">
                              {ingredient.name}
                            </div>
                            {ingredient.remaining !== undefined && (
                              <div className="text-xs text-gray-600 mt-0.5">
                                Remaining: {ingredient.remaining} / {ingredient.maxPerSession}
                              </div>
                            )}
                          </div>
                          <input
                            type="number"
                            min="0"
                            value={ingredient.maxPerSession}
                            onChange={(e) => onIngredientUpdate(ingredient.id, parseInt(e.target.value) || 0)}
                            className="w-24 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-gray-900 bg-white"
                          />
                          <button
                            onClick={() => onIngredientRemove(ingredient.id)}
                            className="text-red-500 hover:text-red-700 p-2 hover:bg-red-50 rounded-lg transition-colors"
                          >
                            <X size={20} />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Add New Ingredient */}
                  <div className="border-2 border-dashed border-gray-300 rounded-xl p-4 bg-gray-50">
                    <div className="flex gap-3">
                      <input
                        type="text"
                        value={newIngredientName}
                        onChange={(e) => onNewIngredientNameChange(e.target.value)}
                        placeholder="e.g., chicken, lobster"
                        className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-gray-900 bg-white"
                      />
                      <input
                        type="number"
                        min="0"
                        value={newIngredientMax}
                        onChange={(e) => onNewIngredientMaxChange(parseInt(e.target.value) || 0)}
                        placeholder="Max"
                        className="w-24 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-gray-900 bg-white"
                      />
                      <button
                        onClick={onIngredientAdd}
                        className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 font-medium transition-colors"
                      >
                        <Plus size={20} />
                        Add
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Info Box */}
            <div className="flex items-start gap-3 p-4 bg-emerald-50 rounded-xl border border-emerald-100">
              <Info size={18} className="text-emerald-600 mt-0.5 flex-shrink-0" />
              <div className="text-sm text-gray-700">
                <span className="font-semibold">Note:</span> Inventory resets automatically based on your schedule. Orders exceeding limits will be rejected.
              </div>
            </div>
          </>
        )}

        {/* Save Button */}
        <button
          onClick={onSave}
          disabled={saving}
          className="w-full sm:w-auto bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 px-8 rounded-xl transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20"
        >
          {saving ? (
            <>
              <Loader size={20} className="animate-spin" />
              Saving...
            </>
          ) : (
            "Save Corporate Inventory"
          )}
        </button>
      </div>
    </div>
  );
};
