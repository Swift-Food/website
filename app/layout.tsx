import "./globals.css";
import Navbar from "@/lib/components/navbar";
import Footer from "@/lib/components/footer";
import { IBM_Plex_Mono } from "next/font/google";
import type { Metadata } from "next";
import { ScrollProvider } from "@/context/ScrollContext";
import ClosureGate from "@/lib/components/ClosureGate";
import { API_BASE_URL } from "@/lib/constants/api";

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

/**
 * Whether Swift has closed to new orders (Admin ▸ Catering Settings).
 * Re-read at most once a minute; if the backend can't be reached the site
 * stays as normal — the backend refuses new orders on its own regardless.
 */
async function isOrderingClosed(): Promise<boolean> {
  try {
    const res = await fetch(`${API_BASE_URL}/catering/status`, {
      next: { revalidate: 60 },
    });
    if (!res.ok) return false;
    const body: { orderingClosed?: boolean } = await res.json();
    return body.orderingClosed === true;
  } catch {
    return false;
  }
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const closed = await isOrderingClosed();

  return (
    <html lang="en" data-theme="Swift">
      <body className={`${ibmPlexMono.className} ${ibmPlexMono.variable}`}>
        <ScrollProvider>
          <ClosureGate closed={closed}>
            <div className="min-h-screen flex flex-col">
              <Navbar />
              <main className="flex-1">{children}</main>
              <Footer />
            </div>
          </ClosureGate>
        </ScrollProvider>
      </body>
    </html>
  );
}
