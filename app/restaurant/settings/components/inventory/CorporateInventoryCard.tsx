"use client";

import { useState, useEffect } from "react";
import { TrendingUp, Loader, Info, Plus, X, HelpCircle } from "lucide-react";

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
  // Track initial state to detect changes
  const [initialState, setInitialState] = useState({
    sessionResetPeriod,
    maxPortionsPerSession,
    enablePortionLimit,
    enableIngredientTracking,
    ingredients: JSON.stringify(ingredients),
  });

  useEffect(() => {
    setInitialState({
      sessionResetPeriod,
      maxPortionsPerSession,
      enablePortionLimit,
      enableIngredientTracking,
      ingredients: JSON.stringify(ingredients),
    });
  }, [sessionResetPeriod, maxPortionsPerSession, enablePortionLimit, enableIngredientTracking, ingredients]);

  const hasChanges =
    initialState.sessionResetPeriod !== sessionResetPeriod ||
    initialState.maxPortionsPerSession !== maxPortionsPerSession ||
    initialState.enablePortionLimit !== enablePortionLimit ||
    initialState.enableIngredientTracking !== enableIngredientTracking ||
    initialState.ingredients !== JSON.stringify(ingredients);

  return (
    <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
      {/* Header */}
      <div className="bg-purple-600 px-6 py-5">
        <div className="flex items-center gap-3">
          <div className="bg-white/20 backdrop-blur-sm rounded-lg p-2.5">
            <TrendingUp className="text-white" size={24} />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white">
              Corporate Session Inventory
            </h3>
            <p className="text-purple-100 text-sm mt-0.5">
              Manage portions and ingredients per session
            </p>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-6 space-y-5">
        {/* Session Reset Period */}
        <div className="bg-gradient-to-br from-purple-50 to-purple-50/30 rounded-lg p-5 border border-purple-200/50">
          <div className="flex items-center gap-2 mb-3">
            <label className="text-sm font-semibold text-gray-900">
              Session Reset Schedule
            </label>
            <div className="group relative">
              <HelpCircle size={16} className="text-gray-400 cursor-help" />
              <div className="absolute left-1/2 -translate-x-1/2 bottom-full mb-2 hidden group-hover:block w-64 p-3 bg-gray-900 text-white text-xs rounded-lg shadow-lg z-10">
                <div className="font-semibold mb-1">How inventory resets</div>
                <div>Choose when your corporate inventory limits automatically reset. This determines how often portions and ingredients become available again.</div>
                <div className="absolute left-1/2 -translate-x-1/2 top-full w-0 h-0 border-x-4 border-x-transparent border-t-4 border-t-gray-900"></div>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <label className="flex items-center gap-3 p-3 bg-white border-2 border-gray-200 rounded-lg cursor-pointer hover:border-purple-300 transition-all has-[:checked]:border-purple-500 has-[:checked]:bg-purple-50/50">
              <input
                type="radio"
                name="resetPeriod"
                value="daily"
                checked={sessionResetPeriod === "daily"}
                onChange={() => onResetPeriodChange("daily")}
                className="w-4 h-4 text-purple-600"
              />
              <div className="flex-1">
                <div className="font-medium text-gray-900">Daily at Midnight</div>
                <div className="text-xs text-gray-500 mt-0.5">Resets once per day at 00:00</div>
              </div>
            </label>

            <label className="flex items-center gap-3 p-3 bg-white border-2 border-gray-200 rounded-lg cursor-pointer hover:border-purple-300 transition-all has-[:checked]:border-purple-500 has-[:checked]:bg-purple-50/50">
              <input
                type="radio"
                name="resetPeriod"
                value="lunch_dinner"
                checked={sessionResetPeriod === "lunch_dinner"}
                onChange={() => onResetPeriodChange("lunch_dinner")}
                className="w-4 h-4 text-purple-600"
              />
              <div className="flex-1">
                <div className="font-medium text-gray-900">Lunch & Dinner</div>
                <div className="text-xs text-gray-500 mt-0.5">Resets at 12:00 (lunch) and 18:00 (dinner)</div>
              </div>
            </label>

            <label className="flex items-center gap-3 p-3 bg-white border-2 border-gray-200 rounded-lg cursor-pointer hover:border-purple-300 transition-all has-[:checked]:border-purple-500 has-[:checked]:bg-purple-50/50">
              <input
                type="radio"
                name="resetPeriod"
                value="disabled"
                checked={sessionResetPeriod === null}
                onChange={() => onResetPeriodChange(null)}
                className="w-4 h-4 text-purple-600"
              />
              <div className="flex-1">
                <div className="font-medium text-gray-900">Disabled</div>
                <div className="text-xs text-gray-500 mt-0.5">No inventory tracking</div>
              </div>
            </label>
          </div>
        </div>

        {/* Max Portions Per Session */}
        {sessionResetPeriod && (
          <>
            <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <div className="text-sm font-semibold text-gray-900">Max Portions Per Session</div>
                  <div className="text-xs text-gray-500 mt-0.5">Limit total portions per reset period</div>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={enablePortionLimit}
                    onChange={(e) => onPortionLimitToggle(e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-300 peer-focus:ring-2 peer-focus:ring-purple-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
                </label>
              </div>

              {enablePortionLimit && (
                <div className="flex items-center gap-3 pt-2">
                  <input
                    type="number"
                    min="0"
                    value={maxPortionsPerSession ?? 100}
                    onChange={(e) => onMaxPortionsChange(parseInt(e.target.value) || 0)}
                    className="w-32 px-4 py-2.5 text-center text-xl font-bold border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 text-gray-900 bg-white"
                    placeholder="100"
                  />
                  <span className="text-sm font-medium text-gray-600">portions per session</span>
                </div>
              )}
            </div>

            {/* Limited Ingredients */}
            <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <div className="text-sm font-semibold text-gray-900">Limited Ingredients</div>
                  <div className="text-xs text-gray-500 mt-0.5">Track specific ingredients per session</div>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={enableIngredientTracking}
                    onChange={(e) => onIngredientTrackingToggle(e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-300 peer-focus:ring-2 peer-focus:ring-purple-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
                </label>
              </div>

              {enableIngredientTracking && (
                <div className="space-y-3 pt-2">
                  {/* Existing Ingredients */}
                  {ingredients.length > 0 && (
                    <div className="space-y-2">
                      {ingredients.map((ingredient) => (
                        <div
                          key={ingredient.id}
                          className="flex items-center gap-2 p-2.5 bg-white rounded-lg border border-gray-200"
                        >
                          <div className="flex-1 min-w-0">
                            <div className="font-medium text-gray-900 capitalize text-sm truncate">
                              {ingredient.name}
                            </div>
                            {ingredient.remaining !== undefined && (
                              <div className="text-xs text-gray-500">
                                {ingredient.remaining} / {ingredient.maxPerSession} left
                              </div>
                            )}
                          </div>
                          <input
                            type="number"
                            min="0"
                            value={ingredient.maxPerSession}
                            onChange={(e) => onIngredientUpdate(ingredient.id, parseInt(e.target.value) || 0)}
                            className="w-20 px-3 py-1.5 text-center border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-purple-500 text-gray-900 bg-white text-sm font-semibold"
                          />
                          <button
                            onClick={() => onIngredientRemove(ingredient.id)}
                            className="text-red-500 hover:text-red-700 p-1.5 hover:bg-red-50 rounded-md transition-colors"
                          >
                            <X size={16} />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Add New Ingredient */}
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-3 bg-white">
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={newIngredientName}
                        onChange={(e) => onNewIngredientNameChange(e.target.value)}
                        placeholder="Ingredient name"
                        className="flex-1 px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-purple-500 text-gray-900 bg-white"
                      />
                      <input
                        type="number"
                        min="0"
                        value={newIngredientMax}
                        onChange={(e) => onNewIngredientMaxChange(parseInt(e.target.value) || 0)}
                        placeholder="Max"
                        className="w-20 px-3 py-2 text-sm text-center border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-purple-500 text-gray-900 bg-white"
                      />
                      <button
                        onClick={onIngredientAdd}
                        className="bg-purple-600 hover:bg-purple-700 text-white px-3 py-2 rounded-md flex items-center gap-1.5 font-medium transition-colors text-sm"
                      >
                        <Plus size={16} />
                        Add
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Info Box */}
            <div className="flex items-start gap-2 p-3 bg-purple-50 rounded-lg border border-purple-200">
              <Info size={16} className="text-purple-600 mt-0.5 flex-shrink-0" />
              <div className="text-xs text-gray-700">
                <span className="font-semibold text-gray-900">Note:</span> Inventory resets automatically. Orders exceeding limits will be rejected.
              </div>
            </div>
          </>
        )}

        {/* Save Button */}
        <div className="pt-2">
          <button
            onClick={onSave}
            disabled={saving || !hasChanges}
            className={`w-full sm:w-auto font-semibold py-2.5 px-6 rounded-lg transition-all flex items-center justify-center gap-2 shadow-sm ${
              hasChanges && !saving
                ? "bg-purple-600 hover:bg-purple-700 text-white"
                : "bg-gray-200 text-gray-400 cursor-not-allowed"
            }`}
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
