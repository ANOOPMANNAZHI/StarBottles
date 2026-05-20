# Module 12 — UAT Preparation & Project Handover

## Overview
Prepare the system for User Acceptance Testing — seed realistic data, document acceptance criteria, create a user guide per role, and package all handover deliverables.

---

## UAT Preparation Tasks

### 1. Run UAT Seeder
The `UatSeeder` is created in Module 10. Before UAT:

```bash
php artisan migrate:fresh --seed --class=UatSeeder
```

Verify the following after seeding:
- [ ] 7 users created across 3 roles
- [ ] 20 products across 4 categories visible in catalogue
- [ ] 10 enquiries in mixed statuses, distributed across executives
- [ ] 2 unassigned enquiries visible in admin panel
- [ ] 2 overdue enquiries visible (follow_up_date in past)
- [ ] 1 quiz with 5 questions assigned to both trainees
- [ ] Training materials seeded (3 PDFs, 2 videos)
- [ ] Company info sections populated
- [ ] ERP sync logs showing history

### 2. Smoke Test All Roles Before Handing Over to Client

For each role, verify these core flows work end-to-end:

**Admin (admin@starbottles.com / Admin@2024):**
- [ ] Log in → redirected to `/admin/dashboard`
- [ ] Dashboard shows stat cards and ERP sync status
- [ ] User Management: create a new executive user
- [ ] Product Management: hide and feature a product
- [ ] ERP Sync: click "Sync Now", observe status update
- [ ] Enquiry Monitor: view all enquiries, assign one to an executive
- [ ] Reports: view Enquiry Overview, Executive Performance, Product Interest
- [ ] Training: upload a material, edit company info
- [ ] Quiz: create a quiz, assign to trainee

**Executive (exec1@starbottles.com / Exec@2024):**
- [ ] Log in → redirected to `/executive/inbox`
- [ ] Inbox shows only assigned enquiries
- [ ] Open an enquiry, update status to "Contacted"
- [ ] Set a follow-up date
- [ ] Add an internal note
- [ ] Click WhatsApp button (verify link format)
- [ ] Browse product catalogue
- [ ] Access learning materials

**Trainee (trainee1@starbottles.com / Trainee@2024):**
- [ ] Log in → redirected to `/trainee/learning`
- [ ] Read company introduction
- [ ] Browse product catalogue (read-only)
- [ ] Watch a training video
- [ ] Download a PDF
- [ ] Start and complete the knowledge quiz
- [ ] View quiz score
- [ ] Verify: Trainee cannot access `/executive/inbox` or `/admin/dashboard`

**Public (no login):**
- [ ] Browse products at `/products`
- [ ] Use search and category filters
- [ ] View a product detail page
- [ ] Submit an enquiry form
- [ ] Verify enquiry appears in admin panel

---

## Documentation Tasks

### 3. Create UAT Acceptance Checklist
File: `docs/UAT_CHECKLIST.md`

```markdown
# StarBottles UAT Acceptance Checklist

Client: StarBottles
Vendor: Havos Private Limited
UAT Version: 1.0

Instructions:
- Test each item in the UAT environment
- Mark ✅ if working correctly, ❌ if issue found
- For any ❌, note the issue in the "Notes" column
- Return completed checklist within 7 working days

| # | Feature | Steps to Test | Expected Result | Status | Notes |
|---|---------|---------------|-----------------|--------|-------|
| 1 | All user roles can log in | Log in as admin, executive, trainee using provided credentials | Each role redirected to correct dashboard | | |
| 2 | Role-based dashboards load | After login, verify correct dashboard renders | Admin sees admin panel; Executive sees inbox; Trainee sees learning portal | | |
| 3 | Product catalogue visible | Browse /products as public user | Products listed with images, filters work | | |
| 4 | Product detail page loads | Click on any product | Specs, images, enquiry form displayed | | |
| 5 | Website enquiry captured | Submit enquiry form on a product page | Enquiry appears in admin panel | | |
| 6 | Admin can manage users | Admin creates a new executive user | User appears in user list, can log in | | |
| 7 | Admin can assign enquiries | Admin assigns a new enquiry to an executive | Enquiry appears in executive's inbox | | |
| 8 | Executive can update status | Executive opens enquiry, changes status | Status updates and saves correctly | | |
| 9 | Executive can add notes | Executive adds internal note to enquiry | Note appears in notes timeline | | |
| 10 | Follow-up date tracking | Executive sets follow-up date | Date displays; overdue shows if past | | |
| 11 | WhatsApp link works | Executive clicks WhatsApp button | Opens WhatsApp with pre-filled message | | |
| 12 | ERP product sync works | Admin clicks "Sync Now" | Products update; sync log shows success | | |
| 13 | Trainee portal accessible | Trainee logs in, accesses Learning | Company info, materials, videos visible | | |
| 14 | Trainee quiz works | Trainee starts and completes the quiz | Score displayed with pass/fail result | | |
| 15 | Trainee cannot see enquiries | Attempt to access /executive/inbox as trainee | Access denied / redirected | | |
| 16 | Reports load correctly | Admin views Reports tab | Enquiry count, executive stats, product interest visible | | |
| 17 | Export works | Admin exports enquiry report as CSV | CSV file downloads with correct data | | |
| 18 | Normal usage no errors | Perform all above steps | No unexpected errors or crashes | | |

Sign-off:
Client Representative: ___________________  Date: ___________
```

### 4. Create User Guide per Role
File: `docs/USER_GUIDE.md`

Structure:
```markdown
# StarBottles User Guide

## Admin Guide
### Logging In
### Managing Users (Create, Edit, Deactivate)
### Managing Products (Hide, Feature, ERP Sync)
### Managing Enquiries (View All, Assign)
### Using Reports
### Managing Training Content

## Executive Guide
### Logging In
### Your Enquiry Inbox
### Updating Enquiry Status
### Setting Follow-up Dates
### Adding Internal Notes
### Contacting Customers
### Browsing Products

## Trainee Guide
### Logging In
### Learning Portal Overview
### Reading Company Introduction
### Browsing Products
### Watching Videos
### Downloading Materials
### Taking the Knowledge Quiz
```

Each section should have:
- Step-by-step numbered instructions (plain language, no jargon)
- `[SCREENSHOT: page or action description]` placeholder for client to add screenshots
- Tips or notes where relevant

### 5. Create Technical Handover Document
File: `docs/TECHNICAL_HANDOVER.md`

Sections:
1. **System Architecture** — backend/frontend/DB/Redis/queue overview diagram (ASCII or Mermaid)
2. **Server Access** — how to SSH, file locations (`/var/www/...`)
3. **Environment Variables** — list all required `.env` vars with descriptions
4. **Deployment Process** — how to push updates (GitHub → CI/CD auto-deploys)
5. **Queue Workers** — how to restart Supervisor workers
6. **ERP Sync** — how to run manual sync, how to check logs
7. **WhatsApp Webhook** — URL to register with BSP, how to update verify token
8. **Backups** — how to back up MySQL database (mysqldump command)
9. **Monitoring** — log file locations, how to check queue worker status
10. **Post-Launch Support** — what is covered in 30-day support, contact details

### 6. Create API Documentation
File: `docs/API.md`

Document all public-facing endpoints that the client may need to know about:

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | /api/v1/auth/login | None | Login and get token |
| POST | /api/v1/auth/logout | Bearer | Logout |
| GET | /api/v1/auth/me | Bearer | Current user |
| GET | /api/v1/products | None | List products |
| GET | /api/v1/products/{id} | None | Product detail |
| POST | /api/v1/enquiries | None | Submit enquiry |
| GET | /api/v1/webhooks/whatsapp | None | BSP verification |
| POST | /api/v1/webhooks/whatsapp | None | Receive WhatsApp messages |
| ... | ... | ... | ... |

Include request/response examples for the most important endpoints (login, submit enquiry, webhook).

---

## Final Delivery Checklist

### Code Quality
- [ ] No `console.log` or `dd()` debug statements in production code
- [ ] All `.env` secrets removed from git history
- [ ] `APP_DEBUG=false` in production `.env`
- [ ] `composer install --no-dev` used in production
- [ ] `npm run build` completes with no TypeScript errors

### Documentation
- [ ] `UAT_CHECKLIST.md` complete and sent to client
- [ ] `USER_GUIDE.md` covers all 3 roles with step-by-step instructions
- [ ] `TECHNICAL_HANDOVER.md` complete with server and deployment details
- [ ] `API.md` documents all key endpoints
- [ ] `DEPLOYMENT.md` updated with any server-specific notes

### UAT Process (per SRS §20.2)
- [ ] UAT environment deployed and accessible
- [ ] UAT credentials shared securely with client
- [ ] UAT start date communicated
- [ ] 7 working day feedback window starts from UAT access date
- [ ] Feedback collection method agreed (email, spreadsheet, or ticketing tool)

### Post-UAT
- [ ] All in-scope functional bugs resolved
- [ ] Out-of-scope requests logged as Change Requests
- [ ] Client confirms acceptance in writing
- [ ] Production deployment done
- [ ] 30-day support window start date noted
