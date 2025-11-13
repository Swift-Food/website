// components/restaurant-dashboard/withdrawals/WithdrawalHistory.tsx
"use client";

import { Clock } from "lucide-react";
import { WithdrawalRequest } from "@/types/restaurant.types";

interface WithdrawalHistoryProps {
  history: WithdrawalRequest[];
}

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
        No withdrawal history yet
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg p-6">
      <h2 className="text-xl font-bold text-gray-900 mb-4">
        Withdrawal History
      </h2>
      <div className="space-y-3">
        {history.map((withdrawal) => (
          <div
            key={withdrawal.id}
            className="bg-white border border-gray-200 rounded-lg p-4"
          >
            <div className="flex justify-between items-start mb-2">
              <div>
                <span
                  className={`px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(
                    withdrawal.status
                  )}`}
                >
                  {withdrawal.status.toUpperCase()}
                </span>
                <p className="text-xs text-gray-500 mt-1">
                  ID: {withdrawal.id.substring(0, 8)}...
                </p>
              </div>
              <div className="text-right">
                <p className="font-bold text-lg text-gray-900">
                  £{Number(withdrawal.amount).toFixed(2)}
                </p>
                {withdrawal.feeCharged > 0 && (
                  <p className="text-xs text-red-600">
                    Fee: -£{Number(withdrawal.feeCharged).toFixed(2)}
                  </p>
                )}
                <p className="text-sm font-semibold text-green-600">
                  £{Number(withdrawal.netAmount).toFixed(2)}
                </p>
              </div>
            </div>

            <div className="flex items-center text-xs text-gray-600 mb-2">
              <Clock size={12} className="mr-1" />
              {formatDate(withdrawal.requestedAt)}
            </div>

            {withdrawal.notes && (
              <p className="text-sm text-gray-700 bg-gray-50 p-2 rounded">
                Note: {withdrawal.notes}
              </p>
            )}

            {withdrawal.rejectionReason && (
              <div className="mt-2 p-2 bg-red-50 border border-red-200 rounded">
                <p className="text-xs font-medium text-red-900">
                  Rejection Reason:
                </p>
                <p className="text-sm text-red-800">
                  {withdrawal.rejectionReason}
                </p>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};