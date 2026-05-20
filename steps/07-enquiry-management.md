# Module 07 — Enquiry Management

## Overview
Full enquiry lifecycle — public submission form, WhatsApp webhook capture, executive inbox, admin monitoring, status workflow, follow-up tracking, and internal notes.

---

## Backend Tasks

### 1. Create EnquiryPolicy
File: `app/Policies/EnquiryPolicy.php`

- `view(User $user, Enquiry $enquiry)`: admin → `true`; executive → `$enquiry->assigned_to === $user->id`
- `update(User $user, Enquiry $enquiry)`: same rules as view
- `addNote(User $user, Enquiry $enquiry)`: same rules as view

Register in `AuthServiceProvider`:
```php
Enquiry::class => EnquiryPolicy::class
```

### 2. Create EnquiryNoteResource
File: `app/Http/Resources/EnquiryNoteResource.php`

Fields: `id`, `note_text`, `created_at` (formatted), `author`: `{ id, name }` (null if system note)

### 3. Create EnquiryListResource
File: `app/Http/Resources/EnquiryListResource.php`

Fields (lightweight for list view):
- `id`, `customer_name`, `phone`, `source`, `status`
- `received_at` — `$this->received_at->diffForHumans()` e.g. "3 hours ago"
- `received_at_raw` — ISO timestamp for sorting
- `follow_up_date`
- `is_overdue` — boolean: `follow_up_date < today AND status NOT IN [closed_won, closed_lost]`
- `response_time_minutes` — minutes between `received_at` and `first_action_at` (null if not yet actioned)
- `product_title` — nullable
- `assigned_to_name` — nullable
- `latest_note_snippet` — first 80 chars of most recent note's `note_text`, nullable

### 4. Create EnquiryResource
File: `app/Http/Resources/EnquiryResource.php`

All `EnquiryListResource` fields plus:
- `email`, `message`
- `first_action_at`
- `product` — `ProductListResource` (nullable)
- `assigned_to` — `{ id, name, phone }` (nullable)
- `notes` — `EnquiryNoteResource` collection (all notes, ordered by `created_at` asc)

### 5. Create EnquiryController
File: `app/Http/Controllers/Api/EnquiryController.php`

**`index(Request $request)`** — Admin + Executive
- Admin: start with `Enquiry::with([...])`
- Executive: start with `Enquiry::with([...])->scopeForExecutive(auth()->id())`
- Filters: `status`, `source`, `assigned_to` (admin only), `date_from`, `date_to`
- Search: `customer_name LIKE` OR `phone LIKE`
- Eager load: `product:id,title,images`, `assignedTo:id,name`, `latestNote` (via `hasOne` latest)
- Append `is_overdue` computed field
- Paginate 20, order by `received_at desc`
- Return `EnquiryListResource` paginated

**`store(Request $request)`** — Public, no auth
- Validate: `customer_name` required, `phone` required, `email` nullable email, `product_id` nullable exists, `message` nullable
- Create: `source=website`, `status=new`, `received_at=now()`
- Return `EnquiryResource` 201

**`show(Enquiry $enquiry)`** — Admin + Executive (policy-gated)
- Authorize via `EnquiryPolicy@view`
- Load all relations including all notes with author
- Return `EnquiryResource`

**`updateStatus(Request $request, Enquiry $enquiry)`** — Admin + Executive (policy-gated)
- Authorize via `EnquiryPolicy@update`
- Validate: `status` required, in valid enum values; `follow_up_date` nullable date
- If previous status was `new` and this is the first update: set `first_action_at = now()`
- Update `status` (and optionally `follow_up_date`)
- Return updated `EnquiryResource`

**`assign(Request $request, Enquiry $enquiry)`** — Admin only
- Validate: `assigned_to` required, exists in `users`
- Verify target user is active executive: `User::find($id)->hasRole('executive') && is_active`
- Update `assigned_to`
- Return updated `EnquiryResource`

**`addNote(Request $request, Enquiry $enquiry)`** — Admin + Executive (policy-gated)
- Authorize via `EnquiryPolicy@addNote`
- Validate: `note_text` required, min 1
- Create `EnquiryNote`: `enquiry_id`, `user_id = auth()->id()`, `note_text`
- Return `EnquiryNoteResource` 201

### 6. Register Enquiry Routes
Public:
```
POST  /v1/enquiries  → EnquiryController@store
```

Admin + Executive:
```
GET    /v1/enquiries                    → EnquiryController@index
GET    /v1/enquiries/{enquiry}          → EnquiryController@show
PATCH  /v1/enquiries/{enquiry}/status   → EnquiryController@updateStatus
POST   /v1/enquiries/{enquiry}/notes    → EnquiryController@addNote
```

Admin only:
```
POST   /v1/enquiries/{enquiry}/assign   → EnquiryController@assign
```

### 7. Create WhatsApp Webhook Handler
File: `app/Http/Controllers/Api/WebhookController.php`

Add `config/whatsapp.php`:
```php
return [
    'verify_token' => env('WHATSAPP_VERIFY_TOKEN', ''),
    'app_secret'   => env('WHATSAPP_APP_SECRET', ''),
];
```

**`verify(Request $request)`** — GET
- If `hub_mode === 'subscribe'` AND `hub_verify_token === config('whatsapp.verify_token')`:
  return `hub_challenge` as plain text with 200
- Else: return 403

**`receive(Request $request)`** — POST
> Always return 200. Wrap all logic in try/catch.
- Verify HMAC signature: `hash_hmac('sha256', $rawBody, config('whatsapp.app_secret'))` vs `X-Hub-Signature-256` header — log warning and return 200 silently if mismatch
- Extract from payload: `$entry[0].changes[0].value`
- Get `$messages = $value['messages'] ?? []` — if empty (status update), return 200
- Get from message: `$phone`, `$text`, `$contactName`, `$timestamp`
- Find existing open enquiry for phone: `Enquiry::where('phone', $phone)->whereNotIn('status', ['closed_won', 'closed_lost'])->latest()->first()`
- If found: create `EnquiryNote` with `user_id=null`, `note_text="[WhatsApp] {$text}"`
- If not found: create new `Enquiry` with `source=whatsapp`, `status=new`, `received_at=$timestamp`
- Always return `response('', 200)`

Register outside all auth middleware (and add to CSRF exceptions):
```
GET   /v1/webhooks/whatsapp  → WebhookController@verify
POST  /v1/webhooks/whatsapp  → WebhookController@receive
```

### 8. Write Feature Tests
File: `tests/Feature/EnquiryTest.php`

- `test_public_can_submit_website_enquiry`
- `test_trainee_cannot_access_enquiry_list` (403)
- `test_executive_only_sees_assigned_enquiries`
- `test_executive_cannot_view_other_executives_enquiry` (403)
- `test_admin_can_see_all_enquiries`
- `test_first_status_update_sets_first_action_at`
- `test_second_status_update_does_not_change_first_action_at`
- `test_admin_can_assign_enquiry_to_active_executive`
- `test_admin_cannot_assign_to_inactive_user` (422)
- `test_executive_can_add_note_to_own_enquiry`
- `test_executive_cannot_add_note_to_others_enquiry` (403)

File: `tests/Feature/WhatsAppWebhookTest.php`

- `test_verify_endpoint_returns_challenge_with_correct_token`
- `test_verify_endpoint_returns_403_with_wrong_token`
- `test_receive_with_invalid_signature_logs_warning_and_returns_200`
- `test_receive_creates_new_enquiry_for_new_phone`
- `test_receive_adds_note_to_existing_open_enquiry`
- `test_receive_creates_new_enquiry_after_closed_enquiry`
- `test_receive_returns_200_even_on_processing_error`

---

## Frontend Tasks

### 9. Create Enquiry Hooks
File: `hooks/useEnquiries.ts`

- `useEnquiries(filters)` — paginated, `refetchInterval: 30000` (auto-refresh every 30s)
- `useEnquiry(id)` — single enquiry with all notes
- `useUpdateEnquiryStatus()` — `PATCH` mutation, optimistic status update in list cache
- `useAddEnquiryNote()` — `POST` mutation, optimistically append note to enquiry
- `useAssignEnquiry()` — `POST` mutation (admin)

### 10. Create EnquiryCard Component
File: `components/enquiry/EnquiryCard.tsx`

Layout: horizontal card with left 4px colored bar (color = status color)

Left section:
- Customer name (bold, 1 line)
- Phone as `tel:` link with phone icon
- `{received_at}` in small gray text ("3 hours ago")

Middle section:
- Source badge: WhatsApp (green), Website (blue), Email (gray)
- Status badge colors: `new`=purple, `contacted`=sky, `follow_up_pending`=amber, `qualified_lead`=green, `closed_won`=emerald, `closed_lost`=red
- Product: small thumbnail + title (if linked)
- Latest note snippet in italic muted text

Right section:
- If `is_overdue`: pulsing red dot + "Overdue" text
- If `status === 'new'`: bold purple "NEW" badge
- Follow-up date if set: "Follow up: {date}"
- Right chevron icon

Click handler: opens `EnquiryDetailPanel` Sheet for the selected enquiry

### 11. Create EnquiryDetailPanel Component
File: `components/enquiry/EnquiryDetailPanel.tsx`

Shadcn `Sheet` (slides in from right, 480px wide on desktop)

Section 1 — Customer Info:
- Name, phone with "📞 Call" button (`href="tel:{phone}"`), email
- "💬 WhatsApp" button: `href="https://wa.me/{intl_phone}?text=Hi {name}..."`

Section 2 — Enquiry Details:
- Source badge, received time, response time (formatted: "Responded in 4h 23m")
- Product card (thumbnail + title + link) if attached

Section 3 — Status & Follow-up:
- Status `Select` dropdown with all valid statuses
- Follow-up date picker (Shadcn `Popover` + `Calendar`)
- "Save Changes" button — calls `useUpdateEnquiryStatus()`

Section 4 — Notes Timeline:
- Chronological list: author name + time + note text
- System/WhatsApp notes: displayed with WhatsApp icon, "via WhatsApp" label
- "Add Note" area: `Textarea` + "Add Note" `Button`
- On submit: `useAddEnquiryNote()`, optimistically appends note

### 12. Build Executive Inbox Page
File: `app/(executive)/inbox/page.tsx`

Header stats bar (3 inline stat cards):
- Total Assigned, New (red badge if > 0), Overdue (amber badge if > 0)

Controls row:
- Status tabs: **All** | **New** | **Contacted** | **Follow-up Pending** | **Qualified Lead** | **Overdue**
- Search input (debounced 300ms)
- Sort select: Newest First | Oldest First | Follow-up Date

Enquiry list:
- `EnquiryCard` per item
- Skeleton list (5 cards) on load
- "All caught up! No enquiries in this view." empty state
- Pagination (20 per page)

Auto-refresh:
- React Query `refetchInterval: 30000` — silently refetches
- New items at top appear automatically

### 13. Build Admin Enquiry Monitor Page
File: `app/(admin)/enquiries/page.tsx`

Top stats row (4 cards):
- Total Enquiries Today
- Unassigned (red background if > 0, "Assign Now →" link)
- Overdue (amber if > 0)
- Avg Response Time (last 7 days, formatted "2h 14m")

Filter bar:
- Date range picker (default: last 7 days)
- Status filter dropdown
- Source filter: All | WhatsApp | Website | Email
- Executive filter dropdown (all active executives)
- Search input

Enquiry table:
- Columns: Customer, Phone, Product, Source, Status, Assigned To, Received, Response Time, Actions
- Unassigned rows: amber left border
- Overdue rows: red left border
- "Assign" button on each row → opens `AssignExecutiveModal`

### 14. Create AssignExecutiveModal
File: `components/admin/AssignExecutiveModal.tsx`

- Shadcn `Dialog`
- Heading: "Assign Enquiry — {customer_name}"
- List of active executives as selectable radio cards
- Each shows: name, current open enquiry count (fetched from API)
- "Assign" button → `useAssignEnquiry()` → toast + close + refetch

### 15. Update Admin Dashboard with Unassigned Widget
In `app/(admin)/dashboard/page.tsx`:

Add section: "Recent Unassigned Enquiries"
- Shows 5 most recent enquiries where `assigned_to = null`
- Each row: customer name, phone, source badge, received time, "Assign" button
- "View All Unassigned →" link to `/admin/enquiries?assigned=none`

---

## Deliverables Checklist
- [ ] Public enquiry form on product page submits successfully
- [ ] WhatsApp webhook verifies and creates enquiries
- [ ] Webhook adds notes to existing open enquiries (not duplicates)
- [ ] Executive inbox shows only assigned enquiries
- [ ] Status update sets `first_action_at` on first action
- [ ] Admin can assign/reassign enquiries to executives
- [ ] Notes timeline renders correctly with author labels
- [ ] "Overdue" highlighting shows in both inbox and admin table
- [ ] Auto-refresh works without full page reload
- [ ] All 18 backend tests passing
