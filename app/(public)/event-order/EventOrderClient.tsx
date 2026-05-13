"use client";

import { CateringWidget } from "@swift-food-services/catering-widget";

export default function EventOrderClient() {
  return (
    <CateringWidget
      publishableKey={process.env.NEXT_PUBLIC_SWIFT_CATERING_PUBLISHABLE_KEY!}
      googleMapsApiKey={process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY ?? ""}
      stickyTopOffset={0}
      theme={{
        primary: "#fa43ad",
      }}
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
  );
}
