import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Privacy Policy — StarBottles",
  description: "How StarBottles collects, uses, and protects your personal data.",
};

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="mb-10">
      <h2 className="font-poppins font-bold text-xl text-brand-darker mb-4">{title}</h2>
      {children}
    </div>
  );
}

function P({ children }: { children: React.ReactNode }) {
  return <p className="font-inter text-gray-600 text-base leading-[1.8] mb-4">{children}</p>;
}

function Ul({ items }: { items: string[] }) {
  return (
    <ul className="space-y-2.5 font-inter text-gray-600 text-base mb-4 ml-1">
      {items.map((item) => (
        <li key={item} className="flex items-start gap-3">
          <span className="w-1.5 h-1.5 rounded-full bg-brand/40 mt-2.5 flex-shrink-0" />
          <span className="leading-[1.8]">{item}</span>
        </li>
      ))}
    </ul>
  );
}

export default function PrivacyPolicy() {
  return (
    <main className="min-h-screen bg-[#f5f6fa]">
      {/* Branded header */}
      <header className="relative overflow-hidden"
        style={{ background: "linear-gradient(135deg, #080d2a 0%, #0E1249 40%, #1B2178 100%)" }}
      >
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 right-0 w-[400px] h-[400px] rounded-full bg-white/[0.03]" style={{ transform: "translate(40%, -50%)" }} />
        </div>
        <div className="max-w-4xl mx-auto px-6 lg:px-8 py-8 relative">
          <Link href="/" className="flex items-center gap-2.5 w-fit mb-8 group">
            <div className="w-9 h-9 rounded-xl bg-white/10 ring-1 ring-white/[0.12] flex items-center justify-center group-hover:bg-white/15 transition-colors">
              <span className="text-white font-poppins font-bold text-sm">S</span>
            </div>
            <span className="font-poppins font-bold text-xl text-white">StarBottles</span>
          </Link>
          <h1 className="font-poppins font-extrabold text-4xl md:text-5xl text-white tracking-tight mb-3">Privacy Policy</h1>
          <p className="font-inter text-sm text-white/35">Last updated: March 2025</p>
        </div>
      </header>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-6 lg:px-8 py-16">
        <div className="bg-white rounded-2xl ring-1 ring-gray-100 shadow-sm p-8 md:p-12">
          <Section title="1. Our Commitment to Privacy">
            <P>
              Welcome to Star Bottles. Starbottles.in is committed to protecting and respecting your
              privacy. This Privacy Policy explains how we collect, use, and safeguard your personal
              information when you use our website, products, and services.
            </P>
          </Section>

          <Section title="2. Information We Collect">
            <P>
              To provide a seamless experience for our customers, we may collect the following details
              when you use our website or online store:
            </P>
            <Ul items={[
              "Full Name",
              "Billing & Shipping Address",
              "Telephone Number",
              "Email Address",
              "Payment Information (Credit/Debit Card, UPI, Wallets, Net Banking, etc.)",
              "Company Details (if applicable)",
              "Order History & Preference",
            ]} />
          </Section>

          <Section title="3. How We Use Your Information">
            <P>The information collected is used strictly for the following purposes:</P>
            <Ul items={[
              "To process and deliver your orders",
              "To provide order confirmations, shipping updates, and support",
              "To respond to your inquiries and requests",
              "To improve our website, products, and customer experience",
              "To send you promotional offers, newsletters, or updates (only if you have opted in)",
            ]} />
            <P>
              We do not sell, rent, or share your personal information with outside parties except
              where necessary for:
            </P>
            <Ul items={[
              "Payment processing (through secure third-party providers such as Razorpay, PayU, or Stripe)",
              "Shipping and delivery (with our logistics partners)",
              "Legal obligations (if required by law or government authorities)",
            ]} />
          </Section>

          <Section title="4. Data Security">
            <P>
              We take appropriate physical, electronic, and managerial measures to safeguard your
              personal information against unauthorized access, disclosure, alteration, or
              destruction. All payment details are encrypted and processed securely through trusted
              third-party payment gateways.
            </P>
          </Section>

          <Section title="5. Links to Other Websites">
            <P>
              Our website may include links to external websites for your convenience. Please note
              that we are not responsible for the privacy practices of these external sites. We
              encourage you to review the privacy policy of any website you visit.
            </P>
          </Section>

          <Section title="6. Controlling Your Personal Information">
            <P>You may at any time:</P>
            <Ul items={[
              "Opt out of receiving marketing communications by writing to us at mail@starbottles.in (Subject: Unsubscribe)",
              "Request corrections to your personal information if it is inaccurate or incomplete",
              "Request that we delete your personal information, subject to legal and contractual obligations",
            ]} />
            <P>
              We will not use your personal information for direct marketing unless you have given us
              permission to do so.
            </P>
          </Section>

          <Section title="7. Contact Us">
            <P>
              If you have any questions or concerns regarding this Privacy Policy, please contact us:
            </P>
            <Ul items={[
              "Email: mail@starbottles.in",
              "Phone: +91 8086850000",
              "Address: 39/126, CA Chambers, RS Road, Thrissur, Kerala 680 001",
            ]} />
          </Section>
        </div>

        <div className="mt-8 flex items-center justify-between">
          <Link href="/" className="font-inter text-sm font-semibold text-brand hover:text-brand-dark transition-colors flex items-center gap-2 bg-white px-4 py-2.5 rounded-xl ring-1 ring-gray-100 hover:ring-brand/20 shadow-sm">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to Home
          </Link>
          <Link href="/terms" className="font-inter text-sm text-gray-400 hover:text-brand transition-colors">
            Terms of Service
          </Link>
        </div>
      </div>
    </main>
  );
}
