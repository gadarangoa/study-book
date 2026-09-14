# Tasks: Course Modules

**Input**: Design documents from `/specs/001-course-modules/`

**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/

**Tests**: Not requested — implementation only.

**Organization**: Tasks grouped by user story. Each story is independently testable.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (US1–US7)
- Exact file paths included in descriptions

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Install dependencies, create shadcn components, set up IndexedDB

- [ ] T001 Install additional shadcn/ui components: dialog, alert-dialog, badge, tabs, scroll-area, collapsible, textarea via `npx shadcn@latest add dialog alert-dialog badge tabs scroll-area collapsible textarea`
- [ ] T002 [P] Create IndexedDB wrapper in `src/lib/db.ts` with open, getAll, getById, create, update, delete, and getByIndex operations using the `idb` pattern (install `idb` via pnpm if needed, or use raw IndexedDB with Promise wrapper)
- [ ] T003 [P] Create feature directory structure: `src/features/careers/`, `src/features/courses/`, `src/features/resources/`, `src/features/tasks/`, `src/features/partners/` each with `components/`, `hooks/`, `types.ts`, `index.ts`

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Type definitions and data layer that ALL user stories depend on

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [ ] T004 [P] Define Career type in `src/features/careers/types.ts` (id, name, description?, createdAt, updatedAt)
- [ ] T005 [P] Define Course type in `src/features/courses/types.ts` (id, careerId, name, teacher?, description?, createdAt, updatedAt)
- [ ] T006 [P] Define Resource type in `src/features/resources/types.ts` (id, courseId, type: "note"|"link", title, content?, url?, description?, createdAt, updatedAt) plus NoteFormData and LinkFormData
- [ ] T007 [P] Define Task type in `src/features/tasks/types.ts` (id, courseId, title, dueDate?, status: "pending"|"complete", createdAt, updatedAt) plus TaskFormData
- [ ] T008 [P] Define Partner type in `src/features/partners/types.ts` (id, courseId, name, createdAt)
- [ ] T009 [P] Define ScheduleEntry type in `src/features/courses/types.ts` (id, courseId, day, startTime, endTime, location?) plus ScheduleEntryFormData
- [ ] T010 Implement IndexedDB database initialization with store creation (careers, courses, resources, tasks, partners, scheduleEntries) and indexes in `src/lib/db.ts`
- [ ] T011 Implement cascade delete logic in `src/lib/db.ts`: deleteCareer (removes career + all courses + all child entities), deleteCourse (removes course + all child entities)

**Checkpoint**: Foundation ready — types defined, DB initialized, cascade deletes working

---

## Phase 3: User Story 1 — Create and Manage Careers (Priority: P1) 🎯 MVP

**Goal**: Users can create, edit, and delete careers (study programs)

**Independent Test**: Create a career, verify it appears in list, edit it, delete it with confirmation

### Implementation for User Story 1

- [ ] T012 [P] [US1] Create `useCareers` hook in `src/features/careers/hooks/use-careers.ts` — returns careers, isLoading, createCareer, updateCareer, deleteCareer (reads/writes IndexedDB careers store)
- [ ] T013 [P] [US1] Create CareerForm component in `src/features/careers/components/career-form.tsx` — dialog with name input (required) and description textarea (optional), submit/cancel buttons using shadcn Dialog + Input + Textarea + Button
- [ ] T014 [P] [US1] Create CareerCard component in `src/features/careers/components/career-card.tsx` — displays career name, description preview, course count badge, action menu (edit/delete) using shadcn Card + Badge + DropdownMenu
- [ ] T015 [P] [US1] Create CareerList component in `src/features/careers/components/career-list.tsx` — renders array of CareerCard items with empty state when no careers exist
- [ ] T016 [US1] Create career delete confirmation using shadcn AlertDialog in CareerCard — warns about associated course data loss before confirming deletion
- [ ] T017 [US1] Export public API from `src/features/careers/index.ts` (types, hooks, components)

**Checkpoint**: Career CRUD fully functional — create, read, update, delete with confirmation

---

## Phase 4: User Story 2 — Create and Manage Courses Within a Career (Priority: P1)

**Goal**: Users can create, edit, and delete courses within a specific career

**Independent Test**: Open a career, create a course, verify it appears under that career, edit it, delete it

### Implementation for User Story 2

- [ ] T018 [P] [US2] Create `useCourses` hook in `src/features/courses/hooks/use-courses.ts` — returns courses for a careerId, isLoading, createCourse, updateCourse, deleteCourse (queries IndexedDB courses store by careerId index)
- [ ] T019 [P] [US2] Create CourseForm component in `src/features/courses/components/course-form.tsx` — dialog with name input (required), teacher input (optional), description textarea (optional) using shadcn Dialog + Input + Textarea + Button
- [ ] T020 [P] [US2] Create CourseCard component in `src/features/courses/components/course-card.tsx` — displays course name, teacher name, pending task count badge, action menu using shadcn Card + Badge + DropdownMenu
- [ ] T021 [P] [US2] Create CourseList component in `src/features/courses/components/course-list.tsx` — renders array of CourseCard items filtered by careerId, with empty state
- [ ] T022 [US2] Create course delete confirmation using shadcn AlertDialog — warns about associated resource/task data loss
- [ ] T023 [US2] Export public API from `src/features/courses/index.ts` (types, hooks, components)

**Checkpoint**: Course CRUD functional within career context

---

## Phase 5: User Story 3 — Add Teachers and Schedule to Courses (Priority: P1)

**Goal**: Users can add teacher name and class schedule entries to courses

**Independent Test**: Create a course, add teacher info and schedule times, verify display on course detail

### Implementation for User Story 3

- [ ] T024 [US3] Extend CourseForm in `src/features/courses/components/course-form.tsx` to include teacher name input field
- [ ] T025 [P] [US3] Create ScheduleEntryList component in `src/features/courses/components/schedule-entry-list.tsx` — displays schedule entries grouped by day, with add/delete actions using shadcn Select for day, Input for times
- [ ] T026 [US3] Add schedule entry form (inline or dialog) in `src/features/courses/components/schedule-entry-list.tsx` — day select, start time, end time, location input, validation that endTime > startTime
- [ ] T027 [US3] Create `useScheduleEntries` hook or extend `useCourses` in `src/features/courses/hooks/use-courses.ts` — add/addScheduleEntry, removeScheduleEntry operations on IndexedDB scheduleEntries store
- [ ] T028 [US3] Create CourseDetail component in `src/features/courses/components/course-detail.tsx` — shows course info (name, teacher, description) and schedule entries using shadcn Tabs placeholder (Tabs added in Phase 8)

**Checkpoint**: Course metadata (teacher, schedule) fully editable and displayed

---

## Phase 6: User Story 7 — Browse Career and Course List on Dashboard (Priority: P1)

**Goal**: Dashboard shows all careers with nested courses and pending task counts

**Independent Test**: Create multiple careers with courses, verify dashboard displays correct hierarchy and task counts

### Implementation for User Story 7

- [ ] T029 [US7] Update `src/pages/dashboard.tsx` — replace placeholder with career list using CareerList component, show empty state when no careers exist (uses useCareers hook)
- [ ] T030 [US7] Update `src/components/app-sidebar.tsx` — add career navigation items to sidebar (careers as collapsible groups with courses listed underneath) using shadcn Collapsible
- [ ] T031 [US7] Update `src/App.tsx` routes — add `/careers/:careerId` route for CareerDetail page, `/courses/:courseId` route for CourseDetail page
- [ ] T032 [US7] Create CareerDetail page in `src/pages/career-detail.tsx` — shows career name, description, and CourseList component for that career's courses
- [ ] T033 [US7] Create CourseDetail page in `src/pages/course-detail.tsx` — loads course by courseId param, renders CourseDetail component with resources/tasks/partners tabs (tabs populated in later phases)

**Checkpoint**: Full navigation flow working — dashboard → career → course detail

---

## Phase 7: User Story 4 — Organize Resources Within a Course (Priority: P2)

**Goal**: Users can add notes and links to courses, filter by type

**Independent Test**: Open a course, add a note and a link, filter by type, verify both appear

### Implementation for User Story 4

- [ ] T034 [P] [US4] Create `useResources` hook in `src/features/resources/hooks/use-resources.ts` — returns resources for a courseId, filter state, createResource, updateResource, deleteResource (queries IndexedDB resources store by courseId index)
- [ ] T035 [P] [US4] Create NoteForm component in `src/features/resources/components/note-form.tsx` — dialog with title input (required) and content textarea (optional) using shadcn Dialog + Input + Textarea
- [ ] T036 [P] [US4] Create LinkForm component in `src/features/resources/components/link-form.tsx` — dialog with title input (required), URL input (required, validated), description textarea (optional)
- [ ] T037 [P] [US4] Create ResourceList component in `src/features/resources/components/resource-list.tsx` — renders resource cards with title, type badge, filter toggle (All | Notes | Links), action menu using shadcn Badge + ToggleGroup
- [ ] T038 [US4] Integrate ResourceList into CourseDetail tabs — add "Resources" tab content in `src/features/courses/components/course-detail.tsx`
- [ ] T039 [US4] Export public API from `src/features/resources/index.ts`

**Checkpoint**: Resources (notes + links) fully manageable per course with filtering

---

## Phase 8: User Story 5 — Track Pending Tasks Per Course (Priority: P2)

**Goal**: Users can add tasks with due dates, mark complete/incomplete, see pending counts

**Independent Test**: Add tasks to a course, mark one complete, verify pending count updates on dashboard

### Implementation for User Story 5

- [ ] T040 [P] [US5] Create `useTasks` hook in `src/features/tasks/hooks/use-tasks.ts` — returns tasks, pendingTasks, completedTasks, createTask, updateTask, toggleTaskStatus, deleteTask (queries IndexedDB tasks store by courseId and status indexes)
- [ ] T041 [P] [US5] Create TaskForm component in `src/features/tasks/components/task-form.tsx` — dialog with title input (required), due date input (optional, type="date") using shadcn Dialog + Input
- [ ] T042 [P] [US5] Create TaskItem component in `src/features/tasks/components/task-item.tsx` — displays task title, due date, checkbox to toggle status, action menu using shadcn Checkbox
- [ ] T043 [P] [US5] Create TaskList component in `src/features/tasks/components/task-list.tsx` — two sections (Pending, Completed), each rendering TaskItem array, with add button
- [ ] T044 [US5] Integrate TaskList into CourseDetail tabs — add "Tasks" tab content in `src/features/courses/components/course-detail.tsx`
- [ ] T045 [US5] Wire pending task count to dashboard — ensure useCareers returns totalPendingTasks per career, CourseCard shows pending count badge
- [ ] T046 [US5] Export public API from `src/features/tasks/index.ts`

**Checkpoint**: Task management fully functional with dashboard-level visibility

---

## Phase 9: User Story 6 — Register Partners/Classmates (Priority: P3)

**Goal**: Users can add and remove study partners per course

**Independent Test**: Add a partner to a course, view partner list, remove a partner

### Implementation for User Story 6

- [ ] T047 [P] [US6] Create `usePartners` hook in `src/features/partners/hooks/use-partners.ts` — returns partners, addPartner, removePartner (queries IndexedDB partners store by courseId index)
- [ ] T048 [P] [US6] Create PartnerList component in `src/features/partners/components/partner-list.tsx` — renders partner names with delete button, inline input + add button at bottom using shadcn Input + Button
- [ ] T049 [US6] Integrate PartnerList into CourseDetail tabs — add "Partners" tab content in `src/features/courses/components/course-detail.tsx`
- [ ] T050 [US6] Export public API from `src/features/partners/index.ts`

**Checkpoint**: Partner management functional per course

---

## Phase 10: Polish & Cross-Cutting Concerns

**Purpose**: Validation, empty states, responsive layout, finishing touches

- [ ] T051 Add form validation to CareerForm — require non-empty name, show inline error using shadcn patterns (data-invalid on Field, aria-invalid on Input)
- [ ] T052 Add form validation to CourseForm — require non-empty name, show inline error
- [ ] T053 Add form validation to NoteForm — require non-empty title; LinkForm — require non-empty title + valid URL
- [ ] T054 Add form validation to TaskForm — require non-empty title
- [ ] T055 Implement empty state component for career list (no careers yet — prompt to create first career)
- [ ] T056 Implement empty state for course list within a career (no courses yet — prompt to add first course)
- [ ] T057 Ensure responsive layout works at 320px, 768px, and 2560px widths — verify sidebar collapses on mobile, cards stack properly
- [ ] T058 Add keyboard navigation support — ensure all interactive elements are focusable, dialogs trap focus, escape closes dialogs
- [ ] T059 Run quickstart.md validation scenarios V1–V11 end-to-end and fix any issues found
- [ ] T060 Final lint and typecheck pass — `pnpm lint` and `pnpm typecheck` with zero errors

---

## Dependencies & Execution Order

### Phase Dependencies

- **Phase 1 (Setup)**: No dependencies — start immediately
- **Phase 2 (Foundational)**: Depends on Phase 1 completion — BLOCKS all user stories
- **Phase 3 (US1 Careers)**: Depends on Phase 2
- **Phase 4 (US2 Courses)**: Depends on Phase 2, can parallel with Phase 3
- **Phase 5 (US3 Teachers/Schedule)**: Depends on Phase 4 (needs CourseDetail component)
- **Phase 6 (US7 Dashboard)**: Depends on Phases 3 + 4 (needs careers and courses to display)
- **Phase 7 (US4 Resources)**: Depends on Phase 2, can parallel with Phases 3–6
- **Phase 8 (US5 Tasks)**: Depends on Phase 2, can parallel with Phases 3–7
- **Phase 9 (US6 Partners)**: Depends on Phase 2, can parallel with Phases 3–8
- **Phase 10 (Polish)**: Depends on all desired user stories being complete

### User Story Dependencies

- **US1 (Careers)**: Can start after Phase 2 — no dependencies on other stories
- **US2 (Courses)**: Can start after Phase 2 — no dependencies on other stories
- **US3 (Teachers/Schedule)**: Depends on US2 (extends CourseForm, CourseDetail)
- **US7 (Dashboard)**: Depends on US1 + US2 (displays careers with courses)
- **US4 (Resources)**: Can start after Phase 2 — independent
- **US5 (Tasks)**: Can start after Phase 2 — independent, integrates with dashboard
- **US6 (Partners)**: Can start after Phase 2 — independent

### Parallel Opportunities

```bash
# Phase 2 — all type definitions in parallel:
Task: "Define Career type in src/features/careers/types.ts"
Task: "Define Course type in src/features/courses/types.ts"
Task: "Define Resource type in src/features/resources/types.ts"
Task: "Define Task type in src/features/tasks/types.ts"
Task: "Define Partner type in src/features/partners/types.ts"

# Phase 3+4 — US1 and US2 can run in parallel (different feature dirs):
Task: "Create useCareers hook in src/features/careers/hooks/use-careers.ts"
Task: "Create useCourses hook in src/features/courses/hooks/use-courses.ts"
Task: "Create CareerForm in src/features/careers/components/career-form.tsx"
Task: "Create CourseForm in src/features/courses/components/course-form.tsx"

# Phase 7+8+9 — US4, US5, US6 can all run in parallel:
Task: "Create useResources hook in src/features/resources/hooks/use-resources.ts"
Task: "Create useTasks hook in src/features/tasks/hooks/use-tasks.ts"
Task: "Create usePartners hook in src/features/partners/hooks/use-partners.ts"
```

---

## Implementation Strategy

### MVP First (US1 + US2 + US7)

1. Complete Phase 1: Setup
2. Complete Phase 2: Foundational (CRITICAL)
3. Complete Phase 3: US1 Careers
4. Complete Phase 4: US2 Courses
5. Complete Phase 6: US7 Dashboard
6. **STOP and VALIDATE**: Full career → course flow works end-to-end
7. The app is now usable for organizing courses by career

### Incremental Delivery

1. Setup + Foundational → Foundation ready
2. US1 (Careers) → Career CRUD works
3. US2 (Courses) → Course CRUD within careers works
4. US7 (Dashboard) → Full navigation flow works → **MVP!**
5. US3 (Teachers/Schedule) → Course metadata enriched
6. US4 (Resources) → Notes and links per course
7. US5 (Tasks) → Task tracking with dashboard counts
8. US6 (Partners) → Partner registry
9. Polish → Validation, responsive, a11y

---

## Notes

- [P] tasks = different files, no dependencies on each other within the same phase
- [Story] label maps task to specific user story for traceability
- Each user story is independently completable and testable
- Commit after each task or logical group
- Stop at any checkpoint to validate story independently
- IndexedDB operations are async — all hooks return Promises
- shadcn Dialog is used for all create/edit forms (consistent UX)
- shadcn AlertDialog is used for all delete confirmations
