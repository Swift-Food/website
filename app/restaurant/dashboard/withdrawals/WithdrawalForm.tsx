// components/restaurant-dashboard/withdrawals/WithdrawalForm.tsx
"use client";

import { useState } from "react";
import { AlertCircle, CheckCircle, Loader } from "lucide-react";
import { restaurantApi } from "@/services/api/restaurant.api";
import { BalanceInfo } from "@/types/restaurant.types";

interface WithdrawalFormProps {
  restaurantUserId: string;
  balance: BalanceInfo | null;
  onSuccess: () => void;
  accountId: string
}

export const WithdrawalForm = ({
  restaurantUserId,
  balance,
  accountId,
  onSuccess,
}: WithdrawalFormProps) => {
  const [withdrawalAmount, setWithdrawalAmount] = useState("");
  const [notes, setNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    const amount = parseFloat(withdrawalAmount);

    if (isNaN(amount) || amount <= 0) {
      setError("Please enter a valid amount");
      return;
    }

    if (balance && amount > balance.available) {
      setError(
        `You can withdraw up to £${balance.available.toFixed(2)}`
      );
      return;
    }

    setSubmitting(true);

    try {
      const withdrawalRequest: any = {
        userId: restaurantUserId,
        userType: "restaurant",
        amount,
        notes: notes.trim() || undefined,
        isInstantPayout: false,
      };

      // Only include accountId if not legacy
      if (accountId !== 'legacy') {
        withdrawalRequest.accountId = accountId;
      }

      await restaurantApi.requestWithdrawal(withdrawalRequest);

      setSuccess(
        `Done. £${amount.toFixed(2)} is on its way to your bank account. It usually arrives in 1 to 3 working days.`
      );
      setWithdrawalAmount("");
      setNotes("");
      onSuccess();
    } catch (err: any) {
      setError(err.message || "The withdrawal could not be completed");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="bg-white rounded-lg p-6">
      <h2 className="text-xl font-bold text-gray-900 mb-1">
        Withdraw your balance
      </h2>
      <p className="text-sm text-gray-600 mb-4">
        Send money from your available balance to your bank account. This is
        free and takes 1 to 3 working days.
      </p>

      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-start text-red-700">
          <AlertCircle size={18} className="mr-2 flex-shrink-0 mt-0.5" />
          <span className="text-sm">{error}</span>
        </div>
      )}

      {success && (
        <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg flex items-start text-green-700">
          <CheckCircle size={18} className="mr-2 flex-shrink-0 mt-0.5" />
          <span className="text-sm">{success}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Amount (£)
          </label>
          <input
            type="number"
            step="0.01"
            min="0.01"
            max={balance?.available}
            value={withdrawalAmount}
            onChange={(e) => setWithdrawalAmount(e.target.value)}
            required
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
            placeholder="0.00"
          />
          <p className="text-xs text-gray-500 mt-1">
            Available: £{balance?.available.toFixed(2) || "0.00"}
          </p>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Notes (Optional)
          </label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={3}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
            placeholder="Add any notes about this withdrawal..."
          />
        </div>

        {withdrawalAmount && parseFloat(withdrawalAmount) > 0 && (
          <div className="bg-gray-50 p-4 rounded-lg space-y-2 text-sm">
            <div className="flex justify-between text-gray-700">
              <span>Amount:</span>
              <span className="font-medium">
                £{parseFloat(withdrawalAmount).toFixed(2)}
              </span>
            </div>
            <div className="flex justify-between text-gray-700">
              <span>Fee:</span>
              <span className="font-medium">Free</span>
            </div>
            <div className="flex justify-between text-gray-900 font-bold pt-2 border-t border-gray-200">
              <span>You receive:</span>
              <span>
                £{parseFloat(withdrawalAmount).toFixed(2)}
              </span>
            </div>
            <p className="text-xs text-gray-600 pt-2">
              Reaches your bank account in 1 to 3 working days.
            </p>
          </div>
        )}

        <button
          type="submit"
          disabled={submitting || !balance || balance.available <= 0}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-4 rounded-lg transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center justify-center"
        >
          {submitting ? (
            <>
              <Loader size={18} className="mr-2 animate-spin" />
              Sending...
            </>
          ) : (
            "Withdraw to my bank"
          )}
        </button>
      </form>
    </div>
  );
};
