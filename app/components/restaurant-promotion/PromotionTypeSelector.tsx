// components/restaurant-promotions/PromotionTypeSelector.tsx
"use client";

import { X } from "lucide-react";
import { PROMOTION_TYPES } from "@/types/promotion.types";

interface PromotionTypeSelectorProps {
  onSelect: (type: string) => void;
  onClose: () => void;
}

export const PromotionTypeSelector = ({
  onSelect,
  onClose,
}: PromotionTypeSelectorProps) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b px-6 py-4 flex items-center justify-between">
          <h2 className="text-2xl font-bold text-gray-900">
            Select Promotion Type
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition"
          >
            <X size={24} />
          </button>
        </div>

        {/* Promotion Types Grid */}
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {PROMOTION_TYPES.map((promo) => (
              <button
                key={promo.type}
                onClick={() => promo.available && !promo.comingSoon && onSelect(promo.type)}
                disabled={!promo.available || promo.comingSoon}
                className={`relative p-6 rounded-lg border-2 text-left transition ${
                  promo.available && !promo.comingSoon
                    ? "border-gray-200 hover:border-blue-500 hover:shadow-lg cursor-pointer"
                    : "border-gray-200 bg-gray-50 cursor-not-allowed opacity-60"
                }`}
              >
                <div className="flex items-start">
                  <div className="text-4xl mr-4">{promo.icon}</div>
                  <div className="flex-1">
                    <h3 className="text-lg font-bold text-gray-900 mb-2">
                      {promo.title}
                    </h3>
                    <p className="text-sm text-gray-600">{promo.description}</p>
                  </div>
                </div>
                {promo.comingSoon && (
                  <div className="absolute top-4 right-4">
                    <span className="px-3 py-1 bg-yellow-100 text-yellow-800 text-xs font-semibold rounded-full">
                      Coming Soon
                    </span>
                  </div>
                )}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};