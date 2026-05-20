import Hero from "@/components/Hero";
import FeaturedProducts from "@/components/FeaturedProducts";
import Stats from "@/components/Stats";
import ClientsBar from "@/components/ClientsBar";
import CompanyIntro from "@/components/CompanyIntro";
import CategoryGrid from "@/components/CategoryGrid";
import Products from "@/components/Products";
import HowItWorks from "@/components/HowItWorks";
import Testimonials from "@/components/Testimonials";
import CTABanner from "@/components/CTABanner";
import Footer from "@/components/Footer";
import {
  fetchCompanyStats, fetchProducts, fetchTestimonials,
  fetchBanners, fetchCategories, fetchFeaturedCategories, fetchSiteSettings, fetchPageContent,
} from "@/lib/api";

export const revalidate = 86400;

export default async function Home() {
  const [stats, testimonials, products, banners, categories, featuredCategories, settings, homeContent] = await Promise.all([
    fetchCompanyStats().catch(() => undefined),
    fetchTestimonials().catch(() => undefined),
    fetchProducts().catch(() => []),
    fetchBanners().catch(() => []),
    fetchCategories().catch(() => []),
    fetchFeaturedCategories().catch(() => []),
    fetchSiteSettings().catch(() => ({})),
    fetchPageContent("home").catch(() => ({})),
  ]);

  // Use featured categories on home page; fall back to all categories if none are marked featured yet
  const homeCategories = featuredCategories.length > 0 ? featuredCategories : categories;

  return (
    <main className="min-h-screen bg-white">
      <Hero banners={banners} />
      <CategoryGrid categories={homeCategories} />
      <FeaturedProducts products={products} />
      <CompanyIntro stats={stats} homeContent={homeContent} />
      <Stats stats={stats} />
      <ClientsBar />
      <Products initialProducts={products} />
      <HowItWorks />
      <Testimonials items={testimonials} />
      <CTABanner />
      <Footer stats={stats} settings={settings} />
    </main>
  );
}
