# Module 03 — Authentication

## Overview
Implement login/logout API with Sanctum tokens, role-based session handling, brute-force protection, and the frontend login page with role-based redirects.

---

## Backend Tasks

### 1. Create Base API Controller
File: `app/Http/Controllers/Api/BaseApiController.php`

Add these helper methods used by all controllers:
- `successResponse($data, $message = 'Success', $code = 200)` → `{ success: true, message, data }`
- `errorResponse($message, $code = 400, $errors = [])` → `{ success: false, message, errors }`
- `paginatedResponse($paginator, $message = 'Success')` → includes `meta.pagination` block

### 2. Create CheckRole Middleware
File: `app/Http/Middleware/CheckRole.php`

- Accept roles as comma-separated parameter: `middleware('role:admin,executive')`
- Read authenticated user's Spatie role
- If user does not have any of the listed roles → return `403 Forbidden` JSON
- Register as `'role'` in `app/Http/Kernel.php` under `$routeMiddleware`

### 3. Create UserResource
File: `app/Http/Resources/UserResource.php`

Fields to expose:
- `id`, `name`, `email`, `phone`
- `role` — from `$this->getRoleNames()->first()`
- `is_active`, `last_login_at`

Fields to exclude: `password`, `remember_token`

### 4. Create AuthController
File: `app/Http/Controllers/Api/AuthController.php`

**`login(Request $request)`**
- Validate: `email` (required, email format), `password` (required)
- Find user by email — if not found: return `422 "Invalid credentials"`
- Check `is_active` — if false: return `403 "Your account has been deactivated. Contact your administrator."`
- Verify password with `Hash::check` — if wrong: return `422 "Invalid credentials"`
- Apply rate limiting: max 5 attempts per IP, lockout 15 minutes — return `429` with `retry_after` seconds on breach
- Delete all existing Sanctum tokens for the user
- Create new token: `$user->createToken('auth-token')`
- Update `last_login_at = now()`
- Return: `{ token, token_type: "Bearer", user: UserResource }`

**`logout(Request $request)`**
- Requires `auth:sanctum` middleware
- Delete current token: `$request->user()->currentAccessToken()->delete()`
- Return: `{ message: "Logged out successfully" }`

**`me(Request $request)`**
- Requires `auth:sanctum` middleware
- Update `last_activity_at = now()`
- Return: `UserResource` of current user

### 5. Register Auth Routes
In `routes/api.php`:
```
POST  /v1/auth/login   → AuthController@login   (no auth middleware)
POST  /v1/auth/logout  → AuthController@logout  (auth:sanctum)
GET   /v1/auth/me      → AuthController@me      (auth:sanctum)
```

### 6. Set Up Global API Route Structure
In `routes/api.php` create middleware-grouped route stubs:
- Public routes (no middleware)
- Authenticated routes (`auth:sanctum`)
- Admin only routes (`auth:sanctum` + `role:admin`)
- Executive + Admin routes (`auth:sanctum` + `role:admin,executive`)
- All roles routes (`auth:sanctum` + `role:admin,executive,trainee`)

### 7. Write Feature Tests
File: `tests/Feature/AuthTest.php`

- `test_successful_login_returns_token_and_user_role`
- `test_inactive_user_gets_403_on_login`
- `test_wrong_password_returns_422`
- `test_unknown_email_returns_422`
- `test_logout_revokes_token` (subsequent `/me` call returns 401)
- `test_rate_limit_triggers_after_5_failed_attempts`
- `test_me_requires_authentication`
- `test_me_returns_correct_authenticated_user`

---

## Frontend Tasks

### 8. Configure NextAuth
File: `lib/auth.ts`

- Use `CredentialsProvider`
- On submit: call `POST /v1/auth/login` with email/password
- On success: store `{ id, name, email, role, token }` in JWT
- Expose `role` and `token` on the session object via `jwt` and `session` callbacks
- Session max age: 24 hours (86400 seconds)
- On failed credentials: throw `Error("InvalidCredentials")` so the error type is detectable

### 9. Configure Axios Instance
File: `lib/api.ts`

- Base URL from `process.env.NEXT_PUBLIC_API_URL`
- Request interceptor: attach `Authorization: Bearer {token}` from `getSession()`
- Response interceptor:
  - `401` → call `signOut()` and redirect to `/login`
  - `403` → redirect to `/unauthorized`
  - All other errors → reject promise with error for local handling

### 10. Configure App-Wide Providers
File: `providers/QueryProvider.tsx`
- Wrap with `QueryClientProvider`, set `staleTime: 60000`

File: `app/layout.tsx`
- Wrap with `SessionProvider` and `QueryProvider`

### 11. Create Route Protection Middleware
File: `middleware.ts`

Rules:
- No session → redirect to `/login`
- `/admin/*` → role must be `admin`, else redirect `/unauthorized`
- `/executive/*` → role must be `admin` or `executive`, else `/unauthorized`
- `/trainee/*` → role must be `admin`, `executive`, or `trainee`, else `/unauthorized`

Matcher config: exclude `/login`, `/api/*`, `/_next/*`, `/unauthorized`, and static assets

### 12. Create Zustand Auth Store
File: `store/authStore.ts`

State: `user`, `token`, `role`
Actions: `setUser(user, token, role)`, `clearUser()`

### 13. Build Login Page
File: `app/(auth)/login/page.tsx`

Layout:
- Centered card on slate-100 background
- "StarBottles" heading + "Sign in to your account" subtitle
- Email input, Password input (with show/hide toggle)
- "Sign In" button — full width, shows spinner while loading

Form logic:
- Use `react-hook-form` + Zod schema: `email` (valid email), `password` (min 1 char)
- On submit: call `signIn('credentials', { email, password, redirect: false })`
- On success: check session role and redirect:
  - `admin` → `/admin/dashboard`
  - `executive` → `/executive/inbox`
  - `trainee` → `/trainee/learning`
- Error messages:
  - `CredentialsSignin` → "Invalid email or password"
  - `403` response → "Account is deactivated. Contact your administrator."
  - `429` response → "Too many attempts. Please try again later."

### 14. Create Unauthorized Page
File: `app/unauthorized/page.tsx`
- Show "Access Denied" message with role explanation
- "Go to Dashboard" link (back to role-appropriate home)
- "Sign Out" button

---

## Deliverables Checklist
- [ ] `POST /v1/auth/login` returns token and role
- [ ] `POST /v1/auth/logout` revokes token
- [ ] Inactive user blocked at login
- [ ] Rate limiting triggers at 5 attempts
- [ ] All 8 auth tests passing
- [ ] NextAuth session stores token and role
- [ ] Login page redirects by role after successful login
- [ ] Role-based middleware blocks unauthorized route access
- [ ] `/unauthorized` page renders correctly
