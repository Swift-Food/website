"use client";

import { ReactNode } from "react";

interface SettingsCardProps {
  title: string;
  description?: string;
  children: ReactNode;
}

/**
 * Consistent titled-card wrapper used to group the profile editor's sections.
 */
export const SettingsCard = ({ title, description, children }: SettingsCardProps) => {
  return (
    <section className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 md:p-7">
      <div className="mb-5">
        <h2 className="text-base font-semibold text-gray-900">{title}</h2>
        {description && (
          <p className="text-sm text-gray-500 mt-1">{description}</p>
        )}
      </div>
      {children}
    </section>
  );
};
