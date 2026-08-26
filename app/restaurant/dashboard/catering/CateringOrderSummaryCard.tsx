"use client";

import { CalendarDays, Clock, MapPin, UserRound, ChevronRight } from "lucide-react";
import { CateringOrderResponse } from "@/types/api";
import {
  formatCollectionTimeRange,
  formatCurrency,
  formatDate,
  formatEventTimeRange,
} from "./utils/format.utils";
import { formatDeliveryAddress } from "./utils/address.utils";
import {
  getRestaurantNetEarnings,
  getRestaurantOrderItems,
} from "./utils/pricing.utils";
import { BUCKET_STYLES, bucketForStatus } from "./CateringOrdersCalendar";

interface Props {
  order: CateringOrderResponse & { effectiveStatus?: string };
  restaurantId: string;
  onOpenDetails: (orderId: string) => void;
}

/**
 * Compact order summary used in the calendar view. Shows the key order
 * information only — the full item breakdown lives in the details modal.
 */
export const CateringOrderSummaryCard = ({
  order,
  restaurantId,
  onOpenDetails,
}: Props) => {
  const status = order.effectiveStatus || order.status;
  const bucket = bucketForStatus(status);
  const badge = bucket
    ? BUCKET_STYLES[bucket]
    : { label: status.replace(/_/g, " "), dot: "bg-gray-400", badge: "bg-gray-100 text-gray-700" };

  const items = getRestaurantOrderItems(order, restaurantId);
  const itemCount = items.reduce(
    (total: number, item: any) =>
      total +
      (item.menuItems?.reduce(
        (sum: number, menuItem: any) => sum + (menuItem.quantity || 0),
        0
      ) ?? item.quantity ?? 0),
    0
  );
  const sessionCount = order.mealSessions?.length ?? 0;
  const earnings = getRestaurantNetEarnings(order, restaurantId);
  const address = formatDeliveryAddress(order.deliveryAddress);

  return (
    <button
      onClick={() => onOpenDetails(order.id)}
      className="group w-full text-left bg-white border border-gray-200 rounded-xl p-4 transition-all hover:border-blue-400 hover:shadow-md focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-sm font-bold text-gray-900">
            Reference: {order.id.slice(0, 4).toUpperCase()}
          </p>
          <p className="truncate text-sm text-gray-600 mt-0.5">
            {order.customerName}
            {order.organization ? ` · ${order.organization}` : ""}
          </p>
        </div>
        <span
          className={`shrink-0 inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ${badge.badge}`}
        >
          <span className={`w-1.5 h-1.5 rounded-full ${badge.dot}`} />
          {badge.label}
        </span>
      </div>

      {/* Key details */}
      <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-1.5 text-sm text-gray-600">
        <span className="flex items-center gap-1.5">
          <CalendarDays size={14} className="shrink-0 text-gray-400" />
          {formatDate(order.eventDate)}
        </span>
        <span className="flex items-center gap-1.5">
          <Clock size={14} className="shrink-0 text-gray-400" />
          {order.collectionTime
            ? formatCollectionTimeRange(order.collectionTime)
            : formatEventTimeRange(order.eventTime)}
        </span>
        {order.guestCount ? (
          <span className="flex items-center gap-1.5">
            <UserRound size={14} className="shrink-0 text-gray-400" />
            {order.guestCount} guests
          </span>
        ) : null}
        {address ? (
          <span className="flex items-center gap-1.5 min-w-0">
            <MapPin size={14} className="shrink-0 text-gray-400" />
            <span className="truncate">{address}</span>
          </span>
        ) : null}
      </div>

      {/* Footer */}
      <div className="mt-3 pt-3 border-t border-gray-100 flex items-center justify-between gap-3">
        <div className="text-sm">
          <span className="text-gray-500">
            {itemCount} item{itemCount !== 1 ? "s" : ""}
            {sessionCount > 1 ? ` · ${sessionCount} sessions` : ""}
          </span>
        </div>
        <div className="flex items-center gap-3">
          <div className="text-right">
            <p className="text-[11px] uppercase tracking-wide text-gray-400">
              Your earnings
            </p>
            <p className="text-sm font-bold text-gray-900">
              {formatCurrency(earnings)}
            </p>
          </div>
          <ChevronRight
            size={18}
            className="shrink-0 text-gray-300 transition-colors group-hover:text-blue-500"
          />
        </div>
      </div>
    </button>
  );
};
