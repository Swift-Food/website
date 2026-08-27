"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Gift, Loader, Receipt, Users } from "lucide-react";
import { ChangePasswordCard } from "@/lib/components/account/ChangePasswordCard";
import { useCustomerAuth } from "@/lib/hooks/useCustomerAuth";

interface PlaceholderSection {
  title: string;
  description: string;
  icon: typeof Receipt;
}

const SECTIONS: PlaceholderSection[] = [
  {
    title: "Your orders",
    description: "Every catering order you have placed, with its status and a one-tap reorder.",
    icon: Receipt,
  },
  {
    title: "Shared with you",
    description: "Orders someone else placed where you were added as a manager or viewer.",
    icon: Users,
  },
  {
    title: "Your rewards",
    description: "Thank-you discount codes from completed orders, ready to use at checkout.",
    icon: Gift,
  },
];

export default function AccountPage() {
  const router = useRouter();
  const { user, isAuthenticated, loading, logout } = useCustomerAuth();

  useEffect(() => {
    if (!loading && !isAuthenticated) router.replace("/account/login");
  }, [loading, isAuthenticated, router]);

  if (loading || !isAuthenticated) {
    return (
      <div className="min-h-[80vh] bg-white flex items-center justify-center">
        <Loader size={24} className="animate-spin text-gray-300" />
      </div>
    );
  }

  return (
    <div className="min-h-[80vh] bg-white pt-20 md:pt-28 pb-24 px-6">
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

        <div className="grid gap-6 sm:grid-cols-3 mb-6">
          {SECTIONS.map(({ title, description, icon: Icon }) => (
            <div
              key={title}
              className="bg-white border border-gray-100 rounded-[32px] p-8 shadow-[0_24px_60px_rgba(0,0,0,0.03)]"
            >
              <div className="w-10 h-10 bg-gray-50 rounded-xl flex items-center justify-center text-primary mb-6">
                <Icon size={20} />
              </div>
              <h2 className="text-xs font-black uppercase tracking-widest text-black mb-2">
                {title}
              </h2>
              <p className="text-sm text-gray-400 font-light leading-relaxed mb-6">
                {description}
              </p>
              <span className="font-mono text-[10px] font-bold tracking-[0.12em] uppercase text-gray-300">
                Coming soon
              </span>
            </div>
          ))}
        </div>

        <ChangePasswordCard />
      </div>
    </div>
  );
}
