import type { Metadata } from "next";
import CateringAIClient from "./CateringAIClient";

export const metadata: Metadata = {
  title: "AI Catering Planner",
  description:
    "Plan a catered event with Swift Food's AI assistant. Tell us about your event and we'll draft a menu in seconds.",
};

export default function CateringAIPage() {
  return <CateringAIClient />;
}
