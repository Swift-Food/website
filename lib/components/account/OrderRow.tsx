"use client";

import Link from "next/link";
import { RotateCcw } from "lucide-react";
import { MyCateringOrder } from "@/types/api/customer-account.api.types";
import {
  STATUS_LABELS,
  deliveryAddressLine,
  orderMetaLine,
  orderTitle,
  shortOrderId,
} from "./orderDisplay";

interface OrderRowProps {
  order: MyCateringOrder;
  /** The compact form used inside the dashboard cards. */
  compact?: boolean;
  /** Placed by someone else. Marked so a merged list stays readable. */
  shared?: boolean;
}

export const OrderRow = ({ order, compact, shared }: OrderRowProps) => {
  const address = deliveryAddressLine(order);

  return (
    <div className="py-4 border-b border-gray-100 last:border-b-0">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <div className="flex items-baseline gap-2">
            <p className="font-medium text-black truncate">{orderTitle(order)}</p>
            <span className="shrink-0 font-mono text-[10px] text-gray-300 uppercase tracking-widest">
              {shortOrderId(order)}
            </span>
            {shared && (
              <span className="shrink-0 rounded-full bg-primary/10 px-2 py-0.5 font-mono text-[10px] font-bold text-primary uppercase tracking-widest">
                Shared
              </span>
            )}
          </div>
          <p className="text-sm text-gray-400 font-light">{orderMetaLine(order)}</p>
          {address && !compact && (
            <p className="text-sm text-gray-400 font-light truncate">{address}</p>
          )}
        </div>

        <span className="shrink-0 font-mono text-[10px] font-bold tracking-[0.12em] uppercase text-gray-400">
          {STATUS_LABELS[order.status] ?? order.status}
        </span>
      </div>

      {order.accessToken && (
        <div className="flex items-center gap-5 mt-2">
          <Link
            href={`/event-order/view/${order.accessToken}`}
            target="_blank"
            rel="noopener noreferrer"
            className="font-mono text-[10px] font-bold tracking-[0.12em] uppercase border-b border-primary text-primary pb-0.5 hover:text-black hover:border-black transition-colors"
          >
            View
          </Link>
          <Link
            href={`/event-order?reorder=${order.accessToken}`}
            // Not "reorder": the items are not copied, only the contact and
            // delivery details, so the label must not promise the basket back.
            title="Start a new order with your contact and delivery details filled in"
            className="inline-flex items-center gap-1.5 font-mono text-[10px] font-bold tracking-[0.12em] uppercase text-gray-400 hover:text-primary transition-colors"
          >
            <RotateCcw size={12} />
            New order, prefilled
          </Link>
        </div>
      )}
    </div>
  );
};
