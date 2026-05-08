import type { Metadata } from "next";
import { Suspense } from "react";
import EventOrderClient from "./EventOrderClient";

export const metadata: Metadata = {
  title: "Order Event Catering | Corporate & Party Food Delivery London | Swift Food",
  description:
    "Order catering for your next event in London. From office lunches to 3,000-person conferences, get reliable food delivery from top London restaurants. Quick ordering, flexible delivery times.",
  keywords: [
    "order catering London",
    "event catering order",
    "corporate food order",
    "party food delivery London",
    "conference catering order",
    "office lunch delivery",
    "bulk catering order",
    "hackathon food order",
  ],
  alternates: {
    canonical: "https://swiftfood.uk/event-order",
  },
  openGraph: {
    title: "Order Event Catering | Swift Food",
    description:
      "Order catering for events up to 3,000 people in London. Fast, reliable delivery from top restaurants.",
    url: "https://swiftfood.uk/event-order",
  },
};

export default function CateringPage() {
  // EventOrderClient calls useSearchParams() to read ?draftSessionId=,
  // which Next.js 16 requires be inside a Suspense boundary so the page
  // can statically pre-render the surrounding chrome and bail to client
  // rendering only for the search-params-dependent subtree.
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-sm text-base-content/60">Loading…</div>
        </div>
      }
    >
      <EventOrderClient />
    </Suspense>
  );
}
