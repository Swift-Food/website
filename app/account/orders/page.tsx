"use client";

import { useState } from "react";
import Link from "next/link";
import { AccountPageShell } from "@/lib/components/account/AccountPageShell";
import { AuthAlert } from "@/lib/components/account/AuthAlert";
import { OrderRow } from "@/lib/components/account/OrderRow";
import { mergeRecentOrders } from "@/lib/components/account/orderDisplay";
import { useAccountData } from "@/lib/components/account/useAccountData";
import { customerAccountApi } from "@/services/api/customer-account.api";
import { MyOrdersResponse } from "@/types/api/customer-account.api.types";

type Filter = "all" | "own" | "shared";

const FILTERS: { value: Filter; label: string }[] = [
  { value: "all", label: "All" },
  { value: "own", label: "Placed by you" },
  { value: "shared", label: "Shared with you" },
];

export default function AllOrdersPage() {
  const [filter, setFilter] = useState<Filter>("all");
  const { data, loading, error } = useAccountData<MyOrdersResponse>(
    () => customerAccountApi.getMyOrders(),
    "Could not load your orders."
  );

  const own = data?.own ?? [];
  const shared = data?.shared ?? [];
  const ownIds = new Set(own.map((order) => order.id));

  const visible =
    filter === "own" ? own : filter === "shared" ? shared : mergeRecentOrders(own, shared);

  const hasAny = own.length > 0 || shared.length > 0;

  return (
    <AccountPageShell
      title="Your orders"
      subtitle="Every catering order you have placed or been added to."
      backTo={{ label: "Back to account", href: "/account" }}
    >
      {loading && (
        <p className="text-sm text-gray-400 font-light">Loading your orders…</p>
      )}
      {error && <AuthAlert tone="error" message={error} />}

      {!loading && !error && !hasAny && (
        <div>
          <p className="text-sm text-gray-400 font-light mb-6">
            You have not placed a catering order yet.
          </p>
          <Link
            href="/event-order"
            className="inline-block bg-black text-white py-4 px-8 rounded-2xl font-black uppercase tracking-[0.4em] text-xs hover:bg-primary transition-all"
          >
            Start an order
          </Link>
        </div>
      )}

      {!loading && !error && hasAny && (
        <>
          {/* Only worth offering once there is something on both sides. */}
          {own.length > 0 && shared.length > 0 && (
            <div className="flex flex-wrap gap-6 mb-8">
              {FILTERS.map(({ value, label }) => (
                <button
                  key={value}
                  onClick={() => setFilter(value)}
                  aria-pressed={filter === value}
                  className={`font-mono text-[10px] font-bold tracking-[0.12em] uppercase pb-0.5 border-b transition-colors ${
                    filter === value
                      ? "text-primary border-primary"
                      : "text-gray-400 border-transparent hover:text-black"
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          )}

          <div className="bg-white border border-gray-100 rounded-[32px] p-8 md:p-10 shadow-[0_24px_60px_rgba(0,0,0,0.03)]">
            {visible.length === 0 ? (
              <p className="text-sm text-gray-400 font-light">
                No orders match this filter.
              </p>
            ) : (
              visible.map((order) => (
                <OrderRow
                  key={order.id}
                  order={order}
                  shared={!ownIds.has(order.id)}
                />
              ))
            )}
          </div>
        </>
      )}
    </AccountPageShell>
  );
}
