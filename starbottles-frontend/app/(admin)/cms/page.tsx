"use client";

import Link from "next/link";
import { Image, PanelTop, Settings, FileText, Search, Quote, BarChart3, Milestone, ArrowRight } from "lucide-react";
import { Card } from "@/components/ui/card";

const websiteSections = [
  {
    title: "Media Library",
    description: "Upload and manage images used across the website",
    href: "/cms/media",
    icon: Image,
  },
  {
    title: "Banners",
    description: "Hero banners on the homepage with CTA buttons",
    href: "/cms/banners",
    icon: PanelTop,
  },
  {
    title: "Site Settings",
    description: "Company info, contact details, and social links",
    href: "/cms/settings",
    icon: Settings,
  },
  {
    title: "Page Content",
    description: "Edit text and content sections for each page",
    href: "/cms/pages",
    icon: FileText,
  },
  {
    title: "SEO",
    description: "Meta titles, descriptions, and open graph tags",
    href: "/cms/seo",
    icon: Search,
  },
];

const b2bSections = [
  {
    title: "Testimonials",
    description: "Client social proof shown on the B2B website",
    href: "/cms/testimonials",
    icon: Quote,
  },
  {
    title: "Company Stats",
    description: "Key numbers shown in hero and stats sections",
    href: "/cms/company-stats",
    icon: BarChart3,
  },
  {
    title: "Milestones",
    description: "Company timeline shown on the About page",
    href: "/cms/milestones",
    icon: Milestone,
  },
];

function SectionCard({ title, description, href, icon: Icon }: (typeof websiteSections)[number]) {
  return (
    <Link href={href}>
      <Card className="group relative p-5 hover:shadow-md border-border/60 transition-all duration-300 cursor-pointer h-full overflow-hidden hover:border-accent/40">
        <div className="absolute inset-y-0 left-0 w-0.5 bg-transparent group-hover:bg-accent transition-all duration-300 rounded-r" />
        <div className="flex items-start gap-3.5">
          <div className="p-2.5 rounded-xl bg-muted/60 group-hover:bg-accent/10 transition-colors duration-300 shrink-0">
            <Icon size={18} className="text-muted-foreground group-hover:text-accent transition-colors duration-300" strokeWidth={1.75} />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between gap-2">
              <h3 className="font-semibold text-sm">{title}</h3>
              <ArrowRight size={14} className="text-muted-foreground/0 group-hover:text-muted-foreground/60 transition-all duration-300 shrink-0 -translate-x-1 group-hover:translate-x-0" />
            </div>
            <p className="text-xs text-muted-foreground mt-1 leading-relaxed">{description}</p>
          </div>
        </div>
      </Card>
    </Link>
  );
}

function SectionGroup({ label, sections }: { label: string; sections: typeof websiteSections }) {
  return (
    <div className="space-y-3">
      <div className="flex items-center gap-3">
        <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">{label}</h2>
        <div className="flex-1 h-px bg-border/60" />
      </div>
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {sections.map((s) => (
          <SectionCard key={s.href} {...s} />
        ))}
      </div>
    </div>
  );
}

export default function CmsHubPage() {
  return (
    <div className="p-6 lg:p-8 max-w-5xl mx-auto space-y-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Website CMS</h1>
        <p className="text-sm text-muted-foreground mt-1">Manage content across all public-facing websites.</p>
      </div>

      <SectionGroup label="Company Website" sections={websiteSections} />
      <SectionGroup label="B2B Website" sections={b2bSections} />
    </div>
  );
}
