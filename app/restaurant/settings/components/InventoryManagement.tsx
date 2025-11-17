"use client";

import { useState, useEffect } from "react";
import {
  Package,
  Clock,
  Plus,
  X,
  AlertCircle,
  TrendingUp,
  Loader,
  Info,
} from "lucide-react";
import { restaurantApi } from "@/app/api/restaurantApi";

interface IngredientItem {
  id: string;
  name: string;
  maxPerSession: number;
  remaining?: number;
}

interface InventoryManagementProps {
  restaurantId: string;
  token: string;
  isCatering: boolean;
  isCorporate: boolean;
  onUpdate?: () => void;
}

export const InventoryManagement = ({
  restaurantId,
  token,
  isCatering,
  isCorporate,
  onUpdate,
}: InventoryManagementProps) => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Catering state
  const [cateringData, setCateringData] = useState<any>(null);
  const [maxCateringPortions, setMaxCateringPortions] = useState(150);

  // Corporate state
  const [sessionResetPeriod, setSessionResetPeriod] = useState<
    "daily" | "lunch_dinner" | null
  >(null);
  const [maxPortionsPerSession, setMaxPortionsPerSession] = useState<
    number | null
  >(null);
  const [enablePortionLimit, setEnablePortionLimit] = useState(false);
  const [enableIngredientTracking, setEnableIngredientTracking] =
    useState(false);
  const [ingredients, setIngredients] = useState<IngredientItem[]>([]);
  const [newIngredientName, setNewIngredientName] = useState("");
  const [newIngredientMax, setNewIngredientMax] = useState<number>(10);

  useEffect(() => {
    loadInventoryData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [restaurantId]);

  const loadInventoryData = async () => {
    setLoading(true);
    setError("");
    try {
      // Load catering portions if catering restaurant
      if (isCatering) {
        try {
          const cateringAvailability =
            await restaurantApi.getCateringPortionsAvailability(restaurantId);
          setCateringData(cateringAvailability);
          setMaxCateringPortions(
            cateringAvailability.maximumCateringPortionsPerDay || 150
          );
        } catch (err) {
          console.warn("Catering data not available:", err);
        }
      }

      // Load corporate inventory if corporate restaurant
      if (isCorporate) {
        const restaurantDetails = await restaurantApi.getRestaurantDetails(
          restaurantId
        );

        // Session reset period
        setSessionResetPeriod(restaurantDetails.sessionResetPeriod || null);

        // Portions per session
        if (restaurantDetails.maxPortionsPerSession !== null) {
          setEnablePortionLimit(true);
          setMaxPortionsPerSession(restaurantDetails.maxPortionsPerSession);
        }

        // Limited ingredients
        if (restaurantDetails.limitedIngredientsPerSession) {
          setEnableIngredientTracking(true);
          const ingredientsList: IngredientItem[] = Object.entries(
            restaurantDetails.limitedIngredientsPerSession
          ).map(([name, max], index) => ({
            id: `ingredient-${index}`,
            name,
            maxPerSession: max as number,
            remaining: restaurantDetails.limitedIngredientsRemaining?.[name],
          }));
          setIngredients(ingredientsList);
        }
      }
    } catch (err: any) {
      console.error("Failed to load inventory data:", err);
      setError(err.message || "Failed to load inventory settings");
    } finally {
      setLoading(false);
    }
  };

  const handleSaveCateringLimit = async () => {
    setSaving(true);
    setError("");
    setSuccess("");

    try {
      await restaurantApi.updateCateringPortionsLimit(
        restaurantId,
        maxCateringPortions,
        token
      );
      setSuccess("Catering portions limit updated successfully!");
      setTimeout(() => setSuccess(""), 3000);
      await loadInventoryData();
      onUpdate?.();
    } catch (err: any) {
      setError(err.message || "Failed to update catering portions limit");
    } finally {
      setSaving(false);
    }
  };

  const handleSaveCorporateInventory = async () => {
    setSaving(true);
    setError("");
    setSuccess("");

    try {
      // Build the limited ingredients object
      const limitedIngredientsPerSession = enableIngredientTracking
        ? ingredients.reduce((acc, ing) => {
            acc[ing.name] = ing.maxPerSession;
            return acc;
          }, {} as { [key: string]: number })
        : null;

      await restaurantApi.updateCorporateInventory(
        restaurantId,
        {
          sessionResetPeriod,
          maxPortionsPerSession: enablePortionLimit
            ? maxPortionsPerSession
            : null,
          limitedIngredientsPerSession,
        },
        token
      );

      setSuccess("Corporate inventory settings updated successfully!");
      setTimeout(() => setSuccess(""), 3000);
      await loadInventoryData();
      onUpdate?.();
    } catch (err: any) {
      setError(err.message || "Failed to update corporate inventory settings");
    } finally {
      setSaving(false);
    }
  };

  const handleAddIngredient = () => {
    if (!newIngredientName.trim()) {
      setError("Please enter an ingredient name");
      return;
    }

    if (ingredients.some((ing) => ing.name === newIngredientName.trim())) {
      setError("This ingredient is already in the list");
      return;
    }

    const newIngredient: IngredientItem = {
      id: `ingredient-${Date.now()}`,
      name: newIngredientName.trim(),
      maxPerSession: newIngredientMax,
    };

    setIngredients([...ingredients, newIngredient]);
    setNewIngredientName("");
    setNewIngredientMax(10);
    setError("");
  };

  const handleRemoveIngredient = (id: string) => {
    setIngredients(ingredients.filter((ing) => ing.id !== id));
  };

  const handleUpdateIngredientMax = (id: string, newMax: number) => {
    setIngredients(
      ingredients.map((ing) =>
        ing.id === id ? { ...ing, maxPerSession: newMax } : ing
      )
    );
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg p-6">
        <div className="flex items-center justify-center py-8">
          <Loader className="animate-spin text-primary mr-3" size={24} />
          <span className="text-gray-600">Loading inventory settings...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Messages */}
      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg flex items-start text-red-700">
          <AlertCircle size={18} className="mr-2 flex-shrink-0 mt-0.5" />
          <span className="text-sm">{error}</span>
        </div>
      )}

      {success && (
        <div className="p-4 bg-green-50 border border-green-200 rounded-lg text-green-700">
          <span className="text-sm font-medium">{success}</span>
        </div>
      )}

      {/* Catering Daily Portions */}
      {isCatering && (
        <div className="bg-white rounded-lg border-2 border-gray-200 p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="bg-blue-100 rounded-full p-2">
              <Package className="text-blue-600" size={24} />
            </div>
            <div>
              <h3 className="text-lg font-bold text-gray-900">
                Catering Daily Portions Limit
              </h3>
              <p className="text-sm text-gray-600">
                Set maximum portions you can accept per day for catering orders
              </p>
            </div>
          </div>

          {/* Current Status */}
          {cateringData && (
            <div className="mb-6 p-4 bg-blue-50 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-700">
                  Today&apos;s Usage
                </span>
                <span className="text-sm font-bold text-blue-600">
                  {cateringData.cateringPortionsToday} /{" "}
                  {cateringData.maximumCateringPortionsPerDay} portions
                </span>
              </div>

              {/* Progress Bar */}
              <div className="w-full bg-gray-200 rounded-full h-3 mb-2">
                <div
                  className={`h-3 rounded-full transition-all ${
                    (cateringData.cateringPortionsToday /
                      cateringData.maximumCateringPortionsPerDay) *
                      100 >
                    90
                      ? "bg-red-500"
                      : (cateringData.cateringPortionsToday /
                          cateringData.maximumCateringPortionsPerDay) *
                          100 >
                        70
                      ? "bg-yellow-500"
                      : "bg-green-500"
                  }`}
                  style={{
                    width: `${Math.min(
                      (cateringData.cateringPortionsToday /
                        cateringData.maximumCateringPortionsPerDay) *
                        100,
                      100
                    )}%`,
                  }}
                />
              </div>

              <div className="flex items-center justify-between text-xs text-gray-600">
                <span>
                  Remaining: {cateringData.remainingPortions} portions
                </span>
                <span>
                  {Math.round(
                    (cateringData.cateringPortionsToday /
                      cateringData.maximumCateringPortionsPerDay) *
                      100
                  )}
                  % used
                </span>
              </div>
            </div>
          )}

          {/* Input */}
          <div className="mb-4">
            <label className="block text-sm font-semibold text-gray-900 mb-2">
              Maximum Portions Per Day
            </label>
            <input
              type="number"
              min="0"
              value={maxCateringPortions}
              onChange={(e) =>
                setMaxCateringPortions(parseInt(e.target.value) || 0)
              }
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 bg-white"
              placeholder="150"
            />
            <p className="text-xs text-gray-500 mt-1">
              Orders will be automatically rejected if they would exceed this
              limit
            </p>
          </div>

          {/* Reset Info */}
          <div className="flex items-start gap-2 p-3 bg-gray-50 rounded-lg mb-4">
            <Clock size={16} className="text-gray-500 mt-0.5" />
            <div className="text-xs text-gray-600">
              <span className="font-semibold">Auto-reset:</span> Daily at 12:00
              AM (midnight) UTC
            </div>
          </div>

          {/* Save Button */}
          <button
            onClick={handleSaveCateringLimit}
            disabled={saving}
            className="w-full bg-primary hover:bg-primary/90 text-white font-medium py-3 px-6 rounded-lg transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {saving ? (
              <>
                <Loader size={20} className="animate-spin" />
                Saving...
              </>
            ) : (
              "Save Catering Limit"
            )}
          </button>
        </div>
      )}

      {/* Corporate Session Inventory */}
      {isCorporate && (
        <div className="bg-white rounded-lg border-2 border-gray-200 p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="bg-purple-100 rounded-full p-2">
              <TrendingUp className="text-purple-600" size={24} />
            </div>
            <div>
              <h3 className="text-lg font-bold text-gray-900">
                Corporate Session Inventory
              </h3>
              <p className="text-sm text-gray-600">
                Manage portions and ingredients for corporate dining sessions
              </p>
            </div>
          </div>

          {/* Session Reset Period */}
          <div className="mb-6">
            <label className="block text-sm font-semibold text-gray-900 mb-3">
              Session Reset Schedule
            </label>

            <div className="space-y-3">
              <label className="flex items-start p-4 border-2 border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors">
                <input
                  type="radio"
                  name="resetPeriod"
                  value="daily"
                  checked={sessionResetPeriod === "daily"}
                  onChange={() => setSessionResetPeriod("daily")}
                  className="mt-1 mr-3"
                />
                <div>
                  <div className="font-medium text-gray-900">
                    Daily (Midnight)
                  </div>
                  <div className="text-sm text-gray-600">
                    Reset once per day at 00:00 (midnight)
                  </div>
                </div>
              </label>

              <label className="flex items-start p-4 border-2 border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors">
                <input
                  type="radio"
                  name="resetPeriod"
                  value="lunch_dinner"
                  checked={sessionResetPeriod === "lunch_dinner"}
                  onChange={() => setSessionResetPeriod("lunch_dinner")}
                  className="mt-1 mr-3"
                />
                <div>
                  <div className="font-medium text-gray-900">
                    Lunch & Dinner
                  </div>
                  <div className="text-sm text-gray-600">
                    Reset twice daily at 12:00 (lunch) and 18:00 (dinner)
                  </div>
                </div>
              </label>

              <label className="flex items-start p-4 border-2 border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors">
                <input
                  type="radio"
                  name="resetPeriod"
                  value="disabled"
                  checked={sessionResetPeriod === null}
                  onChange={() => setSessionResetPeriod(null)}
                  className="mt-1 mr-3"
                />
                <div>
                  <div className="font-medium text-gray-900">Disabled</div>
                  <div className="text-sm text-gray-600">
                    No automatic inventory tracking
                  </div>
                </div>
              </label>
            </div>
          </div>

          {/* Max Portions Per Session */}
          {sessionResetPeriod && (
            <div className="mb-6">
              <div className="flex items-center justify-between mb-3">
                <label className="text-sm font-semibold text-gray-900">
                  Max Portions Per Session
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={enablePortionLimit}
                    onChange={(e) => setEnablePortionLimit(e.target.checked)}
                    className="rounded"
                  />
                  <span className="text-sm text-gray-600">Enable</span>
                </label>
              </div>

              {enablePortionLimit && (
                <input
                  type="number"
                  min="0"
                  value={maxPortionsPerSession ?? 100}
                  onChange={(e) =>
                    setMaxPortionsPerSession(parseInt(e.target.value) || 0)
                  }
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-gray-900 bg-white"
                  placeholder="100"
                />
              )}
            </div>
          )}

          {/* Limited Ingredients */}
          {sessionResetPeriod && (
            <div className="mb-6">
              <div className="flex items-center justify-between mb-3">
                <label className="text-sm font-semibold text-gray-900">
                  Limited Ingredients
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={enableIngredientTracking}
                    onChange={(e) =>
                      setEnableIngredientTracking(e.target.checked)
                    }
                    className="rounded"
                  />
                  <span className="text-sm text-gray-600">Enable</span>
                </label>
              </div>

              {enableIngredientTracking && (
                <div>
                  {/* Existing Ingredients */}
                  {ingredients.length > 0 && (
                    <div className="space-y-2 mb-4">
                      {ingredients.map((ingredient) => (
                        <div
                          key={ingredient.id}
                          className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg"
                        >
                          <div className="flex-1">
                            <div className="font-medium text-gray-900 capitalize">
                              {ingredient.name}
                            </div>
                            {ingredient.remaining !== undefined && (
                              <div className="text-xs text-gray-600">
                                Remaining: {ingredient.remaining} /{" "}
                                {ingredient.maxPerSession}
                              </div>
                            )}
                          </div>
                          <input
                            type="number"
                            min="0"
                            value={ingredient.maxPerSession}
                            onChange={(e) =>
                              handleUpdateIngredientMax(
                                ingredient.id,
                                parseInt(e.target.value) || 0
                              )
                            }
                            className="w-24 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-gray-900 bg-white"
                          />
                          <button
                            onClick={() =>
                              handleRemoveIngredient(ingredient.id)
                            }
                            className="text-red-500 hover:text-red-700 p-2"
                          >
                            <X size={20} />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Add New Ingredient */}
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-4">
                    <div className="flex gap-3">
                      <input
                        type="text"
                        value={newIngredientName}
                        onChange={(e) => setNewIngredientName(e.target.value)}
                        placeholder="Ingredient name (e.g., chicken)"
                        className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-gray-900 bg-white"
                      />
                      <input
                        type="number"
                        min="0"
                        value={newIngredientMax}
                        onChange={(e) =>
                          setNewIngredientMax(parseInt(e.target.value) || 0)
                        }
                        placeholder="Max"
                        className="w-24 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-gray-900 bg-white"
                      />
                      <button
                        onClick={handleAddIngredient}
                        className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg flex items-center gap-2"
                      >
                        <Plus size={20} />
                        Add
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Info Box */}
          <div className="flex items-start gap-2 p-3 bg-purple-50 rounded-lg mb-4">
            <Info size={16} className="text-purple-600 mt-0.5" />
            <div className="text-xs text-gray-700">
              <span className="font-semibold">Note:</span> Inventory
              automatically resets based on your selected schedule. Orders
              exceeding limits will be rejected.
            </div>
          </div>

          {/* Save Button */}
          <button
            onClick={handleSaveCorporateInventory}
            disabled={saving}
            className="w-full bg-purple-600 hover:bg-purple-700 text-white font-medium py-3 px-6 rounded-lg transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center justify-center gap-2"
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
      )}

      {/* No Inventory Systems Enabled */}
      {!isCatering && !isCorporate && (
        <div className="bg-white rounded-lg border-2 border-gray-200 p-8 text-center">
          <Package className="mx-auto text-gray-400 mb-4" size={48} />
          <h3 className="text-lg font-bold text-gray-900 mb-2">
            No Inventory Management Available
          </h3>
          <p className="text-gray-600">
            This restaurant is not set up for catering or corporate services.
            Contact support to enable inventory management features.
          </p>
        </div>
      )}
    </div>
  );
};
