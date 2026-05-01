"use client";

import { usePathname } from "next/navigation";
import Navbar from "@/lib/components/navbar";
import Footer from "@/lib/components/footer";

const BARE_ROUTES = new Set(["/catering-AI"]);

/**
 * Wraps the site-wide Navbar/Footer with a pathname check so the
 * /catering-AI page can render edge-to-edge without the chrome.
 */
export function SiteNavbar() {
  const pathname = usePathname();
  if (pathname && BARE_ROUTES.has(pathname)) return null;
  return <Navbar />;
}

export function SiteFooter() {
  const pathname = usePathname();
  if (pathname && BARE_ROUTES.has(pathname)) return null;
  return <Footer />;
}
