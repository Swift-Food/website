// app/restaurant/promotions/[restaurantId]/edit/[promotionId]/page.tsx - UPDATE

"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, Loader } from "lucide-react";
import { promotionsServices } from "@/services/api/promotion.api";
import { RestaurantWideForm } from "@/lib/components/restaurant-promotion/RestaurantWideForm";
import { GroupWideForm } from "@/lib/components/restaurant-promotion/GroupWideForm";
import { BuyMoreSaveMoreForm } from "@/lib/components/restaurant-promotion/BuyMoreSaveMoreForm";
import { BogoForm } from "@/lib/components/restaurant-promotion/BOGOForm";
import { Promotion } from "@/services/api/promotion.api";

export default function EditPromotionPage() {
  const params = useParams();
  const router = useRouter();
  const restaurantId = params.restaurantId as string;
  const promotionId = params.promotionId as string;

  const [promotion, setPromotion] = useState<Promotion | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    loadPromotion();
  }, [promotionId]);

  const loadPromotion = async () => {
    try {
      setLoading(true);
      const data = await promotionsServices.getPromotionById(promotionId);
      
      // Verify promotion belongs to this restaurant
      if (data.restaurantId !== restaurantId) {
        alert("Promotion not found");
        router.push(`/restaurant/promotions/${restaurantId}`);
        return;
      }
      
      setPromotion(data);
    } catch (error: any) {
      console.error("Failed to load promotion:", error);
      alert(error.response?.data?.message || "Failed to load promotion");
      router.push(`/restaurant/promotions/${restaurantId}`);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (formData: any) => {
    setSubmitting(true);
    try {
      await promotionsServices.updatePromotion(promotionId, formData);
      
      alert("Promotion updated successfully!");
      router.push(`/restaurant/promotions/${restaurantId}`);
    } catch (error: any) {
      console.error("Failed to update promotion:", error);
      alert(error.response?.data?.message || "Failed to update promotion. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete this promotion? This action cannot be undone.")) {
      return;
    }

    setSubmitting(true);
    try {
      await promotionsServices.deletePromotion(promotionId);
      alert("Promotion deleted successfully!");
      router.push(`/restaurant/promotions/${restaurantId}`);
    } catch (error: any) {
      console.error("Failed to delete promotion:", error);
      alert(error.response?.data?.message || "Failed to delete promotion");
      setSubmitting(false);
    }
  };

  const getPromotionTitle = () => {
    if (!promotion) return "Edit Promotion";
    
    switch (promotion.promotionType) {
      case "RESTAURANT_WIDE":
        return "Edit Restaurant-Wide Discount";
      case "CATEGORY_SPECIFIC":
        return "Edit Menu Group Discount";
      case "BUY_MORE_SAVE_MORE":
        return "Edit Buy More Save More";
      case "BOGO": // ADD THIS
        return "Edit Buy One Get One (BOGO)";
      case "ITEM_SPECIFIC":
        return "Edit Item-Specific Discount";
      default:
        return "Edit Promotion";
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader className="animate-spin h-8 w-8 text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading promotion...</p>
        </div>
      </div>
    );
  }

  if (!promotion) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">Promotion not found</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-4xl mx-auto py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center">
            <button
              onClick={() => router.push(`/restaurant/promotions/${restaurantId}`)}
              className="mr-4 p-2 hover:bg-gray-200 rounded-full transition"
              disabled={submitting}
            >
              <ArrowLeft size={24} />
            </button>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                {getPromotionTitle()}
              </h1>
              <p className="text-gray-600 mt-1">
                Update your promotion details
              </p>
            </div>
          </div>

          {/* Delete Button */}
          <button
            onClick={handleDelete}
            disabled={submitting}
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition disabled:opacity-50"
          >
            Delete
          </button>
        </div>

        {/* Status Badge */}
        <div className="mb-6">
          <span
            className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
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
        </div>

        {/* Reuse same form components with mode="edit" and promotion prop */}
        {promotion.promotionType === "RESTAURANT_WIDE" && (
          <RestaurantWideForm
            mode="edit"
            promotion={promotion}
            onSubmit={handleSubmit}
            onCancel={() => router.push(`/restaurant/promotions/${restaurantId}`)}
            submitting={submitting}
          />
        )}

        {promotion.promotionType === "CATEGORY_SPECIFIC" && (
          <GroupWideForm
            mode="edit"
            promotion={promotion}
            restaurantId={restaurantId}
            onSubmit={handleSubmit}
            onCancel={() => router.push(`/restaurant/promotions/${restaurantId}`)}
            submitting={submitting}
          />
        )}

        {promotion.promotionType === "BUY_MORE_SAVE_MORE" && (
          <BuyMoreSaveMoreForm
            mode="edit"
            promotion={promotion}
            restaurantId={restaurantId}
            onSubmit={handleSubmit}
            onCancel={() => router.push(`/restaurant/promotions/${restaurantId}`)}
            submitting={submitting}
          />
        )}

        {/* ADD THIS */}
        {promotion.promotionType === "BOGO" && (
          <BogoForm
            mode="edit"
            promotion={promotion}
            restaurantId={restaurantId}
            onSubmit={handleSubmit}
            onCancel={() => router.push(`/restaurant/promotions/${restaurantId}`)}
            submitting={submitting}
          />
        )}
      </div>
    </div>
  );
}