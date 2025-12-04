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
  title: "Swift Food - Bringing London's streetfood to you",
  description: "Swift Food - Planning made easy, Catering made better.",
  keywords: ["event", "food delivery", "events", "UK", "event-order", "streetfood", "delivery"],
  authors: [{ name: "Swift Food Services ltd" }],
  
  icons: {
    icon: "/logo.png",
    apple: "/logo.png",
  },
  
  openGraph: {
    type: "website",
    locale: "en_GB",
    url: "https://swiftfood.uk",
    siteName: "Swift Food",
    title: "Swift Food - Bringing London's streetfood to you",
    description: "We provide event ordering and delivery of the best street food in London",
    
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
    google: "bu1_vFJg_q2u8Syf9Cith5Q6G_Zld7hqwqLw8gDdtSM", // Add this from Google Search Console
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
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