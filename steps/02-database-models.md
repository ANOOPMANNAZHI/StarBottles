# Module 02 — Database Migrations & Eloquent Models

## Overview
Create all database tables in the correct foreign key dependency order, then create Eloquent models with relationships, scopes, and accessors.

---

## Migration Tasks

> Create migrations in this exact order to avoid foreign key errors.

### 1. `users` table
Columns:
- `id` bigIncrements
- `name` string
- `email` string unique
- `phone` string nullable
- `password` string
- `role` enum(`admin`, `executive`, `trainee`)
- `is_active` boolean default `true`
- `last_login_at` timestamp nullable
- `last_activity_at` timestamp nullable
- `remember_token` string nullable
- `timestamps`

### 2. `product_categories` table
Columns:
- `id` bigIncrements
- `name` string
- `slug` string unique
- `parent_id` unsignedBigInteger nullable — FK → `product_categories.id` (self-referencing)
- `timestamps`

### 3. `products` table
Columns:
- `id` bigIncrements
- `erp_id` string unique
- `title` string
- `description` text nullable
- `category_id` FK → `product_categories.id` nullable
- `material` string nullable
- `capacity` string nullable
- `neck_size` string nullable
- `shape_type` string nullable
- `is_active` boolean default `true`
- `is_featured` boolean default `false`
- `is_hidden` boolean default `false`
- `images` JSON nullable
- `video_url` string nullable
- `synced_at` timestamp nullable
- `timestamps`

### 4. `product_variations` table
Columns:
- `id`, `product_id` FK → `products.id` (cascade delete)
- `attribute_name` string, `attribute_value` string
- `timestamps`

### 5. `erp_sync_logs` table
Columns:
- `id`
- `status` enum(`success`, `failed`)
- `products_added` integer default `0`
- `products_updated` integer default `0`
- `error_message` text nullable
- `synced_at` timestamp

### 6. `enquiries` table
Columns:
- `id`
- `customer_name` string, `phone` string, `email` string nullable
- `product_id` FK → `products.id` nullable (set null on delete)
- `message` text nullable
- `source` enum(`website`, `whatsapp`, `email`) default `website`
- `status` enum(`new`, `contacted`, `follow_up_pending`, `qualified_lead`, `closed_won`, `closed_lost`) default `new`
- `assigned_to` FK → `users.id` nullable (set null on delete)
- `received_at` timestamp
- `first_action_at` timestamp nullable
- `follow_up_date` date nullable
- `timestamps`

### 7. `enquiry_notes` table
Columns:
- `id`, `enquiry_id` FK → `enquiries.id` (cascade delete)
- `user_id` FK → `users.id` nullable (set null on delete) — null = system/WhatsApp note
- `note_text` text
- `timestamps`

### 8. `training_materials` table
Columns:
- `id`, `title` string
- `type` enum(`video`, `pdf`, `document`)
- `file_path` string, `description` text nullable
- `uploaded_by` FK → `users.id`
- `is_active` boolean default `true`
- `timestamps`

### 9. `company_info_sections` table
Columns:
- `id`, `section_key` string unique, `title` string
- `content` longtext
- `display_order` integer default `0`
- `timestamps`

### 10. `quiz_tests` table
Columns:
- `id`, `title` string, `description` text nullable
- `passing_score` integer default `70`
- `created_by` FK → `users.id`
- `is_active` boolean default `true`
- `timestamps`

### 11. `quiz_questions` table
Columns:
- `id`, `quiz_id` FK → `quiz_tests.id` (cascade delete)
- `question_text` text
- `options` JSON — array of 4 option strings
- `correct_option` integer — index (0–3) of the correct option
- `display_order` integer default `0`
- `timestamps`

### 12. `quiz_test_assignments` table
Columns:
- `id`, `quiz_id` FK → `quiz_tests.id`
- `trainee_id` FK → `users.id`
- `assigned_by` FK → `users.id`
- `assigned_at` timestamp
- `retake_approved` boolean default `false`

### 13. `quiz_attempts` table
Columns:
- `id`, `quiz_id` FK → `quiz_tests.id`
- `trainee_id` FK → `users.id`
- `answers` JSON — array of selected option indexes
- `score` integer, `passed` boolean
- `attempted_at` timestamp

### 14. `catalogues` table
Columns:
- `id`, `file_path` string, `version` string nullable
- `uploaded_by` FK → `users.id`
- `is_current` boolean default `false`
- `timestamps`

### 15. `product_views` table
Columns:
- `id`, `product_id` FK → `products.id` (cascade delete)
- `user_id` FK → `users.id` nullable
- `viewer_ip` string nullable
- `viewed_at` timestamp

---

## Eloquent Model Tasks

### 16. `User` model (`app/Models/User.php`)
- Use Spatie `HasRoles` trait
- `$fillable`: name, email, phone, password, role, is_active, last_login_at, last_activity_at
- `$hidden`: password, remember_token
- `$casts`: is_active → boolean, last_login_at → datetime
- Relationships: `hasMany(Enquiry::class, 'assigned_to')`, `hasMany(EnquiryNote::class)`, `hasMany(TrainingMaterial::class, 'uploaded_by')`, `hasMany(QuizAttempt::class, 'trainee_id')`
- Scopes: `scopeActive()` → `where('is_active', true)`, `scopeByRole($role)`

### 17. `Product` model
- `$fillable`: all columns
- `$casts`: images → array, is_active/is_featured/is_hidden → boolean, synced_at → datetime
- Relationships: `belongsTo(ProductCategory::class, 'category_id')`, `hasMany(ProductVariation::class)`, `hasMany(Enquiry::class)`, `hasMany(ProductView::class)`
- Scopes: `scopeVisible()` → `where('is_hidden', false)->where('is_active', true)`, `scopeFeatured()`
- Accessor: `getFirstImageAttribute()` → returns `$this->images[0] ?? null`

### 18. `ProductCategory` model
- Relationships: `belongsTo(self::class, 'parent_id') as parent`, `hasMany(self::class, 'parent_id') as children`, `hasMany(Product::class, 'category_id')`

### 19. `Enquiry` model
- `$casts`: received_at/first_action_at → datetime, follow_up_date → date
- Relationships: `belongsTo(Product::class)`, `belongsTo(User::class, 'assigned_to') as assignedTo`, `hasMany(EnquiryNote::class)`
- Scopes:
  - `scopeForExecutive($userId)` → `where('assigned_to', $userId)`
  - `scopeByStatus($status)`
  - `scopeUnassigned()` → `whereNull('assigned_to')`
  - `scopeOverdue()` → `where('follow_up_date', '<', today())->whereNotIn('status', ['closed_won', 'closed_lost'])`

### 20. `EnquiryNote` model
- Relationships: `belongsTo(Enquiry::class)`, `belongsTo(User::class)`

### 21. `QuizTest` model
- `$casts`: is_active → boolean
- Relationships: `belongsTo(User::class, 'created_by') as createdBy`, `hasMany(QuizQuestion::class)`, `hasMany(QuizAttempt::class)`, `hasMany(QuizTestAssignment::class)`

### 22. `QuizQuestion` model
- `$casts`: options → array
- Relationship: `belongsTo(QuizTest::class)`

### 23. `QuizAttempt` model
- `$casts`: answers → array, passed → boolean
- Relationships: `belongsTo(QuizTest::class)`, `belongsTo(User::class, 'trainee_id') as trainee`

### 24. `QuizTestAssignment` model
- Relationships: `belongsTo(QuizTest::class)`, `belongsTo(User::class, 'trainee_id') as trainee`, `belongsTo(User::class, 'assigned_by') as assignedBy`

### 25. `TrainingMaterial` model
- `$casts`: is_active → boolean
- Relationship: `belongsTo(User::class, 'uploaded_by') as uploadedBy`
- Scopes: `scopeActive()`, `scopeByType($type)`

### 26. `Catalogue` model
- Relationship: `belongsTo(User::class, 'uploaded_by') as uploadedBy`
- Static method: `current()` → `static::where('is_current', true)->first()`

### 27. `ProductView` model
- Relationships: `belongsTo(Product::class)`, `belongsTo(User::class)` (nullable)

---

## Deliverables Checklist
- [ ] All 15 migrations created in correct order
- [ ] `php artisan migrate` runs without errors
- [ ] All 12+ models created with correct fillable, casts, and relationships
- [ ] Scopes working (test with `php artisan tinker`)
- [ ] No orphaned FK constraint errors
