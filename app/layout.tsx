
import "./globals.css";
import Navbar from "./components/navbar";
import Footer from "./components/footer";
import { IBM_Plex_Mono } from "next/font/google";

const ibmPlexMono = IBM_Plex_Mono({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-ibm-plex-mono",
  display: "swap",
});


export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${ibmPlexMono.className} ${ibmPlexMono.variable}`}>
        <Navbar />
        <div className="wrapper">
          <div className="marquee-text">
            <div className="marquee-text-track">
              <p>JOIN SWIFT FOOD ON APP STORE & GOOGLE PLAY!</p>
              <p aria-hidden="true">
                JOIN SWIFT FOOD ON APP STORE & GOOGLE PLAY!
              </p>
              <p>JOIN SWIFT FOOD ON APP STORE & GOOGLE PLAY!</p>
              <p aria-hidden="true">
                JOIN SWIFT FOOD ON APP STORE & GOOGLE PLAY!
              </p>
              <p>JOIN SWIFT FOOD ON APP STORE & GOOGLE PLAY!</p>
              <p aria-hidden="true">
                JOIN SWIFT FOOD ON APP STORE & GOOGLE PLAY!
              </p>
              <p>JOIN SWIFT FOOD ON APP STORE & GOOGLE PLAY!</p>
              <p aria-hidden="true">
                JOIN SWIFT FOOD ON APP STORE & GOOGLE PLAY!
              </p>
            </div>
          </div>
        </div>
        <main
        // className="px-16 max-lg:px-4"
        >
          {children}
        </main>
        <div className="divider"></div>
        <Footer />
        <style>{`
          @keyframes marquee {
            0% { transform: translateX(100%); }
            100% { transform: translateX(-100%); }
          }
        `}</style>
      </body>
    </html>
  );
}
