# StarBottles Platform — Claude Code Guide

## Dev Commands

```bash
# Start all dev services (Laravel server, queue worker, pail logs, Vite)
composer dev

# Run all tests (clears config cache first)
composer test

# First-time project setup
composer setup

# Run a single test by name
php artisan test --filter=TestName

# Production asset build
npm run build
```

## Architecture

### Project Layout
```
star bottles/
├── starbottles-backend/   # Laravel 12 API backend
│   ├── app/
│   │   ├── Models/
│   │   ├── Http/Controllers/
│   │   └── Services/      # Domain services (to be added per module)
│   ├── routes/
│   │   └── api.php        # API routes (to be created)
│   └── database/
└── steps/                 # Module specs (12 modules documented)
```

### Backend (Laravel 12)
- **Auth:** Laravel Sanctum (API tokens)
- **Authorization:** Spatie Laravel Permission (RBAC — roles & permissions)
- **Database:** SQLite (dev); queue, session, and cache all use `database` driver
- **Asset Pipeline:** Vite + Tailwind CSS v4

### Key Packages
| Package | Purpose |
|---|---|
| Maatwebsite Excel | Excel exports |
| dompdf | PDF generation |
| Intervention Image | Image processing |
| Guzzle | HTTP client for ERP/BSP integration |

### Development Approach
- **Module-driven:** 12 modules specified in `steps/` directory
- Module 01 complete, Module 02 in progress
- API routes live in `routes/api.php`
- Domain logic goes in `app/Services/` (one service class per domain concept)
