import Link from "next/link";

const values = [
  {
    icon: "🏭",
    title: "Indian Manufacturing",
    desc: "All products are manufactured in India to BIS standards, ensuring consistent quality and competitive pricing.",
  },
  {
    icon: "🔬",
    title: "Quality Tested",
    desc: "Every batch undergoes rigorous leak, drop, and chemical resistance testing before dispatch.",
  },
  {
    icon: "🌱",
    title: "Sustainable Options",
    desc: "We offer recycled PET and bio-based PP options for brands committed to sustainability.",
  },
  {
    icon: "🤝",
    title: "Dedicated Support",
    desc: "A dedicated account manager for every business client — from first order to repeat supply.",
  },
];

export default function About() {
  return (
    <section className="py-20 lg:py-28 bg-white">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
          {/* Left: Visual */}
          <div className="relative">
            <div className="bg-gradient-to-br from-brand-darker via-brand-dark to-brand rounded-2xl p-10 text-white">
              <p className="font-inter text-brand-light font-semibold text-sm mb-2 uppercase tracking-wider">
                About StarBottles
              </p>
              <h3 className="font-poppins font-bold text-3xl md:text-4xl mb-4 leading-tight">
                50+ Years of<br />Packaging Excellence
              </h3>
              <p className="font-inter text-white/75 leading-relaxed mb-8">
                Founded in 1967, StarBottles has grown from a regional supplier to one of India&apos;s
                most trusted B2B packaging partners. We serve cosmetic brands, pharmaceutical
                companies, FMCG manufacturers, and home care businesses across the country.
              </p>

              <div className="grid grid-cols-2 gap-5">
                {[
                  { value: "1967", label: "Established" },
                  { value: "2200+", label: "Happy Clients" },
                  { value: "100+", label: "Product SKUs" },
                  { value: "18+", label: "States Covered" },
                ].map((stat) => (
                  <div key={stat.label} className="bg-white/10 rounded-xl p-4">
                    <p className="font-poppins font-bold text-2xl text-white">{stat.value}</p>
                    <p className="font-inter text-sm text-white/60 mt-0.5">{stat.label}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Floating badge */}
            <div className="absolute -bottom-5 -right-5 bg-white border border-gray-100 shadow-lg rounded-xl px-5 py-4 flex items-center gap-3">
              <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                <svg className="w-5 h-5 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                </svg>
              </div>
              <div>
                <p className="font-poppins font-semibold text-gray-900 text-sm">ISO Certified</p>
                <p className="font-inter text-xs text-gray-400">Quality Assured</p>
              </div>
            </div>
          </div>

          {/* Right: Content */}
          <div>
            <span className="inline-block bg-brand-pale text-brand-dark font-inter text-sm font-semibold px-4 py-1.5 rounded-full mb-4">
              Why Choose Us
            </span>
            <h2 className="font-poppins font-bold text-3xl md:text-4xl text-gray-900 mb-4">
              Your Reliable Packaging Partner
            </h2>
            <p className="font-inter text-gray-500 text-lg mb-10">
              We combine scale, speed, and quality to deliver packaging solutions that help your
              brand stand out — on time, every time.
            </p>

            <div className="space-y-6">
              {values.map((item) => (
                <div key={item.title} className="flex gap-4">
                  <div className="w-11 h-11 bg-brand-pale rounded-xl flex items-center justify-center text-xl flex-shrink-0">
                    {item.icon}
                  </div>
                  <div>
                    <h4 className="font-poppins font-semibold text-gray-900 mb-1">{item.title}</h4>
                    <p className="font-inter text-gray-500 text-sm leading-relaxed">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>

            <Link
              href="/contact"
              className="inline-flex items-center gap-2 mt-10 bg-brand hover:bg-brand-dark text-white font-poppins font-semibold px-8 py-3.5 rounded-xl transition-colors"
            >
              Partner With Us
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
