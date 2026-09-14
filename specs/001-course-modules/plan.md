# Implementation Plan: Course Modules

**Branch**: `001-course-modules` | **Date**: 2026-09-02 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/001-course-modules/spec.md`

## Summary

Build a career → course hierarchy for organizing study content. Authenticated
users create careers (study programs), then add courses (asignatures) under each
career. Each course holds resources (notes, links), tasks, partners, and schedule
entries. All data persists in localStorage/IndexedDB. UI uses shadcn/ui v4
components with React Router v8 navigation.

## Technical Context

**Language/Version**: TypeScript 6, React 19

**Primary Dependencies**: shadcn/ui v4 (base-lyra), React Router v8, Tailwind CSS v4

**Storage**: IndexedDB (via a thin wrapper) — localStorage limits (5-10MB)
make IndexedDB the better choice for hierarchical data with relations.

**Testing**: Vitest + React Testing Library (to be added as dev dependency)

**Target Platform**: Modern browsers (Chrome 90+, Firefox 90+, Safari 15+, Edge 90+)

**Project Type**: SPA (Single Page Application)

**Performance Goals**: Dashboard load <1s, CRUD operations <300ms, responsive 320-2560px

**Constraints**: Offline-only (no backend), single-user per browser, <20 careers,
<100 courses total, <500 resources per course

**Scale/Scope**: Personal study tool, ~7 entity types, ~15 functional requirements

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principle | Status | Notes |
|-----------|--------|-------|
| I. Component-First Architecture | PASS | All UI via shadcn/ui primitives |
| II. Type-Safe Data Modeling | PASS | All entities as TypeScript interfaces, no `any` |
| III. Offline-First with Local Persistence | PASS | IndexedDB for all data, no backend |
| IV. Modular Feature Boundaries | PASS | `src/features/careers/`, `src/features/courses/`, etc. |
| V. Accessible by Default | PASS | shadcn patterns, ARIA, keyboard nav |

No violations detected. Proceeding to Phase 0.

## Project Structure

### Documentation (this feature)

```text
specs/001-course-modules/
├── plan.md              # This file
├── research.md          # Phase 0 output
├── data-model.md        # Phase 1 output
├── quickstart.md        # Phase 1 output
├── contracts/           # Phase 1 output (UI contracts)
└── tasks.md             # Phase 2 output (/speckit.tasks)
```

### Source Code (repository root)

```text
src/
├── features/
│   ├── careers/
│   │   ├── components/
│   │   │   ├── career-card.tsx
│   │   │   ├── career-form.tsx
│   │   │   └── career-list.tsx
│   │   ├── hooks/
│   │   │   └── use-careers.ts
│   │   ├── types.ts
│   │   └── index.ts
│   ├── courses/
│   │   ├── components/
│   │   │   ├── course-card.tsx
│   │   │   ├── course-form.tsx
│   │   │   ├── course-detail.tsx
│   │   │   └── course-list.tsx
│   │   ├── hooks/
│   │   │   └── use-courses.ts
│   │   ├── types.ts
│   │   └── index.ts
│   ├── resources/
│   │   ├── components/
│   │   │   ├── resource-list.tsx
│   │   │   ├── note-form.tsx
│   │   │   └── link-form.tsx
│   │   ├── hooks/
│   │   │   └── use-resources.ts
│   │   ├── types.ts
│   │   └── index.ts
│   ├── tasks/
│   │   ├── components/
│   │   │   ├── task-list.tsx
│   │   │   ├── task-form.tsx
│   │   │   └── task-item.tsx
│   │   ├── hooks/
│   │   │   └── use-tasks.ts
│   │   ├── types.ts
│   │   └── index.ts
│   └── partners/
│       ├── components/
│       │   ├── partner-list.tsx
│       │   └── partner-form.tsx
│       ├── hooks/
│       │   └── use-partners.ts
│       ├── types.ts
│       └── index.ts
├── lib/
│   ├── db.ts              # IndexedDB wrapper (thin CRUD layer)
│   └── utils.ts           # Existing cn() utility
├── hooks/
│   └── use-mobile.ts      # Existing
├── components/
│   ├── ui/                 # shadcn components (existing + additions)
│   ├── app-sidebar.tsx     # Updated with career navigation
│   └── theme-provider.tsx  # Existing
├── layouts/
│   └── app-layout.tsx      # Existing
├── pages/
│   ├── login.tsx           # Existing
│   └── dashboard.tsx       # Updated with career/course listing
├── App.tsx                 # Updated with new routes
├── main.tsx                # Existing
└── index.css               # Existing
```

**Structure Decision**: Feature-based co-location under `src/features/` per
Constitution Principle IV. Each feature has `components/`, `hooks/`, `types.ts`,
and a public `index.ts`. Cross-feature imports go through index files only.
Shared utilities live in `src/lib/`. UI primitives live in `src/components/ui/`.

## Complexity Tracking

No constitution violations. No complexity justifications needed.
