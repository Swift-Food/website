"use client";

import { useState, useEffect } from "react";
import { restaurantApi } from "@/app/api/restaurantApi";
import { Plus, Trash2 } from "lucide-react";
import { Promotion } from "@/services/promotionServices";

interface DiscountTier {
  minQuantity: number;
  discountPercentage: number;
}

interface BuyMoreSaveMoreFormProps {
  onSubmit: (data: any) => void;
  onCancel: () => void;
  submitting: boolean;
  restaurantId: string;
  promotion?: Promotion; // ADD THIS
  mode?: "create" | "edit"; // ADD THIS
}

export function BuyMoreSaveMoreForm({ 
  onSubmit, 
  onCancel, 
  submitting, 
  restaurantId,
  promotion, // ADD THIS
  mode = "create" // ADD THIS
}: BuyMoreSaveMoreFormProps) {
  const isEditMode = mode === "edit" && promotion;
  const [groupTitles, setGroupTitles] = useState<string[]>([]);
  
  const [formData, setFormData] = useState({
    name: promotion?.name || "",
    description: promotion?.description || "",
    applicability: promotion?.applicability || "BOTH",
    maxDiscountAmount: promotion?.maxDiscountAmount || null,
    minOrderAmount: promotion?.minOrderAmount || null,
    startDate: promotion ? formatDateTimeLocal(promotion.startDate) : "",
    endDate: promotion ? formatDateTimeLocal(promotion.endDate) : "",
    status: promotion?.status || "ACTIVE",
    applyToAllGroups: promotion?.applyToAllGroups || false,
    applicableCategories: promotion?.applicableCategories || [],
    discountTiers: (promotion?.discountTiers || [
      { minQuantity: 5, discountPercentage: 5 },
      { minQuantity: 10, discountPercentage: 10 },
    ]) as DiscountTier[],
  });


  useEffect(() => {
    const fetchGroupTitles = async () => {
      try {
        const titles = await restaurantApi.getMenuGroups(restaurantId);
        setGroupTitles(titles);
      } catch (error) {
        console.error("Failed to fetch group titles:", error);
      }
    };
    fetchGroupTitles();
  }, [restaurantId]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate tiers
    if (formData.discountTiers.length === 0) {
      alert("Please add at least one discount tier");
      return;
    }

    // Validate tier quantities are ascending
    const sortedTiers = [...formData.discountTiers].sort((a, b) => a.minQuantity - b.minQuantity);
    for (let i = 0; i < sortedTiers.length - 1; i++) {
      if (sortedTiers[i].minQuantity === sortedTiers[i + 1].minQuantity) {
        alert("Each tier must have a unique minimum quantity");
        return;
      }
    }

    onSubmit({
      ...formData,
      promotionType: "BUY_MORE_SAVE_MORE",
      discountPercentage: 0, // Not used for this type, but required by backend
    });
  };

  const toggleGroupTitle = (groupTitle: string) => {
    setFormData(prev => ({
      ...prev,
      applicableCategories: prev.applicableCategories.includes(groupTitle)
        ? prev.applicableCategories.filter(title => title !== groupTitle)
        : [...prev.applicableCategories, groupTitle]
    }));
  };

  const addTier = () => {
    setFormData(prev => ({
      ...prev,
      discountTiers: [
        ...prev.discountTiers,
        { minQuantity: 0, discountPercentage: 0 }
      ]
    }));
  };

  const removeTier = (index: number) => {
    if (formData.discountTiers.length <= 1) {
      alert("You must have at least one discount tier");
      return;
    }
    setFormData(prev => ({
      ...prev,
      discountTiers: prev.discountTiers.filter((_, i) => i !== index)
    }));
  };

  const updateTier = (index: number, field: keyof DiscountTier, value: number) => {
    setFormData(prev => ({
      ...prev,
      discountTiers: prev.discountTiers.map((tier, i) => 
        i === index ? { ...tier, [field]: value } : tier
      )
    }));
  };

  const sortedTiers = [...formData.discountTiers].sort((a, b) => a.minQuantity - b.minQuantity);

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow p-6 space-y-6">
      {isEditMode && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Status *
          </label>
          <select
            required
            value={formData.status}
            onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="ACTIVE">Active</option>
            <option value="INACTIVE">Inactive</option>
            <option value="SCHEDULED">Scheduled</option>
            <option value="EXPIRED">Expired</option>
          </select>
        </div>
      )}

      {/* Basic Info */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Promotion Name *
        </label>
        <input
          type="text"
          required
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          placeholder="e.g., Buy More, Save More on Sandwiches"
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Description
        </label>
        <textarea
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          placeholder="Describe how customers can save with this promotion"
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          rows={3}
        />
      </div>

      {/* Discount Tiers */}
      <div className="border-t border-gray-200 pt-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Discount Tiers *</h3>
            <p className="text-sm text-gray-600 mt-1">
              Set quantity thresholds and their corresponding discounts
            </p>
          </div>
          <button
            type="button"
            onClick={addTier}
            className="flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition"
          >
            <Plus size={16} />
            Add Tier
          </button>
        </div>

        <div className="space-y-3">
          {sortedTiers.map((tier, index) => {
            const originalIndex = formData.discountTiers.findIndex(
              t => t.minQuantity === tier.minQuantity && t.discountPercentage === tier.discountPercentage
            );
            return (
              <div 
                key={originalIndex} 
                className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg border border-gray-200"
              >
                <div className="flex-1">
                  <label className="block text-xs font-medium text-gray-600 mb-1">
                    Min Quantity
                  </label>
                  <input
                    type="number"
                    required
                    min="1"
                    value={tier.minQuantity}
                    onChange={(e) => updateTier(originalIndex, 'minQuantity', Number(e.target.value))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div className="flex-1">
                  <label className="block text-xs font-medium text-gray-600 mb-1">
                    Discount (%)
                  </label>
                  <input
                    type="number"
                    required
                    min="0"
                    max="100"
                    step="0.01"
                    value={tier.discountPercentage}
                    onChange={(e) => updateTier(originalIndex, 'discountPercentage', Number(e.target.value))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <button
                  type="button"
                  onClick={() => removeTier(originalIndex)}
                  disabled={formData.discountTiers.length <= 1}
                  className="mt-5 p-2 text-red-600 hover:bg-red-50 rounded-lg transition disabled:opacity-30 disabled:cursor-not-allowed"
                  title="Remove tier"
                >
                  <Trash2 size={18} />
                </button>
              </div>
            );
          })}
        </div>

        {/* Tier Preview */}
        <div className="mt-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
          <p className="text-sm font-medium text-blue-900 mb-2">Tier Preview:</p>
          <div className="space-y-1">
            {sortedTiers.map((tier, index) => (
              <p key={index} className="text-sm text-blue-800">
                Buy {tier.minQuantity}+ items → Get {tier.discountPercentage}% off
              </p>
            ))}
          </div>
        </div>
      </div>

      {/* Apply to All Groups Toggle */}
      <div className="border-t border-gray-200 pt-6">
        <label className="flex items-center gap-3 cursor-pointer">
          <input
            type="checkbox"
            checked={formData.applyToAllGroups}
            onChange={(e) => setFormData({ 
              ...formData, 
              applyToAllGroups: e.target.checked,
              applicableCategories: e.target.checked ? [] : formData.applicableCategories
            })}
            className="h-5 w-5 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
          />
          <div>
            <span className="font-medium text-gray-900">Apply to all menu groups</span>
            <p className="text-sm text-gray-600">
              When enabled, this promotion will count all items together
            </p>
          </div>
        </label>
      </div>

      {/* Select Specific Groups (if not applying to all) */}
      {!formData.applyToAllGroups && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Select Menu Groups * ({formData.applicableCategories.length} selected)
          </label>
          <p className="text-sm text-gray-600 mb-3">
            Only items from selected groups will count toward the quantity threshold
          </p>
          <div className="border border-gray-300 rounded-lg p-4 max-h-60 overflow-y-auto">
            {groupTitles.length === 0 ? (
              <p className="text-gray-500 text-center py-4">No menu groups found</p>
            ) : (
              groupTitles.map((groupTitle) => (
                <label 
                  key={groupTitle} 
                  className="flex items-center p-2 hover:bg-gray-50 rounded cursor-pointer"
                >
                  <input
                    type="checkbox"
                    checked={formData.applicableCategories.includes(groupTitle)}
                    onChange={() => toggleGroupTitle(groupTitle)}
                    className="mr-3 h-4 w-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                  />
                  <span className="font-medium">{groupTitle}</span>
                </label>
              ))
            )}
          </div>
        </div>
      )}

      {/* Max Discount and Min Order */}
      <div className="grid grid-cols-2 gap-4 border-t border-gray-200 pt-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Max Discount Amount (£)
          </label>
          <input
            type="number"
            min="0"
            step="0.01"
            value={formData.maxDiscountAmount || ""}
            onChange={(e) => setFormData({ 
              ...formData, 
              maxDiscountAmount: e.target.value ? Number(e.target.value) : null 
            })}
            placeholder="Optional cap"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          <p className="text-xs text-gray-500 mt-1">Leave empty for no cap</p>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Min Order Amount (£)
          </label>
          <input
            type="number"
            min="0"
            step="0.01"
            value={formData.minOrderAmount || ""}
            onChange={(e) => setFormData({ 
              ...formData, 
              minOrderAmount: e.target.value ? Number(e.target.value) : null 
            })}
            placeholder="Optional minimum"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          <p className="text-xs text-gray-500 mt-1">Leave empty for no minimum</p>
        </div>
      </div>

      {/* Applicability */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Applicability *
        </label>
        <select
          required
          value={formData.applicability}
          onChange={(e) => setFormData({ ...formData, applicability: e.target.value as any })}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        >
          <option value="CATERING">Catering Only</option>
          <option value="CORPORATE">Corporate Only</option>
          <option value="BOTH">Both</option>
        </select>
      </div>

      {/* Date Range */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Start Date *
          </label>
          <input
            type="datetime-local"
            required
            value={formData.startDate}
            onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            End Date *
          </label>
          <input
            type="datetime-local"
            required
            value={formData.endDate}
            onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex justify-end space-x-4 pt-4 border-t border-gray-200">
        <button
          type="button"
          onClick={onCancel}
          disabled={submitting}
          className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition disabled:opacity-50"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={
            submitting || 
            formData.discountTiers.length === 0 ||
            (!formData.applyToAllGroups && formData.applicableCategories.length === 0)
          }
          className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {submitting ? (isEditMode ? "Updating..." : "Creating...") : (isEditMode ? "Update Promotion" : "Create Promotion")}
        </button>
      </div>
    </form>
  );
}


function formatDateTimeLocal(dateString: string): string {
  const date = new Date(dateString);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  return `${year}-${month}-${day}T${hours}:${minutes}`;
}