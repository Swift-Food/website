import { MyCateringOrder } from "@/types/api/customer-account.api.types";

export const STATUS_LABELS: Record<string, string> = {
  pending_review: "In review",
  admin_reviewed: "In review",
  restaurant_reviewed: "In review",
  payment_link_sent: "Awaiting payment",
  paid: "Paid",
  confirmed: "Confirmed",
  completed: "Completed",
  cancelled: "Cancelled",
};

export const formatDate = (value: string | Date | undefined): string => {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return date.toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
};

export const formatTotal = (order: MyCateringOrder): string => {
  const total = order.customerFinalTotal ?? order.finalTotal ?? order.estimatedTotal;
  if (typeof total !== "number") return "";
  return `£${total.toFixed(2)}`;
};

/**
 * Orders have no name of their own, so the first session's name is the closest
 * thing to one ("Main Event", "Lunch"). Falls back to the organisation, then to
 * a short id - the same first-8 shape the order view page shows.
 */
export const orderTitle = (order: MyCateringOrder): string => {
  const sessionName = order.mealSessions?.[0]?.sessionName?.trim();
  if (sessionName) return sessionName;
  if (order.organization?.trim()) return order.organization.trim();
  return `Order ${shortOrderId(order)}`;
};

/** First 4 characters of the id, matching how the order view page refers to it. */
export const shortOrderId = (order: MyCateringOrder): string =>
  `#${order.id.slice(0, 4)}`;

export const sessionCount = (order: MyCateringOrder): number =>
  order.mealSessions?.length ?? 0;

export const deliveryAddressLine = (order: MyCateringOrder): string => {
  const address = order.deliveryAddress;
  if (typeof address === "string") return address.replace(/^,\s*/, "").trim();
  if (address && typeof address === "object") {
    return [address.street, address.city, address.postcode].filter(Boolean).join(", ");
  }
  return "";
};

/** "2 sessions · 3 Sept 2026 · £420.00", skipping anything we do not have. */
export const orderMetaLine = (order: MyCateringOrder): string => {
  const sessions = sessionCount(order);
  return [
    sessions > 1 ? `${sessions} sessions` : sessions === 1 ? "1 session" : "",
    formatDate(order.eventDate),
    formatTotal(order),
  ]
    .filter(Boolean)
    .join(" · ");
};

/**
 * Both lists arrive sorted by recency but separately, so merging needs its own
 * sort. `myRole` survives the merge, which is what marks a row as shared.
 */
export const mergeRecentOrders = (
  own: MyCateringOrder[],
  shared: MyCateringOrder[]
): MyCateringOrder[] =>
  [...own, ...shared].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );

/** Whether this order was placed by someone else and shared with the caller. */
export const isSharedWithMe = (
  order: MyCateringOrder,
  own: MyCateringOrder[]
): boolean => !own.some((o) => o.id === order.id);
