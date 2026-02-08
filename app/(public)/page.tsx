import type { Metadata } from "next";
import HomeClient from "./HomeClient";

export const metadata: Metadata = {
  title: "Swift Food | London Event Catering & Food Delivery for Corporate & Tech Events",
  description:
    "London's trusted event catering service. Order pizza catering, street food, and corporate catering for events up to 3,000 people. Fast ordering, reliable delivery across London.",
  keywords: [
    "catering",
    "London catering",
    "event catering",
    "corporate catering",
    "pizza catering",
    "street food catering",
    "food delivery London",
    "office catering London",
    "tech event catering",
    "catering service London",
    "bulk food order London",
    "party catering London",
    "hackathon catering",
    "conference catering",
  ],
  alternates: {
    canonical: "https://swiftfood.uk",
  },
  openGraph: {
    title: "Swift Food | London Event Catering & Food Delivery",
    description:
      "Order catering for events up to 3,000 people. Pizza, street food, and corporate catering delivered across London.",
    url: "https://swiftfood.uk",
  },
};

const localBusinessJsonLd = {
  "@context": "https://schema.org",
  "@type": "FoodEstablishment",
  name: "Swift Food",
  description:
    "London's trusted event catering service. Order pizza, street food, and corporate catering for events up to 3,000 people.",
  url: "https://swiftfood.uk",
  logo: "https://swiftfood.uk/logo.png",
  image: "https://swiftfood.uk/logo.png",
  address: {
    "@type": "PostalAddress",
    addressLocality: "London",
    addressCountry: "GB",
  },
  areaServed: {
    "@type": "City",
    name: "London",
  },
  servesCuisine: ["Pizza", "Street Food", "Corporate Catering", "Event Catering"],
  priceRange: "$$",
  openingHoursSpecification: {
    "@type": "OpeningHoursSpecification",
    dayOfWeek: [
      "Monday",
      "Tuesday",
      "Wednesday",
      "Thursday",
      "Friday",
      "Saturday",
      "Sunday",
    ],
    opens: "08:00",
    closes: "22:00",
  },
  sameAs: [],
};

const websiteJsonLd = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  name: "Swift Food",
  url: "https://swiftfood.uk",
  description:
    "London's trusted event catering service for corporate events, tech events, and large gatherings.",
  publisher: {
    "@type": "Organization",
    name: "Swift Food Services Ltd",
    logo: {
      "@type": "ImageObject",
      url: "https://swiftfood.uk/logo.png",
    },
  },
};

export default function Home() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(localBusinessJsonLd),
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(websiteJsonLd),
        }}
      />
      <HomeClient />
    </>
  );
}
