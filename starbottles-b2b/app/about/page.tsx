import type { Metadata } from "next";
import Footer from "@/components/Footer";
import AboutPage from "@/components/AboutPage";
import { fetchCompanyStats, fetchSiteSettings, fetchPageContent } from "@/lib/api";

export const revalidate = 86400;

export const metadata: Metadata = {
  title: "About Us — StarBottles | B2B Packaging Partner Since 1967",
  description:
    "StarBottles is one of Kerala's most trusted names in plastic and glass packaging. Founded in 1967 in Thrissur, Kerala — 2200+ clients, 1500+ SKUs, 18+ states served. ISO certified, BIS compliant.",
};

export default async function About() {
  const [stats, settings, aboutContent] = await Promise.all([
    fetchCompanyStats().catch(() => undefined),
    fetchSiteSettings().catch(() => ({})),
    fetchPageContent("about").catch(() => ({})),
  ]);

  return (
    <main className="min-h-screen bg-white">
      <AboutPage stats={stats} aboutContent={aboutContent} />
      <Footer stats={stats} settings={settings} />
    </main>
  );
}
