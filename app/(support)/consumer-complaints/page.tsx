import type { Metadata } from "next";
import ConsumerComplaintsClient from "./ConsumerComplaintsClient";

export const metadata: Metadata = {
  title: "Consumer Complaints | Swift Food",
  description:
    "Submit a consumer complaint to Swift Food. We take all feedback seriously and aim to resolve issues promptly.",
  alternates: {
    canonical: "https://swiftfood.uk/consumer-complaints",
  },
};

export default function ConsumerComplaintsPage() {
  return <ConsumerComplaintsClient />;
}
