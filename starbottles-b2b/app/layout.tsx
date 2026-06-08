import type { Metadata } from "next";
import { Poppins, Inter } from "next/font/google";
import Script from "next/script";
import "./globals.css";
import WhatsAppFloat from "@/components/WhatsAppFloat";
import ChatWidget from "@/components/ChatWidget";
import Navbar from "@/components/Navbar";
import { fetchCategories, fetchProducts, fetchSiteSettings } from "@/lib/api";

const GA_ID = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID;

const organizationSchema = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: "StarBottles",
  url: "https://starbottles.in",
  logo: "https://starbottles.in/logo.png",
  description:
    "India's trusted B2B packaging supplier for cosmetics, pharma, and FMCG businesses. Low MOQ, custom branding, pan-India delivery.",
  address: {
    "@type": "PostalAddress",
    addressLocality: "Thrissur",
    addressRegion: "Kerala",
    addressCountry: "IN",
  },
  contactPoint: {
    "@type": "ContactPoint",
    telephone: "+91-80-8685-0000",
    contactType: "customer service",
    areaServed: "IN",
    availableLanguage: ["English", "Malayalam"],
  },
  sameAs: [],
};

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
  metadataBase: new URL("https://starbottles.in"),
  alternates: { canonical: "https://starbottles.in" },
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
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }}
        />
      </head>
      <body className="antialiased">
        <Navbar categories={categories} products={products} settings={settings} />
        {children}
        <WhatsAppFloat />
        <ChatWidget />
        {GA_ID && (
          <>
            <Script
              src={`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`}
              strategy="afterInteractive"
            />
            <Script id="ga4-init" strategy="afterInteractive">
              {`
                window.dataLayer = window.dataLayer || [];
                function gtag(){dataLayer.push(arguments);}
                gtag('js', new Date());
                gtag('config', '${GA_ID}', { page_path: window.location.pathname });
              `}
            </Script>
          </>
        )}
      </body>
    </html>
  );
}
