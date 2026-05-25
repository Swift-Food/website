import type { Metadata } from "next";
import HomeClient from "../HomeClient";

export const metadata: Metadata = {
  title: "Swift Food | London Event Catering & Food Delivery for Corporate & Tech Events",
  description:
    "London's trusted event catering service. Order pizza catering, street food, and corporate catering for events up to 3,000 people. Fast ordering, reliable delivery across London.",
  robots: { index: false, follow: false },
};

export default function HomeV1Page() {
  return <HomeClient />;
}
