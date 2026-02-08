import type { Metadata } from "next";
import MenuClient from "./MenuClient";

export const metadata: Metadata = {
  title: "Catering Menu | Pizza, Street Food & Corporate Catering in London | Swift Food",
  description:
    "Browse our catering menu featuring pizza, burgers, Asian street food, and more from London's best restaurants. Filter by dietary needs, allergens, and cuisine. Perfect for office lunches, corporate events, and large gatherings.",
  keywords: [
    "catering menu London",
    "pizza catering menu",
    "street food menu",
    "corporate lunch menu",
    "event food menu",
    "halal catering London",
    "vegan catering London",
    "office lunch catering",
    "bulk food order",
  ],
  alternates: {
    canonical: "https://swiftfood.uk/menu",
  },
  openGraph: {
    title: "Catering Menu | Swift Food",
    description:
      "Browse catering options from London's best restaurants. Pizza, street food, corporate catering and more.",
    url: "https://swiftfood.uk/menu",
  },
};

export default function MenuPage() {
  return <MenuClient />;
}
