// app/restaurant/promotions/[restaurantId]/create/page.tsx
"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { ArrowLeft, Loader } from "lucide-react";
import { promotionsServices } from "@/services/promotionServices";
import { RestaurantWideForm } from "@/app/components/restaurant-promotion/RestaurantWideForm";

export default function CreatePromotionPage() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const restaurantId = params.restaurantId as string;
  const promotionType = searchParams.get("type") as string;

  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    // Redirect if no type specified
    if (!promotionType) {
      router.push(`/restaurant/promotions/${restaurantId}`);
    }
  }, [promotionType, restaurantId, router]);

  const handleSubmit = async (formData: any) => {
    setSubmitting(true);
    try {
      await promotionsServices.createPromotion({
        ...formData,
        restaurantId,
        type: promotionType,
      });
      
      alert("Promotion created successfully!");
      router.push(`/restaurant/promotions/${restaurantId}`);
    } catch (error: any) {
      console.error("Failed to create promotion:", error);
      alert(error.response?.data?.message || "Failed to create promotion. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const getPromotionTitle = () => {
    switch (promotionType) {
      case "RESTAURANT_WIDE":
        return "Restaurant-Wide Discount";
      case "GROUP_WIDE":
        return "Menu Group Discount";
      case "BUY_MORE_SAVE_MORE":
        return "Buy More Save More";
      default:
        return "Create Promotion";
    }
  };

  if (!promotionType) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader className="animate-spin h-8 w-8 text-blue-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-4xl mx-auto py-8">
        {/* Header */}
        <div className="flex items-center mb-8">
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
              Set up your promotion details below
            </p>
          </div>
        </div>

        {/* Form based on type */}
        {promotionType === "RESTAURANT_WIDE" && (
          <RestaurantWideForm
            onSubmit={handleSubmit}
            onCancel={() => router.push(`/restaurant/promotions/${restaurantId}`)}
            submitting={submitting}
          />
        )}

        {promotionType === "GROUP_WIDE" && (
          <div className="bg-white rounded-lg p-8 text-center">
            <p className="text-gray-600">Menu Group Discount form coming soon...</p>
          </div>
        )}

        {promotionType === "BUY_MORE_SAVE_MORE" && (
          <div className="bg-white rounded-lg p-8 text-center">
            <p className="text-gray-600">Buy More Save More form coming soon...</p>
          </div>
        )}
      </div>
    </div>
  );
}