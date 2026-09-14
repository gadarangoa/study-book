# Quickstart Validation Guide: Course Modules

**Feature**: 001-course-modules
**Date**: 2026-09-02

## Prerequisites

- Node.js 18+ installed
- pnpm installed
- Modern browser (Chrome, Firefox, Safari, or Edge)

## Setup

```bash
cd study-book
pnpm install
pnpm dev
```

Open `http://localhost:5173` in the browser. You should see the login page.

## Validation Scenarios

### V1: Career CRUD (covers FR-001 to FR-004, FR-017, FR-018)

1. Log in (any email/password — no real auth).
2. **Expected**: Dashboard shows empty state prompting to create a career.
3. Click "Add Career", enter name "Software Engineering", save.
4. **Expected**: Career appears on dashboard with name.
5. Edit the career name to "CS Degree".
6. **Expected**: Name updates immediately.
7. Delete the career.
8. **Expected**: Confirmation dialog appears. Confirm. Career removed, empty state shown.

### V2: Course CRUD within Career (covers FR-005 to FR-009)

1. Create a career "Software Engineering".
2. Open the career, click "Add Course", enter name "Data Structures", save.
3. **Expected**: Course appears under the career.
4. Edit course: add teacher "Dr. Smith", save.
5. **Expected**: Teacher name displayed on course card.
6. Delete the course.
7. **Expected**: Confirmation dialog. Course removed from career.

### V3: Course Metadata (covers FR-006, FR-014)

1. Create a career and a course within it.
2. Open the course detail page.
3. Add a schedule entry: Monday, 09:00-10:30, Room 201.
4. **Expected**: Schedule entry displayed in course detail.
5. **Expected**: Dashboard shows the course with pending task count (0).

### V4: Resources — Notes and Links (covers FR-010, FR-011)

1. Open a course.
2. Add a note: title "Lecture 1 Notes", content "Today we covered trees...".
3. **Expected**: Note appears in resource list.
4. Add a link: title "Textbook", URL "https://example.com/book".
5. **Expected**: Link appears in resource list.
6. Filter by "notes" only.
7. **Expected**: Only the note is shown.
8. Filter by "links" only.
9. **Expected**: Only the link is shown.

### V5: Task Management (covers FR-012, FR-013)

1. Open a course.
2. Add a task: title "Assignment 1", due date "2026-09-15".
3. **Expected**: Task appears as pending in the task list.
4. **Expected**: Dashboard shows pending task count = 1 for this course.
5. Mark the task as complete.
6. **Expected**: Task moves to completed. Dashboard count = 0.
7. Mark the task as incomplete.
8. **Expected**: Task returns to pending. Dashboard count = 1.

### V6: Partners (covers FR-015)

1. Open a course.
2. Add partner "Alice".
3. **Expected**: "Alice" appears in partner list.
4. Add partner "Bob".
5. **Expected**: Both partners listed.
6. Remove "Alice".
7. **Expected**: Only "Bob" remains.

### V7: Dashboard Overview (covers FR-007, SC-003, SC-006)

1. Create 2 careers with 2 courses each.
2. Add tasks to some courses.
3. Navigate to dashboard.
4. **Expected**: All careers displayed, each showing nested courses.
5. **Expected**: Courses with pending tasks show the count.
6. **Expected**: Total load time under 1 second.

### V8: Data Persistence (covers FR-016, SC-005)

1. Create careers, courses, resources, tasks, partners.
2. Close the browser tab.
3. Reopen `http://localhost:5173`.
4. Log in.
5. **Expected**: All data (careers, courses, resources, tasks, partners)
   is present and unchanged.

### V9: Empty States (covers FR-017)

1. Clear all data (or use a fresh browser profile).
2. Log in.
3. **Expected**: Empty state message prompts to create first career.

### V10: Responsive Layout (covers NFR-003)

1. Resize browser to 320px width.
2. **Expected**: Layout adapts, all elements accessible.
3. Resize to 2560px width.
4. **Expected**: Layout uses available space, no broken layouts.

### V11: Keyboard Navigation (covers NFR-004)

1. Tab through the dashboard.
2. **Expected**: All interactive elements (buttons, inputs, links) are
   reachable via keyboard.
3. Press Enter on a button.
4. **Expected**: Action triggers correctly.
