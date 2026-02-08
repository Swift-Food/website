import type { Metadata } from "next";
import ContactClient from "./ContactClient";

export const metadata: Metadata = {
  title: "Contact Us | Get in Touch with Swift Food | London Event Catering",
  description:
    "Contact Swift Food for event catering enquiries, corporate catering quotes, or support. We cater events across London for up to 3,000 people.",
  keywords: [
    "contact catering London",
    "catering enquiry",
    "event catering quote",
    "corporate catering contact",
    "Swift Food contact",
  ],
  alternates: {
    canonical: "https://swiftfood.uk/contact",
  },
  openGraph: {
    title: "Contact Swift Food | London Event Catering",
    description:
      "Get in touch for event catering enquiries, quotes, or support.",
    url: "https://swiftfood.uk/contact",
  },
};

export default function ContactUsPage() {
  return <ContactClient />;
}
