"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Loader, RotateCcw } from "lucide-react";
import { AuthAlert } from "./AuthAlert";
import { customerAccountApi } from "@/services/api/customer-account.api";
import {
  MyCateringOrder,
  MyOrdersResponse,
} from "@/types/api/customer-account.api.types";

const STATUS_LABELS: Record<string, string> = {
  pending_review: "In review",
  admin_reviewed: "In review",
  restaurant_reviewed: "In review",
  payment_link_sent: "Awaiting payment",
  paid: "Paid",
  confirmed: "Confirmed",
  completed: "Completed",
  cancelled: "Cancelled",
};

const formatDate = (value: string | Date | undefined): string => {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return date.toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
};

const formatTotal = (order: MyCateringOrder): string => {
  const total = order.customerFinalTotal ?? order.finalTotal ?? order.estimatedTotal;
  if (typeof total !== "number") return "";
  return `£${total.toFixed(2)}`;
};

const orderLabel = (order: MyCateringOrder): string =>
  order.orderReference || `Order ${order.id.slice(0, 8)}`;

const OrderRow = ({ order }: { order: MyCateringOrder }) => (
  <div className="flex flex-wrap items-center justify-between gap-4 py-5 border-b border-gray-100 last:border-b-0">
    <div className="min-w-0">
      <p className="font-medium text-black truncate">{orderLabel(order)}</p>
      <p className="text-sm text-gray-400 font-light">
        {[formatDate(order.eventDate), formatTotal(order)].filter(Boolean).join(" · ")}
      </p>
    </div>

    <div className="flex items-center gap-5 shrink-0">
      <span className="font-mono text-[10px] font-bold tracking-[0.12em] uppercase text-gray-400">
        {STATUS_LABELS[order.status] ?? order.status}
      </span>

      {order.accessToken && (
        <>
          <Link
            href={`/event-order/view/${order.accessToken}`}
            className="font-mono text-[10px] font-bold tracking-[0.12em] uppercase border-b border-primary text-primary pb-0.5 hover:text-black hover:border-black transition-colors"
          >
            View
          </Link>
          <Link
            href={`/event-order?reorder=${order.accessToken}`}
            className="inline-flex items-center gap-1.5 font-mono text-[10px] font-bold tracking-[0.12em] uppercase text-gray-400 hover:text-primary transition-colors"
          >
            <RotateCcw size={12} />
            Again
          </Link>
        </>
      )}
    </div>
  </div>
);

const OrderGroup = ({
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
    <div className="mb-10 last:mb-0">
      <h3 className="text-xs font-black uppercase tracking-widest text-black mb-1">
        {title}
      </h3>
      <p className="text-sm text-gray-400 font-light mb-2">{description}</p>
      <div>
        {orders.map((order) => (
          <OrderRow key={order.id} order={order} />
        ))}
      </div>
    </div>
  );
};

export const OrdersSection = () => {
  const [orders, setOrders] = useState<MyOrdersResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;
    customerAccountApi
      .getMyOrders()
      .then((data) => {
        if (!cancelled) setOrders(data);
      })
      .catch((err: unknown) => {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "Could not load your orders.");
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const isEmpty = !!orders && !orders.own.length && !orders.shared.length;

  return (
    <div className="bg-white border border-gray-100 rounded-[32px] p-8 md:p-10 shadow-[0_24px_60px_rgba(0,0,0,0.03)]">
      <h2 className="text-xs font-black uppercase tracking-widest text-black mb-8">
        Your orders
      </h2>

      {loading && (
        <div className="py-8 flex justify-center">
          <Loader size={20} className="animate-spin text-gray-300" />
        </div>
      )}

      {!loading && error && <AuthAlert tone="error" message={error} />}

      {!loading && isEmpty && (
        <div className="py-4">
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

      {!loading && orders && !isEmpty && (
        <>
          <OrderGroup
            title="Placed by you"
            description="Orders you created."
            orders={orders.own}
          />
          <OrderGroup
            title="Shared with you"
            description="Orders someone else placed and added you to."
            orders={orders.shared}
          />
        </>
      )}
    </div>
  );
};
