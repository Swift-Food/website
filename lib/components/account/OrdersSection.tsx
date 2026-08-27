"use client";

import Link from "next/link";
import { Gift, Receipt, Users } from "lucide-react";
import { AccountCard } from "./AccountCard";
import { AuthAlert } from "./AuthAlert";
import { OrderRow } from "./OrderRow";
import { useAccountData } from "./useAccountData";
import { customerAccountApi } from "@/services/api/customer-account.api";
import {
  AvailableDiscount,
  MyCateringOrder,
  MyOrdersResponse,
} from "@/types/api/customer-account.api.types";

/** How many rows a dashboard card shows before deferring to its own page. */
const PREVIEW_COUNT = 3;

const EmptyNote = ({ children }: { children: React.ReactNode }) => (
  <p className="text-sm text-gray-400 font-light">{children}</p>
);

const OrderPreview = ({ orders }: { orders: MyCateringOrder[] }) => (
  <div>
    {orders.slice(0, PREVIEW_COUNT).map((order) => (
      <OrderRow key={order.id} order={order} compact />
    ))}
  </div>
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
  const codes = rewards.data ?? [];

  return (
    <div className="grid gap-6 md:grid-cols-3">
      <AccountCard
        title="Your orders"
        icon={Receipt}
        loading={orders.loading}
        action={own.length ? { label: "View all", href: "/account/orders" } : undefined}
      >
        {orders.error && <AuthAlert tone="error" message={orders.error} />}
        {!orders.error && !own.length && (
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
        {!orders.error && own.length > 0 && <OrderPreview orders={own} />}
      </AccountCard>

      <AccountCard
        title="Shared with you"
        icon={Users}
        loading={orders.loading}
        action={
          shared.length ? { label: "View all", href: "/account/orders" } : undefined
        }
      >
        {!orders.error && !shared.length && (
          <EmptyNote>
            Orders someone else placed and added you to will appear here.
          </EmptyNote>
        )}
        {!orders.error && shared.length > 0 && <OrderPreview orders={shared} />}
      </AccountCard>

      <AccountCard title="Your rewards" icon={Gift} loading={rewards.loading}>
        {rewards.error && <AuthAlert tone="error" message={rewards.error} />}
        {!rewards.error && !codes.length && (
          <EmptyNote>
            Thank-you codes arrive once an order is completed. Enter one in the
            discount box at checkout.
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
