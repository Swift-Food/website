import { Poppins } from "next/font/google";
import "./globals.css";
import Navbar from "./components/navbar";
import Footer from "./components/footer";

const primaryFont = Poppins({
  variable: "--font-poppins",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${primaryFont.className} ${primaryFont.variable}`}>
        <Navbar />
        <main className="px-16 max-lg:px-4">{children}</main>
        <div className="divider"></div>
        <Footer />
      </body>
    </html>
  );
}