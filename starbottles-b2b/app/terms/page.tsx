import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Terms of Service — StarBottles",
  description: "Terms and conditions for using StarBottles packaging products and services.",
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

export default function TermsOfService() {
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
          <h1 className="font-poppins font-extrabold text-4xl md:text-5xl text-white tracking-tight mb-3">Terms of Service</h1>
          <p className="font-inter text-sm text-white/35">Last updated: March 2025</p>
        </div>
      </header>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-6 lg:px-8 py-16">
        <div className="bg-white rounded-2xl ring-1 ring-gray-100 shadow-sm p-8 md:p-12">
          <P>
            Welcome to the Web site operated by Star Bottles. We maintain this Website as a service
            to its visitors. By using this Website, you are agreeing to comply with and be bound by
            the following terms of use. Please review the following terms carefully. If you do not
            agree to these terms, you have no right from Star Bottles to obtain information from or
            otherwise use this Web site. Failure to use this Website in accordance with the following
            terms of use may subject you to severe civil and criminal penalties.
          </P>

          <Section title="Introduction">
            <P>
              You agree to the terms and conditions outlined in this Terms of Use Agreement
              (&quot;Agreement&quot;) with respect to this Web site (the &quot;Site&quot;). This
              Agreement constitutes the entire and only agreement between us and you, and supersedes
              all prior or contemporaneous agreements, representations, warranties and understandings
              with respect to the Site, the content and computer programs provided by or through the
              Site, and the subject matter of this Agreement. This Agreement may be amended at any
              time by us from time to time without specific notice to you. The latest Agreement will
              be posted on the Site, and you should review this Agreement prior to each use of the
              Site.
            </P>
          </Section>

          <Section title="Copyright">
            <P>
              The content, organization, graphics, design, compilation, magnetic translation, digital
              conversion and other matters related to the Site are protected under applicable
              copyrights, trademarks and other proprietary (including but not limited to intellectual
              property) rights. The copying, redistribution, use or publication by you of any such
              matters or any part of the Site, except as allowed under &quot;Limited Right to
              Use&quot; below, is strictly prohibited. You do not acquire ownership rights to any
              content, document or other materials viewed through the Site. The posting by Star
              Bottles of information or materials on the Site does not constitute a waiver of any
              right in such information and materials.
            </P>
          </Section>

          <Section title="Editing, Deleting and Modification">
            <P>
              We reserve the right in our sole discretion to change, edit or delete any documents,
              information or other content appearing on the Site.
            </P>
          </Section>

          <Section title="Non Transferable">
            <P>
              Your right to use the Site is not transferable. Any password or right given to you to
              obtain information or documents from the Site is not transferable.
            </P>
          </Section>

          <Section title="Links to Other Websites">
            <P>
              The Site may now, or hereafter from time to time, contain links to third-party
              Websites. We do not control, investigate, monitor or check such Websites, we are not
              responsible for the computer programs available from, content in or opinions expressed
              at such Websites, and we do not investigate, monitor or check. We provide such
              third-party links only as a convenience to visitors of the Site, and the inclusion of a
              link does not imply approval or endorsement of the linked site by us. If you decide to
              leave the Site and access any third-party Website, you do so at your own risk.
            </P>
          </Section>
        </div>

        <div className="mt-8 flex items-center justify-between">
          <Link href="/" className="font-inter text-sm font-semibold text-brand hover:text-brand-dark transition-colors flex items-center gap-2 bg-white px-4 py-2.5 rounded-xl ring-1 ring-gray-100 hover:ring-brand/20 shadow-sm">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to Home
          </Link>
          <Link href="/privacy-policy" className="font-inter text-sm text-gray-400 hover:text-brand transition-colors">
            Privacy Policy
          </Link>
        </div>
      </div>
    </main>
  );
}
