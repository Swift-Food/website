// app/components/restaurant-promotion/forms/RestaurantWideForm.tsx
"use client";

import { useState } from "react";
import { Calendar, Percent, DollarSign, Tag } from "lucide-react";

interface RestaurantWideFormProps {
  onSubmit: (data: any) => Promise<void>;
  onCancel: () => void;
  submitting: boolean;
  initialData?: any;
}

export const RestaurantWideForm = ({
  onSubmit,
  onCancel,
  submitting,
  initialData,
}: RestaurantWideFormProps) => {
  const [formData, setFormData] = useState({
    name: initialData?.name || "",
    description: initialData?.description || "",
    applicability: initialData?.applicability || "BOTH",
    discountPercentage: initialData?.discountPercentage || "",
    maxDiscountAmount: initialData?.maxDiscountAmount || "",
    minOrderAmount: initialData?.minOrderAmount || "",
    startDate: initialData?.startDate
      ? new Date(initialData.startDate).toISOString().slice(0, 16)
      : "",
    endDate: initialData?.endDate
      ? new Date(initialData.endDate).toISOString().slice(0, 16)
      : "",
    priority: initialData?.priority || 0,
    isStackable: initialData?.isStackable || false,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleChange = (
    e: React.ChangeEvent< 
    HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;

    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));

    // Clear error for this field
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const validate = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = "Promotion name is required";
    }

    if (!formData.discountPercentage) {
      newErrors.discountPercentage = "Discount percentage is required";
    } else if (
      Number(formData.discountPercentage) < 0 ||
      Number(formData.discountPercentage) > 100
    ) {
      newErrors.discountPercentage = "Discount must be between 0 and 100";
    }

    if (!formData.startDate) {
      newErrors.startDate = "Start date is required";
    }

    if (!formData.endDate) {
      newErrors.endDate = "End date is required";
    }

    if (formData.startDate && formData.endDate) {
      if (new Date(formData.startDate) >= new Date(formData.endDate)) {
        newErrors.endDate = "End date must be after start date";
      }
    }

    if (
      formData.maxDiscountAmount &&
      Number(formData.maxDiscountAmount) < 0
    ) {
      newErrors.maxDiscountAmount = "Max discount must be positive";
    }

    if (formData.minOrderAmount && Number(formData.minOrderAmount) < 0) {
      newErrors.minOrderAmount = "Min order amount must be positive";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validate()) {
      return;
    }

    const submitData = {
      ...formData,
      discountPercentage: Number(formData.discountPercentage),
      maxDiscountAmount: formData.maxDiscountAmount
        ? Number(formData.maxDiscountAmount)
        : undefined,
      minOrderAmount: formData.minOrderAmount
        ? Number(formData.minOrderAmount)
        : undefined,
      priority: Number(formData.priority),
      startDate: new Date(formData.startDate).toISOString(),
      endDate: new Date(formData.endDate).toISOString(),
    };

    await onSubmit(submitData);
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-sm">
      <div className="p-6 space-y-6">
        {/* Basic Information */}
        <div>
          <h2 className="text-xl font-bold text-gray-900 mb-4">
            Basic Information
          </h2>

          {/* Promotion Name */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Promotion Name *
            </label>
            <div className="relative">
              <Tag
                className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                size={20}
              />
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="e.g., Weekend Special Offer"
                className={`w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  errors.name ? "border-red-500" : "border-gray-300"
                }`}
              />
            </div>
            {errors.name && (
              <p className="mt-1 text-sm text-red-600">{errors.name}</p>
            )}
          </div>

          {/* Description */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Description (Optional)
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Describe your promotion..."
              rows={3}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Applicability */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Applies To *
            </label>
            <select
              name="applicability"
              value={formData.applicability}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="BOTH">Both Catering & Corporate</option>
              <option value="CATERING">Catering Orders Only</option>
              <option value="CORPORATE">Corporate Orders Only</option>
            </select>
          </div>
        </div>

        {/* Discount Settings */}
        <div>
          <h2 className="text-xl font-bold text-gray-900 mb-4">
            Discount Settings
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Discount Percentage */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Discount Percentage *
              </label>
              <div className="relative">
                <Percent
                  className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                  size={20}
                />
                <input
                  type="number"
                  name="discountPercentage"
                  value={formData.discountPercentage}
                  onChange={handleChange}
                  placeholder="10"
                  min="0"
                  max="100"
                  step="0.01"
                  className={`w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    errors.discountPercentage
                      ? "border-red-500"
                      : "border-gray-300"
                  }`}
                />
              </div>
              {errors.discountPercentage && (
                <p className="mt-1 text-sm text-red-600">
                  {errors.discountPercentage}
                </p>
              )}
            </div>

            {/* Max Discount Amount */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Max Discount Amount (Optional)
              </label>
              <div className="relative">
                <DollarSign
                  className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                  size={20}
                />
                <input
                  type="number"
                  name="maxDiscountAmount"
                  value={formData.maxDiscountAmount}
                  onChange={handleChange}
                  placeholder="50"
                  min="0"
                  step="0.01"
                  className={`w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    errors.maxDiscountAmount
                      ? "border-red-500"
                      : "border-gray-300"
                  }`}
                />
              </div>
              {errors.maxDiscountAmount && (
                <p className="mt-1 text-sm text-red-600">
                  {errors.maxDiscountAmount}
                </p>
              )}
              <p className="mt-1 text-xs text-gray-500">
                Cap the maximum discount amount
              </p>
            </div>

            {/* Min Order Amount */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Min Order Amount (Optional)
              </label>
              <div className="relative">
                <DollarSign
                  className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                  size={20}
                />
                <input
                  type="number"
                  name="minOrderAmount"
                  value={formData.minOrderAmount}
                  onChange={handleChange}
                  placeholder="100"
                  min="0"
                  step="0.01"
                  className={`w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    errors.minOrderAmount
                      ? "border-red-500"
                      : "border-gray-300"
                  }`}
                />
              </div>
              {errors.minOrderAmount && (
                <p className="mt-1 text-sm text-red-600">
                  {errors.minOrderAmount}
                </p>
              )}
              <p className="mt-1 text-xs text-gray-500">
                Minimum order value to qualify
              </p>
            </div>

            {/* Priority */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Priority
              </label>
              <input
                type="number"
                name="priority"
                value={formData.priority}
                onChange={handleChange}
                placeholder="0"
                min="0"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <p className="mt-1 text-xs text-gray-500">
                Lower number = higher priority
              </p>
            </div>
          </div>
        </div>

        {/* Date Range */}
        <div>
          <h2 className="text-xl font-bold text-gray-900 mb-4">
            Validity Period
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Start Date */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Start Date & Time *
              </label>
              <div className="relative">
                <Calendar
                  className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                  size={20}
                />
                <input
                  type="datetime-local"
                  name="startDate"
                  value={formData.startDate}
                  onChange={handleChange}
                  className={`w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    errors.startDate ? "border-red-500" : "border-gray-300"
                  }`}
                />
              </div>
              {errors.startDate && (
                <p className="mt-1 text-sm text-red-600">{errors.startDate}</p>
              )}
            </div>

            {/* End Date */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                End Date & Time *
              </label>
              <div className="relative">
                <Calendar
                  className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                  size={20}
                />
                <input
                  type="datetime-local"
                  name="endDate"
                  value={formData.endDate}
                  onChange={handleChange}
                  className={`w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    errors.endDate ? "border-red-500" : "border-gray-300"
                  }`}
                />
              </div>
              {errors.endDate && (
                <p className="mt-1 text-sm text-red-600">{errors.endDate}</p>
              )}
            </div>
          </div>
        </div>

        {/* Advanced Options */}
        <div>
          <h2 className="text-xl font-bold text-gray-900 mb-4">
            Advanced Options
          </h2>

          <div className="flex items-center">
            <input
              type="checkbox"
              name="isStackable"
              checked={formData.isStackable}
              onChange={handleChange}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <label className="ml-2 block text-sm text-gray-700">
              Allow stacking with other promotions
            </label>
          </div>
          <p className="mt-1 ml-6 text-xs text-gray-500">
            When enabled, this promotion can be combined with others
          </p>
        </div>

        {/* Preview */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h3 className="font-semibold text-gray-900 mb-2">Preview</h3>
          <div className="text-sm text-gray-700 space-y-1">
            <p>
              <span className="font-medium">Discount:</span>{" "}
              {formData.discountPercentage || "0"}%
              {formData.maxDiscountAmount &&
                ` (max £${formData.maxDiscountAmount})`}
            </p>
            {formData.minOrderAmount && (
              <p>
                <span className="font-medium">Minimum order:</span> £
                {formData.minOrderAmount}
              </p>
            )}
            <p>
              <span className="font-medium">Applies to:</span>{" "}
              {formData.applicability === "BOTH"
                ? "Catering & Corporate"
                : formData.applicability}
            </p>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="border-t px-6 py-4 flex justify-end space-x-3 bg-gray-50 rounded-b-lg">
        <button
          type="button"
          onClick={onCancel}
          disabled={submitting}
          className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition disabled:opacity-50"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={submitting}
          className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:opacity-50 flex items-center"
        >
          {submitting ? (
            <>
              <svg
                className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                ></circle>
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                ></path>
              </svg>
              Creating...
            </>
          ) : (
            "Create Promotion"
          )}
        </button>
      </div>
    </form>
  );
};