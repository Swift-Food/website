"use client";

import { useState } from "react";
import Link from "next/link";
import { Gift, Receipt } from "lucide-react";
import { AccountCard } from "./AccountCard";
import { AuthAlert } from "./AuthAlert";
import { DiscountModal } from "./DiscountModal";
import { OrderRow } from "./OrderRow";
import { discountScopeLine, formatDate, mergeRecentOrders } from "./orderDisplay";
import { useAccountData } from "./useAccountData";
import { customerAccountApi } from "@/services/api/customer-account.api";
import {
  AvailableDiscount,
  MyOrdersResponse,
} from "@/types/api/customer-account.api.types";

/** How many rows a dashboard card shows before deferring to its own page. */
const PREVIEW_COUNT = 3;

const EmptyNote = ({ children }: { children: React.ReactNode }) => (
  <p className="text-sm text-gray-400 font-light">{children}</p>
);

export const AccountOverview = () => {
  const orders = useAccountData<MyOrdersResponse>(
    () => customerAccountApi.getMyOrders(),
    "Could not load your orders."
  );
  const rewards = useAccountData<AvailableDiscount[]>(
    () => customerAccountApi.getMyDiscounts(),
    "Could not load your reward codes."
  );

  const own = orders.data?.own ?? [];
  const shared = orders.data?.shared ?? [];
  const recent = mergeRecentOrders(own, shared);
  const codes = rewards.data ?? [];
  const [selectedDiscount, setSelectedDiscount] = useState<AvailableDiscount | null>(
    null
  );

  return (
    <div className="grid gap-6 md:grid-cols-3">
      <AccountCard
        title="Recent orders"
        icon={Receipt}
        className="md:col-span-2"
        loading={orders.loading}
        action={recent.length ? { label: "View all", href: "/account/orders" } : undefined}
      >
        {orders.error && <AuthAlert tone="error" message={orders.error} />}

        {!orders.error && !recent.length && (
          <>
            <EmptyNote>You have not placed a catering order yet.</EmptyNote>
            <Link
              href="/event-order"
              className="mt-6 inline-block bg-black text-white py-3 px-6 rounded-2xl font-black uppercase tracking-[0.4em] text-[10px] hover:bg-primary transition-all"
            >
              Start one
            </Link>
          </>
        )}

        {!orders.error &&
          recent.slice(0, PREVIEW_COUNT).map((order) => (
            <OrderRow
              key={order.id}
              order={order}
              compact
              shared={!own.some((o) => o.id === order.id)}
            />
          ))}
      </AccountCard>

      <AccountCard title="Your discount codes" icon={Gift} loading={rewards.loading}>
        {rewards.error && <AuthAlert tone="error" message={rewards.error} />}

        {!rewards.error && !codes.length && (
          <EmptyNote>
            You have no discount codes right now.
          </EmptyNote>
        )}

        {!rewards.error &&
          codes.map((discount) => (
            <button
              key={discount.code}
              type="button"
              onClick={() => setSelectedDiscount(discount)}
              className="block w-full text-left py-3 border-b border-gray-100 last:border-b-0 hover:bg-gray-50 rounded-lg px-2 -mx-2 transition-colors"
            >
              {/* Three weights, not four identical lines: what the code is,
                  what it's worth, then the constraints demoted together. */}
              <div className="flex items-baseline justify-between gap-3">
                <p className="font-mono font-bold text-black tracking-widest text-sm">
                  {discount.code}
                </p>
                <p className="text-sm text-black font-light shrink-0">
                  {discount.discountType === "PERCENT"
                    ? `${discount.discountAmount}% off`
                    : `£${discount.discountAmount.toFixed(2)} off`}
                </p>
              </div>
              {/* Wraps as whole phrases: a long restaurant name pushes the
                  whole "Expires ..." onto its own line rather than splitting
                  the date off from its label. */}
              <p className="text-xs text-gray-400 font-light mt-1 flex flex-wrap gap-x-2">
                <span>{discountScopeLine(discount.restaurants)}</span>
                {/* formatDate returns "" for a null or unparseable value, so a
                    code with no expiry renders nothing here. */}
                {formatDate(discount.expiresAt ?? undefined) && (
                  <span className="whitespace-nowrap">
                    Expires {formatDate(discount.expiresAt ?? undefined)}
                  </span>
                )}
              </p>
            </button>
          ))}
      </AccountCard>

      <DiscountModal
        isOpen={selectedDiscount !== null}
        onClose={() => setSelectedDiscount(null)}
        discount={selectedDiscount}
      />
    </div>
  );
};
