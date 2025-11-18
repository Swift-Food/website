// app/components/restaurant-promotion/PromotionTypeSelector.tsx - UPDATE

"use client";

import { useRouter } from "next/navigation";
import { Percent, Grid, TrendingUp, Gift } from "lucide-react";

interface PromotionTypeSelectorProps {
  restaurantId?: string; 
  onSelect?: (type: string) => void;  
}

interface PromotionTypeCard {
  type: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  color: string;
  bgColor: string;
  examples: string[];
}

export function PromotionTypeSelector({ restaurantId, onSelect }: PromotionTypeSelectorProps) {
  const router = useRouter();

  const promotionTypes: PromotionTypeCard[] = [
    {
      type: "RESTAURANT_WIDE",
      title: "Restaurant-Wide Discount",
      description: "Apply a percentage discount to the entire order value",
      icon: <Percent className="w-8 h-8" />,
      color: "text-blue-600",
      bgColor: "bg-blue-50 border-blue-200",
      examples: [
        "10% off all orders",
        "15% off orders over £50",
        "20% discount this weekend"
      ]
    },
    {
      type: "CATEGORY_SPECIFIC",
      title: "Menu Group Discount",
      description: "Target specific menu groups with customized discounts",
      icon: <Grid className="w-8 h-8" />,
      color: "text-purple-600",
      bgColor: "bg-purple-50 border-purple-200",
      examples: [
        "20% off all sandwiches",
        "15% off salads and wraps",
        "30% discount on breakfast items"
      ]
    },
    {
      type: "BUY_MORE_SAVE_MORE",
      title: "Buy More Save More",
      description: "Reward customers with increasing discounts based on quantity",
      icon: <TrendingUp className="w-8 h-8" />,
      color: "text-green-600",
      bgColor: "bg-green-50 border-green-200",
      examples: [
        "Buy 5 get 5% off, buy 10 get 10% off",
        "Purchase 3+ items for 15% discount",
        "Tiered savings on bulk orders"
      ]
    },
    // ADD THIS
    {
      type: "BOGO",
      title: "Buy One Get One (BOGO)",
      description: "Classic buy one get one free or buy X get Y free deals",
      icon: <Gift className="w-8 h-8" />,
      color: "text-orange-600",
      bgColor: "bg-orange-50 border-orange-200",
      examples: [
        "Buy 1 Get 1 Free on sandwiches",
        "Buy 2 Get 1 Free on drinks",
        "BOGO on selected items"
      ]
    }
  ];

  const handleSelectType = (type: string) => {
    if (onSelect) {
      // If onSelect provided, use it (modal mode)
      onSelect(type);
    } else if (restaurantId) {
      // Otherwise navigate (standalone mode)
      router.push(`/restaurant/promotions/${restaurantId}/create?type=${type}`);
    }
  };

  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Choose Your Promotion Type
        </h2>
        <p className="text-gray-600">
          Select the type of promotion you'd like to create
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
        {promotionTypes.map((promo) => (
          <button
            key={promo.type}
            onClick={() => handleSelectType(promo.type)}
            className={`${promo.bgColor} border-2 rounded-xl p-6 text-left hover:shadow-lg transition-all duration-200 hover:scale-105 group`}
          >
            <div className={`${promo.color} mb-4 group-hover:scale-110 transition-transform`}>
              {promo.icon}
            </div>
            
            <h3 className="text-xl font-bold text-gray-900 mb-2">
              {promo.title}
            </h3>
            
            <p className="text-gray-600 text-sm mb-4">
              {promo.description}
            </p>

            <div className="border-t border-gray-200 pt-4 mt-4">
              <p className="text-xs font-semibold text-gray-500 uppercase mb-2">
                Examples:
              </p>
              <ul className="space-y-1">
                {promo.examples.map((example, idx) => (
                  <li key={idx} className="text-sm text-gray-700 flex items-start">
                    <span className="mr-2">•</span>
                    <span>{example}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className={`mt-4 ${promo.color} font-medium text-sm flex items-center`}>
              Create this promotion
              <svg 
                className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" 
                fill="none" 
                viewBox="0 0 24 24" 
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </div>
          </button>
        ))}
      </div>

      <div className="mt-8 p-6 bg-gray-50 rounded-lg border border-gray-200">
        <h4 className="font-semibold text-gray-900 mb-2">💡 Pro Tips</h4>
        <ul className="space-y-2 text-sm text-gray-700">
          <li className="flex items-start">
            <span className="mr-2">•</span>
            <span><strong>Restaurant-Wide:</strong> Best for flash sales and holiday promotions</span>
          </li>
          <li className="flex items-start">
            <span className="mr-2">•</span>
            <span><strong>Menu Group:</strong> Perfect for promoting specific categories or clearing inventory</span>
          </li>
          <li className="flex items-start">
            <span className="mr-2">•</span>
            <span><strong>Buy More Save More:</strong> Ideal for encouraging larger orders and increasing average order value</span>
          </li>
          <li className="flex items-start">
            <span className="mr-2">•</span>
            <span><strong>BOGO:</strong> Great for moving inventory quickly and attracting new customers</span>
          </li>
        </ul>
      </div>
    </div>
  );
}