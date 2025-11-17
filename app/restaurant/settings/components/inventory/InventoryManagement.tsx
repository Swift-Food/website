"use client";

import { useState, useEffect } from "react";
import { Package, AlertCircle, Loader } from "lucide-react";
import { restaurantApi } from "@/app/api/restaurantApi";
import { CateringPortionsCard } from "./CateringPortionsCard";
import { CorporateInventoryCard } from "./CorporateInventoryCard";

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
}

export const InventoryManagement = ({
  restaurantId,
  token,
  isCatering,
  isCorporate,
}: InventoryManagementProps) => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [activeTab, setActiveTab] = useState<"catering" | "corporate">(
    isCatering ? "catering" : "corporate"
  );

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

  // Show tabs only if both catering and corporate are enabled
  const showTabs = isCatering && isCorporate;

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

      {/* Tabs (only show if both types are enabled) */}
      {showTabs && (
        <div className="bg-white rounded-lg border border-gray-200 p-1.5 inline-flex gap-1">
          <button
            onClick={() => setActiveTab("catering")}
            className={`px-6 py-2.5 rounded-md font-semibold text-sm transition-all duration-200 ${
              activeTab === "catering"
                ? "bg-emerald-600 text-white shadow-md scale-105"
                : "text-gray-600 hover:text-emerald-700 hover:bg-emerald-50"
            }`}
          >
            Catering Limits
          </button>
          <button
            onClick={() => setActiveTab("corporate")}
            className={`px-6 py-2.5 rounded-md font-semibold text-sm transition-all duration-200 ${
              activeTab === "corporate"
                ? "bg-purple-600 text-white shadow-md scale-105"
                : "text-gray-600 hover:text-purple-700 hover:bg-purple-50"
            }`}
          >
            Corporate Inventory
          </button>
        </div>
      )}

      {/* Catering Daily Portions */}
      {isCatering && (!showTabs || activeTab === "catering") && (
        <CateringPortionsCard
          maxPortions={maxCateringPortions}
          currentData={cateringData}
          onMaxChange={setMaxCateringPortions}
          onSave={handleSaveCateringLimit}
          saving={saving}
        />
      )}

      {/* Corporate Session Inventory */}
      {isCorporate && (!showTabs || activeTab === "corporate") && (
        <CorporateInventoryCard
          sessionResetPeriod={sessionResetPeriod}
          maxPortionsPerSession={maxPortionsPerSession}
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
          onSave={handleSaveCorporateInventory}
          saving={saving}
        />
      )}

      {/* No Inventory Systems Enabled */}
      {!isCatering && !isCorporate && (
        <div className="bg-white rounded-lg border border-gray-200 p-8 text-center">
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
