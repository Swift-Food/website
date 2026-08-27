"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { CateringWidget } from "@swift-food-services/catering-widget";
import {
  cateringService,
  type PartnerBranding,
} from "@/services/api/catering.api";
import { parseInitialDataFromParams } from "@/lib/branding/parseInitialDataFromParams";
import { useScroll } from "@/context/ScrollContext";
import { ensureFreshCustomerToken } from "@/lib/api-client/auth-client";
import PartnerBrandedHeader from "./PartnerBrandedHeader";
import PartnerNotFound from "./PartnerNotFound";

const DEFAULT_PRIMARY = "#fa43ad";

/**
 * Branding doubles as the gate for slug delegation. `partnerSlug` is only
 * handed to the widget once `by-slug` confirmed it resolves to an active
 * partner, so the backend never sees an unknown slug on the normal path - and
 * a page that renders branded is a page whose orders attribute to that partner.
 */
type BrandingState =
  | { status: "none" }
  | { status: "loading" }
  | { status: "found"; branding: PartnerBranding }
  | { status: "notFound" };

export default function EventOrderClient() {
  const searchParams = useSearchParams();
  const partnerSlug = searchParams.get("partner");
  const { setHideNavbar } = useScroll();

  const [brandingState, setBrandingState] = useState<BrandingState>(
    partnerSlug ? { status: "loading" } : { status: "none" },
  );

  useEffect(() => {
    setHideNavbar(!!partnerSlug);
    return () => setHideNavbar(false);
  }, [partnerSlug, setHideNavbar]);

  // Parse prefill once from the current query string.
  const initialData = parseInitialDataFromParams(
    searchParams as unknown as URLSearchParams,
  );

  useEffect(() => {
    let active = true;
    if (!partnerSlug) {
      setBrandingState({ status: "none" });
      return;
    }
    setBrandingState({ status: "loading" });
    cateringService.getPartnerBrandingBySlug(partnerSlug).then((result) => {
      if (!active) return;
      setBrandingState(
        result ? { status: "found", branding: result } : { status: "notFound" },
      );
    });
    return () => {
      active = false;
    };
  }, [partnerSlug]);

  if (brandingState.status === "loading") {
    return <div className="min-h-[60vh]" aria-busy="true" />;
  }

  if (brandingState.status === "notFound") {
    return <PartnerNotFound slug={partnerSlug ?? ""} />;
  }

  const branding =
    brandingState.status === "found" ? brandingState.branding : null;
  const primary = branding?.theme?.primary ?? DEFAULT_PRIMARY;

  return (
    <>
      {branding && (
        <PartnerBrandedHeader
          logoImageUrl={branding.logoImageUrl}
          name={branding.name}
          accentColor={primary}
        />
      )}
      <CateringWidget
        aiEnabled
        publishableKey={process.env.NEXT_PUBLIC_SWIFT_CATERING_PUBLISHABLE_KEY!}
        partnerSlug={branding?.slug}
        googleMapsApiKey={process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY ?? ""}
        stickyTopOffset={0}
        // The website owns the customer session, so it owns refreshing it. The
        // widget just asks for a token and gets null when nobody is signed in.
        getAuthToken={ensureFreshCustomerToken}
        theme={{ primary }}
        initialData={initialData}
        onOrderCompleteDelaySeconds={0}
        onOrderComplete={({ accessToken }) => {
          if (accessToken && typeof window !== "undefined") {
            window.location.href = `/event-order/view/${accessToken}`;
          }
        }}
        onError={(e) => {
          // A partner deactivated mid-session surfaces here rather than at
          // page load; drop to the same recovery screen.
          if (e.code === "unknown_partner_slug") {
            setBrandingState({ status: "notFound" });
            return;
          }
          console.error("catering widget error", e);
        }}
      />
    </>
  );
}
