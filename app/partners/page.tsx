"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Loader } from "lucide-react";
import { useCoworkingAuth } from "@/lib/hooks/useCoworkingAuth";

export default function PartnersIndexPage() {
  const router = useRouter();
  const { isAuthenticated, loading } = useCoworkingAuth();

  useEffect(() => {
    if (loading) return;
    router.replace(isAuthenticated ? "/partners/dashboard" : "/partners/login");
  }, [loading, isAuthenticated, router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <Loader size={36} className="animate-spin text-indigo-600 mx-auto mb-3" />
        <p className="text-gray-500 text-sm">Loading…</p>
      </div>
    </div>
  );
}
