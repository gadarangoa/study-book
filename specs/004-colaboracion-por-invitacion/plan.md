# Implementation Plan: Trabajo Colaborativo por Invitación

**Branch**: `004-colaboracion-por-invitacion` | **Date**: 2026-09-13 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/004-colaboracion-por-invitacion/spec.md`

## Summary

El propietario de una asignatura invita por correo a su equipo; los invitados se autentican con Firebase Authentication, aceptan desde un enlace con vigencia y obtienen acceso aislado a esa única asignatura para aportar en el editor de documentos. Enfoque técnico: dos colecciones Firestore nuevas (`invitations`, `courseMembers`), reglas de seguridad Firestore como enforcement real del aislamiento (el filtrado por `uid` actual del cliente no es seguridad), envío de correo vía Firebase Trigger Email extension (colección `mail`, sin servidor propio), reclamo de acceso con batch transaccional validado por reglas (`request.auth.token.email` vs. correo invitado), y UI nueva en `src/features/collaboration/` extendiendo la ruta existente `/courses/:courseId/team` más una página pública `/invite/:token`.

## Technical Context

**Language/Version**: TypeScript 6, React 19 + Vite 8 (stack existente del repo, ver `package.json`)

**Primary Dependencies**: `firebase` ^12.18.0 (Auth + Firestore, ya integrados en `src/lib/firebase.ts`), `react-router` ^8.3.1, shadcn/ui v4, Tailwind CSS v4. Editor TipTap/KaTeX: sin cambios.

**Storage**: Cloud Firestore — colecciones nuevas `invitations` y `courseMembers` (+ `mail` para la Trigger Email extension). Los documentos existentes (`courses`, `apaDocuments`, etc.) conservan su campo `uid` como propietario. Sin IndexedDB nuevo; `localStorage` solo para tema.

**Testing**: Sin runner automatizado en el repo. Verificación: `pnpm dev` con emuladores Firebase (Auth :9099, Firestore :8080, ya cableados vía `VITE_USE_FIREBASE_EMULATORS=true`), más gates `pnpm typecheck` y `pnpm lint`. Ver [quickstart.md](./quickstart.md).

**Target Platform**: Web SPA, navegadores modernos, desktop-first (igual que el producto actual).

**Project Type**: Web application — frontend único + Firebase como backend-as-a-service (sin servidor propio).

**Performance Goals**: Correo de invitación entregado en <2 min en 95% (SC-001); revocación efectiva en <1 min en 99% (SC-005); 90% de aceptaciones al primer intento sin ayuda (SC-002).

**Constraints**: Aislamiento total por asignatura impuesto en servidor (reglas Firestore, SC-003); enlace de un solo uso efectivo con vigencia de 7 días; el correo invitado es la identidad de acceso (debe coincidir con `auth.token.email`); invitados no pueden eliminar la asignatura ni invitar/revocar; colaboración asíncrona (tiempo real fuera de alcance).

**Scale/Scope**: Equipos de 2–20 colaboradores por asignatura; 2 colecciones nuevas, 1 ruta pública nueva (`/invite/:token`), extensión de 1 página existente (`TeamPage`); 3 historias de usuario del spec.

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

- **I. Component-First** — PASS. Nueva UI (diálogo de invitación, listas de miembros/invitaciones) con primitivos shadcn (`Dialog`, `Field`/`Input`, `Button`, `Badge`); sin estilos manuales donde exista primitivo.
- **II. Type-Safe Data Modeling** — PASS. `src/features/collaboration/types.ts` con `Invitation`, `CourseMember`, estados y transiciones antes de implementar; prohibido `any` en bordes Firestore.
- **III. Offline-First with Local Persistence** — VIOLATION JUSTIFICADA (ver Complexity Tracking). Los datos propios mantienen el modelo actual; los datos compartidos son remotos por definición. El spec lo exige explícitamente (Firebase Auth + invitación por correo).
- **IV. Modular Feature Boundaries** — PASS. Nuevo módulo `src/features/collaboration/` (`components/`, `hooks/`, `types.ts`); consumo de `courses`/`documents` solo vía sus interfaces públicas (`@/lib/db`, tipos exportados); reglas Firestore versionadas como contrato en `contracts/`.
- **V. Accessible by Default** — PASS. `Dialog` con título para lector de pantalla, `Label` en cada campo, errores con región aria-live, estados (pendiente/aceptada/expirada/revocada) con texto + icono, nunca solo color.

**Gates**: sin violaciones injustificadas → se procede a Phase 0.

## Project Structure

### Documentation (this feature)

```text
specs/004-colaboracion-por-invitacion/
├── plan.md              # This file (/speckit.plan command output)
├── research.md          # Phase 0 output (/speckit.plan command)
├── data-model.md        # Phase 1 output (/speckit.plan command)
├── quickstart.md        # Phase 1 output (/speckit.plan command)
├── contracts/           # Phase 1 output (/speckit.plan command)
│   ├── invitations.md   # Ciclo de vida y operaciones de invitación
│   ├── access-rules.md  # Matriz de acceso + reglas Firestore
│   └── email-and-routes.md # Plantilla de correo y ruta /invite/:token
└── tasks.md             # Phase 2 output (/speckit.tasks command - NOT created by /speckit.plan)
```

### Source Code (repository root)

```text
src/
├── features/
│   ├── collaboration/            # NUEVO módulo (esta feature)
│   │   ├── types.ts              # Invitation, CourseMember, estados
│   │   ├── hooks/
│   │   │   ├── use-invitations.ts  # CRUD invitaciones por curso
│   │   │   ├── use-members.ts      # Miembros + cursos compartidos
│   │   │   └── use-accept-invite.ts # Flujo de aceptación por token
│   │   ├── components/
│   │   │   ├── invite-dialog.tsx   # Formulario de invitación (shadcn Dialog)
│   │   │   ├── member-list.tsx     # Miembros activos + revocar
│   │   │   └── invitation-list.tsx # Pendientes + reenviar
│   │   └── index.ts                # Interfaz pública del módulo
│   ├── courses/                    # SIN CAMBIOS (consumo vía @/lib/db)
│   ├── documents/                  # Solo atribución de aporte (meta updatedBy)
│   ├── partners/                   # SIN CAMBIOS (teamName local, distinto de acceso)
│   └── auth/                       # Reúso useAuth/AuthProvider existentes
├── pages/
│   ├── team.tsx                    # EXTENDER: pestaña invitar + listas
│   └── invite-accept.tsx           # NUEVA ruta pública /invite/:token
├── lib/
│   ├── db.ts                       # EXTENDER: helpers invitations/courseMembers
│   └── firebase.ts                 # SIN CAMBIOS
└── App.tsx                         # NUEVA ruta /invite/:token (fuera de ProtectedRoute)

firestore.rules                      # NUEVO: aislamiento por asignatura
```

**Structure Decision**: Aplicación web de proyecto único (frontend + Firebase BaaS). Sin backend propio: la Trigger Email extension y las reglas Firestore cubren envío y autorización. El enforcement real vive en `firestore.rules`; el cliente solo filtra para UX.

## Complexity Tracking

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| III. Offline-First: invitaciones, membresías y aportes compartidos viven en Firestore remoto, no en persistencia local | El spec exige invitación por correo + auth Firebase + aportes visibles al equipo; el estado compartido entre distintos `uid` no puede resolverse en `localStorage` de un solo navegador | Mantener todo local haría imposible que un invitado (otro navegador/cuenta) vea la asignatura o sus aportes; duplicar datos por invitado rompería SC-004 (aportes visibles al equipo) y el aislamiento auditable |
| Sin Cloud Functions propias en v1 (reclamo vía batch cliente + reglas) | Evita operar un backend para un flujo que las reglas Firestore pueden autorizar atómicamente comparando `auth.token.email` con la invitación | Una Function de reclamo añade despliegue/monitoreo; se reserva como endurecimiento futuro si la revisión de seguridad lo exige |

## Post-Design Constitution Re-check (Phase 1)

- **I** — PASS: `invite-dialog.tsx`, `member-list.tsx`, `invitation-list.tsx` ma açısından shadcn; la página `/invite/:token` usa `Card` existente como en `login.tsx`.
- **II** — PASS: [data-model.md](./data-model.md) define todas las interfaces antes de implementar; contratos en `contracts/` fijan estados y transiciones.
- **III** — Excepción de alcance confirmada y acotada: solo `invitations`/`courseMembers`/aportes compartidos son remotos; carreras, cursos propios y borradores locales conservan el modelo actual.
- **IV** — PASS: todo lo nuevo vive en `src/features/collaboration/` + `pages/invite-accept.tsx`; `partners` (nombres de equipo locales) no se mezcla con acceso real.
- **V** — PASS: contratos exigen títulos de diálogo, labels y mensajes de estado textuales (ver `contracts/email-and-routes.md` y `quickstart.md` escenarios de accesibilidad por teclado).
