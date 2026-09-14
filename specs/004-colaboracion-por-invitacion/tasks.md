# Tasks: Trabajo Colaborativo por Invitación

**Input**: Design documents from `/specs/004-colaboracion-por-invitacion/`

**Prerequisites**: plan.md (required), spec.md (required for user stories), research.md, data-model.md, contracts/

**Tests**: No test framework in repo (none configured). Tests are OPTIONAL and not included per spec. See `quickstart.md` for manual validation scenarios.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

## Path Conventions

- Single project: `src/`, `tests/` at repository root (no tests in this feature)
- Frontend: `src/features/<name>/`, `src/pages/`
- Paths shown below assume single project (plan.md structure)

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization and basic structure for the collaboration feature

- [x] T001 Create feature module directory `src/features/collaboration/` with `components/`, `hooks/`, `types.ts` and `index.ts` per Constitution IV (modular feature boundaries)
- [x] T002 Create `src/features/collaboration/types.ts` with `Invitation`, `InvitationStatus`, `CourseMember`, `MemberRole`, `CourseAccess`, `SharedCourseView` interfaces (Constitution II: type-safe data modeling)
- [x] T003 Create `firestore.rules` with `isOwner(courseId)`, `isMember(courseId)`, `emailLower()` helpers and the access matrix defined in `contracts/access-rules.md`
- [x] T004 [P] Add Firestore indexes for `courseMembers(uid)`, `courseMembers(courseId)`, `invitations(courseId, emailLower, status)` in `firestore.indexes.json`
- [x] T005 [P] Extend `src/lib/db.ts` with `getInvitations(courseId)`, `getCourseMembers(courseId)`, `createInvitation()`, `createCourseMember()`, `updateInvitation()`, `removeCourseMember()`, `deleteCourseCascade` extensions for the two new collections

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure that MUST be complete before ANY user story can be implemented

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [x] T006 Extend `src/App.tsx` to add public route `/invite/:token` outside `ProtectedRoute` (mirrors `/login` pattern), importing `InviteAcceptPage`
- [ ] T007 Extend `src/lib/firebase.ts` if needed for Trigger Email extension collection `mail` access; confirm `VITE_USE_FIREBASE_EMULATORS=true` works for Firestore rules testing against emulators (Auth :9099, Firestore :8080)
- [ ] T008 Deploy/update `firestore.rules` and `firestore.indexes.json` to the Firebase project (or emulators) so `contracts/access-rules.md` enforcement is live
- [ ] T009 Configure Firebase Trigger Email extension (collection `mail`, SMTP/SendGrid sender, Spanish template matching `contracts/email-and-routes.md`) in the Firebase console; verify a doc written to `mail` triggers delivery

**Checkpoint**: Foundation ready — user story implementation can now begin

---

## Phase 3: User Story 1 - Invitar colaboradores a una asignatura (Priority: P1) 🎯 MVP

**Goal**: Propietario puede invitar por correo a un miembro del equipo desde la vista de la asignatura; la invitación queda registrada como pendiente y el destinatario recibe el correo con enlace de aceptación (US1; FR-001/002/003/004/005; SC-001)

**Independent Test**: Abrir una asignatura propia, enviar invitación a `guest@ejemplo.com`, verificar la invitación en "Pendientes" y que el correo llega en <2 min con asignatura, quién invita y enlace `/invite/<token>`.

### Implementation for User Story 1

- [x] T010 [P] [US1] Create `src/features/collaboration/hooks/use-invitations.ts` with `sendInvitation(courseId, email)`, `resendInvitation(invitationId)`, `pendingInvitations(courseId)` operations using `src/lib/db.ts` helpers; validates email format (FR-002) and prevents duplicates (FR-003) before creating
- [x] T011 [P] [US1] Create `src/features/collaboration/hooks/use-members.ts` with `activeMembers(courseId)` returning `CourseMember[]` with role and date; `removeMember(courseId, uid)` with owner-only guard (FR-010)
- [x] T012 [US1] Create `src/features/collaboration/components/invite-dialog.tsx` with shadcn `Dialog`, `FieldGroup`/`Input`, `Button`, `Label`; validates email format client-side, shows `duplicate-active` or `invalid-email` error messages in an `aria-live` region; on submit calls `sendInvitation` and triggers the Firestore doc that enqueues the Trigger Email (FR-001/002/003/005)
- [x] T013 [US1] Extend `src/pages/team.tsx` (`/courses/:courseId/team`) to render `InviteDialog` (owner only) and two sections: `InvitationList` (pendientes con reenvío) and `MemberList` (activos con revocación con confirmación); integrate `use-invitations` and `use-members` hooks (FR-011/012)
- [x] T014 [US1] Create `src/features/collaboration/components/invitation-list.tsx` showing pending invitations with email, expiry, `resendCount`, reenviar action (resend invokes `resendInvitation` and extends `expiresAt` + 7d)
- [x] T015 [US1] Create `src/features/collaboration/components/member-list.tsx` showing active members with name/email, role, date, and a Revocar button (owner only, confirmation modal, calls `removeMember`)
- [x] T016 [US1] Wire the Firebase `mail` collection write: `sendInvitation` creates the `Invitation` doc and, in the same `writeBatch`, writes a `mail` doc with the template from `contracts/email-and-routes.md` (subject in Spanish, link `/invite/<token>`, invitedByEmail, courseName) (FR-004/005)
- [x] T017 [US1] Add `role` field to `CourseMember` default (`"collaborator"`) and `Course` ownership display in `TeamPage` (owner badge) so UI can hide/show invite controls (FR-010)

**Checkpoint**: User Story 1 is fully functional and testable independently — owner can invite, see pending, see active members, and the invitee receives the email

---

## Phase 4: User Story 2 - Aceptar invitación y acceder solo a la asignatura invitada (Priority: P1)

**Goal**: Miembro invitado acepta desde el correo, se autentica con Firebase Auth, y accede únicamente a la asignatura invitada para editar documentos (US2; FR-006/007/008/009/013/014; SC-002/003/004)

**Independent Test**: En navegación privada, abrir el enlace del correo, completar login con el correo invitado, verificar que solo se ve esa asignatura y que editar un documento guarda con autoría visible.

### Implementation for User Story 2

- [x] T018 [P] [US2] Create `src/pages/invite-accept.tsx` (public route, outside `ProtectedRoute`) resolving `/invite/:token`: reads invitation doc, renders `loading/valid/accepted/expired/revoked/wrong-email/not-found` states with `aria-live` regions; if no session redirects to `/login?redirect=/invite/:token`; if `auth.token.email.lower() !== invitation.emailLower` shows `wrong-email` (FR-006/007/013)
- [x] T019 [P] [US2] Create `src/features/collaboration/hooks/use-accept-invite.ts` implementing the batch transaction: `create(courseMembers/{courseId_uid})` + `update(invitation → accepted, acceptedAt, acceptedByUid)` via `src/lib/db.ts`; wraps in Firestore `writeBatch` and relies on `firestore.rules` to enforce `pending`, `expiresAt > request.time`, `request.auth.token.email.lower() == invitation.emailLower` (FR-007; D3 batch decision)
- [x] T020 [US2] Extend `src/lib/db.ts` with `getSharedCourses(uid)` returning courses where the user is an `owner` (via `courses.uid`) OR `collaborator` (via `courseMembers.uid`), enabling the dashboard to compose the union for "cursos visibles para mí" per D4 (FR-008)
- [x] T021 [US2] Extend `src/features/courses/types.ts` or `src/features/collaboration/types.ts` with `updatedByUid` and `updatedByEmail` on `ApaFormDocument`-related writes; add `updatedBy*` capture to the document-save flow so each aporte registers authorship (FR-014)
- [x] T022 [US2] Ensure `courseMembers` deletion on revoke immediately blocks Firestore reads via rules (SC-005, <1 min); verify `getSharedCourses` reflects removal instantly
- [x] T023 [US2] Validate that the invited collaborator can list, open and edit documents of the shared course in the existing editor (TipTap) and that saves persist with `updatedBy*` attribution; confirm the owner sees the aporte after reload (FR-009/014; SC-004)

**Checkpoint**: User Story 2 works independently — invitee accepts, accesses only that course, and edits documents with visible authorship

---

## Phase 5: User Story 3 - Gestionar y revocar accesos (Priority: P2)

**Goal**: Propietario reenvía invitaciones pendientes y retira el acceso a colaboradores activos (US3; FR-011/012/013; SC-005)

**Independent Test**: Como propietario, reenviar una invitación pendiente (nuevo correo, resendCount++), revocar un colaborador (confirmación, acceso perdido en <1 min), abrir enlace expirado/revocado (mensaje explicativo).

### Implementation for User Story 3

- [x] T024 [P] [US3] Extend `use-invitations.ts` with `resendInvitation(invitationId)` that checks `status == "pending"` or `status == "expired"`, updates `expiresAt = now + 7d`, `resendCount++`, `status = "pending"`, and re-enqueues a new `mail` doc; rejects `accepted`/`revoked` states with a clear message (FR-013)
- [x] T025 [P] [US3] Extend `use-members.ts` `removeMember(courseId, uid)` to require owner guard and `confirm` dialog; deletes the `courseMembers` doc and returns immediately so rules deny access on next read (SC-005, <1 min) (FR-012)
- [x] T026 [US3] Extend `invitation-list.tsx` to show `resendCount` and allow reenviar (calls `resendInvitation`), and `member-list.tsx` to show Revocar with confirmation calling `removeMember` (FR-011/012)
- [x] T027 [US3] Extend `invite-accept.tsx` to render `expired` and `revoked` states clearly ("Esta invitación venció el <fecha>. Pide al propietario que la reenvíe." / "Esta invitación fue retirada por el propietario.") with a link back to the course for the owner (FR-013)
- [x] T028 [US3] Verify cascade: delete a course (extends existing `deleteCourseCascade` in `src/lib/db.ts`) also deletes its `invitations` and `courseMembers`; confirm pending links show `not-found`/revoked status (edge case)

**Checkpoint**: User Story 3 works independently — owner can reenviar, revocar, and expired/revoked links show explanatory states

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Improvements that affect multiple user stories

- [x] T029 [P] Extend `src/lib/db.ts` `deleteCourseCascade` to explicitly delete `invitations` and `courseMembers` docs for the course (and handle `mail` docs if deletable), covering the "propietario elimina la asignatura" edge case
- [ ] T030 [P] Add accessibility audit pass for `invite-dialog.tsx`, `invite-accept.tsx`, `member-list.tsx`, `invitation-list.tsx`: keyboard-only navigation, focus management, `aria-describedby` for expiry, `aria-live` for status changes; verify no color-only indicators (Constitución V)
- [x] T031 Run `pnpm typecheck` and `pnpm lint` with zero errors; fix any type issues in `src/features/collaboration/` and `src/pages/invite-accept.tsx`
- [ ] T032 [P] Cross-story validation against `quickstart.md`: run scenarios E1–E4 manually (invite → accept → isolate → revoke → reenviar → expired/revoked) and confirm SC-001 through SC-005
- [ ] T033 Document in `README` or feature `notes` the known gap: no Cloud Function for invite sending (Trigger Email extension used as primary); plan B documented in `research.md` D2

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies — can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion — BLOCKS all user stories
- **User Stories (Phase 3–5)**: All depend on Foundational completion
  - US1 and US2 share the foundational infrastructure but are independently testable
  - US3 depends on US1 and US2 being implemented (needs invite flow and acceptance to exist to manage/revoke)
- **Polish (Phase 6)**: Depends on all desired user stories being complete

### User Story Dependencies

- **User Story 1 (P1)**: Can start after Foundational — no dependencies on other stories; MVP candidate
- **User Story 2 (P1)**: Can start after Foundational — depends on US1 infrastructure (invitation doc exists to accept); independently testable with a manually seeded invitation
- **User Story 3 (P2)**: Can start after US1 and US2 — needs invite flow and acceptance in place

### Within Each User Story

- Models/types before hooks
- Hooks before components
- Components before page integration
- Core implementation before edge cases

### Parallel Opportunities

- **Setup**: T002, T003, T004, T005 marked [P] — different files, run in parallel
- **Foundational**: T006, T007, T009 marked [P] — different files, run in parallel
- **US1 models/hooks**: T010, T011 marked [P] — different files
- **US2 pages/hooks**: T018, T019 marked [P] — different files
- **US3 hooks**: T024, T025 marked [P] — different files
- **Different stories**: US1 and US2 can be parallel after Foundational if team capacity allows; US3 sequential after US1/US2

---

## Parallel Example: User Story 1

```bash
# Launch all hooks for US1 together:
Task: "Create use-invitations.ts in src/features/collaboration/hooks/use-invitations.ts"
Task: "Create use-members.ts in src/features/collaboration/hooks/use-members.ts"

# Launch all components for US1 together:
Task: "Create invite-dialog.tsx in src/features/collaboration/components/invite-dialog.tsx"
Task: "Create invitation-list.tsx in src/features/collaboration/components/invitation-list.tsx"
Task: "Create member-list.tsx in src/features/collaboration/components/member-list.tsx"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup (T001–T005)
2. Complete Phase 2: Foundational (T006–T009)
3. Complete Phase 3: User Story 1 (T010–T017)
4. **STOP and VALIDATE**: Invite a test user, verify email delivery, confirm invitation recorded as pending (E1 from `quickstart.md`)
5. Deploy/demo if ready

### Incremental Delivery

1. Setup + Foundational → Foundation ready
2. Add US1 → Test independently → Deploy/Demo (MVP: owner can invite)
3. Add US2 → Test independently → Deploy/Demo (invitee can accept and edit)
4. Add US3 → Test independently → Deploy/Demo (owner can manage/revoke)
5. Polish → Typecheck/lint, accessibility audit, edge cases

### Parallel Team Strategy

With multiple developers:
1. Team completes Setup + Foundational together (T001–T009)
2. Once Foundational is done:
   - Developer A: User Story 1 (T010–T017)
   - Developer B: User Story 2 (T018–T023)
3. Stories complete and integrate independently
4. Developer C: User Story 3 (T024–T028) after US1/US2 merge

---

## Notes

- [P] tasks = different files, no dependencies
- [Story] label maps task to specific user story for traceability (US1, US2, US3)
- Each user story should be independently completable and testable
- No test runner in repo → tests are manual via `quickstart.md`; tasks reflect implementation only
- Verify `pnpm typecheck` and `pnpm lint` pass after each phase
- Firestore rules are the enforcement layer — never rely on client-side filtering alone (SC-003, FR-008/010)
- Commit after each task or logical group
- Stop at any checkpoint to validate story independently
- Avoid: vague tasks, same-file conflicts, cross-story dependencies that break independence