/**
 * AccountAssignmentAlert Component
 * Alert for unassigned paid orders requiring account assignment
 */

import { AlertCircle, Loader, CheckCircle } from "lucide-react";
import { PayoutAccountDto } from "../types/order-card.dto";

interface AccountAssignmentAlertProps {
  orderId: string;
  availableAccounts: Record<string, PayoutAccountDto>;
  selectedAccounts: Record<string, string>;
  onAccountSelect: (orderId: string, accountId: string) => void;
  onClaim: (orderId: string) => void;
  claiming: string | null;
}

export function AccountAssignmentAlert({
  orderId,
  availableAccounts,
  selectedAccounts,
  onAccountSelect,
  onClaim,
  claiming,
}: AccountAssignmentAlertProps) {
  const selectedAccountId = selectedAccounts[orderId];
  const selectedAccount = selectedAccountId
    ? availableAccounts[selectedAccountId]
    : null;

  return (
    <div className="mb-4 bg-yellow-50 border-2 border-yellow-400 rounded-lg p-4">
      <div className="flex items-start gap-3">
        <AlertCircle
          className="text-yellow-600 flex-shrink-0 mt-0.5"
          size={20}
        />
        <div className="flex-1">
          <p className="font-semibold text-yellow-900 mb-2">
            ⚠️ Action Required: Assign Payment Account
          </p>
          <p className="text-sm text-yellow-800 mb-3">
            This order has been paid by the customer. Please select which
            branch/account should receive the payout.
          </p>

          {/* Account Selector */}
          <div className="mb-3">
            <label className="block text-xs font-semibold text-yellow-900 mb-2">
              💳 Select Branch/Payment Account:
            </label>
            <select
              value={selectedAccountId || ""}
              onChange={(e) => onAccountSelect(orderId, e.target.value)}
              className="w-full px-3 py-2 border-2 border-yellow-400 rounded-lg text-gray-900 bg-white focus:ring-2 focus:ring-yellow-500 text-sm"
            >
              <option value="">-- Choose Account --</option>
              {Object.entries(availableAccounts).map(([id, account]) => (
                <option key={id} value={id}>
                  {account.name}
                </option>
              ))}
            </select>
          </div>

          {/* Claim Button */}
          <button
            onClick={() => onClaim(orderId)}
            disabled={!selectedAccountId || claiming === orderId}
            className="w-full bg-yellow-600 hover:bg-yellow-700 text-white font-semibold py-2.5 px-4 rounded-lg transition-colors disabled:bg-yellow-300 disabled:cursor-not-allowed flex items-center justify-center text-sm"
          >
            {claiming === orderId ? (
              <>
                <Loader size={16} className="mr-2 animate-spin" />
                Assigning Account...
              </>
            ) : (
              <>
                <CheckCircle size={16} className="mr-2" />
                Confirm & Assign Account
              </>
            )}
          </button>

          {selectedAccount && (
            <p className="text-xs text-yellow-700 mt-2">
              💰 Once assigned, earnings will be transferred to:{" "}
              <strong>{selectedAccount.name}</strong>
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
