# Module 01 — Project Setup & Infrastructure

## Overview
Scaffold both the Laravel backend and Next.js frontend, install all dependencies, configure environments, and set up database, queues, and folder structure.

---

## Backend Tasks (Laravel)

### 1. Create Laravel Project
- Run `composer create-project laravel/laravel starbottles-backend`
- Set up `.env` with database credentials, app name, app URL

### 2. Install Required Packages
- `laravel/sanctum` — API token authentication
- `spatie/laravel-permission` — role-based access control
- `predis/predis` — Redis driver
- `guzzlehttp/guzzle` — HTTP client for ERP and BSP calls
- `maatwebsite/excel` — CSV/XLSX export
- `barryvdh/laravel-dompdf` — PDF export
- `intervention/image` — image processing

### 3. Configure Environment
- Set `QUEUE_CONNECTION=redis`
- Set `SESSION_DRIVER=redis`
- Set `CACHE_DRIVER=redis`
- Publish Sanctum config: `php artisan vendor:publish --provider="Laravel\Sanctum\SanctumServiceProvider"`
- Publish Spatie config: `php artisan vendor:publish --provider="Spatie\Permission\PermissionServiceProvider"`

### 4. Configure Sanctum Middleware
- Add `EnsureFrontendRequestsAreStateful` to the `api` middleware group in `app/Http/Kernel.php`

### 5. Set Up Redis Queue
- Configure `config/queue.php` to use redis as default
- Install and configure Supervisor for queue workers (3 worker processes)

### 6. Create Roles Seeder
- Create `database/seeders/RolesAndPermissionsSeeder.php`
- Seed 3 roles: `admin`, `executive`, `trainee`
- Run: `php artisan db:seed --class=RolesAndPermissionsSeeder`

### 7. Configure Folder Structure
Create the following folders (with `.gitkeep`):
- `app/Http/Controllers/Api/`
- `app/Http/Controllers/Api/Admin/`
- `app/Http/Requests/`
- `app/Http/Resources/`
- `app/Services/`
- `app/Jobs/`
- `app/Policies/`
- `storage/app/public/products/`
- `storage/app/public/training/`
- `storage/app/catalogue/`

---

## Frontend Tasks (Next.js)

### 8. Create Next.js Project
- Run `npx create-next-app@latest starbottles-frontend --typescript --tailwind --app`
- Configure `tsconfig.json` with path alias `@/*`

### 9. Install Required Packages
- `@tanstack/react-query` + `@tanstack/react-query-devtools`
- `axios`
- `zustand`
- `next-auth`
- `react-hook-form` + `@hookform/resolvers` + `zod`
- `recharts`
- `react-player`
- `date-fns`

### 10. Install and Configure shadcn/ui
- Run `npx shadcn-ui@latest init` (Style: Default, Color: Slate, CSS variables: Yes)
- Add components: `button input label table dialog badge card select dropdown-menu toast skeleton avatar sheet tabs progress separator popover calendar command form textarea`

### 11. Create Route Group Folder Structure
```
app/
├── (auth)/login/
├── (public)/
│   ├── products/
│   └── products/[id]/
├── (admin)/
│   ├── dashboard/
│   ├── users/
│   ├── products/
│   ├── enquiries/
│   ├── training/
│   └── reports/
├── (executive)/
│   ├── inbox/
│   ├── inbox/[id]/
│   └── products/
├── (trainee)/
│   ├── learning/
│   ├── learning/videos/
│   ├── learning/downloads/
│   └── quiz/
└── unauthorized/
```

### 12. Configure Environment Variables
Create `.env.local` with:
- `NEXT_PUBLIC_API_URL=http://localhost:8000/api`
- `NEXTAUTH_URL=http://localhost:3000`
- `NEXTAUTH_SECRET=your-secret-here`

---

## Deliverables Checklist
- [ ] Laravel project runs without errors (`php artisan serve`)
- [ ] All packages installed and published
- [ ] Database connection working (`php artisan migrate`)
- [ ] Roles seeded (admin, executive, trainee)
- [ ] Redis connection working
- [ ] Next.js project runs without errors (`npm run dev`)
- [ ] All shadcn components installed
- [ ] Route group folders created
- [ ] `.env.local` configured
