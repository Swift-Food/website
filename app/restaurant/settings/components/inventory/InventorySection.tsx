"use client";

import { ArrowLeft } from "lucide-react";
import { InventoryManagement } from "./InventoryManagement";

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

        <InventoryManagement
          restaurantId={restaurantId}
          isCatering={isCatering}
          isCorporate={isCorporate}
        />
      </div>
    </div>
  );
};
