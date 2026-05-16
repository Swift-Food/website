import type { Metadata } from "next";
import HomeV2Client from "./HomeV2Client";

export const metadata: Metadata = {
  title: "Swift Food | Catering, planned in a chat",
  description:
    "Tell Swift what you're hosting. We'll suggest the menu, price the order, and deliver — no email threads, no spreadsheets, no waiting on quotes.",
  // Preview route — keep out of search index until it replaces "/".
  robots: { index: false, follow: false },
};

export default function HomeV2Page() {
  return <HomeV2Client />;
}
