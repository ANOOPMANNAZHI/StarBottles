import type { Metadata } from "next";
import Footer from "@/components/Footer";
import ContactPage from "@/components/ContactPage";
import { fetchCompanyStats, fetchSiteSettings } from "@/lib/api";

export const revalidate = 0;

export const metadata: Metadata = {
  title: "Contact Us — StarBottles | B2B Packaging Distributor, Thrissur Kerala",
  description:
    "Get in touch with StarBottles — call, WhatsApp, or email our team in Thrissur, Kerala. Fast response within 24 hours for B2B packaging inquiries.",
};

export default async function Contact() {
  const [stats, settings] = await Promise.all([
    fetchCompanyStats().catch(() => undefined),
    fetchSiteSettings().catch(() => ({})),
  ]);

  return (
    <main className="min-h-screen bg-white">
      <ContactPage />
      <Footer stats={stats} settings={settings} />
    </main>
  );
}
