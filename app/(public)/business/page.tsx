import type { Metadata } from "next";
import BusinessClient from "./BusinessClient";

export const metadata: Metadata = {
  title: "Swift Food | AI Catering Widget for Workspaces, Offices & Venues",
  description:
    "Add AI-powered catering to your website in one line of code. Give members, teams, or guests a way to order catering right from your site.",
  openGraph: {
    title: "Swift Food | AI Catering Widget for Business",
    description:
      "Embed our catering widget on your workspace, office, or venue website. Free to get started — no setup fee, no monthly cost.",
    url: "https://swiftfood.uk/business",
  },
};

export default function BusinessPage() {
  return <BusinessClient />;
}
