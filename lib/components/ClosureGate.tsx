"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";

// Pages that stay reachable after Swift closes: restaurant and partner portals,
// customer accounts, existing-order pages, in-flight payment results, and the
// legal/support pages. Everything else (homepage, ordering) shows the notice.
const STILL_OPEN_PREFIXES = [
  "/restaurant",
  "/partners",
  "/account",
  "/event-order/view",
  "/event-order/menu",
  "/payment",
  "/terms",
  "/privacy",
  "/partners-privacy-policy",
  "/swift-partner-policy",
  "/swift-partner-standards",
  "/content-rights-swift",
  "/contact",
  "/consumer-complaints",
  "/faq",
];

const CONTACT_EMAIL = "swiftfooduk@gmail.com";

function isStillOpen(pathname: string): boolean {
  return STILL_OPEN_PREFIXES.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`),
  );
}

interface ClosureGateProps {
  closed: boolean;
  children: React.ReactNode;
}

/**
 * Replaces the site with the ceasing-operations notice once ordering is
 * closed in Admin ▸ Catering Settings. The flag is read server-side in the
 * root layout; this only decides, per path, whether the notice applies.
 */
export default function ClosureGate({ closed, children }: ClosureGateProps) {
  const pathname = usePathname() ?? "/";

  if (!closed || isStillOpen(pathname)) return <>{children}</>;

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-[#f7f8f9] px-6 py-16 text-center">
      <Image src="/logo.png" alt="Swift Food" width={72} height={72} priority />
      <h1 className="mt-8 max-w-xl text-3xl font-semibold text-gray-900">
        Swift Food has ceased operations
      </h1>
      <p className="mt-6 max-w-xl leading-relaxed text-gray-700">
        After serving events across London, Swift Food has ceased trading and is
        no longer accepting new orders.
      </p>
      <p className="mt-4 max-w-xl leading-relaxed text-gray-700">
        We are grateful to every customer, restaurant and partner who ordered,
        cooked and worked with us. Thank you for your support.
      </p>
      <p className="mt-4 max-w-xl leading-relaxed text-gray-700">
        Existing orders can still be viewed using the link in your confirmation
        email. For questions about an existing order, payment or refund, please
        contact us at{" "}
        <a
          href={`mailto:${CONTACT_EMAIL}`}
          className="font-semibold text-[#fa43ad] underline"
        >
          {CONTACT_EMAIL}
        </a>
        .
      </p>
      <div className="mt-10 flex flex-wrap justify-center gap-4 text-sm text-gray-500">
        <Link href="/terms" className="hover:underline">
          Terms
        </Link>
        <Link href="/privacy" className="hover:underline">
          Privacy
        </Link>
      </div>
    </div>
  );
}
