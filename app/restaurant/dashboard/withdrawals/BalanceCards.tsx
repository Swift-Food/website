// components/restaurant-dashboard/withdrawals/BalanceCards.tsx
"use client";

import { DollarSign, Clock } from "lucide-react";
import { BalanceInfo } from "@/types/restaurant.types";

interface BalanceCardsProps {
  balance: BalanceInfo | null;
  /**
   * Earnings from orders already paid for whose transfer has not run yet —
   * money the restaurant is owed and will be sent. Replaces Stripe's own
   * "pending balance", which described the settlement pipeline rather than
   * anything a restaurant could act on.
   */
  upcoming?: { total: number; nextDate: string | null } | null;
}

/** "21 Sep" — the day money lands, without the year clutter. */
const formatDay = (iso: string): string =>
  new Date(iso).toLocaleDateString("en-GB", { day: "numeric", month: "short" });

export const BalanceCards = ({ balance, upcoming }: BalanceCardsProps) => {
  const upcomingTotal = upcoming?.total ?? 0;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
      <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-lg p-6 text-white">
        <div className="flex items-center mb-2">
          <DollarSign size={24} />
          <span className="ml-2 text-sm font-medium">
            Available to withdraw now
          </span>
        </div>
        <p className="text-4xl font-bold">
          £{balance?.available.toFixed(2) || "0.00"}
        </p>
      </div>

      <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg p-6 text-white">
        <div className="flex items-center mb-2">
          <Clock size={24} />
          <span className="ml-2 text-sm font-medium">On its way to you</span>
        </div>
        <p className="text-4xl font-bold">£{upcomingTotal.toFixed(2)}</p>
        <p className="mt-1 text-sm text-blue-50">
          {upcomingTotal > 0
            ? upcoming?.nextDate
              ? `From orders already paid for. Next payment ${formatDay(upcoming.nextDate)}.`
              : "From orders already paid for."
            : "Earnings from paid orders appear here until they are sent, about 5 working days after the order."}
        </p>
      </div>
    </div>
  );
};
