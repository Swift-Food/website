"use client";

import { OrdersList } from "./OrdersList";
import { useDashboard } from "../DashboardShell";

export default function OrdersPage() {
  const { spaceId } = useDashboard();
  return <OrdersList spaceId={spaceId} />;
}
