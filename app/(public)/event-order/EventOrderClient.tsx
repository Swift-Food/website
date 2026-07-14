"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { CateringWidget } from "@swift-food-services/catering-widget";
import {
  cateringService,
  type PartnerBranding,
} from "@/services/api/catering.api";
import { parseInitialDataFromParams } from "@/lib/branding/parseInitialDataFromParams";
import PartnerBrandedHeader from "./PartnerBrandedHeader";

const DEFAULT_PRIMARY = "#fa43ad";

export default function EventOrderClient() {
  const searchParams = useSearchParams();
  const partnerSlug = searchParams.get("partner");

  const [branding, setBranding] = useState<PartnerBranding | null>(null);

  // Parse prefill once from the current query string.
  const initialData = parseInitialDataFromParams(
    searchParams as unknown as URLSearchParams,
  );

  useEffect(() => {
    let active = true;
    if (!partnerSlug) {
      setBranding(null);
      return;
    }
    cateringService.getPartnerBrandingBySlug(partnerSlug).then((result) => {
      if (active) setBranding(result);
    });
    return () => {
      active = false;
    };
  }, [partnerSlug]);

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
        googleMapsApiKey={process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY ?? ""}
        stickyTopOffset={0}
        theme={{ primary }}
        initialData={initialData}
        onOrderCompleteDelaySeconds={0}
        onOrderComplete={({ accessToken }) => {
          if (accessToken && typeof window !== "undefined") {
            window.location.href = `/event-order/view/${accessToken}`;
          }
        }}
        onError={(e) => {
          console.error("catering widget error", e);
        }}
      />
    </>
  );
}
