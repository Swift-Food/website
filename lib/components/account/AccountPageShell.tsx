"use client";

import { ReactNode } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, Loader } from "lucide-react";
import { useCustomerAuth } from "@/lib/hooks/useCustomerAuth";

interface AccountPageShellProps {
  title: string;
  subtitle?: string;
  /** Present on sub-pages; the dashboard shows a sign-out control instead. */
  backTo?: { label: string; href: string };
  children: ReactNode;
}

/**
 * Signed-in chrome for every account page: the guard, the heading, and the one
 * control in the top right. Redirects to sign-in rather than rendering a
 * half-empty page.
 */
export const AccountPageShell = ({
  title,
  subtitle,
  backTo,
  children,
}: AccountPageShellProps) => {
  const router = useRouter();
  const { user, isAuthenticated, loading, logout } = useCustomerAuth();

  if (loading || !isAuthenticated) {
    if (!loading && !isAuthenticated) router.replace("/account/login");
    return (
      <div className="min-h-below-nav bg-white flex items-center justify-center">
        <Loader size={24} className="animate-spin text-gray-300" />
      </div>
    );
  }

  return (
    <div className="min-h-below-nav bg-white pt-8 md:pt-10 pb-24 px-6">
      <div className="max-w-4xl mx-auto">
        {backTo && (
          <Link
            href={backTo.href}
            className="inline-flex items-center gap-2 font-mono text-[10px] font-bold tracking-[0.12em] uppercase text-gray-400 hover:text-primary transition-colors mb-4"
          >
            <ArrowLeft size={12} />
            {backTo.label}
          </Link>
        )}

        <header className="border-b border-gray-100 pb-4 mb-8">
          <div className="flex items-baseline justify-between gap-6">
            <div className="flex items-baseline gap-4 min-w-0">
              <h1 className="text-2xl md:text-3xl font-black tracking-tighter uppercase text-black leading-none shrink-0">
                {title}
              </h1>
              {!subtitle && user?.email && (
                <p className="hidden sm:block font-mono text-xs text-gray-400 truncate">
                  {user.email}
                </p>
              )}
            </div>

            {!backTo && (
              <button
                onClick={logout}
                className="shrink-0 font-mono text-[10px] font-bold tracking-[0.12em] uppercase border-b border-gray-300 text-gray-400 pb-0.5 hover:text-primary hover:border-primary transition-colors"
              >
                Sign out
              </button>
            )}
          </div>

          {subtitle ? (
            <p className="text-sm text-gray-400 font-light leading-relaxed max-w-xl mt-2">
              {subtitle}
            </p>
          ) : (
            user?.email && (
              <p className="sm:hidden font-mono text-xs text-gray-400 truncate mt-2">
                {user.email}
              </p>
            )
          )}
        </header>

        {children}
      </div>
    </div>
  );
};
