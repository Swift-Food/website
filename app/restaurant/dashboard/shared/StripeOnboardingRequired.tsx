// components/restaurant-dashboard/shared/StripeOnboardingRequired.tsx
"use client";

import { useState } from "react";
import { AlertCircle, ExternalLink, Loader, CheckCircle } from "lucide-react";
import { restaurantApi } from "@/app/api/restaurantApi";
import { PaymentAccounts } from "@/types/restaurant.types";

interface StripeOnboardingRequiredProps {
  userId: string;
  token: string;
  onRefresh: () => void;
  paymentAccounts: PaymentAccounts | null;
  selectedAccountId: string | null;
}

export const StripeOnboardingRequired = ({
  userId,
  token,
  onRefresh,
  paymentAccounts,
  selectedAccountId,
}: StripeOnboardingRequiredProps) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const hasMultipleBranches =
    paymentAccounts && Object.keys(paymentAccounts).length > 0;
  const showAllBranches = hasMultipleBranches && selectedAccountId === null;

  const handleRefreshLink = async (accountId?: string) => {
    setLoading(true);
    setError("");
    try {
      const { onboardingUrl } = await restaurantApi.refreshOnboardingLink(
        userId,
        token,
        accountId
      );
      window.location.href = onboardingUrl;
    } catch (err: any) {
      setError(err.message || "Failed to get onboarding link");
    } finally {
      setLoading(false);
    }
  };

  if (showAllBranches) {
    const accounts = Object.entries(paymentAccounts!);
    const incompleteAccounts = accounts.filter(
      ([, account]) => !account.stripeOnboardingComplete
    );

    return (
      <div className="max-w-4xl mx-auto">
        <div className="bg-yellow-50 border-2 border-yellow-200 rounded-lg p-8">
          <div className="text-center mb-6">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-yellow-100 rounded-full mb-4">
              <AlertCircle size={32} className="text-yellow-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Stripe Onboarding Status
            </h2>
            <p className="text-gray-700">
              Select a branch from the navigation above to complete its Stripe
              onboarding.
            </p>
          </div>

          <div className="space-y-3">
            <h3 className="font-semibold text-gray-900 mb-3">Branch Status:</h3>
            {accounts.map(([accountId, account]) => (
              <div
                key={accountId}
                className={`p-4 rounded-lg border-2 ${
                  account.stripeOnboardingComplete
                    ? "bg-green-50 border-green-300"
                    : "bg-red-50 border-red-300"
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    {account.stripeOnboardingComplete ? (
                      <CheckCircle size={20} className="text-green-600 mr-2" />
                    ) : (
                      <AlertCircle size={20} className="text-red-600 mr-2" />
                    )}
                    <span className="font-medium text-gray-900">
                      {account.name}
                    </span>
                  </div>
                  <span
                    className={`text-sm font-medium ${
                      account.stripeOnboardingComplete
                        ? "text-green-700"
                        : "text-red-700"
                    }`}
                  >
                    {account.stripeOnboardingComplete
                      ? "Complete"
                      : "Incomplete"}
                  </span>
                </div>
              </div>
            ))}
          </div>

          {incompleteAccounts.length > 0 && (
            <p className="text-sm text-gray-600 mt-4 text-center">
              {incompleteAccounts.length} branch
              {incompleteAccounts.length > 1 ? "es" : ""} require
              {incompleteAccounts.length === 1 ? "s" : ""} onboarding
            </p>
          )}
        </div>
      </div>
    );
  }

  const accountName =
    selectedAccountId && paymentAccounts?.[selectedAccountId]
      ? paymentAccounts[selectedAccountId].name
      : "Main Account";

  return (
    <div className="max-w-2xl mx-auto">
      <div className="bg-yellow-50 border-2 border-yellow-200 rounded-lg p-8 text-center">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-yellow-100 rounded-full mb-4">
          <AlertCircle size={32} className="text-yellow-600" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Complete Stripe Onboarding
        </h2>
        <p className="text-gray-700 mb-2">
          {hasMultipleBranches && selectedAccountId
            ? `Complete Stripe onboarding for ${accountName}`
            : "Complete your Stripe account setup"}
        </p>
        <p className="text-gray-600 text-sm mb-6">
          This is required to securely receive payments.
        </p>

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
            {error}
          </div>
        )}

        <button
          onClick={() => handleRefreshLink(selectedAccountId || undefined)}
          disabled={loading}
          className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-6 rounded-lg transition-colors disabled:bg-blue-300 disabled:cursor-not-allowed inline-flex items-center"
        >
          {loading ? (
            <>
              <Loader size={18} className="mr-2 animate-spin" />
              Loading...
            </>
          ) : (
            <>
              <ExternalLink size={18} className="mr-2" />
              Complete Stripe Onboarding
            </>
          )}
        </button>

        <button
          onClick={onRefresh}
          className="mt-4 text-blue-600 hover:text-blue-700 font-medium block w-full"
        >
          I've completed onboarding - Refresh
        </button>
      </div>
    </div>
  );
};