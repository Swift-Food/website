"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { Loader } from "lucide-react";

export default function RestaurantLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    // Skip auth check for login page
    if (pathname === "/restaurant/login") {
      setIsChecking(false);
      return;
    }

    const token = localStorage.getItem("access_token");

    if (!token) {
      localStorage.setItem("redirect_after_login", pathname);
      router.push("/restaurant/login");
    } else {
      setIsChecking(false);
    }
  }, [router, pathname]);

  // Don't show loader on login page
  if (isChecking && pathname !== "/restaurant/login") {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader size={48} className="animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">Verifying access...</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}