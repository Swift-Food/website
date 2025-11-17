// components/restaurant-dashboard/withdrawals/WithdrawalForm.tsx
"use client";

import { useState } from "react";
import { AlertCircle, CheckCircle, Loader } from "lucide-react";
import { restaurantApi } from "@/app/api/restaurantApi";
import { BalanceInfo } from "@/types/restaurant.types";

interface WithdrawalFormProps {
  restaurantUserId: string;
  token: string;
  balance: BalanceInfo | null;
  onSuccess: () => void;
  accountId: string
}

export const WithdrawalForm = ({
  restaurantUserId,
  token,
  balance,
  accountId,
  onSuccess,
}: WithdrawalFormProps) => {
  const [withdrawalAmount, setWithdrawalAmount] = useState("");
  const [notes, setNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  console.log("withdrawal form opend", restaurantUserId, accountId)

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
        `Insufficient balance. Available: £${balance.available.toFixed(2)}`
      );
      return;
    }

    setSubmitting(true);

    try {
      await restaurantApi.requestWithdrawal(
        {
          userId: restaurantUserId,
          userType: "restaurant",
          amount,
          notes: notes.trim() || undefined,
          isInstantPayout: false,
          accountId: accountId
        },
        token
      );

      setSuccess(
        "Withdrawal request submitted successfully! Pending admin approval."
      );
      setWithdrawalAmount("");
      setNotes("");
      onSuccess();
    } catch (err: any) {
      setError(err.message || "Failed to submit withdrawal request");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="bg-white rounded-lg p-6">
      <h2 className="text-xl font-bold text-gray-900 mb-4">
        Request Withdrawal
      </h2>

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

      {balance && !balance.canWithdrawWithoutFee && (
        <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg flex items-start">
          <AlertCircle
            size={20}
            className="text-yellow-600 mr-3 flex-shrink-0 mt-0.5"
          />
          <div>
            <p className="font-medium text-yellow-900">
              Early Withdrawal Fee
            </p>
            <p className="text-sm text-yellow-800">
              You withdrew within the last 7 days. A £0.50 fee will be charged
              for this withdrawal.
            </p>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Withdrawal Amount (£)
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
              <span>Requested Amount:</span>
              <span className="font-medium">
                £{parseFloat(withdrawalAmount).toFixed(2)}
              </span>
            </div>
            {balance && !balance.canWithdrawWithoutFee && (
              <div className="flex justify-between text-red-600">
                <span>Early Withdrawal Fee:</span>
                <span className="font-medium">-£0.50</span>
              </div>
            )}
            <div className="flex justify-between text-gray-900 font-bold pt-2 border-t border-gray-200">
              <span>You'll Receive:</span>
              <span>
                £
                {(
                  parseFloat(withdrawalAmount) -
                  (balance && !balance.canWithdrawWithoutFee ? 0.5 : 0)
                ).toFixed(2)}
              </span>
            </div>
            <p className="text-xs text-gray-600 pt-2">
              Expected arrival: 1-3 business days after approval
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
              Submitting...
            </>
          ) : (
            "Request Withdrawal"
          )}
        </button>
      </form>
    </div>
  );
};