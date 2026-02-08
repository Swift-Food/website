import type { Metadata } from "next";
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
  return <EventOrderClient />;
}
