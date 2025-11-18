// app/components/restaurant-promotion/BogoForm.tsx
"use client";

import { useState, useEffect } from "react";
import { Promotion } from "@/services/api/promotion.api";
import { cateringService } from "@/services/api/catering.api";

interface MenuItem {
  id: string;
  name: string;
  price: number;
  groupTitle: string;
}

interface BogoFormProps {
  onSubmit: (data: any) => void;
  onCancel: () => void;
  submitting: boolean;
  restaurantId: string;
  promotion?: Promotion;
  mode?: "create" | "edit";
}

export function BogoForm({ 
  onSubmit, 
  onCancel, 
  submitting, 
  restaurantId,
  promotion,
  mode = "create"
}: BogoFormProps) {
  const isEditMode = mode === "edit" && promotion;
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [formData, setFormData] = useState({
    name: promotion?.name || "",
    description: promotion?.description || "",
    applicability: promotion?.applicability || "BOTH",
    maxDiscountAmount: promotion?.maxDiscountAmount || null,
    minOrderAmount: promotion?.minOrderAmount || null,
    startDate: promotion ? formatDateTimeLocal(promotion.startDate) : "",
    endDate: promotion ? formatDateTimeLocal(promotion.endDate) : "",
    status: promotion?.status || "ACTIVE",
    bogoType: (promotion as any)?.bogoType || "BUY_ONE_GET_ONE_FREE",
    buyQuantity: (promotion as any)?.buyQuantity || 1,
    getQuantity: (promotion as any)?.getQuantity || 1,
    bogoItemIds: (promotion as any)?.bogoItemIds || []
  });

  useEffect(() => {
    const fetchMenuItems = async () => {
      try {
        setLoading(true);
        const items = await cateringService.getRestaurantMenuItems(restaurantId)
        setMenuItems(items);
      } catch (error) {
        console.error("Failed to fetch menu items:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchMenuItems();
  }, [restaurantId]);

  useEffect(() => {
    if (promotion && (promotion as any).bogoItemIds) {
      setFormData(prev => ({
        ...prev,
        bogoItemIds: (promotion as any).bogoItemIds || []
      }));
    }
  }, [promotion]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (formData.bogoItemIds.length === 0) {
      alert("Please select at least one menu item for this BOGO promotion");
      return;
    }

    onSubmit({
      ...formData,
      promotionType: "BOGO",
      discountPercentage: 0, // Not used for BOGO
    });
  };

  const toggleMenuItem = (itemId: string) => {
    setFormData(prev => ({
      ...prev,
      bogoItemIds: prev.bogoItemIds.includes(itemId)
        ? prev.bogoItemIds.filter((id: string) => id !== itemId)
        : [...prev.bogoItemIds, itemId]
    }));
  };

  const handleBogoTypeChange = (type: string) => {
    setFormData(prev => ({
      ...prev,
      bogoType: type as any,
      buyQuantity: type === "BUY_ONE_GET_ONE_FREE" ? 1 : prev.buyQuantity,
      getQuantity: type === "BUY_ONE_GET_ONE_FREE" ? 1 : prev.getQuantity,
    }));
  };

  // Group items by category
  const groupedItems = menuItems.reduce((acc, item) => {
    const group = item.groupTitle || "Other";
    if (!acc[group]) {
      acc[group] = [];
    }
    acc[group].push(item);
    return acc;
  }, {} as Record<string, MenuItem[]>);

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
          placeholder="e.g., Buy 1 Get 1 Free on Sandwiches"
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
          placeholder="Describe your BOGO deal"
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

      {/* BOGO Type */}
      <div className="border-t border-gray-200 pt-6">
        <label className="block text-sm font-medium text-gray-700 mb-3">
          BOGO Type *
        </label>
        <div className="space-y-3">
          <label className="flex items-start p-4 border-2 rounded-lg cursor-pointer hover:bg-gray-50 transition">
            <input
              type="radio"
              name="bogoType"
              value="BUY_ONE_GET_ONE_FREE"
              checked={formData.bogoType === "BUY_ONE_GET_ONE_FREE"}
              onChange={(e) => handleBogoTypeChange(e.target.value)}
              className="mt-1 h-4 w-4 text-blue-600"
            />
            <div className="ml-3">
              <span className="font-medium text-gray-900">Buy 1 Get 1 Free</span>
              <p className="text-sm text-gray-600 mt-1">
                Classic BOGO - Buy one item, get another of equal or lesser value free
              </p>
            </div>
          </label>

          <label className="flex items-start p-4 border-2 rounded-lg cursor-pointer hover:bg-gray-50 transition">
            <input
              type="radio"
              name="bogoType"
              value="BUY_X_GET_Y_FREE"
              checked={formData.bogoType === "BUY_X_GET_Y_FREE"}
              onChange={(e) => handleBogoTypeChange(e.target.value)}
              className="mt-1 h-4 w-4 text-blue-600"
            />
            <div className="ml-3">
              <span className="font-medium text-gray-900">Buy X Get Y Free</span>
              <p className="text-sm text-gray-600 mt-1">
                Flexible deal - Define custom quantities (e.g., Buy 2 Get 1 Free)
              </p>
            </div>
          </label>
        </div>
      </div>

      {/* Custom Quantities (only if BUY_X_GET_Y_FREE) */}
      {formData.bogoType === "BUY_X_GET_Y_FREE" && (
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Buy Quantity *
            </label>
            <input
              type="number"
              required
              min="1"
              value={formData.buyQuantity}
              onChange={(e) => setFormData({ ...formData, buyQuantity: Number(e.target.value) })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <p className="text-xs text-gray-500 mt-1">Number of items to purchase</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Get Quantity Free *
            </label>
            <input
              type="number"
              required
              min="1"
              value={formData.getQuantity}
              onChange={(e) => setFormData({ ...formData, getQuantity: Number(e.target.value) })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <p className="text-xs text-gray-500 mt-1">Number of free items</p>
          </div>
        </div>
      )}

      {/* BOGO Preview */}
      <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
        <p className="text-sm font-medium text-blue-900">
          Deal Preview: Buy {formData.buyQuantity} Get {formData.getQuantity} Free
        </p>
        <p className="text-xs text-blue-700 mt-1">
          Customers will pay for {formData.buyQuantity} item(s) and receive {formData.getQuantity} free
        </p>
      </div>

      {/* Select Menu Items */}
      <div className="border-t border-gray-200 pt-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Select Menu Items * ({formData.bogoItemIds.length} selected)
        </label>
        <p className="text-sm text-gray-600 mb-3">
          Choose which items are eligible for this BOGO promotion
        </p>
        
        {loading ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <p className="text-gray-600 mt-2">Loading menu items...</p>
          </div>
        ) : (
          <div className="border border-gray-300 rounded-lg p-4 max-h-96 overflow-y-auto">
            {Object.keys(groupedItems).length === 0 ? (
              <p className="text-gray-500 text-center py-4">No menu items found</p>
            ) : (
              Object.entries(groupedItems).map(([groupTitle, items]) => (
                <div key={groupTitle} className="mb-4 last:mb-0">
                  <h4 className="font-semibold text-gray-900 mb-2 sticky top-0 bg-white py-2">
                    {groupTitle}
                  </h4>
                  <div className="space-y-1 ml-2">
                    {items.map((item) => (
                      <label 
                        key={item.id} 
                        className="flex items-center justify-between p-2 hover:bg-gray-50 rounded cursor-pointer"
                      >
                        <div className="flex items-center">
                        <input
                          type="checkbox"
                          checked={formData.bogoItemIds?.includes(item.id) || false}
                          onChange={() => toggleMenuItem(item.id)}
                          className="mr-3 h-4 w-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                        />
                          <span className="font-medium">{item.name}</span>
                        </div>
                        <span className="text-sm text-gray-600">£{Number(item.price).toFixed(2)}</span>
                      </label>
                    ))}
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>

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
          disabled={submitting || formData.bogoItemIds.length === 0}
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