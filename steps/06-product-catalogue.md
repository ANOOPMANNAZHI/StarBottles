# Module 06 — Product Catalogue

## Overview
Public-facing product listing and detail pages, admin product visibility controls, product view tracking, and category tree management.

---

## Backend Tasks

### 1. Create ProductListResource
File: `app/Http/Resources/ProductListResource.php`

Fields (lightweight, for grid display):
- `id`, `erp_id`, `title`
- `category`: `{ id, name }`
- `material`, `capacity`
- `is_featured`, `is_hidden`
- `first_image`: `$this->images[0] ?? null`
- `share_url`: `url('/products/' . $this->id)`

### 2. Create ProductResource
File: `app/Http/Resources/ProductResource.php`

Fields (full detail):
- All `ProductListResource` fields
- `description`, `neck_size`, `shape_type`
- `images` (full array), `video_url`
- `is_active`, `synced_at`
- `category`: full `{ id, name, slug }`
- `variations`: collection of `{ attribute_name, attribute_value }`
- `share_url`

### 3. Create ProductController
File: `app/Http/Controllers/Api/ProductController.php`

**`index(Request $request)`** — Public, no auth required
- Base query: `Product::with(['category', 'variations'])->scopeVisible()`
- If authenticated user is admin AND `?include_hidden=true`: remove `is_hidden` filter
- Search: if `?search=`, filter `title LIKE %q%` OR `description LIKE %q%`
- Filters:
  - `?category_id=` — exact match
  - `?material=` — exact match
  - `?capacity=` — LIKE match (e.g. "500" matches "500ml")
  - `?shape_type=` — exact match
  - `?featured=1` — scope `scopeFeatured()`
- Paginate: 24 per page
- Track view: create `ProductView` record with `viewer_ip` and `user_id` (if auth)
- Return `ProductListResource` paginated collection

**`show(Product $product)`**
- If `is_hidden = true` AND user is not admin → `abort(404)`
- Eager load: `category`, `variations`
- Track view (same as index)
- Return full `ProductResource`

**`categories()`**
- Fetch all `ProductCategory` records with `children` relation
- Build nested tree: only return top-level categories (where `parent_id = null`), each with nested children
- Cache for 1 hour: `Cache::remember('product_categories', 3600, fn() => ...)`
- Return tree array

### 4. Create ProductVisibilityController
File: `app/Http/Controllers/Api/Admin/ProductVisibilityController.php`

Both methods restricted to `role:admin`.

**`toggleHidden(Product $product)`**
- `$product->update(['is_hidden' => !$product->is_hidden])`
- Return `ProductResource`

**`toggleFeatured(Product $product)`**
- `$product->update(['is_featured' => !$product->is_featured])`
- Return `ProductResource`

### 5. Register Product Routes
Public (no auth):
```
GET  /v1/products             ProductController@index
GET  /v1/products/categories  ProductController@categories
GET  /v1/products/{product}   ProductController@show
```

Admin only:
```
PATCH  /v1/products/{product}/hide     ProductVisibilityController@toggleHidden
PATCH  /v1/products/{product}/feature  ProductVisibilityController@toggleFeatured
```

### 6. Write Feature Tests
File: `tests/Feature/ProductApiTest.php`

- `test_public_can_list_active_visible_products`
- `test_hidden_products_not_returned_to_public`
- `test_admin_can_view_hidden_products_with_flag`
- `test_search_returns_matching_products`
- `test_category_filter_works`
- `test_featured_filter_returns_only_featured_products`
- `test_viewing_product_creates_product_view_record`
- `test_hidden_product_detail_returns_404_to_public`
- `test_admin_can_toggle_product_hidden`
- `test_admin_can_toggle_product_featured`
- `test_categories_endpoint_returns_nested_tree`

---

## Frontend Tasks

### 7. Create Product Hooks
File: `hooks/useProducts.ts`

- `useProducts(filters, page)` — `GET /v1/products` with filters as query params
- `useProduct(id)` — `GET /v1/products/{id}`
- `useProductCategories()` — `GET /v1/products/categories`, `staleTime: Infinity`
- `useSubmitProductEnquiry()` — `POST /v1/enquiries` mutation (used on product detail page)

### 8. Create ProductCard Component
File: `components/products/ProductCard.tsx`

- Props: `product: ProductListResource`
- Image: `next/image`, aspect ratio 4:3, `object-cover`, fallback to placeholder SVG
- Category badge (top-left overlay on image, semi-transparent background)
- Product title: max 2 lines, truncate with `line-clamp-2`
- Material + Capacity in small gray text
- "View Details" button → `Link` to `/products/{id}`
- Hover: `scale-[1.02]` and shadow transition

### 9. Create ProductFilters Component
File: `components/products/ProductFilters.tsx`

- Props: `categories`, `currentFilters`, `onChange(filters)`
- **Categories section**: checkbox tree — top-level items expandable to show children
- **Material section**: list of checkboxes (derive unique values from categories or static list)
- **Shape/Type section**: checkboxes
- **Search**: text input (debounced 300ms)
- "Clear All Filters" link at bottom — resets all filter state
- On any change: call `onChange` with new filter object

### 10. Build Public Product Listing Page
File: `app/(public)/products/page.tsx`

Layout:
- Full-width hero section: large centered search bar, subtitle "Browse 1,500+ bottles, jars, and containers"
- Two-column below: left sidebar (filters, hidden on mobile) + right main content
- Mobile: floating "Filters" button (fixed bottom) → opens `ProductFilters` inside a Shadcn `Sheet`

Main content:
- Skeleton grid (12 cards, same dimensions) while loading
- Product grid: responsive `grid-cols-1 sm:grid-cols-2 lg:grid-cols-3`
- "No products found" empty state: icon + "Try adjusting your search or filters"
- Pagination: "Showing {from}–{to} of {total}" + prev/next buttons

URL sync:
- Read initial filters from URL query params on mount (`useSearchParams`)
- On filter change, update URL query params (`router.push`) without full reload

### 11. Build Product Detail Page
File: `app/(public)/products/[id]/page.tsx`

Left column (desktop) / Top (mobile):
- Main image (large, click to open fullscreen lightbox)
- Row of thumbnail images below; click to swap main image
- "No image available" placeholder if no images

Right column (desktop) / Below images (mobile):
- Category breadcrumb: `All Products > {category name}`
- Product title (h1)
- Specifications table (bordered rows):
  - Material, Capacity, Neck Size, Shape/Type
- Variations section: if variations exist, show as chips grouped by attribute
- Action buttons:
  - **"Request a Quote"** (primary, large) — smooth scroll to enquiry form below
  - **"Share on WhatsApp"** — `https://wa.me/?text=Check this product: {title} {shareUrl}`
  - **"Copy Link"** — copies `window.location.href`, shows "Copied!" tooltip for 2s

Below the fold:
- `<section id="enquiry-form">` heading "Request a Quote"
- Form fields: Full Name (required), Phone (required), Email (optional), Message (optional)
- Hidden field: `product_id` pre-filled from page params
- Submit → `POST /v1/enquiries` → show success message "Thank you! We'll be in touch shortly."

### 12. Build Admin Product Page
File: `app/(admin)/products/page.tsx`

- Same grid as public page with additional admin controls
- ERP sync mini-banner at top: "Last synced X mins ago · {N} products · Sync Now button"
- Filter tab: **All** | **Featured** | **Hidden**
- Each `ProductCard` in admin mode shows two extra icon buttons:
  - Eye/EyeOff icon → `useToggleProductHidden()` mutation (optimistic badge update)
  - Star/StarOff icon → `useToggleProductFeatured()` mutation
- Hidden products: shown with grayscale filter + "Hidden" badge overlay

### 13. Create Admin Product Hooks
File: `hooks/useProductAdmin.ts`

- `useToggleProductHidden(id)` — `PATCH /v1/products/{id}/hide` with optimistic update
- `useToggleProductFeatured(id)` — `PATCH /v1/products/{id}/feature` with optimistic update

---

## Deliverables Checklist
- [ ] Public product listing loads and paginates correctly
- [ ] Search, category, and material filters work
- [ ] URL query params sync with active filters
- [ ] Hidden products not visible to public
- [ ] Product detail page shows specs, images, variations
- [ ] Enquiry form on product detail submits successfully
- [ ] WhatsApp share button generates correct link
- [ ] Admin can hide/feature products with instant UI update
- [ ] All 11 backend tests passing
- [ ] Category tree renders correctly in filters sidebar
