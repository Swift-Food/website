"use client";

import { useState } from "react";
import { ArrowLeft, ExternalLink, Loader, CreditCard } from "lucide-react";
import { useAuth } from "@/lib/hooks/useAuth";
import { restaurantApi } from "@/services/api/restaurant.api";
import { PaymentAccount } from "@/types/restaurant.types";

interface PaymentsSectionProps {
  onBack: () => void;
}

export const PaymentsSection = ({ onBack }: PaymentsSectionProps) => {
  const { user } = useAuth();
  const [loadingAccountId, setLoadingAccountId] = useState<string | null>(null);
  const [error, setError] = useState("");

  const restaurantUserId = user?.restaurantUser?.id;
  const paymentAccounts = user?.restaurantUser?.paymentAccounts;
  const legacyStripeAccountId = user?.restaurantUser?.stripeAccountId;

  // Multi-branch restaurants have a named account per branch; legacy
  // single-account restaurants only have stripeAccountId on the user record.
  const accounts: [string, PaymentAccount][] =
    paymentAccounts && Object.keys(paymentAccounts).length > 0
      ? Object.entries(paymentAccounts)
      : legacyStripeAccountId
        ? [["main", { name: "Main Account", stripeAccountId: legacyStripeAccountId }]]
        : [];

  // Generated fresh on click and never cached: the dashboard login link is
  // single-use and expires within minutes.
  const handleManageAccount = async (accountId: string) => {
    if (!restaurantUserId) return;
    setLoadingAccountId(accountId);
    setError("");
    try {
      const { dashboardUrl } = await restaurantApi.getStripeDashboardLink(
        restaurantUserId,
        accountId
      );
      window.open(dashboardUrl, "_blank", "noopener,noreferrer");
    } catch (err: any) {
      setError(err.message || "Failed to open Stripe dashboard");
    } finally {
      setLoadingAccountId(null);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-3xl mx-auto py-8">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <button
            onClick={onBack}
            className="p-2 hover:bg-white rounded-lg transition-colors"
          >
            <ArrowLeft size={24} className="text-gray-700" />
          </button>
          <div className="flex-1">
            <h1 className="text-3xl font-bold text-gray-900">Payments</h1>
            <p className="text-gray-600 mt-1">
              Manage your Stripe account — bank details, business info, and
              tax documents.
            </p>
          </div>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
            {error}
          </div>
        )}

        {accounts.length === 0 && (
          <div className="text-center py-8 text-gray-500 bg-white rounded-lg border border-gray-200">
            <CreditCard size={32} className="mx-auto mb-2 text-gray-400" />
            <p>No Stripe account found for this restaurant.</p>
          </div>
        )}

        <div className="space-y-3">
          {accounts.map(([accountId, account]) => (
            <div
              key={accountId}
              className="bg-white border border-gray-200 rounded-lg p-6 flex items-center justify-between gap-4"
            >
              <div>
                <h3 className="font-semibold text-gray-900">
                  {account.name}
                </h3>
                <p className="text-sm text-gray-600">
                  Update your bank details, business info, or tax documents.
                </p>
              </div>

              <button
                onClick={() => handleManageAccount(accountId)}
                disabled={loadingAccountId === accountId}
                className="bg-gray-800 hover:bg-gray-900 text-white font-medium py-2 px-4 rounded-lg transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed inline-flex items-center whitespace-nowrap"
              >
                {loadingAccountId === accountId ? (
                  <>
                    <Loader size={16} className="mr-2 animate-spin" />
                    Loading...
                  </>
                ) : (
                  <>
                    <ExternalLink size={16} className="mr-2" />
                    Manage Stripe Account
                  </>
                )}
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
