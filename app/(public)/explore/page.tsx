import type { Metadata } from "next";
import ExploreClient from "./ExploreClient";

export const metadata: Metadata = {
  title: "Swift Food | AI Catering for Events & Business",
  description:
    "Order catering for events or embed our AI catering widget on your business website. From one-off events to always-on ordering — Swift handles it all.",
};

export default function ExplorePage() {
  return <ExploreClient />;
}
