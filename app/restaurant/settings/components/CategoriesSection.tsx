"use client";

import { useState, useEffect } from "react";
import { ArrowLeft, Loader, AlertCircle, Check } from "lucide-react";
import { fetchWithAuth } from "@/lib/api-client/auth-client";
import { API_BASE_URL, API_ENDPOINTS } from "@/lib/constants/api";

interface Category {
  id: string;
  name: string;
}

interface CategoriesSectionProps {
  restaurantId: string;
  onBack: () => void;
}

export const CategoriesSection = ({ restaurantId, onBack }: CategoriesSectionProps) => {
  const [allCategories, setAllCategories] = useState<Category[]>([]);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    const load = async () => {
      try {
        const [categoriesRes, restaurantRes] = await Promise.all([
          fetch(`${API_BASE_URL}${API_ENDPOINTS.CATEGORIES}`),
          fetchWithAuth(`${API_BASE_URL}${API_ENDPOINTS.RESTAURANT_DETAILS(restaurantId)}`),
        ]);

        if (!categoriesRes.ok) throw new Error("Failed to load categories");
        if (!restaurantRes.ok) throw new Error("Failed to load restaurant");

        const categories: Category[] = await categoriesRes.json();
        const restaurant = await restaurantRes.json();
  

        setAllCategories(categories);
        const existing: Category[] = restaurant.categories ?? [];
        setSelectedIds(existing.map((c) => c.id));
      } catch (err: any) {
        setError(err.message || "Failed to load data");
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [restaurantId]);

  const toggleCategory = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const handleSave = async () => {
    setSaving(true);
    setError("");
    setSuccess("");

    try {
      const response = await fetchWithAuth(
        `${API_BASE_URL}${API_ENDPOINTS.RESTAURANT_CATEGORIES(restaurantId)}`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ categoryIds: selectedIds }),
        }
      );

      if (!response.ok) throw new Error("Failed to save categories");

      setSuccess("Categories updated successfully!");
      setTimeout(() => setSuccess(""), 3000);
    } catch (err: any) {
      setError(err.message || "Failed to save categories");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader size={48} className="animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-4">
      <div className="max-w-2xl mx-auto py-8">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <button onClick={onBack} className="p-2 hover:bg-white rounded-lg transition-colors">
            <ArrowLeft size={24} className="text-gray-700" />
          </button>
          <div>
            <h1 className="text-4xl font-bold text-gray-900">Categories</h1>
            <p className="text-lg text-gray-600 mt-1">
              Select the categories that best describe your restaurant
            </p>
          </div>
        </div>

        {/* Messages */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border-2 border-red-200 rounded-xl flex items-start text-red-700 shadow-sm">
            <AlertCircle size={20} className="mr-3 flex-shrink-0 mt-0.5" />
            <span className="font-medium">{error}</span>
          </div>
        )}
        {success && (
          <div className="mb-6 p-4 bg-green-50 border-2 border-green-200 rounded-xl text-green-700 shadow-sm">
            <span className="font-medium">{success}</span>
          </div>
        )}

        {/* Category Grid */}
        <div className="bg-white border-2 border-gray-200 rounded-2xl p-6 mb-6">
          {allCategories.length === 0 ? (
            <p className="text-gray-500 text-center py-8">No categories available.</p>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {allCategories.map((category) => {
                const selected = selectedIds.includes(category.id);
                return (
                  <button
                    key={category.id}
                    onClick={() => toggleCategory(category.id)}
                    className={`flex items-center justify-between gap-2 px-4 py-3 rounded-xl border-2 text-left transition-all font-medium text-sm ${
                      selected
                        ? "border-blue-500 bg-blue-50 text-blue-700"
                        : "border-gray-200 bg-white text-gray-700 hover:border-gray-300 hover:bg-gray-50"
                    }`}
                  >
                    <span className="truncate">{category.name}</span>
                    {selected && <Check size={16} className="flex-shrink-0 text-blue-600" />}
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {selectedIds.length > 0 && (
          <p className="text-sm text-gray-500 mb-6">
            {selectedIds.length} {selectedIds.length === 1 ? "category" : "categories"} selected
          </p>
        )}

        {/* Actions */}
        <div className="flex gap-3">
          <button
            onClick={onBack}
            className="flex-1 py-3 px-6 border-2 border-gray-200 text-gray-700 rounded-xl font-semibold hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex-1 py-3 px-6 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
          >
            {saving && <Loader size={16} className="animate-spin" />}
            {saving ? "Saving..." : "Save Changes"}
          </button>
        </div>
      </div>
    </div>
  );
};
