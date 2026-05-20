# Module 08 — Trainee Learning Portal

## Overview
A structured onboarding and knowledge portal for trainees — covering company introduction, product catalogue access, training videos, downloadable materials, and a quiz engine with scoring.

---

## Backend Tasks

### 1. Create TrainingController
File: `app/Http/Controllers/Api/TrainingController.php`

**`materials(Request $request)`** — Trainee + Executive + Admin
- Return active training materials grouped by type: `{ videos: [...], pdfs: [...], documents: [...] }`
- For each material, include a `download_url` (signed storage URL or direct public URL)
- Use `scopeActive()` and `scopeByType()`

**`uploadMaterial(Request $request)`** — Admin only
- Validate: `title` required, `type` required (enum: video/pdf/document), `file` required max 100MB, `description` nullable
- Store file: `Storage::disk('public')->put('training/' . $request->type . '/', $file)`
- Create `TrainingMaterial` record
- Return `201` with created record

**`deleteMaterial(TrainingMaterial $material)`** — Admin only
- Soft-delete: `$material->update(['is_active' => false])`
- Return `204 No Content`

**`companyInfo()`** — All authenticated
- Return all `CompanyInfoSection` records ordered by `display_order`

**`updateCompanyInfo(Request $request, string $key)`** — Admin only
- Validate: `title` required, `content` required, `display_order` integer
- `CompanyInfoSection::updateOrCreate(['section_key' => $key], [...fields])`
- Return updated section

### 2. Seed Default Company Info Sections
Create `database/seeders/CompanyInfoSeeder.php` that seeds these sections (with placeholder content):
- `company_background` — Company Background
- `business_activities` — What We Do
- `products_overview` — Products We Make
- `industries_served` — Industries We Serve
- `manufacturing` — Our Manufacturing
- `values` — Our Values

### 3. Create QuizController
File: `app/Http/Controllers/Api/QuizController.php`

**`index()`** — Admin only
- List all `QuizTest` records with counts: total questions, total attempts, pass rate
- Return paginated

**`store(Request $request)`** — Admin only
- Validate: `title` required, `passing_score` integer 0–100, `questions` required array min 1
- Each question: `question_text` required, `options` array of exactly 4 strings, `correct_option` integer 0–3
- Create `QuizTest`, then bulk-create all `QuizQuestion` records
- Return created quiz with questions (201)

**`show($id)`** — Trainee + Executive + Admin
- For trainee: verify a `QuizTestAssignment` exists for this trainee and quiz — return 403 if not assigned
- Return quiz with questions — **omit `correct_option`** from questions for trainee/executive
- Admin sees `correct_option`

**`assign(Request $request, QuizTest $quiz)`** — Admin only
- Validate: `trainee_ids` required array, each must exist in users as trainee role
- For each trainee: create `QuizTestAssignment` if not already assigned
- Return: `{ message: "Quiz assigned to X trainees", already_assigned: Y }`

**`attempt(Request $request, QuizTest $quiz)`** — Trainee only
- Check `QuizTestAssignment` exists for this trainee
- Check no existing `QuizAttempt` unless `retake_approved = true` on the assignment
  - If already attempted and retake not approved: return `403 "You have already completed this quiz. Contact admin for a retake."`
- Validate: `answers` required array, length must match question count
- Score: count answers where `answers[i] === questions[i].correct_option`, divide by total, multiply by 100
- `passed = score >= quiz.passing_score`
- Create `QuizAttempt` record
- If passed: update `QuizTestAssignment.retake_approved = false` (reset)
- Return: `{ score, passed, correct_count, total_count, passing_score }` — do NOT return which answers were wrong

**`results($id)`** — Admin only
- All `QuizAttempt` records for the quiz with trainee name, score, passed, attempted_at
- Summary: total attempts, pass rate %, average score
- Return paginated by trainee

**`approveRetake(QuizAttempt $attempt)`** — Admin only
- Find the `QuizTestAssignment` for this attempt's quiz + trainee
- Set `retake_approved = true`
- Return updated assignment

### 4. Register Training & Quiz Routes
Trainee + Executive + Admin:
```
GET  /v1/training/materials     TrainingController@materials
GET  /v1/training/company-info  TrainingController@companyInfo
GET  /v1/quiz-tests/{quiz}      QuizController@show
POST /v1/quiz-tests/{quiz}/attempt  QuizController@attempt
```

Admin only:
```
POST    /v1/training/materials               TrainingController@uploadMaterial
DELETE  /v1/training/materials/{material}    TrainingController@deleteMaterial
PUT     /v1/training/company-info/{key}      TrainingController@updateCompanyInfo
GET     /v1/quiz-tests                       QuizController@index
POST    /v1/quiz-tests                       QuizController@store
POST    /v1/quiz-tests/{quiz}/assign         QuizController@assign
GET     /v1/quiz-tests/{quiz}/results        QuizController@results
POST    /v1/quiz-attempts/{attempt}/approve-retake  QuizController@approveRetake
```

### 5. Write Feature Tests
File: `tests/Feature/TrainingTest.php`

- `test_trainee_can_access_training_materials`
- `test_admin_can_upload_training_material`
- `test_admin_can_delete_training_material` (sets is_active=false)
- `test_admin_can_update_company_info_section`
- `test_company_info_returns_all_sections_ordered`

File: `tests/Feature/QuizTest.php`

- `test_admin_can_create_quiz_with_questions`
- `test_admin_can_assign_quiz_to_trainee`
- `test_trainee_can_view_assigned_quiz_without_correct_answers`
- `test_trainee_cannot_view_unassigned_quiz` (403)
- `test_trainee_can_submit_quiz_attempt_and_get_score`
- `test_trainee_cannot_retake_without_approval` (403)
- `test_admin_can_approve_retake`
- `test_admin_can_view_quiz_results`
- `test_correct_option_not_exposed_to_trainee_in_show`

---

## Frontend Tasks

### 6. Create Training & Quiz Hooks
File: `hooks/useTraining.ts`
- `useTrainingMaterials()` — `GET /v1/training/materials`
- `useCompanyInfo()` — `GET /v1/training/company-info`
- `useUploadMaterial()` — `POST` mutation with file upload
- `useUpdateCompanyInfo(key)` — `PUT` mutation

File: `hooks/useQuiz.ts`
- `useAssignedQuizzes()` — derive from assignments (list for trainee)
- `useQuiz(id)` — `GET /v1/quiz-tests/{id}`
- `useSubmitQuizAttempt(quizId)` — `POST /v1/quiz-tests/{id}/attempt` mutation
- `useAdminQuizzes()` — `GET /v1/quiz-tests` (admin)
- `useCreateQuiz()` — `POST` mutation
- `useAssignQuiz(quizId)` — `POST /v1/quiz-tests/{id}/assign` mutation
- `useQuizResults(quizId)` — `GET /v1/quiz-tests/{id}/results`

### 7. Build Trainee Portal Home
File: `app/(trainee)/learning/page.tsx`

Layout: clean, card-based grid

Progress overview (horizontal stepper at top):
- Company Intro → Products → Videos → Downloads → Quiz
- Mark each step with a checkmark if viewed (track in localStorage: `starbottles_learning_progress`)

Navigation cards (2×2 grid):
- 📋 Company Introduction
- 🏭 Product Catalogue (link to public `/products` with read-only message)
- 🎬 Training Videos
- 📥 Downloads

If quiz assigned and not yet completed: render a highlighted CTA card:
- "📝 You have a knowledge test pending" — "Take the Test" button → `/trainee/quiz`

### 8. Build Company Introduction Page
File: `app/(trainee)/learning/company/page.tsx`

- Fetch `useCompanyInfo()` and render sections as a clean article
- Each section: heading + rich text body (render with `dangerouslySetInnerHTML` or a safe renderer)
- "Mark as Read" button at bottom (sets localStorage flag for progress tracking)

### 9. Build Training Videos Page
File: `app/(trainee)/learning/videos/page.tsx`

- Fetch materials filtered to `type=video`
- Grid of video cards: thumbnail (or generic video icon), title, description (2 lines max)
- Click → opens `VideoPlayerModal`

File: `components/training/VideoPlayerModal.tsx` (Shadcn `Dialog`):
- Title in dialog header
- `ReactPlayer` component filling the dialog body
- Supports YouTube URLs and direct file paths
- Close button

### 10. Build Downloads Page
File: `app/(trainee)/learning/downloads/page.tsx`

- Fetch materials filtered to `type=pdf` and `type=document`
- List view (not grid):
  - PDF icon or document icon based on type
  - Title (bold), description (gray), file type badge
  - "Download" button → `href={download_url}` with `target="_blank"`
- Empty state if no files uploaded

### 11. Build Quiz Landing Page
File: `app/(trainee)/quiz/page.tsx`

- List assigned quizzes:
  - Quiz title
  - Status badge: "Not Started" (amber) / "Passed {score}%" (green) / "Failed {score}%" (red) / "Retake Approved" (blue)
  - "Start Quiz" or "View Score" button
- Empty state: "No quizzes assigned yet"

### 12. Build Quiz Taking Experience
File: `app/(trainee)/quiz/[id]/page.tsx`

State machine: `not-started` → `in-progress` → `submitted` → `results`

**Not started state:**
- Quiz title, question count, passing score %
- "Begin Quiz" button

**In-progress state:**
- Progress bar: "Question {current} of {total}"
- Question text (large, readable)
- 4 radio options as large clickable cards (not tiny radio buttons)
- Selected option: highlighted with primary color border
- "Next Question" button (disabled until option selected)
- Cannot go back to previous questions
- On last question: "Submit Quiz" button → opens confirmation `AlertDialog`

**Results state (after submission):**
- Large centered score: e.g. "78%"
- Passed: ✅ "Congratulations! You passed." (green)
- Failed: ❌ "You scored {score}%, but {passing_score}% is required to pass." (red)
- "Contact your administrator if you need a retake." (if failed)
- "Back to Learning" button

---

## Admin Training Management Tasks

### 13. Build Admin Training Management Page
File: `app/(admin)/training/page.tsx`

Shadcn `Tabs` with 4 tabs:

**Tab 1: Company Info**
- List all sections, each editable inline
- Click section → expand to show editable title + `Textarea` for content
- "Save" per section — calls `useUpdateCompanyInfo(key)`
- "Add Section" button (prompts for section key and title)

**Tab 2: Materials (PDFs / Docs)**
- Upload zone: drag-and-drop or click to select (react-dropzone)
- Shows upload progress bar
- Existing materials list: title, type badge, uploaded date, delete button (soft delete)

**Tab 3: Videos**
- Same upload zone for video files OR text input to paste a YouTube URL
- Existing videos list with thumbnail preview

**Tab 4: Quizzes**
- List of quizzes: title, question count, assignments count, pass rate
- "Create Quiz" button → opens `QuizBuilderModal`
- Each quiz row: "Assign" button + "View Results" button

### 14. Create QuizBuilderModal
File: `components/training/QuizBuilderModal.tsx`

- Shadcn `Dialog` (large, full-width on mobile)
- Fields: Quiz Title, Passing Score (0–100 slider with live "Pass at X%" label)
- Dynamic question builder:
  - "Add Question" button appends new question block
  - Each question block: question text input + 4 option inputs + "Correct Answer" radio (selects which option is correct)
  - Minimum 1 question required
- Submit → `useCreateQuiz()` mutation → success toast + close

### 15. Create QuizResultsPanel
File: `components/training/QuizResultsPanel.tsx`

- Summary row: pass rate %, average score, total attempts
- Table: Trainee Name | Score | Passed (badge) | Date | Actions
- "Approve Retake" button per failed attempt → `useApproveRetake()` mutation

### 16. Create AssignQuizModal
File: `components/training/AssignQuizModal.tsx`

- List of trainees with checkboxes (multi-select)
- Shows "Already assigned" label for trainees already assigned this quiz
- "Assign to Selected" button → `useAssignQuiz()` mutation

---

## Deliverables Checklist
- [ ] Company info sections seed and display correctly
- [ ] Admin can upload PDFs, videos, documents
- [ ] Trainee can view and download materials
- [ ] Videos play inside modal using ReactPlayer
- [ ] Admin can create quiz with questions
- [ ] Admin can assign quiz to trainees
- [ ] Trainee can only see assigned quizzes
- [ ] Correct options not exposed in quiz show response
- [ ] Quiz scoring calculates correctly
- [ ] Failed trainee sees retake-needed message
- [ ] Admin can approve retake
- [ ] All 9 quiz tests passing
- [ ] Progress tracking persists in localStorage
