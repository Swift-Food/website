"use client";

import { useState, useEffect } from "react";
import { Package, AlertCircle, Loader } from "lucide-react";
import { restaurantApi } from "@/services/api/restaurant.api";
import { AdvanceNoticeSettings } from "@/types/inventory.types";
import { PortionLimitsCard } from "./PortionLimitsCard";
import { OrderSettingsCard } from "./OrderSettingsCard";

interface IngredientItem {
  id: string;
  name: string;
  maxPerSession: number;
  remaining?: number;
}

interface InventoryManagementProps {
  restaurantId: string;
  isCatering: boolean;
  isCorporate: boolean;
}

export const InventoryManagement = ({
  restaurantId,
  isCatering,
  isCorporate,
}: InventoryManagementProps) => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Inventory state (unified)
  const [sessionResetPeriod, setSessionResetPeriod] = useState<
    "daily" | "lunch_dinner" | null
  >(null);
  const [enablePortionLimit, setEnablePortionLimit] = useState(false);
  const [maxPortionsPerSession, setMaxPortionsPerSession] = useState<number>(0);
  const [portionsRemaining, setPortionsRemaining] = useState<number | null>(null);

  const [enableIngredientTracking, setEnableIngredientTracking] =
    useState(false);
  const [ingredients, setIngredients] = useState<IngredientItem[]>([]);
  const [newIngredientName, setNewIngredientName] = useState("");
  const [newIngredientMax, setNewIngredientMax] = useState<number>(10);

  // Order settings state
  const [minimumDeliveryNoticeHours, setMinimumDeliveryNoticeHours] = useState<number>(0);
  const [maxPortionsPerOrder, setMaxPortionsPerOrder] = useState<number | null>(null);
  const [enableMaxPortionsPerOrder, setEnableMaxPortionsPerOrder] = useState(false);
  const [advanceNoticeSettings, setAdvanceNoticeSettings] = useState<AdvanceNoticeSettings | null>(null);

  // --------------------------------------------------
  // LOAD INITIAL DATA
  // --------------------------------------------------
  useEffect(() => {
    loadInventoryData();
  }, [restaurantId]);

  const loadInventoryData = async () => {
    setLoading(true);
    setError("");

    try {
      // Load order settings from restaurant details
      try {
        const restaurantDetails = await restaurantApi.getRestaurantDetails(restaurantId);
        setMinimumDeliveryNoticeHours(restaurantDetails.minimumDeliveryNoticeHours ?? 0);
        if (restaurantDetails.advanceNoticeSettings) {
          setAdvanceNoticeSettings(restaurantDetails.advanceNoticeSettings);
        } else if (restaurantDetails.minimumDeliveryNoticeHours) {
          setAdvanceNoticeSettings({ type: 'hours', hours: restaurantDetails.minimumDeliveryNoticeHours });
        }
        if (restaurantDetails.maxPortionsPerOrder !== null && restaurantDetails.maxPortionsPerOrder !== undefined) {
          setEnableMaxPortionsPerOrder(true);
          setMaxPortionsPerOrder(restaurantDetails.maxPortionsPerOrder);
        } else {
          setEnableMaxPortionsPerOrder(false);
          setMaxPortionsPerOrder(null);
        }
      } catch (err) {
        console.warn("Failed to load restaurant order settings:", err);
      }

      // Load inventory settings (unified — used by both catering and corporate)
      if (isCatering || isCorporate) {
        try {
          const settings = await restaurantApi.getInventorySettings(restaurantId);

          setSessionResetPeriod(settings.sessionResetPeriod ?? null);
          setPortionsRemaining(settings.portionsRemaining ?? null);

          if (settings.maxPortionsPerSession !== null && settings.maxPortionsPerSession !== undefined) {
            setEnablePortionLimit(true);
            setMaxPortionsPerSession(settings.maxPortionsPerSession);
          } else {
            setEnablePortionLimit(false);
            setMaxPortionsPerSession(0);
          }

          if (settings.limitedIngredientsPerSession) {
            setEnableIngredientTracking(true);
            const ingList: IngredientItem[] = Object.entries(
              settings.limitedIngredientsPerSession
            ).map(([name, max], index) => ({
              id: `ingredient-${index}`,
              name,
              maxPerSession: max as number,
              remaining: settings.limitedIngredientsRemaining?.[name],
            }));
            setIngredients(ingList);
          } else {
            setEnableIngredientTracking(false);
            setIngredients([]);
          }
        } catch (err) {
          console.warn("Inventory data not available:", err);
          setSessionResetPeriod(null);
          setEnablePortionLimit(false);
          setMaxPortionsPerSession(0);
          setPortionsRemaining(null);
          setEnableIngredientTracking(false);
          setIngredients([]);
        }
      }
    } catch (err: any) {
      console.error("Failed to load inventory data:", err);
      setError(err.message || "Failed to load inventory settings");
    } finally {
      setLoading(false);
    }
  };

  // --------------------------------------------------
  // SAVE — INVENTORY
  // --------------------------------------------------
  const handleSaveInventory = async () => {
    setSaving(true);
    setError("");
    setSuccess("");

    try {
      const limitedIngredientsPerSession = enableIngredientTracking
        ? ingredients.reduce((acc, ing) => {
            acc[ing.name] = ing.maxPerSession;
            return acc;
          }, {} as Record<string, number>)
        : null;

      const payload = {
        sessionResetPeriod,
        maxPortionsPerSession: enablePortionLimit
          ? maxPortionsPerSession
          : null,
        limitedIngredientsPerSession,
      };

      await restaurantApi.updateInventorySettings(restaurantId, payload);

      setSuccess("Inventory settings updated successfully!");
      setTimeout(() => setSuccess(""), 3000);
      await loadInventoryData();
    } catch (err: any) {
      console.error("Inventory update failed:", err);
      setError(err.message || "Failed to update inventory settings");
    } finally {
      setSaving(false);
    }
  };

  // --------------------------------------------------
  // SAVE — ORDER SETTINGS
  // --------------------------------------------------
  const handleSaveOrderSettings = async () => {
    setSaving(true);
    setError("");
    setSuccess("");

    try {
      await restaurantApi.updateOrderSettings(restaurantId, {
        minimumDeliveryNoticeHours,
        maxPortionsPerOrder: enableMaxPortionsPerOrder ? maxPortionsPerOrder : null,
        advanceNoticeSettings,
      });

      setSuccess("Order settings updated successfully!");
      setTimeout(() => setSuccess(""), 3000);
      await loadInventoryData();
    } catch (err: any) {
      setError(err.message || "Failed to update order settings");
    } finally {
      setSaving(false);
    }
  };

  // --------------------------------------------------
  // INGREDIENT FUNCTIONS
  // --------------------------------------------------
  const handleAddIngredient = () => {
    if (!newIngredientName.trim()) {
      setError("Please enter an ingredient name");
      return;
    }

    if (ingredients.some((ing) => ing.name === newIngredientName.trim())) {
      setError("This ingredient is already in the list");
      return;
    }

    setIngredients((prev) => [
      ...prev,
      {
        id: `ingredient-${Date.now()}`,
        name: newIngredientName.trim(),
        maxPerSession: newIngredientMax,
      },
    ]);

    setNewIngredientName("");
    setNewIngredientMax(10);
    setError("");
  };

  const handleRemoveIngredient = (id: string) => {
    setIngredients((prev) => prev.filter((ing) => ing.id !== id));
  };

  const handleUpdateIngredientMax = (id: string, newMax: number) => {
    setIngredients((prev) =>
      prev.map((ing) =>
        ing.id === id ? { ...ing, maxPerSession: newMax } : ing
      )
    );
  };

  // --------------------------------------------------
  // LOADING STATE
  // --------------------------------------------------
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
      {/* Error Message */}
      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg flex items-start text-red-700">
          <AlertCircle size={18} className="mr-2 flex-shrink-0 mt-0.5" />
          <span className="text-sm">{error}</span>
        </div>
      )}

      {/* Success */}
      {success && (
        <div className="p-4 bg-green-50 border border-green-200 rounded-lg text-green-700">
          <span className="text-sm font-medium">{success}</span>
        </div>
      )}

      {/* Order Settings - Always shown */}
      <OrderSettingsCard
        minimumDeliveryNoticeHours={minimumDeliveryNoticeHours}
        maxPortionsPerOrder={maxPortionsPerOrder}
        enableMaxPortionsPerOrder={enableMaxPortionsPerOrder}
        advanceNoticeSettings={advanceNoticeSettings}
        onNoticeHoursChange={setMinimumDeliveryNoticeHours}
        onMaxPortionsToggle={setEnableMaxPortionsPerOrder}
        onMaxPortionsChange={setMaxPortionsPerOrder}
        onAdvanceNoticeChange={setAdvanceNoticeSettings}
        onSave={handleSaveOrderSettings}
        saving={saving}
      />

      {/* Unified Inventory Card - shown for catering OR corporate restaurants */}
      {(isCatering || isCorporate) && (
        <PortionLimitsCard
          sessionResetPeriod={sessionResetPeriod}
          maxPortionsPerSession={maxPortionsPerSession}
          portionsRemaining={portionsRemaining}
          enablePortionLimit={enablePortionLimit}
          enableIngredientTracking={enableIngredientTracking}
          ingredients={ingredients}
          newIngredientName={newIngredientName}
          newIngredientMax={newIngredientMax}
          onResetPeriodChange={setSessionResetPeriod}
          onPortionLimitToggle={setEnablePortionLimit}
          onMaxPortionsChange={setMaxPortionsPerSession}
          onIngredientTrackingToggle={setEnableIngredientTracking}
          onIngredientAdd={handleAddIngredient}
          onIngredientRemove={handleRemoveIngredient}
          onIngredientUpdate={handleUpdateIngredientMax}
          onNewIngredientNameChange={setNewIngredientName}
          onNewIngredientMaxChange={setNewIngredientMax}
          onSave={handleSaveInventory}
          saving={saving}
        />
      )}

      {/* None */}
      {!isCatering && !isCorporate && (
        <div className="bg-white rounded-lg border border-gray-200 p-8 text-center">
          <Package className="mx-auto text-gray-400 mb-4" size={48} />
          <h3 className="text-lg font-bold text-gray-900 mb-2">
            No Inventory Management Available
          </h3>
          <p className="text-gray-600">
            This restaurant is not set up for catering or corporate services.
          </p>
        </div>
      )}
    </div>
  );
};
