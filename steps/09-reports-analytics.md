# Module 09 — Reports & Analytics

## Overview
Operational reporting for the admin — enquiry volume trends, executive performance metrics, product interest data, and CSV/Excel/PDF export functionality.

---

## Backend Tasks

### 1. Create ReportController
File: `app/Http/Controllers/Api/Admin/ReportController.php`

All endpoints restricted to `role:admin` middleware.

**`enquiries(Request $request)`**

Parameters: `date_from` (default: 30 days ago), `date_to` (default: today)

Return:
```json
{
  "summary": {
    "total": 145,
    "by_source": { "website": 80, "whatsapp": 60, "email": 5 },
    "by_status": { "new": 12, "contacted": 30, "follow_up_pending": 25, "qualified_lead": 40, "closed_won": 28, "closed_lost": 10 }
  },
  "daily_counts": [
    { "date": "2025-01-01", "count": 5, "website": 3, "whatsapp": 2 },
    ...
  ]
}
```

Build `daily_counts` using: `Enquiry::selectRaw('DATE(received_at) as date, COUNT(*) as count, source')->groupBy('date', 'source')->whereBetween('received_at', [$from, $to])->get()`

Then pivot to merge by date with source columns.

**`executivePerformance(Request $request)`**

Parameters: `date_from`, `date_to`

For each active executive user, compute:
- `assigned_count` — enquiries assigned in date range
- `contacted_count` — enquiries moved to `contacted` status
- `qualified_count` — enquiries moved to `qualified_lead`
- `closed_won` — enquiries closed as `closed_won`
- `closed_lost` — enquiries closed as `closed_lost`
- `avg_response_time_minutes` — average of `(first_action_at - received_at)` in minutes, only where `first_action_at` is not null

Build using grouped DB queries per executive, not N+1 loops.

Return array of executive performance objects sorted by `qualified_count` desc.

**`productInterest(Request $request)`**

Parameters: `date_from`, `date_to`, `limit` (default 10)

Return:
```json
{
  "most_viewed": [
    { "product_id": 1, "title": "PET Round 500ml", "category": "PET Bottles", "view_count": 234 }
  ],
  "most_enquired": [
    { "product_id": 1, "title": "PET Round 500ml", "category": "PET Bottles", "enquiry_count": 45 }
  ]
}
```

Build using:
- `most_viewed`: `ProductView::selectRaw('product_id, COUNT(*) as view_count')->whereBetween('viewed_at', ...)->groupBy('product_id')->orderByDesc('view_count')->limit($limit)->with('product.category')->get()`
- `most_enquired`: similar on `Enquiry` table

**`export(Request $request)`**

Parameters: `report_type` (required: `enquiries` | `executive` | `product`), `format` (required: `csv` | `xlsx` | `pdf`), `date_from`, `date_to`

- Reuse data from existing report methods
- For `csv` / `xlsx`: use Maatwebsite Excel with `FromArray` concern, return as download
- For `pdf`: use DomPDF with a Blade view, return as download
- Set correct `Content-Disposition` headers

Create Blade views for PDF exports:
- `resources/views/exports/enquiries.blade.php`
- `resources/views/exports/executive_performance.blade.php`
- `resources/views/exports/product_interest.blade.php`

### 2. Register Report Routes
Under `auth:sanctum` + `role:admin`:
```
GET  /v1/reports/enquiries               ReportController@enquiries
GET  /v1/reports/executive-performance   ReportController@executivePerformance
GET  /v1/reports/product-interest        ReportController@productInterest
GET  /v1/reports/export                  ReportController@export
```

### 3. Write Feature Tests
File: `tests/Feature/ReportTest.php`

- `test_non_admin_cannot_access_reports` (403 for executive and trainee)
- `test_enquiry_report_returns_correct_summary`
- `test_enquiry_report_respects_date_range`
- `test_daily_counts_cover_all_days_in_range`
- `test_executive_performance_report_returns_all_active_executives`
- `test_executive_performance_calculates_avg_response_time`
- `test_product_interest_returns_top_viewed_and_enquired`
- `test_export_csv_returns_downloadable_file`
- `test_export_xlsx_returns_downloadable_file`

---

## Frontend Tasks

### 4. Create Report Hooks
File: `hooks/useReports.ts`

- `useEnquiryReport(dateRange)` — `GET /v1/reports/enquiries`
- `useExecutiveReport(dateRange)` — `GET /v1/reports/executive-performance`
- `useProductInterestReport(dateRange)` — `GET /v1/reports/product-interest`
- `useExportReport(params)` — triggers download via `window.open()` or blob download

### 5. Create Date Range Picker Component
File: `components/ui/DateRangePicker.tsx`

- Two Shadcn `Popover` + `Calendar` components side by side (from/to)
- Shows "Jan 1 – Jan 31, 2025" when range selected
- Preset buttons: Last 7 Days | Last 30 Days | Last 3 Months | This Year
- Emits `onChange({ from: Date, to: Date })`
- Used by all 3 report tabs

### 6. Build Admin Reports Page
File: `app/(admin)/reports/page.tsx`

Layout:
- Page heading "Reports & Analytics"
- `DateRangePicker` component (top right, applies to all tabs globally)
- Export dropdown button (top right): "Export as CSV", "Export as Excel", "Export as PDF" — exports the active tab's data

Shadcn `Tabs` with 3 tabs:

---

**Tab 1: Enquiry Overview**

Row 1 — Summary stat cards (4 inline):
- Total Enquiries, Website (blue), WhatsApp (green), Email (gray)

Row 2 — Line chart (Recharts `LineChart`):
- X-axis: date, Y-axis: count
- 3 lines: Total (dark), Website (blue), WhatsApp (green)
- Tooltip showing all 3 values on hover
- Legend below chart

Row 3 — Status distribution:
- Horizontal stacked bar or donut chart (Recharts `PieChart`)
- Each status as a color slice with count + percentage label

---

**Tab 2: Executive Performance**

Bar chart (Recharts `BarChart`):
- X-axis: executive names
- 3 grouped bars: Assigned (gray), Qualified Leads (green), Closed Won (emerald)
- Tooltip on hover

Performance table below chart:
- Columns: Executive, Assigned, Contacted, Qualified, Won, Lost, Avg Response Time
- Sortable by clicking column headers
- Best performer row highlighted with subtle green background

---

**Tab 3: Product Interest**

Two side-by-side sections:

**Most Viewed Products:**
- Ranked list (1–10)
- Each row: rank number, product image (small), name, category badge, view count progress bar

**Most Enquired Products:**
- Same layout with enquiry count

---

### 7. Export Flow
When user clicks "Export as CSV/Excel/PDF":
- Call `GET /v1/reports/export?report_type={active_tab}&format={format}&date_from=...&date_to=...`
- Browser triggers file download
- Show brief "Preparing download..." toast

---

## Deliverables Checklist
- [ ] Enquiry report returns correct total and daily breakdown
- [ ] Executive performance shows all active executives
- [ ] Avg response time calculated correctly (excludes null values)
- [ ] Product interest shows top 10 viewed and enquired
- [ ] CSV/XLSX/PDF exports download correctly
- [ ] Date range filter applies to all report types
- [ ] Line chart renders with 3 lines and correct data
- [ ] Executive bar chart renders correctly
- [ ] Product interest ranked list renders
- [ ] Export button triggers file download in browser
- [ ] All 9 backend tests passing
