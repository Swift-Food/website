// components/restaurant-promotions/PromotionsList.tsx
"use client";

import { useState } from "react";
import { Edit2, Trash2, ToggleLeft, ToggleRight } from "lucide-react";
import { Promotion, promotionsServices } from "@/services/promotionServices";
import { useRouter } from "next/navigation";

interface PromotionsListProps {
  promotions: Promotion[];
  restaurantId: string;
  onRefresh: () => void;
}

export const PromotionsList = ({
  promotions,
  restaurantId,
  onRefresh,
}: PromotionsListProps) => {
  const router = useRouter();
  const [toggling, setToggling] = useState<string | null>(null);

  const handleToggleStatus = async (promotion: Promotion) => {
    setToggling(promotion.id);
    try {
      const newStatus = promotion.status === "ACTIVE" ? "INACTIVE" : "ACTIVE";
      await promotionsServices.updatePromotionStatus(promotion.id, newStatus);
      onRefresh();
    } catch (error) {
      console.error("Failed to toggle promotion:", error);
      alert("Failed to update promotion status");
    } finally {
      setToggling(null);
    }
  };

  const handleDelete = async (promotionId: string) => {
    if (!confirm("Are you sure you want to delete this promotion?")) {
      return;
    }

    try {
      await promotionsServices.deletePromotion(promotionId);
      onRefresh();
    } catch (error) {
      console.error("Failed to delete promotion:", error);
      alert("Failed to delete promotion");
    }
  };

  if (promotions.length === 0) {
    return (
      <div className="bg-white rounded-lg p-12 text-center">
        <div className="text-6xl mb-4">🎯</div>
        <h3 className="text-xl font-bold text-gray-900 mb-2">
          No Promotions Yet
        </h3>
        <p className="text-gray-600">
          Create your first promotion to attract more customers
        </p>
      </div>
    );
  }
  console.log("promotions", JSON.stringify(promotions))

  return (
    <div className="space-y-4">
      {promotions.map((promotion) => (
        <div
          key={promotion.id}
          className="bg-white rounded-lg p-6 border border-gray-200 hover:shadow-md transition"
        >
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <h3 className="text-md font-bold text-gray-900">
                  {promotion.promotionType}
              </h3>
              <div className="flex mt-2 items-center mb-2">
                <h3 className="text-xl font-bold text-gray-900">
                  {promotion.name}
                </h3>
                
                <span
                  className={`ml-3 px-3 py-1 rounded-full text-xs font-semibold ${
                    promotion.status === "ACTIVE"
                      ? "bg-green-100 text-green-800"
                      : "bg-gray-100 text-gray-800"
                  }`}
                >
                  {promotion.status}
                </span>
                <span className="ml-2 px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-semibold">
                  {promotion.applicability}
                </span>
              </div>
              <p className="text-gray-600 mb-4">{promotion.description}</p>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div>
                  <span className="text-gray-500">Discount:</span>
                  <span className="ml-2 font-semibold text-gray-900">
                    {promotion.discountPercentage}%
                  </span>
                </div>
                {promotion.minOrderAmount && (
                  <div>
                    <span className="text-gray-500">Min Order:</span>
                    <span className="ml-2 font-semibold text-gray-900">
                      £{promotion.minOrderAmount}
                    </span>
                  </div>
                )}
                {promotion.maxDiscountAmount && (
                  <div>
                    <span className="text-gray-500">Max Discount:</span>
                    <span className="ml-2 font-semibold text-gray-900">
                      £{promotion.maxDiscountAmount}
                    </span>
                  </div>
                )}
                <div>
                  <span className="text-gray-500">Valid Until:</span>
                  <span className="ml-2 font-semibold text-gray-900">
                    {new Date(promotion.endDate).toLocaleDateString()}
                  </span>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center space-x-2 ml-4">
              <button
                onClick={() => handleToggleStatus(promotion)}
                disabled={toggling === promotion.id}
                className="p-2 hover:bg-gray-100 rounded-full transition"
                title={
                  promotion.status === "ACTIVE" ? "Deactivate" : "Activate"
                }
              >
                {promotion.status === "ACTIVE" ? (
                  <ToggleRight size={24} className="text-green-600" />
                ) : (
                  <ToggleLeft size={24} className="text-gray-400" />
                )}
              </button>
              <button
                onClick={() =>
                  router.push(
                    `/restaurant/promotions/${restaurantId}/edit/${promotion.id}`
                  )
                }
                className="p-2 hover:bg-gray-100 rounded-full transition"
                title="Edit"
              >
                <Edit2 size={20} className="text-blue-600" />
              </button>
              <button
                onClick={() => handleDelete(promotion.id)}
                className="p-2 hover:bg-gray-100 rounded-full transition"
                title="Delete"
              >
                <Trash2 size={20} className="text-red-600" />
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};