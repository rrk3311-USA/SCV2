import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { Header } from "@/components/Header";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { Footer } from "@/components/Footer";
import { StickyCartBanner } from "@/components/StickyCartBanner";
import { Analytics } from "@/components/Analytics";
import { RouteTracker } from "@/components/RouteTracker";
import { OutboundTracker } from "@/components/OutboundTracker";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-medusa" });

export const metadata: Metadata = {
  title: "Success Chemistry – Premium Supplements | SCV2",
  description:
    "Premium dietary supplements and vitamins made in USA. Medusa storefront.",
};

/**
 * Root layout: universal header and footer on every page (home, shop, cart, contact, all policy pages).
 * No route opts out – same nav and footer site-wide.
 */
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={inter.variable}>
      <body className="min-h-screen flex flex-col bg-gradient-to-br from-sky-50 via-white to-sky-50 font-sans antialiased">
        <Analytics />
        <RouteTracker />
        <OutboundTracker />
        <Header />
        <Breadcrumbs />
        <main className="flex-1">{children}</main>
        <Footer />
        <StickyCartBanner />
      </body>
    </html>
  );
}
