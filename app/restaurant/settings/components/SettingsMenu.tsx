"use client";

import { ArrowLeft, Clock, ImageIcon, ShoppingBag, AlertCircle } from "lucide-react";
import { SettingsMenuCard } from "./shared/SettingsMenuCard";

interface SettingsMenuProps {
  onOpeningHours: () => void;
  onProfile: () => void;
  onInventory: () => void;
  onBack: () => void;
  showInventory: boolean;
  error?: string;
  success?: string;
}

export const SettingsMenu = ({
  onOpeningHours,
  onProfile,
  onInventory,
  onBack,
  showInventory,
  error,
  success,
}: SettingsMenuProps) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-4">
      <div className="max-w-5xl mx-auto py-8">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <button
            onClick={onBack}
            className="p-2 hover:bg-white rounded-lg transition-colors"
          >
            <ArrowLeft size={24} className="text-gray-700" />
          </button>
          <div className="flex-1">
            <h1 className="text-4xl font-bold text-gray-900">
              Settings
            </h1>
            <p className="text-lg text-gray-600 mt-1">
              Choose what you&apos;d like to update
            </p>
          </div>
        </div>

        {/* Messages */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border-2 border-red-200 rounded-xl flex items-start text-red-700 shadow-sm">
            <AlertCircle size={20} className="mr-3 flex-shrink-0 mt-0.5" />
            <span className="font-medium">{error}</span>
          </div>
        )}

        {success && (
          <div className="mb-6 p-4 bg-green-50 border-2 border-green-200 rounded-xl text-green-700 shadow-sm">
            <span className="font-medium">{success}</span>
          </div>
        )}

        {/* Large Card Menu */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Opening Hours Card */}
          <SettingsMenuCard
            title="Opening Hours"
            description="Set when your restaurant is open and accepting orders"
            icon={Clock}
            color="blue"
            onClick={onOpeningHours}
          />

          {/* Restaurant Profile Card */}
          <SettingsMenuCard
            title="Profile & Photos"
            description="Update your restaurant name, description, and images"
            icon={ImageIcon}
            color="purple"
            onClick={onProfile}
          />

          {/* Inventory Management Card */}
          {showInventory && (
            <SettingsMenuCard
              title="Inventory Limits"
              description="Manage maximum catering portions and ingredient limits per day"
              icon={ShoppingBag}
              color="emerald"
              onClick={onInventory}
              badge="ACTIVE"
            />
          )}
        </div>

        {/* Help Text */}
        <div className="mt-8 text-center">
          <p className="text-gray-500 text-sm">
            Click any card above to edit that section
          </p>
        </div>
      </div>
    </div>
  );
};
