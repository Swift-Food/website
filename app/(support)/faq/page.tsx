import type { Metadata } from "next";
import FAQClient from "./FAQClient";

export const metadata: Metadata = {
  title: "FAQ | Event Catering Questions Answered | Swift Food",
  description:
    "Find answers to common questions about Swift Food's event catering service in London. Learn about ordering, delivery, dietary options, payments, cancellations, and corporate catering.",
  keywords: [
    "catering FAQ",
    "event catering questions",
    "food delivery FAQ",
    "catering service help",
    "London catering help",
    "corporate catering FAQ",
  ],
  alternates: {
    canonical: "https://swiftfood.uk/faq",
  },
  openGraph: {
    title: "FAQ | Swift Food Event Catering",
    description:
      "Answers to common questions about ordering event catering in London with Swift Food.",
    url: "https://swiftfood.uk/faq",
  },
};

const faqJsonLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: [
    {
      "@type": "Question",
      name: "How far in advance should I place a catering order?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Lead times vary by restaurant, and each menu clearly shows the required notice. Some partners offer short-notice options, while others require more preparation time. For larger groups or events, placing your order as early as possible helps us coordinate seamlessly with our partners.",
      },
    },
    {
      "@type": "Question",
      name: "Can I place same-day catering orders?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Yes. Certain restaurants accept same-day or short-notice orders. The exact timing will always be shown on the restaurant's menu.",
      },
    },
    {
      "@type": "Question",
      name: "Do you provide allergen details and dietary filters?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Yes. Each menu item includes allergen information provided by the restaurant. Dietary filters are also available to help you browse easily.",
      },
    },
    {
      "@type": "Question",
      name: "Can I order from multiple restaurants in one delivery?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Yes, you can combine items from several partners within a single order.",
      },
    },
    {
      "@type": "Question",
      name: "What is the largest event Swift Food can support?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "We can accommodate events serving up to 2,500 people. For very large orders, contacting us early ensures the best possible coordination.",
      },
    },
    {
      "@type": "Question",
      name: "What payment methods can I use?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "We accept all payment options supported by our Stripe partners, including major debit and credit cards, international cards, Visa, and American Express. We also accept wallets such as Link, Apple Pay, and Google Pay.",
      },
    },
    {
      "@type": "Question",
      name: "Can I schedule recurring or corporate catering orders?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Yes. Our team can help you set up a corporate account that includes additional features such as budget controls, role assignments, and access to an expanded selection of restaurant partners.",
      },
    },
    {
      "@type": "Question",
      name: "Who delivers the food?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Deliveries are handled by a dedicated courier team experienced in event-scale orders.",
      },
    },
    {
      "@type": "Question",
      name: "Do you provide cutlery, plates and napkins?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Yes. Cutlery, plates and napkins can be included upon request. Some partners may apply a small, clearly displayed charge.",
      },
    },
  ],
};

export default function FAQPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(faqJsonLd),
        }}
      />
      <FAQClient />
    </>
  );
}
