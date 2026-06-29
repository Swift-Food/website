"use client";

import { useState, useEffect } from "react";
import { Save, Loader, AlertCircle, CheckCircle, Info } from "lucide-react";
import { coworkingApi } from "@/services/api/coworking.api";
import { CoworkingSpace } from "@/types/api/coworking.api.types";

interface Props {
  spaceId: string;
}

export const CoworkingSettings = ({ spaceId }: Props) => {
  const [space, setSpace] = useState<CoworkingSpace | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");

  // Task 6 — Commission rate state
  const [commission, setCommission] = useState<string>("0");
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [saveError, setSaveError] = useState("");

  useEffect(() => {
    coworkingApi
      .getSpace(spaceId)
      .then((s) => {
        setSpace(s);
        setCommission(String(s.commission ?? 0));
      })
      .catch((err) => setLoadError(err.message || "Failed to load settings"))
      .finally(() => setLoading(false));
  }, [spaceId]);

  const handleSaveCommission = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSaveError("");
    setSaveSuccess(false);

    const value = parseFloat(commission);
    if (isNaN(value) || value < 0 || value > 100) {
      setSaveError("Please enter a rate between 0 and 100.");
      setSaving(false);
      return;
    }

    try {
      const result = await coworkingApi.updateCommissionRate(spaceId, value);
      setCommission(String(result.commission));
      setSpace((prev) => prev ? { ...prev, commission: result.commission } : prev);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 4000);
    } catch (err: any) {
      setSaveError(err.message || "Failed to update commission rate.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <Loader size={24} className="animate-spin text-primary" />
      </div>
    );
  }

  if (loadError) {
    return (
      <div className="flex items-center gap-2 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
        <AlertCircle size={16} className="flex-shrink-0" />
        {loadError}
      </div>
    );
  }

  const currentRate = space?.commission ?? 0;

  return (
    <div className="max-w-xl space-y-6">
      {/* Space info */}
      {space && (
        <div className="bg-gray-50 rounded-lg p-4 text-sm text-gray-700">
          <p className="font-semibold text-gray-900 mb-1">{space.name}</p>
          {space.slug && <p className="text-gray-500 text-xs font-mono">/{space.slug}</p>}
          {space.contactEmail && <p className="text-gray-600">{space.contactEmail}</p>}
        </div>
      )}

      {/* Task 6 — Catering Service Fee section */}
      <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
        <div className="bg-primary/10 border-b border-primary/20 px-5 py-3.5">
          <h3 className="font-semibold text-primary">Catering Service Fee</h3>
          <p className="text-xs text-primary mt-0.5">
            A percentage charged on top of the catering food subtotal (after promotions)
          </p>
        </div>

        <div className="p-5">
          {/* Current state */}
          <div className="mb-4 p-3 bg-gray-50 border border-gray-200 rounded-lg flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-500 mb-0.5">Current rate</p>
              {currentRate === 0 ? (
                <p className="text-sm font-semibold text-gray-500">No service fee</p>
              ) : (
                <p className="text-sm font-semibold text-gray-900">{currentRate}%</p>
              )}
            </div>
            {currentRate > 0 && (
              <span className="text-xs bg-primary/15 text-primary px-2.5 py-1 rounded-full font-medium">
                Active
              </span>
            )}
          </div>

          <form onSubmit={handleSaveCommission} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                New rate (%)
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  value={commission}
                  onChange={(e) => setCommission(e.target.value)}
                  min="0"
                  max="100"
                  step="0.5"
                  className="w-32 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent text-gray-900 text-sm"
                  placeholder="0"
                />
                <span className="text-sm text-gray-500">% of food subtotal</span>
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Set to 0 to disable the service fee entirely.
              </p>
            </div>

            {saveError && (
              <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                <AlertCircle size={14} className="flex-shrink-0" />
                {saveError}
              </div>
            )}

            {saveSuccess && (
              <div className="flex items-center gap-2 p-3 bg-green-50 border border-green-200 rounded-lg text-green-700 text-sm">
                <CheckCircle size={14} className="flex-shrink-0" />
                Commission rate updated successfully.
              </div>
            )}

            {/* Info note */}
            <div className="flex items-start gap-2 p-3 bg-amber-50 border border-amber-200 rounded-lg text-amber-800 text-xs">
              <Info size={14} className="flex-shrink-0 mt-0.5" />
              <p>
                This rate only applies to <strong>new orders</strong> placed after saving. Existing orders are
                not affected — they retain the rate that was active at the time of pricing.
              </p>
            </div>

            <button
              type="submit"
              disabled={saving}
              className="flex items-center gap-2 bg-primary hover:bg-primary/90 disabled:bg-primary/40 disabled:cursor-not-allowed text-white font-medium py-2.5 px-5 rounded-lg transition-colors text-sm"
            >
              {saving ? (
                <>
                  <Loader size={14} className="animate-spin" />
                  Saving…
                </>
              ) : (
                <>
                  <Save size={14} />
                  Save rate
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
