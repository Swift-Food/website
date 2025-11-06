// components/restaurant-dashboard/analytics/MetricCard.tsx
"use client";

import { LucideIcon } from "lucide-react";

interface MetricCardProps {
  title: string;
  value: string;
  subtitle?: string;
  icon: LucideIcon;
  gradient: string;
}

export const MetricCard = ({
  title,
  value,
  subtitle,
  icon: Icon,
  gradient,
}: MetricCardProps) => {
  return (
    <div className={`${gradient} rounded-lg p-6 text-white`}>
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm font-medium">{title}</span>
        <Icon size={24} />
      </div>
      <p className="text-3xl font-bold">{value}</p>
      {subtitle && <p className="text-sm opacity-90 mt-1">{subtitle}</p>}
    </div>
  );
};