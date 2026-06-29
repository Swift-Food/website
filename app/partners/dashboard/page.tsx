"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Loader } from "lucide-react";
import { useCoworkingAuth } from "@/lib/hooks/useCoworkingAuth";
import { CoworkingDashboard } from "./CoworkingDashboard";

export default function CoworkingDashboardPage() {
  const router = useRouter();
  const { isAuthenticated, loading, spaceId, spaceIds, logout } = useCoworkingAuth();

  // For multi-space admins, let them pick which space to manage
  const [selectedSpaceId, setSelectedSpaceId] = useState<string | null>(null);

  // Default to the first space once auth loads
  useEffect(() => {
    if (spaceId && !selectedSpaceId) {
      setSelectedSpaceId(spaceId);
    }
  }, [spaceId]);

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.push("/partners/login");
    }
  }, [loading, isAuthenticated, router]);

  const handleLogout = () => {
    logout();
    router.push("/partners/login");
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <Loader size={36} className="animate-spin text-indigo-600 mx-auto mb-3" />
          <p className="text-gray-500 text-sm">Loading dashboard…</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Loader size={24} className="animate-spin text-indigo-600" />
      </div>
    );
  }

  // Authenticated but no space linked to this account
  if (!selectedSpaceId) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 max-w-md w-full text-center">
          <div className="inline-flex items-center justify-center w-14 h-14 bg-amber-100 rounded-full mb-4">
            <svg className="w-7 h-7 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
            </svg>
          </div>
          <h2 className="text-lg font-semibold text-gray-900 mb-2">No partner space found</h2>
          <p className="text-sm text-gray-500 mb-6">
            This account isn't linked to any partner space. Contact Swift support to get access set up.
          </p>
          <button
            onClick={handleLogout}
            className="text-sm text-indigo-600 hover:text-indigo-800 font-medium"
          >
            Sign out
          </button>
        </div>
      </div>
    );
  }

  return (
    <CoworkingDashboard
      spaceId={selectedSpaceId}
      onLogout={handleLogout}
      spaceIds={spaceIds}
      selectedSpaceId={selectedSpaceId}
      onSelectSpace={setSelectedSpaceId}
    />
  );
}
