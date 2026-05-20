# Module 04 — User Management

## Overview
Admin-only module to create, edit, activate/deactivate, and reset passwords for executive and trainee users. Includes frontend table UI with modals.

---

## Backend Tasks

### 1. Create StoreUserRequest
File: `app/Http/Requests/StoreUserRequest.php`

Validation rules:
- `name` — required, string, max 255
- `email` — required, email, unique:users
- `phone` — required, string, max 20
- `role` — required, in:`executive`,`trainee` (admin cannot create another admin via API)

Custom error message for `role`: "Role must be executive or trainee."

### 2. Create UpdateUserRequest
File: `app/Http/Requests/UpdateUserRequest.php`

Validation rules (all `sometimes`):
- `name` — string, max 255
- `phone` — string, max 20
- `role` — in:`executive`,`trainee`

### 3. Create UserController
File: `app/Http/Controllers/Api/Admin/UserController.php`

All methods restricted to `role:admin` middleware.

**`index(Request $request)`**
- Accepts: `search` (name or email LIKE), `role` (filter), `is_active` (1 or 0), `per_page` (default 20)
- Eager load Spatie roles
- Return paginated `UserResource` collection via `paginatedResponse()`

**`store(StoreUserRequest $request)`**
- Create user: `User::create([..., 'password' => Hash::make($request->password)])`
- Assign role: `$user->assignRole($request->role)`
- Return `UserResource` with `201` status

**`update(UpdateUserRequest $request, User $user)`**
- Block editing own role: `if (auth()->id() === $user->id && $request->has('role'))` → `403`
- Update name and phone directly
- If role is changing: `$user->syncRoles([$request->role])`
- Return updated `UserResource`

**`toggleActive(User $user)`**
- Block self-deactivation: `if (auth()->id() === $user->id)` → `403 "You cannot deactivate your own account"`
- Flip `is_active`: `$user->update(['is_active' => !$user->is_active])`
- Return updated `UserResource`

**`resetPassword(User $user)`**
- Generate: `$temp = Str::random(10)`
- Update: `$user->update(['password' => Hash::make($temp)])`
- Return: `{ message: "Password reset successfully", temporary_password: $temp }`

### 4. Register Admin User Routes
In `routes/api.php` under `auth:sanctum` + `role:admin` middleware group:
```
GET    /v1/users                       UserController@index
POST   /v1/users                       UserController@store
PUT    /v1/users/{user}                UserController@update
PATCH  /v1/users/{user}/toggle-active  UserController@toggleActive
POST   /v1/users/{user}/reset-password UserController@resetPassword
```

### 5. Write Feature Tests
File: `tests/Feature/UserManagementTest.php`

- `test_executive_cannot_access_user_list` (403)
- `test_trainee_cannot_access_user_list` (403)
- `test_admin_can_list_all_users`
- `test_search_filter_returns_matching_users`
- `test_role_filter_returns_correct_users`
- `test_admin_can_create_executive_user`
- `test_admin_can_create_trainee_user`
- `test_admin_cannot_create_admin_user` (422)
- `test_admin_can_update_user_name_and_phone`
- `test_admin_can_change_user_role_between_executive_and_trainee`
- `test_admin_cannot_change_own_role` (403)
- `test_admin_can_deactivate_user`
- `test_admin_cannot_deactivate_themselves` (403)
- `test_reset_password_returns_temporary_password`

---

## Frontend Tasks

### 6. Create User List Page
File: `app/(admin)/users/page.tsx`

Layout:
- Page heading "Team Members" with "Add User" button (top right)
- Search input (300ms debounce) — filters by name or email
- Filter tabs: **All** | **Executives** | **Trainees**
- Data table with skeleton loading state

Table columns:
| Column | Details |
|--------|---------|
| Name | Avatar (initials) + name + email stacked |
| Phone | Plain text |
| Role | Badge — `executive` = blue, `trainee` = purple |
| Status | Badge — Active = green, Inactive = red |
| Last Login | Formatted datetime |
| Actions | Edit icon, Toggle Active icon, Reset Password icon |

Interactions:
- **Toggle Active**: show `AlertDialog` confirmation before calling API; optimistic badge update
- **Reset Password**: open `ResetPasswordDialog` after API call
- **Edit**: open `EditUserModal` pre-populated

### 7. Create CreateUserModal
File: `components/users/CreateUserModal.tsx`

- Shadcn `Dialog` triggered by "Add User" button
- Form fields: Full Name, Email, Phone, Role (Select: Executive / Trainee)
- Zod schema validation with inline error messages
- Default password: auto-generated (show to admin after creation in a dialog)
- On success: toast "User created successfully" → close modal → refetch table

### 8. Create EditUserModal
File: `components/users/EditUserModal.tsx`

- Same structure as Create modal
- Pre-populate all fields with current user data
- On success: toast "User updated" → close → refresh

### 9. Create ResetPasswordDialog
File: `components/users/ResetPasswordDialog.tsx`

- Shadcn `Dialog` (opens after successful reset API call)
- Show temporary password in a highlighted monospace box
- "Copy to Clipboard" button with "Copied ✓" feedback
- Warning note: "Share this password securely with the user. It won't be shown again."

### 10. Create React Query Hooks
File: `hooks/useUsers.ts`

- `useUsers(filters)` — `GET /v1/users` — paginated list, re-fetches on filter change
- `useCreateUser()` — `POST /v1/users` mutation, invalidates `['users']` on success
- `useUpdateUser()` — `PUT /v1/users/{id}` mutation, invalidates on success
- `useToggleUserActive(id)` — `PATCH` mutation with **optimistic update** (flip badge immediately)
- `useResetPassword()` — `POST /v1/users/{id}/reset-password` mutation, returns `temporary_password`

---

## Deliverables Checklist
- [ ] All 14 backend tests passing
- [ ] Admin cannot create/promote another admin
- [ ] Admin cannot deactivate themselves
- [ ] Temporary password returned on reset
- [ ] User list renders with correct role/status badges
- [ ] Search and filter tabs work
- [ ] Create modal validates and submits correctly
- [ ] Edit modal pre-populates fields
- [ ] Reset password dialog shows and copies temporary password
- [ ] Optimistic toggle active works without page refresh
