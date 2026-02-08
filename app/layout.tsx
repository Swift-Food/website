import "./globals.css";
import Navbar from "@/lib/components/navbar";
import Footer from "@/lib/components/footer";
import { IBM_Plex_Mono } from "next/font/google";
import type { Metadata } from "next";
import { ScrollProvider } from "@/context/ScrollContext";

const ibmPlexMono = IBM_Plex_Mono({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-ibm-plex-mono",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://swiftfood.uk"),

  title: {
    default: "Swift Food | Event Catering & Food Delivery in London",
    template: "%s | Swift Food",
  },
  description:
    "London's trusted event catering service. Order pizza, street food, and corporate catering for events up to 3,000 people. Fast ordering, reliable delivery.",
  keywords: [
    "catering",
    "London catering",
    "event catering",
    "corporate catering",
    "pizza catering",
    "street food catering",
    "food delivery London",
    "office catering",
    "tech event catering",
    "catering service London",
    "party catering",
    "conference catering",
  ],
  authors: [{ name: "Swift Food Services Ltd" }],

  icons: {
    icon: "/logo.png",
    apple: "/logo.png",
  },

  openGraph: {
    type: "website",
    locale: "en_GB",
    url: "https://swiftfood.uk",
    siteName: "Swift Food",
    title: "Swift Food | Event Catering & Food Delivery in London",
    description:
      "London's trusted event catering service. Order pizza, street food, and corporate catering for events up to 3,000 people.",
    images: [
      {
        url: "/logo.png",
        width: 512,
        height: 512,
        alt: "Swift Food - London Event Catering",
      },
    ],
  },

  twitter: {
    card: "summary_large_image",
    title: "Swift Food | Event Catering & Food Delivery in London",
    description:
      "London's trusted event catering service. Order pizza, street food, and corporate catering for events up to 3,000 people.",
    images: ["/logo.png"],
  },

  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },

  verification: {
    google: "bu1_vFJg_q2u8Syf9Cith5Q6G_Zld7hqwqLw8gDdtSM",
  },

  alternates: {
    canonical: "https://swiftfood.uk",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" data-theme="Swift">
      <body className={`${ibmPlexMono.className} ${ibmPlexMono.variable}`}>
        <ScrollProvider>
          <div className="min-h-screen flex flex-col">
            <Navbar />
            <main className="flex-1">{children}</main>
            <Footer />
          </div>
        </ScrollProvider>
      </body>
    </html>
  );
}
