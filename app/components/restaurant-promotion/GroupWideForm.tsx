"use client";

import { useState, useEffect } from "react";
import { restaurantApi } from "@/app/api/restaurantApi";

interface GroupWideFormProps {
  onSubmit: (data: any) => void;
  onCancel: () => void;
  submitting: boolean;
  restaurantId: string; // Add this prop
}

export function GroupWideForm({ onSubmit, onCancel, submitting, restaurantId }: GroupWideFormProps) {
  const [groupTitles, setGroupTitles] = useState<string[]>([]);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    applicability: "BOTH",
    discountPercentage: 0,
    maxDiscountAmount: null as number | null,
    minOrderAmount: null as number | null,
    startDate: "",
    endDate: "",
    applicableCategories: [] as string[], // These will be groupTitle strings
  });

  useEffect(() => {
    const fetchGroupTitles = async () => {
      try {
        const titles = await restaurantApi.getMenuGroups(restaurantId)
        setGroupTitles(titles);
      } catch (error) {
        console.error("Failed to fetch group titles:", error);
      }
    };
    fetchGroupTitles();
  }, [restaurantId]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      ...formData,
      promotionType: "CATEGORY_SPECIFIC",
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

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow p-6 space-y-6">
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
          className="w-full px-4 py-2 border border-gray-300 rounded-lg"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Description
        </label>
        <textarea
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg"
          rows={3}
        />
      </div>

      {/* Select Group Titles */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Select Menu Groups * ({formData.applicableCategories.length} selected)
        </label>
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
                  className="mr-3 h-4 w-4"
                />
                <span className="font-medium">{groupTitle}</span>
              </label>
            ))
          )}
        </div>
      </div>

      {/* Discount Percentage */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Discount Percentage (%) *
        </label>
        <input
          type="number"
          required
          min="0"
          max="100"
          value={formData.discountPercentage}
          onChange={(e) => setFormData({ ...formData, discountPercentage: Number(e.target.value) })}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Max Discount Amount
          </label>
          <input
            type="number"
            min="0"
            value={formData.maxDiscountAmount || 0}
            onChange={(e) => setFormData({ ...formData, maxDiscountAmount: Number(e.target.value) })}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Min Order Amount
          </label>
          <input
            type="number"
            min="0"
            value={formData.minOrderAmount || 0}
            onChange={(e) => setFormData({ ...formData, minOrderAmount: Number(e.target.value) })}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Applicability *
        </label>
        <select
          required
          value={formData.applicability}
          onChange={(e) => setFormData({ ...formData, applicability: e.target.value })}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg"
        >
          <option value="CATERING">Catering Only</option>
          <option value="CORPORATE">Corporate Only</option>
          <option value="BOTH">Both</option>
        </select>
      </div>

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
            className="w-full px-4 py-2 border border-gray-300 rounded-lg"
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
            className="w-full px-4 py-2 border border-gray-300 rounded-lg"
          />
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex justify-end space-x-4 pt-4">
        <button
          type="button"
          onClick={onCancel}
          disabled={submitting}
          className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={submitting || formData.applicableCategories.length === 0}
          className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
        >
          {submitting ? "Creating..." : "Create Promotion"}
        </button>
      </div>
    </form>
  );
}