# Module 05 — ERP Product Sync

## Overview
Build the ERP synchronisation service that pulls product data from the client's ERP system and upserts it into the local database. Includes a mock ERP for development, a queueable sync job, Artisan command, scheduler, and admin monitoring API.

> ⚠️ **Client Dependency:** Real ERP API credentials and documentation must be provided before this module can be switched to production mode. Use mock mode (default) until then.

---

## Backend Tasks

### 1. Create Mock ERP Data File
File: `storage/app/mock_erp_products.json`

Create a JSON array of 10 sample products. Each product object should have:
- `id` (string) — unique ERP product ID, e.g. `"ERP-001"`
- `name` (string) — e.g. `"PET Boston Round 500ml"`
- `description` (string) — brief product description
- `category` (string) — e.g. `"PET Bottles"`, `"Glass Jars"`, `"HDPE Containers"`
- `material` (string) — e.g. `"PET"`, `"HDPE"`, `"Glass"`, `"PP"`
- `capacity_ml` (string) — e.g. `"500ml"`, `"1L"`, `"250ml"`
- `neck_size_mm` (string) — e.g. `"28mm"`, `"38mm"`
- `shape` (string) — e.g. `"Round"`, `"Square"`, `"Oval"`
- `images` (array of strings) — placeholder URLs
- `variations` (array) — each with `attribute` and `value`

Include 2–3 products per category across at least 4 categories.

### 2. Create ERP Config File
File: `config/erp.php`

```php
return [
    'base_url'            => env('ERP_BASE_URL', ''),
    'api_key'             => env('ERP_API_KEY', ''),
    'use_mock'            => env('ERP_USE_MOCK', true),
    'mock_file'           => storage_path('app/mock_erp_products.json'),
    'sync_interval_hours' => env('ERP_SYNC_INTERVAL', 6),
    'field_map' => [
        'erp_id'      => 'id',
        'title'       => 'name',
        'description' => 'description',
        'material'    => 'material',
        'capacity'    => 'capacity_ml',
        'neck_size'   => 'neck_size_mm',
        'shape_type'  => 'shape',
        'images'      => 'images',
    ],
];
```

Add these env vars to `.env` and `.env.example`:
- `ERP_BASE_URL=`
- `ERP_API_KEY=`
- `ERP_USE_MOCK=true`
- `ERP_SYNC_INTERVAL=6`

### 3. Create ErpSyncService
File: `app/Services/ErpSyncService.php`

**`fetchProducts()` — private**
- If `config('erp.use_mock')` is `true`: read and decode `config('erp.mock_file')`
- If `false`: Guzzle `GET {base_url}/products` with header `Authorization: Bearer {api_key}`
- On HTTP error: throw `\Exception` with status code and body in message

**`mapProduct(array $erpProduct)` — private**
- Loop through `config('erp.field_map')` to build a mapped array
- Map `erp_id` from ERP's `id` field
- Return array matching the `products` table columns

**`sync()` — public**
- Call `fetchProducts()` — wrap in try/catch
- Get all current `erp_id` values from the products table: `Product::pluck('erp_id')`
- Track `$added = 0`, `$updated = 0`, `$deactivated = 0`, `$incomingErpIds = []`
- For each ERP product:
  - Call `mapProduct()`
  - Run `Product::updateOrCreate(['erp_id' => $mapped['erp_id']], $mapped)`
  - If the model `wasRecentlyCreated`: increment `$added`, else `$updated`
  - Add `erp_id` to `$incomingErpIds`
- After loop: deactivate products not in ERP response: `Product::whereNotIn('erp_id', $incomingErpIds)->update(['is_active' => false])`
- Count deactivated records
- Write success log to `erp_sync_logs`: status=`success`, products_added, products_updated
- Return `['added' => $added, 'updated' => $updated, 'deactivated' => $deactivated]`
- On any exception: write `erp_sync_logs` with status=`failed`, error_message → rethrow

### 4. Create SyncErpProductsJob
File: `app/Jobs/SyncErpProductsJob.php`

- Implements `ShouldQueue`
- `handle()`: resolve `ErpSyncService` from container and call `->sync()`
- `failed(\Throwable $exception)`: log error with `Log::error('ERP Sync Job Failed', ['error' => $exception->getMessage()])`

### 5. Create Artisan Command
File: `app/Console/Commands/SyncErpProducts.php`

- Signature: `erp:sync`
- Description: `"Sync products from ERP system"`
- `handle()`: call `ErpSyncService->sync()` directly (not queued, for manual use)
- Output to console: "Sync complete. Added: X, Updated: Y, Deactivated: Z"
- On failure: output error message and exit with code 1

### 6. Schedule the Sync Job
In `app/Console/Kernel.php`:
```php
$schedule->command('erp:sync')
    ->everySixHours()
    ->withoutOverlapping()
    ->onFailure(function () { Log::error('Scheduled ERP sync failed'); });
```

### 7. Create ErpSyncController
File: `app/Http/Controllers/Api/Admin/ErpSyncController.php`

**`status()`**
- Return last 10 `ErpSyncLog` records ordered by `synced_at` desc
- Also return `total_products` count from products table
- Also return `last_sync` (the most recent log entry)

**`trigger()`**
- Dispatch `SyncErpProductsJob::dispatch()`
- Return `202 Accepted`: `{ message: "Sync job has been queued" }`

### 8. Register ERP Routes
Under `auth:sanctum` + `role:admin` middleware:
```
GET   /v1/erp/sync-status  → ErpSyncController@status
POST  /v1/erp/sync         → ErpSyncController@trigger
```

### 9. Write Feature Tests
File: `tests/Feature/ErpSyncTest.php`

- `test_sync_service_creates_new_products_from_mock`
- `test_sync_service_updates_existing_products`
- `test_sync_service_deactivates_products_not_in_erp_response`
- `test_sync_logs_success_record_after_successful_sync`
- `test_sync_logs_failure_record_on_error`
- `test_non_admin_cannot_trigger_sync` (403)
- `test_admin_can_trigger_sync_and_gets_202`
- `test_admin_can_view_sync_status`

---

## Frontend Tasks

### 10. Create ERP Sync React Query Hook
File: `hooks/useErpSync.ts`

- `useErpSyncStatus()` — `GET /v1/erp/sync-status`, `refetchInterval: 60000`
- `useTriggerSync()` — `POST /v1/erp/sync` mutation

### 11. Create ErpSyncMonitor Component
File: `components/admin/ErpSyncMonitor.tsx`

Layout (card):
- Heading "ERP Sync Status" + small "Auto-refreshes every 60s" label
- Row: Last synced time (relative "2 hours ago" + absolute tooltip)
- Status badge: green "Success" / red "Failed"
- Stats row: `{products_added} Products Added` | `{products_updated} Updated` | `{total_products} Total in DB`
- If `status = failed`: expandable red error message panel (Shadcn `Collapsible`)
- "Sync Now" button:
  - On click: call `useTriggerSync()` mutation
  - Show spinner inside button + disable button while loading
  - After success: refetch status after 3 seconds
  - Show toast: "Sync job queued successfully"

### 12. Create ERP Sync History Table
File: `components/admin/ErpSyncHistoryTable.tsx`

- Table: Date/Time | Status (badge) | Added | Updated | Error
- Show last 10 sync entries
- Error column: truncated to 60 chars, click to expand full message in a tooltip

### 13. Add to Admin Dashboard
File: `app/(admin)/dashboard/page.tsx`

Sections:
1. **Top stat cards** (3 inline):
   - Total Products (from sync status API)
   - Active Executives (from users API: `role=executive&is_active=1`)
   - Active Trainees (from users API: `role=trainee&is_active=1`)
2. **ERP Sync Monitor** (full width card below)
3. **Sync History Table** (last 5 entries)

---

## Deliverables Checklist
- [ ] Mock ERP JSON file with 10 sample products created
- [ ] `php artisan erp:sync` runs and creates products in DB
- [ ] Existing products are updated, not duplicated
- [ ] Products missing from ERP response are deactivated
- [ ] Success and failure logs written to `erp_sync_logs`
- [ ] All 8 sync tests passing
- [ ] Scheduler configured with `withoutOverlapping()`
- [ ] `POST /v1/erp/sync` returns 202 and queues job
- [ ] Admin dashboard shows stat cards, sync monitor, and history
- [ ] "Sync Now" button triggers sync and refreshes status
