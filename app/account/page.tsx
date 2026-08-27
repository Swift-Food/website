"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Loader } from "lucide-react";
import { ChangePasswordCard } from "@/lib/components/account/ChangePasswordCard";
import { OrdersSection } from "@/lib/components/account/OrdersSection";
import { RewardsSection } from "@/lib/components/account/RewardsSection";
import { useCustomerAuth } from "@/lib/hooks/useCustomerAuth";

export default function AccountPage() {
  const router = useRouter();
  const { user, isAuthenticated, loading, logout } = useCustomerAuth();

  useEffect(() => {
    if (!loading && !isAuthenticated) router.replace("/account/login");
  }, [loading, isAuthenticated, router]);

  if (loading || !isAuthenticated) {
    return (
      <div className="min-h-below-nav bg-white flex items-center justify-center">
        <Loader size={24} className="animate-spin text-gray-300" />
      </div>
    );
  }

  return (
    <div className="min-h-below-nav bg-white pt-20 md:pt-28 pb-24 px-6">
      <div className="max-w-3xl mx-auto">
        <div className="flex items-end justify-between gap-6 mb-12">
          <div>
            <h1 className="text-4xl md:text-5xl font-black tracking-tighter uppercase text-black leading-none mb-4">
              Your account
            </h1>
            <p className="text-gray-400 font-light leading-relaxed">
              {user?.email ?? "Manage your Swift Food catering orders."}
            </p>
          </div>
          <button
            onClick={logout}
            className="shrink-0 font-mono text-[10px] font-bold tracking-[0.12em] uppercase border-b border-gray-300 text-gray-400 pb-0.5 hover:text-primary hover:border-primary transition-colors"
          >
            Sign out
          </button>
        </div>

        <div className="space-y-6">
          <OrdersSection />
          <RewardsSection />
          <ChangePasswordCard />
        </div>
      </div>
    </div>
  );
}
