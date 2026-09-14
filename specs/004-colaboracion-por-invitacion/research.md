# Research: Trabajo Colaborativo por Invitación

**Feature**: `specs/004-colaboracion-por-invitacion` | **Date**: 2026-09-13
**Method**: inspección directa del repo (`src/lib/firebase.ts`, `src/lib/db.ts`, `src/features/auth/*`, `src/pages/team.tsx`, `src/pages/login.tsx`, `package.json`). Sin unknowns abiertos: todo el Technical Context se resolvió con evidencia local.

## D1 — Modelo de acceso compartido en Firestore

- **Decision**: dos colecciones nuevas, `invitations` y `courseMembers`; el campo `uid` existente de cada documento se interpreta como propietario; el aislamiento real lo imponen `firestore.rules` (inexistente hoy: `src/lib/db.ts` filtra por `uid` solo en cliente, lo cual no es seguridad ante invitados con otro `uid`).
- **Rationale**: el acceso es por asignatura y por identidad (correo autenticado). Una colección de membresías permite "cursos visibles para mí = propios + aquellos con membresía" con queries indexables; la invitación separada permite estados (pendiente/aceptada/expirada/revocada) y reenvío sin tocar membresías.
- **Alternatives considered**:
  - Custom claims (`courseIds` en el token): rechazado — requiere backend con Admin SDK para fijar claims y el token tarda en refrescar (rompe SC-005, revocación <1 min).
  - Duplicar el curso por invitado: rechazado — diverge documentos y rompe SC-004 (aportes visibles al equipo) y la autoría única.
  - Reutilizar `partners` (nombres locales por curso): rechazado — `src/features/partners/types.ts` no tiene identidad ni email; es etiqueta de portada, no acceso.

## D2 — Envío del correo de invitación

- **Decision**: Firebase Trigger Email extension (escribe un doc en colección `mail`; la extensión lo envía vía SMTP/SendGrid configurado en consola). Sin código de servidor propio en v1.
- **Rationale**: el repo no tiene backend ni funciones; la extensión es el camino serverless oficial, con reintentos y plantilla Handlebars. El remitente y proveedor se configuran en consola Firebase (fuera del código).
- **Alternatives considered**:
  - Cloud Function `onCreate(invitations)` + Resend/SendGrid API: alternativa válida y más testeable; se adopta como plan B si la extensión no está disponible en el proyecto Firebase.
  - EmailJS/llamada SMTP desde el cliente: rechazado — expone credenciales y permite forjar invitaciones (rompe FR-004/FR-007).

## D3 — Reclamo de acceso (aceptar invitación)

- **Decision**: batch transaccional desde cliente — `create(courseMembers)` + `update(invitation → accepted)` en un `writeBatch`, autorizado por reglas que verifican: invitación `pending`, `expiresAt > request.time`, y `request.auth.token.email.lower() == invitation.emailLower`. El token es el ID aleatorio del doc de invitación (no secuencial, no adivinable).
- **Rationale**: sin backend propio, las reglas son el único enforcement atómico disponible; `auth.token.email` está presente porque el login es email+password (`src/pages/login.tsx`). La verificación de expiración en reglas impide aceptar enlaces viejos aunque la UI falle.
- **Alternatives considered**:
  - Cloud Function callable `acceptInvite`: más robusta (valida y reclama en servidor), pero añade despliegue; reservada como endurecimiento futuro.
  - Marcar aceptada solo en cliente sin reglas: rechazado — cualquier usuario podría auto-otorgarse acceso (viola SC-003).

## D4 — Visibilidad "solo la asignatura invitada"

- **Decision**: el dashboard/listas consultan `courses where uid == me` (propios, como hoy) UNION `courseMembers where uid == me → get(courseId)` (compartidos). Las reglas deniegan `get/list` de cursos, documentos, recursos, tareas y miembros salvo propietario o miembro. La ruta `/invite/:token` es pública (fuera de `ProtectedRoute`, como `/login` en `src/App.tsx`): resuelve la invitación, exige auth (redirige a `/login?redirect=/invite/:token` si falta) y reclama.
- **Rationale**: reutiliza el patrón de rutas existente; la denegación vive en servidor (reglas), el cliente solo compone la unión para UX. Los invitados nunca reciben listados globales.
- **Alternatives considered**: filtrar en cliente y confiar en ocultar enlaces — rechazado, viola SC-003 ante URLs adivinadas (edge case del spec).

## D5 — UI y roles

- **Decision**: extender `TeamPage` (`/courses/:courseId/team`, ya existe) con diálogo de invitación + listas de miembros/pendientes; nueva `InviteAcceptPage`; rol fijo `owner | collaborator` (sin solo-lectura en v1, per spec). Componentes shadcn existentes (`Dialog`, `Card`, `Input`, `Button`, `Badge`); formularios con `Label` y región aria-live para errores, siguiendo `login.tsx`.
- **Rationale**: la página de equipo ya es el contexto "miembros del equipo" del spec; el invitado necesita una landing pública de aceptación separada del dashboard protegido.
- **Alternatives considered**: invitar desde el detalle del curso — rechazado como ubicación primaria porque `/team` ya concentra gestión de equipo; se enlaza desde el detalle hacia `/team`.

## D6 — Desarrollo y verificación local

- **Decision**: emuladores Firebase (Auth :9099, Firestore :8080) ya cableados en `src/lib/firebase.ts` con `VITE_USE_FIREBASE_EMULATORS=true`; reglas se prueban contra el emulador; gates `pnpm typecheck` + `pnpm lint`; sin framework de tests en el repo (no se añade runner en esta feature).
- **Rationale**: el repo ya trae el cableado de emuladores y los gates de constitución; añadir Vitest/Playwright excede el alcance del spec y se propone como follow-up.
- **Alternatives considered**: tests E2E automatizados — diferidos; `quickstart.md` define escenarios manuales trazables a cada criterio de aceptación.
