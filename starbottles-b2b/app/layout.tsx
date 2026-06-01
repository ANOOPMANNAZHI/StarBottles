import type { Metadata } from "next";
import { Poppins, Inter } from "next/font/google";
import "./globals.css";
import WhatsAppFloat from "@/components/WhatsAppFloat";
import ChatWidget from "@/components/ChatWidget";
import Navbar from "@/components/Navbar";
import { fetchCategories, fetchProducts, fetchSiteSettings } from "@/lib/api";

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  variable: "--font-poppins",
});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "StarBottles | Premium B2B Packaging Solutions India",
  description:
    "StarBottles supplies premium PET, HDPE, and PP packaging for cosmetic, personal care, pharma, and FMCG businesses across India. Low MOQ, custom branding, pan-India delivery.",
  keywords:
    "B2B packaging India, cosmetic bottles supplier, HDPE jars, PET dropper bottles, bulk packaging Kerala, packaging supplier Thrissur, airless pump bottles India",
  icons: {
    icon: "/favicon.ico",
    apple: "/apple-touch-icon.png",
  },
  manifest: "/site.webmanifest",
  openGraph: {
    title: "StarBottles | Premium B2B Packaging Solutions India",
    description:
      "India's trusted packaging supplier — cosmetic containers, dropper bottles, airless pumps, and more. Bulk-ready, custom-brandable, pan-India delivery.",
    url: "https://starbottles.in",
    siteName: "StarBottles",
    locale: "en_IN",
    type: "website",
    images: [{ url: "/og-image.png", width: 1200, height: 630 }],
  },
  twitter: {
    card: "summary_large_image",
    title: "StarBottles | Premium B2B Packaging Solutions India",
    description:
      "India's trusted B2B packaging supplier for cosmetics, pharma, and FMCG businesses. Low MOQ, custom branding, pan-India delivery.",
  },
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const [categories, products, settings] = await Promise.all([
    fetchCategories().catch(() => []),
    fetchProducts().catch(() => []),
    fetchSiteSettings().catch(() => ({})),
  ]);

  return (
    <html lang="en" className={`${poppins.variable} ${inter.variable}`}>
      <body className="antialiased">
        <Navbar categories={categories} products={products} settings={settings} />
        {children}
        <WhatsAppFloat />
        <ChatWidget />
      </body>
    </html>
  );
}
