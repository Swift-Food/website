// app/restaurant/promotions/[restaurantId]/page.tsx
"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, Plus, Loader } from "lucide-react";
import { Promotion, promotionsServices } from "@/services/api/promotion.api";
import { PromotionsList } from "@/lib/components/restaurant-promotion/PromotiontsList";
import { PromotionTypeSelector } from "@/lib/components/restaurant-promotion/PromotionTypeSelector";

export default function PromotionsPage() {
  const params = useParams();
  const router = useRouter();
  const restaurantId = params.restaurantId as string;

  const [loading, setLoading] = useState(true);
  const [promotions, setPromotions] = useState<Promotion[]>([]);
  const [showTypeSelector, setShowTypeSelector] = useState(false);

  const fetchPromotions = async () => {
    setLoading(true);
    try {
      const data = await promotionsServices.getRestaurantPromotions(restaurantId);
      setPromotions(data);
    } catch (error) {
      console.error("Failed to fetch promotions:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPromotions();
  }, [restaurantId]);

  const handleSelectType = (type: string) => {
    router.push(`/restaurant/promotions/${restaurantId}/create?type=${type}`);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader className="animate-spin h-8 w-8 text-blue-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-6xl mx-auto py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center">
            <button
              onClick={() => router.replace('/restaurant/dashboard')}
              className="mr-4 p-2 hover:bg-gray-200 rounded-full transition"
            >
              <ArrowLeft size={24} />
            </button>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Promotions</h1>
              <p className="text-gray-600 mt-1">
                Create and manage discounts for your restaurant
              </p>
            </div>
          </div>
          <button
            onClick={() => setShowTypeSelector(true)}
            className="flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
          >
            <Plus size={20} className="mr-2" />
            Create Promotion
          </button>
        </div>

        {/* Active Promotions */}
        <PromotionsList
          promotions={promotions}
          restaurantId={restaurantId}
          onRefresh={fetchPromotions}
        />

        {/* Type Selector Modal */}
        {showTypeSelector && (
          <PromotionTypeSelector
            onSelect={handleSelectType}
          />
        )}
      </div>
    </div>
  );
}