// components/restaurant-promotions/PromotionsList.tsx
"use client";

import { useState } from "react";
import { Edit2, Trash2, ToggleLeft, ToggleRight, TrendingUp, Grid, Percent, Gift } from "lucide-react";
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

  const getPromotionTypeIcon = (type: string) => {
    switch (type) {
      case "RESTAURANT_WIDE":
        return <Percent size={18} className="text-blue-600" />;
      case "CATEGORY_SPECIFIC":
        return <Grid size={18} className="text-purple-600" />;
      case "BUY_MORE_SAVE_MORE":
        return <TrendingUp size={18} className="text-green-600" />;
      case "BOGO": // ADD THIS
        return <Gift size={18} className="text-orange-600" />;
      default:
        return null;
    }
  };

  const getPromotionTypeLabel = (type: string) => {
    switch (type) {
      case "RESTAURANT_WIDE":
        return "Restaurant-Wide";
      case "CATEGORY_SPECIFIC":
        return "Menu Group";
      case "BUY_MORE_SAVE_MORE":
        return "Buy More Save More";
      case "BOGO": // ADD THIS
        return "Buy One Get One";
      case "ITEM_SPECIFIC":
        return "Item-Specific";
      default:
        return type;
    }
  };

  const renderPromotionDetails = (promotion: Promotion) => {
    if (promotion.promotionType === "BUY_MORE_SAVE_MORE" && promotion.discountTiers) {
      return (
        <div className="mt-4">
          <span className="text-sm font-medium text-gray-700 mb-2 block">Discount Tiers:</span>
          <div className="flex flex-wrap gap-2">
            {promotion.discountTiers
              .sort((a, b) => a.minQuantity - b.minQuantity)
              .map((tier, index) => (
                <span
                  key={index}
                  className="px-3 py-1 bg-green-50 text-green-800 rounded-full text-xs font-medium"
                >
                  {tier.minQuantity}+ items → {tier.discountPercentage}% off
                </span>
              ))}
          </div>
          {promotion.applyToAllGroups && (
            <span className="inline-block mt-2 px-2 py-1 bg-blue-50 text-blue-700 rounded text-xs">
              Applies to all menu groups
            </span>
          )}
          {!promotion.applyToAllGroups && promotion.applicableCategories && promotion.applicableCategories.length > 0 && (
            <div className="mt-2">
              <span className="text-xs text-gray-500">Groups: </span>
              <span className="text-xs text-gray-700">
                {promotion.applicableCategories.join(", ")}
              </span>
            </div>
          )}
        </div>
      );
    }

    if (promotion.promotionType === "CATEGORY_SPECIFIC" && promotion.applicableCategories && promotion.applicableCategories.length > 0) {
      return (
        <div className="mt-4">
          <span className="text-sm font-medium text-gray-700 mb-2 block">Applicable Groups:</span>
          <div className="flex flex-wrap gap-2">
            {promotion.applicableCategories.map((category, index) => (
              <span
                key={index}
                className="px-3 py-1 bg-purple-50 text-purple-800 rounded-full text-xs font-medium"
              >
                {category}
              </span>
            ))}
          </div>
        </div>
      );
    }

    if (promotion.promotionType === "BOGO" && promotion.bogoItemIds && promotion.bogoItemIds.length > 0) {
      const bogoType = (promotion as any).bogoType || "BUY_ONE_GET_ONE_FREE";
      const buyQty = (promotion as any).buyQuantity || 1;
      const getQty = (promotion as any).getQuantity || 1;
      
      return (
        <div className="mt-4">
          <div className="flex items-center gap-2 mb-3">
            <span className="px-4 py-2 bg-orange-100 text-orange-800 rounded-full text-sm font-semibold">
              {bogoType === "BUY_ONE_GET_ONE_FREE" 
                ? "Buy 1 Get 1 Free" 
                : `Buy ${buyQty} Get ${getQty} Free`}
            </span>
            <span className="text-sm text-gray-600">
              on {promotion.bogoItemIds.length} item{promotion.bogoItemIds.length !== 1 ? 's' : ''}
            </span>
          </div>
        </div>
      );
    }

    return null;
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

  return (
    <div className="space-y-4">
      {promotions.map((promotion) => (
        <div
          key={promotion.id}
          className="bg-white rounded-lg p-6 border border-gray-200 hover:shadow-md transition"
        >
          <div className="flex items-start justify-between">
            <div className="flex-1">
              {/* Promotion Type Badge */}
              <div className="flex items-center gap-2 mb-2">
                {getPromotionTypeIcon(promotion.promotionType)}
                <span className="text-sm font-medium text-gray-600">
                  {getPromotionTypeLabel(promotion.promotionType)}
                </span>
              </div>

              {/* Title and Status */}
              <div className="flex items-center mb-2">
                <h3 className="text-xl font-bold text-gray-900">
                  {promotion.name}
                </h3>
                
                <span
                  className={`ml-3 px-3 py-1 rounded-full text-xs font-semibold ${
                    promotion.status === "ACTIVE"
                      ? "bg-green-100 text-green-800"
                      : promotion.status === "SCHEDULED"
                      ? "bg-blue-100 text-blue-800"
                      : promotion.status === "EXPIRED"
                      ? "bg-gray-100 text-gray-800"
                      : "bg-yellow-100 text-yellow-800"
                  }`}
                >
                  {promotion.status}
                </span>
                <span className="ml-2 px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-semibold">
                  {promotion.applicability}
                </span>
              </div>

              {promotion.description && (
                <p className="text-gray-600 mb-4">{promotion.description}</p>
              )}
              
              {/* Standard Details */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                {promotion.promotionType !== "BUY_MORE_SAVE_MORE" && (
                  <div>
                    <span className="text-gray-500">Discount:</span>
                    <span className="ml-2 font-semibold text-gray-900">
                      {promotion.discountPercentage}%
                    </span>
                  </div>
                )}
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
                  <span className="text-gray-500">Start:</span>
                  <span className="ml-2 font-semibold text-gray-900">
                    {new Date(promotion.startDate).toLocaleDateString()}
                  </span>
                </div>
                <div>
                  <span className="text-gray-500">End:</span>
                  <span className="ml-2 font-semibold text-gray-900">
                    {new Date(promotion.endDate).toLocaleDateString()}
                  </span>
                </div>
              </div>

              {/* Type-specific details */}
              {renderPromotionDetails(promotion)}
            </div>

            {/* Actions */}
            <div className="flex items-center space-x-2 ml-4">
              <button
                onClick={() => handleToggleStatus(promotion)}
                disabled={toggling === promotion.id}
                className="p-2 hover:bg-gray-100 rounded-full transition disabled:opacity-50"
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