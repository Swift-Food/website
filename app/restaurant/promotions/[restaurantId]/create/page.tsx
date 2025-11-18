// app/restaurant/promotions/[restaurantId]/create/page.tsx - UPDATE

"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { ArrowLeft, Loader } from "lucide-react";
import { promotionsServices } from "@/services/api/promotion.api";
import { RestaurantWideForm } from "@/lib/components/restaurant-promotion/RestaurantWideForm";
import { GroupWideForm } from "@/lib/components/restaurant-promotion/GroupWideForm";
import { BuyMoreSaveMoreForm } from "@/lib/components/restaurant-promotion/BuyMoreSaveMoreForm";
import { BogoForm } from "@/lib/components/restaurant-promotion/BOGOForm";


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
      case "CATEGORY_SPECIFIC":
        return "Menu Group Discount";
      case "BUY_MORE_SAVE_MORE":
        return "Buy More Save More";
      case "BOGO": // ADD THIS
        return "Buy One Get One (BOGO)";
      default:
        return "Create Promotion";
    }
  };

  const getPromotionDescription = () => {
    switch (promotionType) {
      case "RESTAURANT_WIDE":
        return "Apply a percentage discount to the entire order";
      case "CATEGORY_SPECIFIC":
        return "Apply discounts to specific menu groups";
      case "BUY_MORE_SAVE_MORE":
        return "Offer tiered discounts based on quantity purchased";
      case "BOGO": // ADD THIS
        return "Buy one get one free or buy X get Y free deals";
      default:
        return "Set up your promotion details below";
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
              {getPromotionDescription()}
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

        {promotionType === "CATEGORY_SPECIFIC" && (
          <GroupWideForm
            restaurantId={restaurantId}
            onSubmit={handleSubmit}
            onCancel={() => router.push(`/restaurant/promotions/${restaurantId}`)}
            submitting={submitting}
          />
        )}

        {promotionType === "BUY_MORE_SAVE_MORE" && (
          <BuyMoreSaveMoreForm
            restaurantId={restaurantId}
            onSubmit={handleSubmit}
            onCancel={() => router.push(`/restaurant/promotions/${restaurantId}`)}
            submitting={submitting}
          />
        )}

        {/* ADD THIS */}
        {promotionType === "BOGO" && (
          <BogoForm
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