# Module 10 — Testing & Security Hardening

## Overview
Comprehensive role-isolation tests, access control validation, security hardening across all API endpoints, and a UAT seed dataset for client testing.

---

## Backend Tasks

### 1. Create Test Role Seeder
File: `database/seeders/TestRoleSeeder.php`

Create one user per role with known credentials:

| Role | Email | Password |
|------|-------|----------|
| Admin | `admin@test.com` | `Admin@123` |
| Executive 1 | `exec1@test.com` | `Exec@123` |
| Executive 2 | `exec2@test.com` | `Exec@123` |
| Trainee | `trainee@test.com` | `Trainee@123` |

Use in tests via `artisan db:seed --class=TestRoleSeeder` or directly in `setUp()`.

### 2. Create Access Control Tests
File: `tests/Feature/AccessControlTest.php`

**Unauthenticated access (all should return 401):**
- `GET /v1/enquiries`
- `GET /v1/users`
- `GET /v1/reports/enquiries`
- `POST /v1/auth/logout`
- `GET /v1/auth/me`

**Trainee access restrictions (all should return 403):**
- `GET /v1/enquiries`
- `GET /v1/enquiries/{any_id}`
- `POST /v1/enquiries/{id}/notes`
- `GET /v1/users`
- `POST /v1/users`
- `GET /v1/reports/enquiries`
- `GET /v1/erp/sync-status`
- `POST /v1/erp/sync`
- `GET /v1/quiz-tests` (admin list)
- `POST /v1/quiz-tests` (create quiz)
- `GET /v1/quiz-tests/{id}/results`

**Executive access restrictions (all should return 403):**
- `GET /v1/users`
- `POST /v1/users`
- `DELETE /v1/users/{id}`
- `POST /v1/enquiries/{id}/assign`
- `POST /v1/erp/sync`
- `GET /v1/reports/enquiries`
- `GET /v1/quiz-tests` (admin list)
- `POST /v1/training/materials`

**Data isolation tests:**
- Executive A cannot view enquiry assigned to Executive B (403)
- Executive A cannot add note to Executive B's enquiry (403)
- Executive A's `GET /v1/enquiries` does NOT include Executive B's enquiries
- Trainee cannot view quiz not assigned to them (403)
- Trainee cannot submit attempt for unassigned quiz (403)

### 3. Create Webhook Security Tests
File: `tests/Feature/WebhookSecurityTest.php`

- `test_whatsapp_webhook_verify_rejects_wrong_token`
- `test_whatsapp_webhook_receive_rejects_invalid_signature`
- `test_whatsapp_webhook_receive_rejects_missing_signature`
- `test_whatsapp_webhook_always_returns_200_to_prevent_retries`
- `test_webhook_routes_are_accessible_without_authentication`
- `test_webhook_routes_are_excluded_from_csrf_protection`

### 4. Create Authentication Security Tests
File: `tests/Feature/AuthSecurityTest.php`

- `test_deactivated_user_token_returns_401_on_subsequent_requests`
  - Create user, generate token, deactivate user, call `/me` → should return 401
- `test_login_throttle_blocks_after_5_failed_attempts`
- `test_old_tokens_revoked_on_new_login`
  - Login twice, first token should no longer work
- `test_password_not_exposed_in_any_api_response`
  - Check all user-returning endpoints for absence of `password` key

### 5. Security Hardening Checks

**API Response Security:**
- All API responses must include these headers (configure in middleware or Nginx):
  - `X-Content-Type-Options: nosniff`
  - `X-Frame-Options: DENY`
  - `X-XSS-Protection: 1; mode=block`

**Input Sanitisation:**
- Ensure all text inputs stored to DB pass through `strip_tags()` or use Blade's `{{ }}` auto-escaping on output
- Phone numbers: strip non-numeric characters before storage

**Password Policy:**
- In `StoreUserRequest`, add password validation: min 8 chars, at least 1 uppercase, 1 number (for admin-created passwords)
- When admin resets password, generated temporary password must meet the same policy

**Rate Limiting on Sensitive Endpoints:**
- In `routes/api.php`, add `throttle:60,1` to all authenticated routes
- Add `throttle:6,1` (stricter) to auth login route

### 6. Create UAT Seeder
File: `database/seeders/UatSeeder.php`

Seed the following data for client UAT:

**Users:**
- 1 admin: `admin@starbottles.com` / `Admin@2024`
- 3 executives: `exec1@starbottles.com`, `exec2@starbottles.com`, `exec3@starbottles.com` / `Exec@2024`
- 2 trainees: `trainee1@starbottles.com`, `trainee2@starbottles.com` / `Trainee@2024`

**Products:** (20 products across 4 categories)
- 5 × PET Bottles (round, square, oval, boston round, spray)
- 5 × HDPE Containers (wide mouth jar, cream jar, canister, dropper, flip-top)
- 5 × Glass Jars (amber, clear, frosted, boston round, hexagonal)
- 5 × PP/Other (pump bottle, trigger sprayer, lotion pump, tottle, disc cap)

**Enquiries:** (10 enquiries in various statuses)
- 3 assigned to exec1: statuses new, contacted, follow_up_pending
- 3 assigned to exec2: statuses qualified_lead, closed_won, closed_lost
- 2 assigned to exec3: statuses new, follow_up_pending (with follow_up_date in past = overdue)
- 2 unassigned: statuses new (these appear in admin "unassigned" panel)

**Enquiry Notes:**
- 2 notes on exec1's enquiries (authored by exec1)
- 1 WhatsApp-style note on exec2's enquiry (user_id=null, text starts with "[WhatsApp]")

**Quiz:**
- 1 quiz: "Product Knowledge Test" with 5 MCQ questions about bottle types/materials
- Assign to both trainees
- 1 completed attempt by trainee1 (score 80, passed=true)

**Training Materials:**
- 3 PDFs: "Product Catalogue 2024", "Company Profile", "Material Guide"
- 2 Videos: YouTube placeholder URLs
- Company info sections seeded with realistic placeholder content

**ERP Sync Logs:**
- 3 successful, 1 failed (with error message), 1 successful

Run: `php artisan db:seed --class=UatSeeder`

---

## Deliverables Checklist
- [ ] All access control tests passing (unauthenticated, trainee, executive)
- [ ] Data isolation tests passing (executives cannot see each other's enquiries)
- [ ] Webhook security tests passing
- [ ] Auth security tests passing
- [ ] Deactivated user token rejected
- [ ] Old tokens revoked on re-login
- [ ] Password never exposed in API responses
- [ ] UAT seeder runs without errors
- [ ] UAT credentials documented and confirmed working
- [ ] Rate limiting active on login and general API routes
