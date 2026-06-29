"use client";

import { CoworkingCalendar } from "./CoworkingCalendar";
import { useDashboard } from "../DashboardShell";

export default function CalendarPage() {
  const { spaceId } = useDashboard();
  return <CoworkingCalendar spaceId={spaceId} />;
}
