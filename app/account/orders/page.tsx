"use client";

import Link from "next/link";
import { AccountPageShell } from "@/lib/components/account/AccountPageShell";
import { AuthAlert } from "@/lib/components/account/AuthAlert";
import { OrderRow } from "@/lib/components/account/OrderRow";
import { useAccountData } from "@/lib/components/account/useAccountData";
import { customerAccountApi } from "@/services/api/customer-account.api";
import {
  MyCateringOrder,
  MyOrdersResponse,
} from "@/types/api/customer-account.api.types";

const Group = ({
  title,
  description,
  orders,
}: {
  title: string;
  description: string;
  orders: MyCateringOrder[];
}) => {
  if (!orders.length) return null;
  return (
    <div className="bg-white border border-gray-100 rounded-[32px] p-8 md:p-10 shadow-[0_24px_60px_rgba(0,0,0,0.03)]">
      <h2 className="text-xs font-black uppercase tracking-widest text-black mb-1">
        {title}
      </h2>
      <p className="text-sm text-gray-400 font-light mb-4">{description}</p>
      {orders.map((order) => (
        <OrderRow key={order.id} order={order} />
      ))}
    </div>
  );
};

export default function AllOrdersPage() {
  const { data, loading, error } = useAccountData<MyOrdersResponse>(
    () => customerAccountApi.getMyOrders(),
    "Could not load your orders."
  );

  const own = data?.own ?? [];
  const shared = data?.shared ?? [];
  const isEmpty = !loading && !error && !own.length && !shared.length;

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

      {isEmpty && (
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

      <div className="space-y-6">
        <Group title="Placed by you" description="Orders you created." orders={own} />
        <Group
          title="Shared with you"
          description="Orders someone else placed and added you to."
          orders={shared}
        />
      </div>
    </AccountPageShell>
  );
}
