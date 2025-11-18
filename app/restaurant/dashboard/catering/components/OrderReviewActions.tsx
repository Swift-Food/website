/**
 * OrderReviewActions Component
 * Accept/Reject buttons for orders pending review
 */

import { CheckCircle, AlertCircle, Loader } from "lucide-react";
import { PayoutAccountDto } from "../types/order-card.dto";

interface OrderReviewActionsProps {
  orderId: string;
  onReview: (orderId: string, accepted: boolean) => Promise<void>;
  reviewing: string | null;
  availableAccounts: Record<string, PayoutAccountDto>;
  selectedAccounts: Record<string, string>;
  onAccountSelect: (orderId: string, accountId: string) => void;
  loadingAccounts: boolean;
}

export function OrderReviewActions({
  orderId,
  onReview,
  reviewing,
  availableAccounts,
  selectedAccounts,
  onAccountSelect,
  loadingAccounts,
}: OrderReviewActionsProps) {
  const hasAccounts =
    !loadingAccounts &&
    availableAccounts &&
    Object.keys(availableAccounts).length > 0;

  const selectedAccountId = selectedAccounts[orderId];
  const selectedAccount = selectedAccountId
    ? availableAccounts[selectedAccountId]
    : null;

  return (
    <div className="mt-4 pt-4 border-t border-gray-200">
      {/* Account Selector */}
      {hasAccounts && (
        <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
          <label className="block text-sm font-semibold text-blue-900 mb-2">
            💳 Select Branch/Payment Account:
          </label>
          <select
            value={selectedAccountId || ""}
            onChange={(e) => onAccountSelect(orderId, e.target.value)}
            className="w-full px-3 py-2 border border-blue-300 rounded-lg text-gray-900 bg-white focus:ring-2 focus:ring-blue-500"
          >
            {Object.entries(availableAccounts).map(([id, account]) => (
              <option key={id} value={id}>
                {account.name}
              </option>
            ))}
          </select>
          {selectedAccount && (
            <p className="text-xs text-blue-700 mt-2">
              💰 Payment will be sent to: <strong>{selectedAccount.name}</strong>
            </p>
          )}
        </div>
      )}

      <p className="text-xs sm:text-sm font-medium text-gray-900 mb-3">
        Please review this order and confirm your availability
      </p>

      <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
        <button
          onClick={() => onReview(orderId, true)}
          disabled={reviewing === orderId || loadingAccounts}
          className="flex-1 bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-4 rounded-lg transition-colors disabled:bg-green-300 disabled:cursor-not-allowed flex items-center justify-center text-sm"
        >
          {reviewing === orderId ? (
            <>
              <Loader size={16} className="mr-2 animate-spin" />
              Accepting...
            </>
          ) : (
            <>
              <CheckCircle size={16} className="mr-2" />
              Accept Order
            </>
          )}
        </button>
        <button
          onClick={() => onReview(orderId, false)}
          disabled={reviewing === orderId || loadingAccounts}
          className="flex-1 bg-red-600 hover:bg-red-700 text-white font-medium py-2 px-4 rounded-lg transition-colors disabled:bg-red-300 disabled:cursor-not-allowed flex items-center justify-center text-sm"
        >
          {reviewing === orderId ? (
            <>
              <Loader size={16} className="mr-2 animate-spin" />
              Rejecting...
            </>
          ) : (
            <>
              <AlertCircle size={16} className="mr-2" />
              Reject Order
            </>
          )}
        </button>
      </div>
    </div>
  );
}
