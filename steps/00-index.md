# StarBottles — Development Task Files

Project: StarBottles Platform  
Client: StarBottles | Vendor: Havos Private Limited  
Stack: Laravel 10 (Backend API) + Next.js 14 (Frontend)

---

## Module Index

| File | Module | Phase | Days |
|------|--------|-------|------|
| `01-project-setup.md` | Project Setup & Infrastructure | Phase 1 | 1–3 |
| `02-database-models.md` | Database Migrations & Eloquent Models | Phase 1 | 4–7 |
| `03-authentication.md` | Authentication (Login/Logout + Frontend) | Phase 2 | 8–12 |
| `04-user-management.md` | User Management (Admin CRUD + UI) | Phase 2 | 13–17 |
| `05-erp-sync.md` | ERP Product Sync Service | Phase 3 | 18–22 |
| `06-product-catalogue.md` | Product Catalogue (Public + Admin) | Phase 3 | 23–28 |
| `07-enquiry-management.md` | Enquiry System + WhatsApp Webhook | Phase 4 | 29–38 |
| `08-trainee-portal.md` | Trainee Learning Portal + Quiz Engine | Phase 5 | 39–46 |
| `09-reports-analytics.md` | Reports & Analytics + Exports | Phase 5 | 47–51 |
| `10-testing-security.md` | Testing, Security & UAT Seed Data | Phase 6 | 52–55 |
| `11-deployment-devops.md` | Deployment, Nginx, CI/CD | Phase 6 | 56–58 |
| `12-uat-handover.md` | UAT Preparation & Project Handover | Phase 6 | 59–60 |

---

## How to Use These Files

Each module file contains:
- **Task list** — numbered tasks broken down by backend and frontend
- **Technical specs** — column definitions, validation rules, logic details
- **Route registrations** — endpoints to add per module
- **Deliverables checklist** — tick off as you complete each task

### Recommended Workflow with Claude Code

1. Open a new Claude Code session per module
2. Start with: _"Read the existing files in the relevant folders to understand the codebase, then we'll work through [Module Name]"_
3. Work through each numbered task in order
4. Tick off the deliverables checklist before moving to the next module

### Key Dependencies Between Modules

- Module 02 must be complete before all others (models + migrations)
- Module 03 (auth) must be complete before modules 04–09
- Module 05 (ERP sync) requires client to provide ERP API credentials for production
- Module 07 (WhatsApp webhook) requires client to activate BSP and provide secrets
- Module 10 (UAT seeder) depends on all feature modules being complete

---

## Critical Client Deliverables Needed

| Item | Needed For | Notes |
|------|-----------|-------|
| ERP API credentials + docs | Module 05 | Use mock mode until provided |
| WhatsApp BSP subscription | Module 07 | Use sandbox for development |
| Ubuntu 22.04 VPS | Module 11 | Client provides per SRS §16 |
| Domain + SSL | Module 11 | Client responsibility per SRS §16 |
| UAT feedback | Module 12 | 7-working-day window per SRS §20.2 |
