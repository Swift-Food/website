"use client";

import { TrendingUp, Info, Plus, X, HelpCircle, Loader } from "lucide-react";
import { SettingsCard } from "../components/SettingsCard";
import { NumberFieldWithUnit } from "../components/NumberFieldWithUnit";
import { ToggleRow } from "../components/ToggleRow";
import { SaveBar } from "../components/SaveBar";
import { useKitchenCapacityState } from "../hooks/useKitchenCapacityState";
import { SessionResetPeriod } from "@/types/inventory.types";

interface Props {
  restaurantId: string;
}

const RESET_OPTIONS: Array<{
  value: SessionResetPeriod;
  label: string;
  hint: string;
}> = [
  { value: "daily", label: "Daily at midnight", hint: "Resets once per day at 00:00" },
  { value: "lunch_dinner", label: "Lunch & dinner", hint: "Resets at 12:00 (lunch) and 18:00 (dinner)" },
  { value: null, label: "No session limits", hint: "Unlimited orders — capacity never resets" },
];

/**
 * Kitchen Capacity tab — internal limits: how many portions the kitchen can
 * make per session and which ingredients we run out of. Only relevant for
 * restaurants that take catering or corporate orders.
 */
export const KitchenCapacityTab = ({ restaurantId }: Props) => {
  const state = useKitchenCapacityState(restaurantId);

  if (state.loading) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-8 flex items-center justify-center gap-3 text-gray-600">
        <Loader className="animate-spin" size={20} />
        <span>Loading kitchen capacity…</span>
      </div>
    );
  }

  const {
    sessionResetPeriod,
    maxPortionsPerSession,
    portionsRemaining,
    enablePortionLimit,
    enableIngredientTracking,
    ingredients,
    newIngredientName,
    newIngredientMax,
    setSessionResetPeriod,
    setMaxPortionsPerSession,
    setEnablePortionLimit,
    setEnableIngredientTracking,
    setNewIngredientName,
    setNewIngredientMax,
    addIngredient,
    removeIngredient,
    updateIngredientMax,
  } = state;

  const portionsUsed =
    maxPortionsPerSession && portionsRemaining !== null
      ? maxPortionsPerSession - portionsRemaining
      : null;
  const usagePercent =
    maxPortionsPerSession && portionsUsed !== null
      ? Math.round((portionsUsed / maxPortionsPerSession) * 100)
      : null;

  return (
    <SettingsCard
      icon={TrendingUp}
      title="Kitchen Capacity"
      subtitle="How many portions your kitchen can make per session"
      accent="purple"
      footer={
        <SaveBar
          label="Save Capacity"
          saving={state.saving}
          enabled={state.hasChanges}
          onClick={state.save}
          success={state.success}
          error={state.error}
          accent="purple"
        />
      }
    >
      {/* Current usage banner — only when limits are on and remaining is known */}
      {enablePortionLimit &&
        maxPortionsPerSession > 0 &&
        portionsRemaining !== null &&
        portionsUsed !== null && (
          <div className="bg-gradient-to-br from-purple-50 to-purple-50/30 rounded-lg p-5 border border-purple-200/50">
            <div className="flex items-center justify-between mb-4">
              <div>
                <div className="text-xs font-semibold text-purple-700 uppercase tracking-wide mb-1">
                  Portions used this session
                </div>
                <div className="text-2xl font-bold text-gray-900">
                  {portionsUsed}
                  <span className="text-lg text-gray-500 font-normal">
                    {" "}/ {maxPortionsPerSession}
                  </span>
                </div>
              </div>
              <div className="text-right">
                <div className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">
                  Remaining
                </div>
                <div className="text-2xl font-bold text-purple-600">
                  {portionsRemaining}
                </div>
              </div>
            </div>
            <div className="w-full bg-white rounded-full h-2.5 overflow-hidden shadow-inner">
              <div
                className={`h-2.5 rounded-full transition-all duration-500 ${
                  (usagePercent ?? 0) > 90
                    ? "bg-gradient-to-r from-red-500 to-red-600"
                    : (usagePercent ?? 0) > 70
                      ? "bg-gradient-to-r from-yellow-400 to-yellow-500"
                      : "bg-gradient-to-r from-green-500 to-green-600"
                }`}
                style={{ width: `${Math.min(usagePercent ?? 0, 100)}%` }}
              />
            </div>
            <div className="flex justify-end mt-2">
              <span className="text-xs font-medium text-gray-600">
                {usagePercent}% capacity
              </span>
            </div>
          </div>
        )}

      {/* Session reset schedule */}
      <div>
        <div className="flex items-center gap-2 mb-3">
          <label className="text-sm font-semibold text-gray-900">
            Session reset schedule
          </label>
          <div className="group relative">
            <HelpCircle size={16} className="text-gray-400 cursor-help" />
            <div className="absolute left-1/2 -translate-x-1/2 bottom-full mb-2 hidden group-hover:block w-64 p-3 bg-gray-900 text-white text-xs rounded-lg shadow-lg z-10">
              <div className="font-semibold mb-1">How inventory resets</div>
              <div>
                Choose when your portion + ingredient limits automatically
                reset back to full. Applies to both session portions and
                any tracked ingredients below.
              </div>
              <div className="absolute left-1/2 -translate-x-1/2 top-full w-0 h-0 border-x-4 border-x-transparent border-t-4 border-t-gray-900" />
            </div>
          </div>
        </div>
        <div className="space-y-2">
          {RESET_OPTIONS.map((opt) => {
            const checked = sessionResetPeriod === opt.value;
            return (
              <label
                key={String(opt.value)}
                className="flex items-center gap-3 p-3 bg-white border-2 border-gray-200 rounded-lg cursor-pointer hover:border-purple-300 transition-all has-[:checked]:border-purple-500 has-[:checked]:bg-purple-50/50"
              >
                <input
                  type="radio"
                  name="resetPeriod"
                  checked={checked}
                  onChange={() => setSessionResetPeriod(opt.value)}
                  className="w-4 h-4 text-purple-600"
                />
                <div className="flex-1">
                  <div className="font-medium text-gray-900">{opt.label}</div>
                  <div className="text-xs text-gray-500 mt-0.5">{opt.hint}</div>
                </div>
              </label>
            );
          })}
        </div>
      </div>

      {sessionResetPeriod && (
        <>
          <ToggleRow
            title="Max portions per session"
            subtitle="Reject orders that exceed this total per reset period"
            enabled={enablePortionLimit}
            onChange={setEnablePortionLimit}
            accent="purple"
          >
            <NumberFieldWithUnit
              value={maxPortionsPerSession || 100}
              onChange={setMaxPortionsPerSession}
              min={0}
              unitLabel="portions per session"
              placeholder="100"
              accent="purple"
              ariaLabel="Max portions per session"
            />
          </ToggleRow>

          <ToggleRow
            title="Limited ingredients"
            subtitle="Track specific ingredients that run out during a session"
            enabled={enableIngredientTracking}
            onChange={setEnableIngredientTracking}
            accent="purple"
          >
            <div className="space-y-3">
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
                        min={0}
                        value={ingredient.maxPerSession}
                        onChange={(e) =>
                          updateIngredientMax(
                            ingredient.id,
                            parseInt(e.target.value) || 0,
                          )
                        }
                        className="w-20 px-3 py-1.5 text-center border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-purple-500 text-gray-900 bg-white text-sm font-semibold"
                      />
                      <button
                        type="button"
                        onClick={() => removeIngredient(ingredient.id)}
                        className="text-red-500 hover:text-red-700 p-1.5 hover:bg-red-50 rounded-md transition-colors"
                        aria-label={`Remove ${ingredient.name}`}
                      >
                        <X size={16} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-3 bg-white">
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newIngredientName}
                    onChange={(e) => setNewIngredientName(e.target.value)}
                    placeholder="Ingredient name"
                    className="flex-1 px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-purple-500 text-gray-900 bg-white"
                  />
                  <input
                    type="number"
                    min={0}
                    value={newIngredientMax}
                    onChange={(e) => setNewIngredientMax(parseInt(e.target.value) || 0)}
                    placeholder="Max"
                    className="w-20 px-3 py-2 text-sm text-center border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-purple-500 text-gray-900 bg-white"
                  />
                  <button
                    type="button"
                    onClick={addIngredient}
                    className="bg-purple-600 hover:bg-purple-700 text-white px-3 py-2 rounded-md flex items-center gap-1.5 font-medium transition-colors text-sm"
                  >
                    <Plus size={16} />
                    Add
                  </button>
                </div>
              </div>
            </div>
          </ToggleRow>

          <div className="flex items-start gap-2 p-3 bg-purple-50 rounded-lg border border-purple-200">
            <Info size={16} className="text-purple-600 mt-0.5 flex-shrink-0" />
            <div className="text-xs text-gray-700">
              <span className="font-semibold text-gray-900">Note:</span> Inventory resets automatically based on your chosen schedule. Orders exceeding limits will be rejected.
            </div>
          </div>
        </>
      )}
    </SettingsCard>
  );
};
