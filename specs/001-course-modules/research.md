# Research: Course Modules

**Feature**: 001-course-modules
**Date**: 2026-09-02

## R1: Storage — IndexedDB vs localStorage

**Decision**: IndexedDB via a thin wrapper library (e.g., `idb` or custom)

**Rationale**:
- localStorage has a 5-10MB limit per origin and stores strings only
  (requires JSON serialization for every read/write).
- IndexedDB supports structured data, indices, transactions, and
  scales to hundreds of MB or more.
- The feature involves hierarchical data (Career → Course → Resources/Tasks)
  with relationships that benefit from indexed queries.
- `idb` (by Jake Archibald) is a 1.2KB wrapper that provides a
  Promise-based API over the raw IndexedDB interface.

**Alternatives considered**:
- localStorage: Rejected — size limits, no indexing, string-only storage.
- Dexie.js: Considered but heavier (25KB) for a simple CRUD app.
- Firebase/localStorage proxy: Rejected — adds backend dependency,
  violates offline-first constraint.

## R2: State Management — Hooks vs Context vs External Library

**Decision**: Custom React hooks with `useState`/`useEffect` + IndexedDB

**Rationale**:
- The app is single-user with offline-only data. No complex shared state
  across distant components.
- Each feature exports a `useXxx` hook that reads/writes IndexedDB and
  returns data + mutation functions.
- The dashboard page calls `useCareers()` which returns all careers with
  their nested courses. Course detail calls `useCourses(careerId)`.
- No need for Redux, Zustand, or Jotai — the data layer is the database,
  not in-memory state.

**Alternatives considered**:
- React Context: Rejected — would require wrapping providers and doesn't
  persist data. Context is for transient UI state, not data storage.
- Zustand: Rejected — adds dependency for what amounts to simple CRUD hooks.
- React Query/TanStack Query: Considered for caching, but unnecessary
  since IndexedDB is already the cache (offline-first).

## R3: Data Relationships — Embedding vs Referencing

**Decision**: Referencing with foreign keys (careerId on Course, courseId on
Resource/Task/Partner)

**Rationale**:
- Each entity (Course, Resource, Task, Partner) belongs to exactly one
  parent (Career or Course).
- Referencing allows independent CRUD operations on each entity without
  rewriting parent documents.
- Cascade deletes are implemented in application logic (delete career →
  query and delete all courses with that careerId → query and delete
  all resources/tasks/partners with those courseIds).

**Alternatives considered**:
- Embedding (nested documents): Rejected — makes independent updates
  difficult and increases document size for large resource lists.

## R4: ID Generation

**Decision**: `crypto.randomUUID()` (built-in, available in all modern browsers)

**Rationale**:
- No dependency needed. Returns v4 UUIDs.
- Globally unique, no coordination required.
- Supported in Chrome 92+, Firefox 95+, Safari 15.4+.

**Alternatives considered**:
- `Date.now() + random`: Rejected — collision risk under rapid creation.
- nanoid: Rejected — adds dependency for what `crypto.randomUUID()` handles.

## R5: Form Handling

**Decision**: Native HTML form elements + controlled React state

**Rationale**:
- Forms are simple (2-4 fields per form). No complex validation or
  multi-step wizards needed.
- Controlled inputs with `useState` provide immediate feedback.
- shadcn `Input`, `Label`, `Button` components handle styling.
- Validation: required fields checked on submit, inline error messages.

**Alternatives considered**:
- React Hook Form: Rejected — overkill for simple 2-4 field forms.
- Formik: Rejected — same reason, adds unnecessary bundle size.

## R6: Navigation Structure

**Decision**: Sidebar with career groups, each expandable to show courses

**Rationale**:
- The sidebar already exists (`AppSidebar`). Extend it to show careers
  as collapsible groups with courses listed underneath.
- Clicking a course navigates to `/courses/:courseId` which renders
  the course detail page with resources, tasks, and partners tabs.
- Dashboard (`/dashboard`) shows an overview of all careers and courses
  with pending task counts.

**Alternatives considered**:
- Separate career pages: Rejected — adds unnecessary navigation depth
  for a personal tool with <20 careers.

## R7: shadcn Components Needed (Additional)

**Decision**: Install `dialog`, `dropdown-menu`, `badge`, `tabs`, `scroll-area`,
`collapsible`, `alert-dialog`, `textarea`

**Rationale**:
- `dialog` + `alert-dialog`: For create/edit forms and delete confirmations.
- `dropdown-menu`: For course/career action menus (edit, delete).
- `badge`: For displaying task counts and resource type indicators.
- `tabs`: For course detail view (Resources | Tasks | Partners tabs).
- `scroll-area`: For long lists of courses or resources.
- `collapsible`: For career groups in sidebar and dashboard.
- `textarea`: For note content and career/course descriptions.
