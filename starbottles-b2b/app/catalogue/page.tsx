import type { Metadata } from "next";
import Footer from "@/components/Footer";
import CatalogueList from "@/components/CatalogueList";
import { fetchActiveCatalogues, fetchSiteSettings } from "@/lib/api";

export const revalidate = 0;

export const metadata: Metadata = {
  title: "Product Catalogues — StarBottles",
  description:
    "Download StarBottles product catalogues. Browse our complete range of packaging solutions including PET bottles, glass jars, HDPE containers, and more.",
  alternates: { canonical: "https://starbottles.in/catalogue" },
};

export default async function CataloguePage() {
  const [catalogues, settings] = await Promise.all([
    fetchActiveCatalogues().catch(() => []),
    fetchSiteSettings().catch(() => ({})),
  ]);

  return (
    <main className="min-h-screen bg-white">
      {/* Hero / Header */}
      <section className="bg-gradient-to-br from-brand/5 via-brand-pale/20 to-white pt-32 pb-16 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <p className="font-inter text-xs font-bold uppercase tracking-[0.18em] text-brand mb-3">
            Resources
          </p>
          <h1 className="font-poppins font-bold text-3xl sm:text-4xl text-gray-900 leading-tight">
            Product Catalogues
          </h1>
          <p className="font-inter text-gray-500 mt-4 text-base max-w-xl mx-auto leading-relaxed">
            Download our latest catalogues to explore our complete range of packaging
            solutions — PET bottles, glass jars, HDPE containers, and more.
          </p>
        </div>
      </section>

      {/* Catalogue list */}
      <section className="max-w-3xl mx-auto px-4 py-12">
        <CatalogueList catalogues={catalogues} />
      </section>

      <Footer settings={settings} />
    </main>
  );
}
