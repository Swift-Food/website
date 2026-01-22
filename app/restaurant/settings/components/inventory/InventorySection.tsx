"use client";

import { useState, useEffect } from "react";
import { ArrowLeft, Zap, Loader } from "lucide-react";
import { InventoryManagement } from "./InventoryManagement";
import { fetchWithAuth } from "@/lib/api-client/auth-client";
import { API_BASE_URL, API_ENDPOINTS } from "@/lib/constants/api";

interface InventorySectionProps {
  restaurantId: string;
  isCatering: boolean;
  isCorporate: boolean;
  onBack: () => void;
}

export const InventorySection = ({
  restaurantId,
  isCatering,
  isCorporate,
  onBack,
}: InventorySectionProps) => {
  const [minimumAutoAccept, setMinimumAutoAccept] = useState<number | null>(null);
  const [initialMinimumAutoAccept, setInitialMinimumAutoAccept] = useState<number | null>(null);
  const [savingAutoAccept, setSavingAutoAccept] = useState(false);
  const [autoAcceptError, setAutoAcceptError] = useState("");
  const [autoAcceptSuccess, setAutoAcceptSuccess] = useState("");

  useEffect(() => {
    loadRestaurantSettings();
  }, [restaurantId]);

  const loadRestaurantSettings = async () => {
    try {
      const response = await fetchWithAuth(
        `${API_BASE_URL}${API_ENDPOINTS.RESTAURANT_DETAILS(restaurantId)}`
      );
      if (response.ok) {
        const data = await response.json();
        const value = data.minimumAutoAccept ?? null;
        setMinimumAutoAccept(value);
        setInitialMinimumAutoAccept(value);
      }
    } catch (err) {
      console.warn("Failed to load restaurant settings:", err);
    }
  };

  const handleSaveAutoAccept = async () => {
    setSavingAutoAccept(true);
    setAutoAcceptError("");
    setAutoAcceptSuccess("");

    try {
      console.log('the link is', `${API_BASE_URL}${API_ENDPOINTS.RESTAURANT_DETAILS(restaurantId)}`)
      const response = await fetchWithAuth(
        `${API_BASE_URL}${API_ENDPOINTS.RESTAURANT_DETAILS(restaurantId)}`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ minimumAutoAcceptQuantity : minimumAutoAccept }),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to update auto-accept settings");
      }

      setInitialMinimumAutoAccept(minimumAutoAccept);
      setAutoAcceptSuccess("Auto-accept settings updated successfully!");
      setTimeout(() => setAutoAcceptSuccess(""), 3000);
    } catch (err: any) {
      setAutoAcceptError(err.message || "Failed to update settings");
    } finally {
      setSavingAutoAccept(false);
    }
  };

  const hasAutoAcceptChanges = minimumAutoAccept !== initialMinimumAutoAccept;

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-5xl mx-auto py-8">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <button
            onClick={onBack}
            className="p-2 hover:bg-white rounded-lg transition-colors"
          >
            <ArrowLeft size={24} className="text-gray-700" />
          </button>
          <div className="flex-1">
            <h1 className="text-3xl font-bold text-gray-900">
              Inventory Management
            </h1>
            <p className="text-gray-600 mt-1">
              Set daily limits and manage ingredient availability
            </p>
          </div>
        </div>

        {/* Auto-Accept Card */}
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden mb-6">
          <div className="bg-blue-600 px-6 py-5">
            <div className="flex items-center gap-3">
              <div className="bg-white/20 backdrop-blur-sm rounded-lg p-2.5">
                <Zap className="text-white" size={24} />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white">
                  Minimum Auto-Accept
                </h3>
                <p className="text-blue-100 text-sm mt-0.5">
                  Automatically accept orders above a minimum quantity
                </p>
              </div>
            </div>
          </div>

          <div className="p-6 space-y-4">
            {autoAcceptError && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                {autoAcceptError}
              </div>
            )}

            {autoAcceptSuccess && (
              <div className="p-3 bg-green-50 border border-green-200 rounded-lg text-green-700 text-sm">
                {autoAcceptSuccess}
              </div>
            )}

            <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <div className="text-sm font-semibold text-gray-900">
                    Minimum Quantity for Auto-Accept
                  </div>
                  <div className="text-xs text-gray-500 mt-0.5">
                    Orders with at least this many items will be auto-accepted
                  </div>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={minimumAutoAccept !== null}
                    onChange={(e) =>
                      setMinimumAutoAccept(e.target.checked ? 10 : null)
                    }
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-300 peer-focus:ring-2 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                </label>
              </div>

              {minimumAutoAccept !== null && (
                <div className="flex items-center gap-3 pt-2">
                  <input
                    type="number"
                    min="1"
                    value={minimumAutoAccept}
                    onChange={(e) =>
                      setMinimumAutoAccept(parseInt(e.target.value) || 1)
                    }
                    className="w-32 px-4 py-2.5 text-center text-xl font-bold border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 bg-white"
                    placeholder="10"
                  />
                  <span className="text-sm font-medium text-gray-600">
                    items minimum
                  </span>
                </div>
              )}
            </div>

            <div className="pt-2">
              <button
                onClick={handleSaveAutoAccept}
                disabled={savingAutoAccept || !hasAutoAcceptChanges}
                className={`w-full sm:w-auto font-semibold py-2.5 px-6 rounded-lg transition-all flex items-center justify-center gap-2 shadow-sm ${
                  hasAutoAcceptChanges && !savingAutoAccept
                    ? "bg-blue-600 hover:bg-blue-700 text-white"
                    : "bg-gray-200 text-gray-400 cursor-not-allowed"
                }`}
              >
                {savingAutoAccept ? (
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

        <InventoryManagement
          restaurantId={restaurantId}
          isCatering={isCatering}
          isCorporate={isCorporate}
        />
      </div>
    </div>
  );
};
