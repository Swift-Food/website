// components/restaurant-dashboard/withdrawals/WithdrawalHistory.tsx
"use client";

import { Clock, Zap } from "lucide-react";
import { WithdrawalRequest } from "@/types/restaurant.types";

interface WithdrawalHistoryProps {
  history: WithdrawalRequest[];
}

// What each Stripe-side status means to the restaurant
const STATUS_LABELS: Record<string, string> = {
  pending: "Requested",
  approved: "On its way",
  completed: "Paid",
  rejected: "Declined",
  failed: "Failed",
};

export const WithdrawalHistory = ({ history }: WithdrawalHistoryProps) => {
  const formatDate = (date: string) =>
    new Date(date).toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      pending: "bg-yellow-100 text-yellow-800 border-yellow-300",
      approved: "bg-blue-100 text-blue-800 border-blue-300",
      completed: "bg-green-100 text-green-800 border-green-300",
      rejected: "bg-red-100 text-red-800 border-red-300",
      failed: "bg-red-100 text-red-800 border-red-300",
    };
    return colors[status] || "bg-gray-100 text-gray-800 border-gray-300";
  };

  if (history.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        No withdrawals yet
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg p-6">
      <h2 className="text-xl font-bold text-gray-900 mb-4">
        Withdrawal history
      </h2>
      <div className="space-y-3">
        {history.map((withdrawal) => {
          const fee = Number(withdrawal.feeCharged);
          const orderRefs = (withdrawal.earlyWithdrawalOrders ?? [])
            .filter((o) => o.status !== "failed")
            .map((o) => `#${o.orderReference}`);
          return (
          <div
            key={withdrawal.id}
            className="bg-white border border-gray-200 rounded-lg p-4"
          >
            <div className="flex justify-between items-start mb-2">
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <span
                    className={`px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(
                      withdrawal.status
                    )}`}
                  >
                    {STATUS_LABELS[withdrawal.status] ?? withdrawal.status.toUpperCase()}
                  </span>
                  {withdrawal.isEarlyWithdrawal && (
                    <span className="px-2 py-1 rounded-full text-xs font-medium border bg-amber-100 text-amber-800 border-amber-300 flex items-center">
                      <Zap size={12} className="mr-1" />
                      Early withdrawal
                    </span>
                  )}
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  ID: {withdrawal.id.substring(0, 8)}...
                </p>
              </div>
              <div className="text-right">
                <p className="font-bold text-lg text-gray-900">
                  £{Number(withdrawal.amount).toFixed(2)}
                </p>
                {fee > 0 && (
                  <p className="text-xs text-red-600">
                    Card processing fee: -£{fee.toFixed(2)}
                  </p>
                )}
                <p className="text-sm font-semibold text-green-600">
                  {fee > 0 ? "You receive " : ""}£{Number(withdrawal.netAmount).toFixed(2)}
                </p>
              </div>
            </div>

            <div className="flex items-center text-xs text-gray-600 mb-2">
              <Clock size={12} className="mr-1" />
              {formatDate(withdrawal.requestedAt)}
            </div>

            {orderRefs.length > 0 && (
              <p className="text-xs text-gray-600 mb-2">
                Orders: {orderRefs.join(", ")}
              </p>
            )}

            {withdrawal.notes && !withdrawal.isEarlyWithdrawal && (
              <p className="text-sm text-gray-700 bg-gray-50 p-2 rounded">
                Note: {withdrawal.notes}
              </p>
            )}

            {withdrawal.rejectionReason && (
              <div className="mt-2 p-2 bg-red-50 border border-red-200 rounded">
                <p className="text-xs font-medium text-red-900">
                  {withdrawal.status === "failed" ? "What happened:" : "Reason:"}
                </p>
                <p className="text-sm text-red-800">
                  {withdrawal.rejectionReason}
                </p>
              </div>
            )}
          </div>
          );
        })}
      </div>
    </div>
  );
};
