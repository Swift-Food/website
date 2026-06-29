import { Inter } from "next/font/google";

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-inter",
});

export default function PartnerDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Scope Inter to the partner dashboard only — the rest of the site uses IBM Plex Mono.
  return <div className={`${inter.className} ${inter.variable}`}>{children}</div>;
}
