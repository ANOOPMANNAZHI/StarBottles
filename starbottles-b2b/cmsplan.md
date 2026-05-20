# StarBottles — CMS Integration Plan

## Recommended CMS: Sanity

**Why Sanity:**
- Best-in-class Next.js integration (official `next-sanity` SDK, Live Preview, ISR support)
- Free tier covers this site's needs (3 users, unlimited API calls, 10GB assets)
- GROQ query language — precise, no over-fetching
- Studio UI is editable by non-dev staff (content manager, sales team)
- Images can stay on `shop.starbottles.in` CDN (just store URLs) or migrate to Sanity's CDN

**Alternative:** Use existing WordPress at `shop.starbottles.in` as headless via WP REST API — viable if products are already in WooCommerce and the client prefers not to add another system.

---

## Content Types (Sanity Schemas)

### Tier 1 — Do First (highest business value)

#### 1. `product` — 1500+ SKUs
Replaces: `lib/products.ts`

| Field | Type | Notes |
|-------|------|-------|
| slug | slug | URL identifier |
| name | string | Product display name |
| category | reference → category | Links to category doc |
| description | text | Short listing description |
| longDescription | portable text | Rich detail page copy |
| material | string | e.g. "PET / HDPE" |
| sizes | array of string | e.g. ["10ml", "30ml", "50ml"] |
| moq | number | Minimum order quantity |
| tag | string | "Best Seller", "Premium", etc. |
| featured | boolean | Show on homepage |
| image | image | Main product image |
| gallery | array of image | Additional images |
| features | array of string | Bullet points |
| applications | array of string | Use cases |
| specs | array of {label, value} | Technical specifications |

Affects: `app/products/page.tsx`, `app/products/[slug]/page.tsx`, `components/Products.tsx`, `components/Navbar.tsx` (mega-menu cards), `components/CategoryGrid.tsx`

---

#### 2. `companyStats` — singleton document
Single source of truth — currently repeated in **5 components**.

| Field | Type | Example |
|-------|------|---------|
| established | number | 2010 |
| clients | {value: number, suffix: string} | {500, "+"} |
| skus | {value: number, suffix: string} | {1500, "+"} |
| states | {value: number, suffix: string} | {18, "+"} |
| unitsShipped | {value: number, suffix: string} | {10, "M+"} |

Affects: `components/Hero.tsx`, `components/Stats.tsx`, `components/CompanyIntro.tsx`, `components/Footer.tsx`, `components/AboutPage.tsx`

---

#### 3. `testimonial` — client social proof
Marketing team can add/remove without a developer.

| Field | Type | Notes |
|-------|------|-------|
| quote | text | Client testimonial |
| name | string | Client full name |
| company | string | Business name |
| location | string | City, State |
| metric | string | e.g. "12,000+ units per quarter" |
| initials | string | Avatar fallback (2 chars) |
| gradientFrom | string | Avatar gradient start color |
| gradientTo | string | Avatar gradient end color |
| order | number | Display sort order |

Affects: `components/Testimonials.tsx`

---

### Tier 2 — Do Second

#### 4. `category` — 6 product categories

| Field | Type | Notes |
|-------|------|-------|
| slug | slug | URL + filter key |
| name | string | Full name |
| shortName | string | Abbreviated label |
| tagline | string | e.g. "Serums · Oils · Pharma" |
| emoji | string | Icon character |
| image | image | Category card image |
| gradientFrom | string | Card bg gradient start |
| gradientTo | string | Card bg gradient end |
| accentColor | string | Highlight color hex |
| productFilter | string | Matches product.category value |
| order | number | Display sort order |

Affects: `components/CategoryGrid.tsx`, `components/Navbar.tsx` (mega-menu left panel)

---

#### 5. `companyInfo` — singleton document
Lets business update contact info without code deploys.

| Field | Type | Notes |
|-------|------|-------|
| phone | string | +91 80 86 85 00 00 |
| email | string | mail@starbottles.in |
| address | string | Street address |
| city | string | Thrissur |
| pincode | string | 680 001 |
| state | string | Kerala |
| weekdayHours | string | 9:00 AM – 6:00 PM |
| saturdayHours | string | 9:00 AM – 2:00 PM |
| whatsappNumber | string | 918086850000 |
| linkedinUrl | url | LinkedIn page |
| instagramUrl | url | Instagram profile |
| mapEmbedUrl | url | Google Maps embed src |

Affects: `components/Footer.tsx`, `components/Navbar.tsx`, `components/ContactPage.tsx`

---

#### 6. `milestone` — company timeline

| Field | Type | Notes |
|-------|------|-------|
| year | number | e.g. 2010 |
| title | string | e.g. "Founded in Thrissur, Kerala" |
| description | text | Detail copy |
| order | number | Sort order |

Affects: `components/AboutPage.tsx` (Story section timeline)

---

### Tier 3 — Nice to Have

#### 7. `industry` — served industries

| Field | Type | Notes |
|-------|------|-------|
| name | string | e.g. "Cosmetics" |
| slug | slug | URL key |
| description | string | Short tagline |
| icon | string | SVG path or emoji |
| order | number | Sort order |

Affects: `components/Navbar.tsx` (Industries mega-menu), `components/AboutPage.tsx`

---

#### 8. `howItWorksStep` — process steps

| Field | Type | Notes |
|-------|------|-------|
| stepNumber | number | 1, 2, 3 |
| title | string | Step title |
| description | text | Step body copy |
| ctaLabel | string | Optional button label |
| ctaHref | string | Optional button href |

Affects: `components/HowItWorks.tsx`

---

#### 9. `clientSector` — industry trust bar

| Field | Type | Notes |
|-------|------|-------|
| name | string | e.g. "Cosmetics" |
| emoji | string | Icon character |
| order | number | Sort order |

Affects: `components/ClientsBar.tsx`

---

#### 10. `heroBanner` — singleton document

| Field | Type | Notes |
|-------|------|-------|
| trustBadge | string | Top pill text |
| eyebrow | string | Small label above heading |
| headlineLine1 | string | First heading line |
| headlineLine2 | string | Gradient/accent line |
| description | text | Hero body copy |
| trustBadges | array of string | Bottom badges |
| ctaPrimary | {label, href} | Primary CTA button |
| ctaSecondary | {label, href} | Secondary CTA button |
| showcaseProducts | array of reference → product | Right panel products |

Affects: `components/Hero.tsx`

---

## What Stays Hardcoded (no CMS needed)

| Item | Reason |
|------|--------|
| Page routes / nav link structure | Code-level, not content |
| Footer legal links (Privacy, Terms, Sitemap) | Static pages, never changes |
| Tailwind theme / brand colors | Design system |
| Animation configs | Developer concern |
| Privacy Policy & Terms page body | Legal text, version-controlled |
| Quote form field definitions | Structural UI |

---

## New Files to Create

```
sanity/
  schemaTypes/
    product.ts
    category.ts
    testimonial.ts
    companyStats.ts
    companyInfo.ts
    milestone.ts
    industry.ts
    howItWorksStep.ts
    clientSector.ts
    heroBanner.ts
    index.ts          ← barrel export
  client.ts           ← createClient (projectId, dataset, apiVersion, useCdn)
  queries.ts          ← GROQ constants (allProducts, productBySlug, etc.)

lib/
  sanity.ts           ← typed fetch helpers wrapping client.fetch()
```

---

## Files to Modify

| File | Change |
|------|--------|
| `lib/products.ts` | Replace static array with `fetchProducts()` / `fetchProductBySlug()` calling Sanity |
| `app/products/page.tsx` | Server component; call `fetchProducts()`; keep client-side filter logic |
| `app/products/[slug]/page.tsx` | Call `fetchProductBySlug(slug)`; add `generateStaticParams` |
| `components/Stats.tsx` | Accept `stats` prop; parent fetches from Sanity |
| `components/Testimonials.tsx` | Accept `items` prop; fetch in `app/page.tsx` |
| `components/CategoryGrid.tsx` | Accept `categories` prop |
| `components/Navbar.tsx` | Accept `categories` + `industries` props (fetch in layout) |
| `components/AboutPage.tsx` | Accept `milestones` + `stats` props |
| `app/page.tsx` | Add server-side fetches for stats, testimonials, categories |
| `next.config.ts` | Add `cdn.sanity.io` to `remotePatterns` |

---

## Environment Variables

```env
NEXT_PUBLIC_SANITY_PROJECT_ID=
NEXT_PUBLIC_SANITY_DATASET=production
SANITY_API_TOKEN=          # read-only token for server-side fetches
```

---

## Rendering Strategy

| Data | Strategy | Revalidate | Why |
|------|----------|-----------|-----|
| Products list | ISR | 3600s (1hr) | Large dataset, changes occasionally |
| Product detail | ISR + `generateStaticParams` | 3600s | SEO critical, pre-render known slugs |
| Homepage (stats, testimonials, categories) | ISR | 86400s (24hr) | Changes rarely |
| Company info / contact | ISR | 86400s | Almost never changes |

---

## Setup Steps (Summary)

1. `npx sanity init` inside project — creates `/studio` route via `next-sanity`
2. Define schemas in `sanity/schemaTypes/`
3. Add env vars to `.env.local`
4. Migrate existing hardcoded data into Sanity Studio
5. Replace static imports with `client.fetch()` calls starting with Tier 1
6. Enable ISR revalidation per table above

---

## Verification

```bash
npm run build
```

All routes build without errors. `/products` and `/products/[slug]` fetch from Sanity. Studio accessible at `/studio`. Company stats show identically across all 5 components from a single source.
