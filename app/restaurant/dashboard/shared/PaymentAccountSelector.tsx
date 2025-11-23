// components/restaurant-dashboard/shared/PaymentAccountSelector.tsx
"use client";

import { PaymentAccounts } from "@/types/restaurant.types";

interface PaymentAccountSelectorProps {
  paymentAccounts: PaymentAccounts | null;
  selectedAccountId: string | null;
  onSelectAccount: (accountId: string | null) => void;
}

export const PaymentAccountSelector = ({
  paymentAccounts,
  selectedAccountId,
  onSelectAccount,
}: PaymentAccountSelectorProps) => {
  if (!paymentAccounts) {
    return null;
  }

  const accounts = Object.entries(paymentAccounts);
  const hasMultipleAccounts = accounts.length > 1;

  // If only one account, don't show the selector at all
  if (accounts.length === 1) {
    return null;
  }

  return (
    <div className="mb-6">
      <div className="bg-white rounded-lg p-4">
        <label className="block text-sm font-medium text-gray-700 mb-3">
          Select Branch
        </label>
        <div className="flex flex-wrap gap-2">
          {hasMultipleAccounts && (
            <button
              onClick={() => onSelectAccount(null)}
              className={`px-4 py-2 rounded-lg font-medium text-sm transition-colors ${
                selectedAccountId === null
                  ? "bg-blue-600 text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              All Branches
            </button>
          )}
          {accounts.map(([accountId, account]) => (
            <button
              key={accountId}
              onClick={() => {
                console.log("Selecting account: ", accountId);
                onSelectAccount(accountId);
              }}
              className={`px-4 py-2 rounded-lg font-medium text-sm transition-colors ${
                selectedAccountId === accountId
                  ? "bg-blue-600 text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              {account.name}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
