// app/components/restaurant-promotion/RestaurantWideForm.tsx
"use client";

import { useState } from "react";
import type { Promotion } from "@/services/api/promotion.api";

interface RestaurantWideFormProps {
  onSubmit: (data: any) => void;
  onCancel: () => void;
  submitting: boolean;
  promotion?: Promotion; // Optional: for edit mode
  mode?: "create" | "edit"; // Optional: defaults to "create"
}

export function RestaurantWideForm({ 
  onSubmit, 
  onCancel, 
  submitting,
  promotion,
  mode = "create"
}: RestaurantWideFormProps) {
  const isEditMode = mode === "edit" && promotion;

  const [formData, setFormData] = useState({
    name: promotion?.name || "",
    description: promotion?.description || "",
    applicability: promotion?.applicability || "BOTH",
    discountPercentage: promotion?.discountPercentage || 0,
    maxDiscountAmount: promotion?.maxDiscountAmount || null,
    minOrderAmount: promotion?.minOrderAmount || null,
    startDate: promotion ? formatDateTimeLocal(promotion.startDate) : "",
    endDate: promotion ? formatDateTimeLocal(promotion.endDate) : "",
    status: promotion?.status || "ACTIVE",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      ...formData,
      promotionType: "RESTAURANT_WIDE",
    });
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
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          rows={3}
        />
      </div>

      {/* Status (only show in edit mode) */}
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
          step="0.01"
          value={formData.discountPercentage}
          onChange={(e) => setFormData({ ...formData, discountPercentage: Number(e.target.value) })}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
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
        </div>
      </div>

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
          disabled={submitting}
          className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:opacity-50"
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