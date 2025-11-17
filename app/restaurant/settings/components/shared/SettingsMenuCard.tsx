"use client";

import { ChevronRight, LucideIcon } from "lucide-react";

interface SettingsMenuCardProps {
  title: string;
  description: string;
  icon: LucideIcon;
  color: "blue" | "purple" | "emerald";
  onClick: () => void;
  badge?: string;
}

const colorClasses = {
  blue: {
    bg: "bg-blue-100",
    icon: "text-blue-600",
    hover: "hover:from-blue-50",
    border: "hover:border-blue-300",
    text: "text-blue-600",
    iconBg: "bg-blue-100",
  },
  purple: {
    bg: "bg-purple-100",
    icon: "text-purple-600",
    hover: "hover:from-purple-50",
    border: "hover:border-purple-300",
    text: "text-purple-600",
    iconBg: "bg-purple-100",
  },
  emerald: {
    bg: "bg-emerald-100",
    icon: "text-emerald-600",
    hover: "hover:from-emerald-50",
    border: "hover:border-emerald-300",
    text: "text-emerald-600",
    iconBg: "bg-emerald-100",
  },
};

export const SettingsMenuCard = ({
  title,
  description,
  icon: Icon,
  color,
  onClick,
  badge,
}: SettingsMenuCardProps) => {
  const colors = colorClasses[color];

  return (
    <button
      onClick={onClick}
      className={`group bg-white hover:bg-gradient-to-br ${colors.hover} hover:to-white border-2 border-gray-200 ${colors.border} rounded-2xl p-8 transition-all hover:shadow-xl text-left relative overflow-hidden`}
    >
      {badge && (
        <div className="absolute top-4 right-4">
          <span className={`${colors.bg} ${colors.icon} text-xs font-bold px-3 py-1.5 rounded-full`}>
            {badge}
          </span>
        </div>
      )}

      <div className="absolute bottom-4 right-4 opacity-10 group-hover:opacity-20 transition-opacity">
        <Icon size={100} className={colors.icon} />
      </div>

      <div className="relative z-10">
        <div className={`${colors.iconBg} rounded-2xl p-4 w-fit mb-4`}>
          <Icon size={32} className={colors.icon} />
        </div>

        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          {title}
        </h2>

        <p className="text-gray-600 text-base mb-6">
          {description}
        </p>

        <div className={`flex items-center ${colors.text} font-semibold group-hover:gap-3 gap-2 transition-all`}>
          <span>Edit</span>
          <ChevronRight size={20} className="group-hover:translate-x-1 transition-transform" />
        </div>
      </div>
    </button>
  );
};
