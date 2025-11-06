// components/restaurant-dashboard/withdrawals/BalanceCards.tsx
"use client";

import { DollarSign, Clock } from "lucide-react";
import { BalanceInfo } from "@/types/restaurant.types";

interface BalanceCardsProps {
  balance: BalanceInfo | null;
}

export const BalanceCards = ({ balance }: BalanceCardsProps) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
      <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-lg p-6 text-white">
        <div className="flex items-center mb-2">
          <DollarSign size={24} />
          <span className="ml-2 text-sm font-medium">Available Balance</span>
        </div>
        <p className="text-4xl font-bold">
          £{balance?.available.toFixed(2) || "0.00"}
        </p>
      </div>

      <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg p-6 text-white">
        <div className="flex items-center mb-2">
          <Clock size={24} />
          <span className="ml-2 text-sm font-medium">Pending Balance</span>
        </div>
        <p className="text-4xl font-bold">
          £{balance?.pending.toFixed(2) || "0.00"}
        </p>
      </div>
    </div>
  );
};