"use client";

import { CoworkingSettings } from "./CoworkingSettings";
import { useDashboard } from "../DashboardShell";

export default function SettingsPage() {
  const { spaceId } = useDashboard();
  return <CoworkingSettings spaceId={spaceId} />;
}
