"use client";

import Link from "next/link";
import { Gift, Receipt } from "lucide-react";
import { AccountCard } from "./AccountCard";
import { AuthAlert } from "./AuthAlert";
import { OrderRow } from "./OrderRow";
import { mergeRecentOrders } from "./orderDisplay";
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
            <div
              key={discount.code}
              className="py-3 border-b border-gray-100 last:border-b-0"
            >
              <p className="font-mono font-bold text-black tracking-widest text-sm">
                {discount.code}
              </p>
              <p className="text-sm text-gray-400 font-light">
                {discount.discountType === "PERCENT"
                  ? `${discount.discountAmount}% off`
                  : `£${discount.discountAmount.toFixed(2)} off`}
              </p>
            </div>
          ))}
      </AccountCard>
    </div>
  );
};
