"use client";

import { useEffect, useState } from "react";
import { restaurantApi } from "@/services/api/restaurant.api";
import { SessionResetPeriod } from "@/types/inventory.types";

export interface IngredientItem {
  id: string;
  name: string;
  maxPerSession: number;
  remaining?: number;
}

interface Snapshot {
  sessionResetPeriod: SessionResetPeriod;
  maxPortionsPerSession: number;
  enablePortionLimit: boolean;
  enableIngredientTracking: boolean;
  ingredientsJson: string;
}

const ingredientsAsJson = (list: IngredientItem[]): string =>
  JSON.stringify(list.map((i) => ({ name: i.name, max: i.maxPerSession })));

/**
 * State + persistence for the Kitchen Capacity tab.
 *
 * Ingredients are edited as an array and serialised to an object keyed by
 * ingredient name on save — matches the shape the inventory-settings
 * endpoint expects.
 */
export const useKitchenCapacityState = (restaurantId: string) => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const [sessionResetPeriod, setSessionResetPeriod] = useState<SessionResetPeriod>(null);
  const [maxPortionsPerSession, setMaxPortionsPerSession] = useState<number>(0);
  const [portionsRemaining, setPortionsRemaining] = useState<number | null>(null);
  const [enablePortionLimit, setEnablePortionLimit] = useState(false);
  const [enableIngredientTracking, setEnableIngredientTracking] = useState(false);
  const [ingredients, setIngredients] = useState<IngredientItem[]>([]);
  const [newIngredientName, setNewIngredientName] = useState("");
  const [newIngredientMax, setNewIngredientMax] = useState(10);

  const [snapshot, setSnapshot] = useState<Snapshot | null>(null);

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const settings = await restaurantApi.getInventorySettings(restaurantId);

      const reset: SessionResetPeriod = settings.sessionResetPeriod ?? null;
      const rawMax = settings.maxPortionsPerSession;
      const hasPortionLimit = rawMax !== null && rawMax !== undefined;
      const portions: number = hasPortionLimit ? rawMax : 0;

      const rawIngredients = settings.limitedIngredientsPerSession as
        | Record<string, number>
        | undefined;
      const hasIngredients = !!rawIngredients;
      const ingList: IngredientItem[] = rawIngredients
        ? Object.entries(rawIngredients).map(([name, max], idx) => ({
            id: `ingredient-${idx}`,
            name,
            maxPerSession: max,
            remaining: settings.limitedIngredientsRemaining?.[name],
          }))
        : [];

      setSessionResetPeriod(reset);
      setEnablePortionLimit(hasPortionLimit);
      setMaxPortionsPerSession(portions);
      setPortionsRemaining(settings.portionsRemaining ?? null);
      setEnableIngredientTracking(hasIngredients);
      setIngredients(ingList);

      setSnapshot({
        sessionResetPeriod: reset,
        maxPortionsPerSession: portions,
        enablePortionLimit: hasPortionLimit,
        enableIngredientTracking: hasIngredients,
        ingredientsJson: ingredientsAsJson(ingList),
      });
    } catch (err: unknown) {
      // Inventory API is optional for restaurants without catering — fail silent
      console.warn("Kitchen capacity data not available:", err);
      setSessionResetPeriod(null);
      setEnablePortionLimit(false);
      setMaxPortionsPerSession(0);
      setPortionsRemaining(null);
      setEnableIngredientTracking(false);
      setIngredients([]);
      setSnapshot({
        sessionResetPeriod: null,
        maxPortionsPerSession: 0,
        enablePortionLimit: false,
        enableIngredientTracking: false,
        ingredientsJson: ingredientsAsJson([]),
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [restaurantId]);

  const addIngredient = () => {
    if (!newIngredientName.trim()) {
      setError("Please enter an ingredient name");
      return;
    }
    if (ingredients.some((i) => i.name === newIngredientName.trim())) {
      setError("That ingredient is already in the list");
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
    setError(null);
  };

  const removeIngredient = (id: string) =>
    setIngredients((prev) => prev.filter((i) => i.id !== id));

  const updateIngredientMax = (id: string, max: number) =>
    setIngredients((prev) =>
      prev.map((i) => (i.id === id ? { ...i, maxPerSession: max } : i)),
    );

  const hasChanges =
    snapshot != null &&
    (snapshot.sessionResetPeriod !== sessionResetPeriod ||
      snapshot.enablePortionLimit !== enablePortionLimit ||
      snapshot.maxPortionsPerSession !== maxPortionsPerSession ||
      snapshot.enableIngredientTracking !== enableIngredientTracking ||
      snapshot.ingredientsJson !== ingredientsAsJson(ingredients));

  const save = async () => {
    setSaving(true);
    setError(null);
    setSuccess(null);
    try {
      const limitedIngredientsPerSession = enableIngredientTracking
        ? ingredients.reduce<Record<string, number>>((acc, ing) => {
            acc[ing.name] = ing.maxPerSession;
            return acc;
          }, {})
        : null;

      await restaurantApi.updateInventorySettings(restaurantId, {
        sessionResetPeriod,
        maxPortionsPerSession: enablePortionLimit ? maxPortionsPerSession : null,
        limitedIngredientsPerSession,
      });

      setSuccess("Kitchen capacity saved.");
      setTimeout(() => setSuccess(null), 3000);
      await load();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to save kitchen capacity");
    } finally {
      setSaving(false);
    }
  };

  return {
    loading,
    saving,
    error,
    success,
    hasChanges,

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

    save,
  };
};
