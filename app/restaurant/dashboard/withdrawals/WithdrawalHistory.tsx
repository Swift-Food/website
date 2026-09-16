// components/restaurant-dashboard/withdrawals/WithdrawalHistory.tsx
"use client";

import { useState } from "react";
import { Clock, Download, Loader } from "lucide-react";
import { WithdrawalRequest } from "@/types/restaurant.types";
import { restaurantApi } from "@/services/api/restaurant.api";
import {
  hasRemittance,
  remittanceFilename,
  remittanceReference,
} from "@/lib/utils/withdrawal-remittance";

interface WithdrawalHistoryProps {
  history: WithdrawalRequest[];
}

export const WithdrawalHistory = ({ history }: WithdrawalHistoryProps) => {
  // Which row is fetching its statement, and the last error against its row.
  const [downloading, setDownloading] = useState<string | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const formatDate = (date: string) =>
    new Date(date).toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });

  /**
   * Nobody reviews a withdrawal — once Stripe has the payout the money is on
   * its way and Swift cannot intervene. "Pending" and "approved" implied a
   * gatekeeper that does not exist, so both read as completed; only a real
   * failure is worth its own colour. New withdrawals are recorded completed
   * outright, so these two only appear on historic rows.
   */
  const displayStatus = (status: string): string =>
    status === "pending" || status === "approved" ? "completed" : status;

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      completed: "bg-green-100 text-green-800 border-green-300",
      rejected: "bg-red-100 text-red-800 border-red-300",
      failed: "bg-red-100 text-red-800 border-red-300",
    };
    return colors[status] || "bg-gray-100 text-gray-800 border-gray-300";
  };

  const downloadStatement = async (withdrawalId: string) => {
    setDownloading(withdrawalId);
    setErrors((prev) => {
      const next = { ...prev };
      delete next[withdrawalId];
      return next;
    });
    try {
      const blob = await restaurantApi.getWithdrawalRemittance(withdrawalId);
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = remittanceFilename(withdrawalId);
      document.body.appendChild(link);
      link.click();
      link.remove();
      // Revoked on a delay: some browsers abandon the download if the object
      // URL disappears in the same tick as the click.
      setTimeout(() => URL.revokeObjectURL(url), 1000);
    } catch (err) {
      setErrors((prev) => ({
        ...prev,
        [withdrawalId]:
          err instanceof Error ? err.message : "Could not download the statement",
      }));
    } finally {
      setDownloading(null);
    }
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
                    displayStatus(withdrawal.status)
                  )}`}
                >
                  {displayStatus(withdrawal.status).toUpperCase()}
                </span>
                {/* The same reference that is printed on the statement, so a
                    saved PDF can be matched back to the row it came from. */}
                <p className="text-xs text-gray-500 mt-1">
                  {withdrawal.isAutomatic
                    ? `ID: ${withdrawal.id.substring(0, 8)}...`
                    : `Ref: ${remittanceReference(withdrawal.id)}`}
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

            <div className="flex flex-wrap items-center gap-3 text-xs text-gray-600 mb-2">
              <span className="flex items-center">
                <Clock size={12} className="mr-1" />
                {formatDate(withdrawal.requestedAt)}
              </span>

              {hasRemittance(withdrawal) && (
                <button
                  type="button"
                  onClick={() => downloadStatement(withdrawal.id)}
                  disabled={downloading === withdrawal.id}
                  className="ml-auto inline-flex items-center gap-1.5 font-semibold text-blue-600 hover:text-blue-800 disabled:text-gray-400 disabled:cursor-not-allowed transition-colors"
                >
                  {downloading === withdrawal.id ? (
                    <>
                      <Loader size={12} className="animate-spin" />
                      Preparing...
                    </>
                  ) : (
                    <>
                      <Download size={12} />
                      Statement (PDF)
                    </>
                  )}
                </button>
              )}
            </div>

            {errors[withdrawal.id] && (
              <p className="text-xs text-red-700 bg-red-50 border border-red-200 rounded px-2 py-1 mb-2">
                {errors[withdrawal.id]}
              </p>
            )}

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
