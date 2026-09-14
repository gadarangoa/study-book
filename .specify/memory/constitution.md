<!--
Sync Impact Report
Version change: 0.0.0 → 1.0.0
Added sections: Core Principles (5), Technology Stack, Development Workflow, Governance
Modified principles: N/A (initial creation)
Removed sections: N/A
Follow-up TODOs: None
-->

# StudyBook Constitution

## Core Principles

### I. Component-First Architecture

Every feature MUST be built as a composable React component using shadcn/ui
primitives. Components MUST be self-contained, accept clear props, and follow
the existing shadcn patterns (FieldGroup for forms, semantic colors, cn()
for conditional classes). No raw divs with manual styling when a shadcn
component exists for the purpose.

### II. Type-Safe Data Modeling

All data structures (courses, notes, schedules, tasks, partners) MUST be
defined as TypeScript interfaces/types before implementation. No `any` types.
All API boundaries and local state MUST use strict typing. Data models MUST
be versioned when schema changes affect stored data.

### III. Offline-First with Local Persistence

The application MUST function without a backend. All data (courses, notes,
schedules, tasks) MUST persist in localStorage or IndexedDB. Sync features
are deferred until explicitly scoped. Data integrity MUST be maintained
across browser sessions.

### IV. Modular Feature Boundaries

Each feature area (Courses, Notes, Schedule, Tasks, Partners, LaTeX Editor)
MUST live in its own directory under `src/features/` with co-located
components, hooks, and types. Cross-feature imports MUST go through
public interfaces only — no reaching into another feature's internal
directory.

### V. Accessible by Default

All interactive elements MUST be keyboard navigable. Forms MUST use proper
labels, aria attributes, and validation patterns from shadcn. Dialogs and
overlays MUST include titles for screen reader access. Color MUST not be
the sole indicator of state.

## Technology Stack

| Layer | Technology | Rationale |
|-------|-----------|-----------|
| Framework | React 19 + Vite 8 | Fast SPA, excellent DX |
| UI | shadcn/ui v4 (base-lyra) | Consistent, composable, accessible |
| Styling | Tailwind CSS v4 | Utility-first, shadcn native |
| Routing | React Router v8 | Client-side navigation |
| Language | TypeScript 6 | Type safety across the codebase |
| Package Manager | pnpm | Fast, disk-efficient |
| LaTeX | KaTeX or MathJax (TBD) | Browser-native LaTeX rendering |

## Development Workflow

1. **Feature Planning** — Define the data model and component API before
   writing implementation code.
2. **Component Scaffolding** — Use `npx shadcn@latest add` for any needed
   UI primitives. Never hand-roll what shadcn provides.
3. **Co-location** — Keep feature code in `src/features/<name>/` with
   `components/`, `hooks/`, `types.ts` sub-structure.
4. **Lint & Typecheck** — Every commit MUST pass `pnpm lint` and
   `pnpm typecheck` with zero errors (shadcn registry warnings excluded).
5. **Manual Verification** — Run `pnpm dev` and verify the feature works
   in the browser before marking complete.

## Governance

This constitution is the authoritative reference for architectural decisions
in StudyBook. All code contributions MUST comply with the principles above.

- **Amendments** require updating this document with a version bump
  (MAJOR for principle removal/redefinition, MINOR for new principles,
  PATCH for clarifications) and a Sync Impact Report.
- **Compliance** is verified through `pnpm typecheck` and `pnpm lint`
  as automated gates, plus manual review against principle requirements.
- **Scope Creep** — Features not described in the project vision MUST
  be proposed as a constitution amendment before implementation begins.

**Version**: 1.0.0 | **Ratified**: 2026-09-02 | **Last Amended**: 2026-09-02
