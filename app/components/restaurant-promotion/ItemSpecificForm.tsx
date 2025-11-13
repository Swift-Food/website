"use client";

import { useState, useEffect } from "react";
import { menuService } from "@/services/menuServices";

interface ItemSpecificFormProps {
  onSubmit: (data: any) => void;
  onCancel: () => void;
  submitting: boolean;
}

export function ItemSpecificForm({ onSubmit, onCancel, submitting }: ItemSpecificFormProps) {
  const [menuItems, setMenuItems] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    applicability: "BOTH",
    discountPercentage: 0,
    maxDiscountAmount: 0,
    minOrderAmount: 0,
    startDate: "",
    endDate: "",
    applicableMenuItemIds: [] as string[],
  });

  useEffect(() => {
    const fetchMenuItems = async () => {
      try {
        const menuData = await menuService.getMenu(/* restaurantId */);
        setMenuItems(menuData.items || []);
      } catch (error) {
        console.error("Failed to fetch menu items:", error);
      }
    };
    fetchMenuItems();
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      ...formData,
      type: "ITEM_SPECIFIC",
    });
  };

  const toggleItem = (itemId: string) => {
    setFormData(prev => ({
      ...prev,
      applicableMenuItemIds: prev.applicableMenuItemIds.includes(itemId)
        ? prev.applicableMenuItemIds.filter(id => id !== itemId)
        : [...prev.applicableMenuItemIds, itemId]
    }));
  };

  const filteredItems = menuItems.filter(item =>
    item.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow p-6 space-y-6">
      {/* Basic Info - same as GroupWideForm */}
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

      {/* Select Menu Items */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Select Menu Items * ({formData.applicableMenuItemIds.length} selected)
        </label>
        <input
          type="text"
          placeholder="Search menu items..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg mb-2"
        />
        <div className="border border-gray-300 rounded-lg p-4 max-h-60 overflow-y-auto">
          {filteredItems.map((item) => (
            <label key={item.id} className="flex items-center p-2 hover:bg-gray-50 rounded cursor-pointer">
              <input
                type="checkbox"
                checked={formData.applicableMenuItemIds.includes(item.id)}
                onChange={() => toggleItem(item.id)}
                className="mr-3 h-4 w-4"
              />
              <div className="flex-1">
                <span className="font-medium">{item.name}</span>
                {item.price && <span className="text-gray-500 ml-2">${item.price}</span>}
              </div>
            </label>
          ))}
        </div>
      </div>

      {/* Rest of form - same as above */}
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

      {/* Same grid fields, applicability, and dates as GroupWideForm */}
      
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
          disabled={submitting}
          className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
        >
          {submitting ? "Creating..." : "Create Promotion"}
        </button>
      </div>
    </form>
  );
}