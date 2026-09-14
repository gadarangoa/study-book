# Data Model: Trabajo Colaborativo por Invitación

**Feature**: `specs/004-colaboracion-por-invitacion` | **Date**: 2026-09-13
Fuente: entidades del spec (Asignatura, Invitación, Colaborador, Documento colaborativo) + tipos existentes (`Course`, `ApaFormDocument`, `Partner`).

> Convención: fechas en ISO-8601 (`new Date().toISOString()`), como los tipos actuales. Emails siempre normalizados a minúsculas en `emailLower` para comparación en reglas.

## Invitation (colección `invitations`, doc ID = token aleatorio)

```ts
type InvitationStatus = "pending" | "accepted" | "expired" | "revoked";

interface Invitation {
  id: string;               // token del enlace /invite/:id (generado por Firestore)
  courseId: string;         // asignatura destino (una sola, FR-004)
  courseName: string;       // snapshot para el correo y la página de aceptación
  email: string;            // correo destinatario tal como se ingresó
  emailLower: string;       // normalizado; identidad de acceso (FR-007)
  invitedByUid: string;     // propietario que invita
  invitedByEmail: string;   // para mostrar "quién invita" (FR-005)
  status: InvitationStatus;
  createdAt: string;
  expiresAt: string;        // createdAt + 7 días (renovable vía reenvío)
  acceptedAt?: string;
  acceptedByUid?: string;
  revokedAt?: string;
  resendCount: number;      // n.º de reenvíos
}
```

**Validación**: `email` con formato válido (FR-002, validación cliente + regla `matches` básica); unicidad activa por `(courseId, emailLower)` con `status == pending` o membresía activa existente (FR-003, verificado con query antes de crear); `expiresAt > createdAt`.

**Transiciones**: `pending → accepted` (reclamo con email coincidente y vigente) · `pending → revoked` (propietario) · `pending → expired` (derivada: `now > expiresAt`, evaluada en reglas y UI; sin job periódico en v1) · `expired → pending` vía reenvío (nuevo `expiresAt`, `resendCount++`). `accepted` y `revoked` son terminales. Un enlace `expired/revoked` muestra mensaje explicativo y no otorga acceso (FR-013).

**Índices Firestore**: `courseId + emailLower + status` (detección de duplicados y listado por curso); lectura por ID para `/invite/:token`.

## CourseMember (colección `courseMembers`, doc ID = `${courseId}_${uid}`)

```ts
type MemberRole = "owner" | "collaborator";

interface CourseMember {
  id: string;               // `${courseId}_${uid}`, idempotente ante doble aceptación
  courseId: string;
  uid: string;              // usuario autenticado (Firebase Auth)
  email: string;
  emailLower: string;
  role: MemberRole;         // owner = creador; collaborator = invitado aceptado
  addedAt: string;
  addedByUid: string;       // propietario que invitó (o el propio owner al crear)
}
```

**Validación**: creación permitida solo si (a) el creador es el propietario del curso (rol `owner`, p. ej. migración inicial), o (b) batch de reclamo con invitación `pending` vigente y `auth.token.emailLower == invitation.emailLower` (FR-007). Borrado solo por el propietario del curso (FR-012, revocación efectiva inmediata). Los colaboradores no pueden crear ni borrar membresías (FR-010).

**Índices**: `uid` (cursos compartidos visibles para mí), `courseId` (miembros de un curso).

## Asignatura compartida (sin colección nueva)

`Course` conserva su forma (`src/features/courses/types.ts`); `uid` existente = propietario. Vista de acceso:

```ts
type CourseAccess = "owner" | "collaborator";
interface SharedCourseView {
  course: Course;
  access: CourseAccess;     // owner si course.uid == me, si no collaborator vía membresía
}
```

**Reglas de visibilidad**: propietario ve y gestiona todo (incl. eliminar e invitar/revocar); colaborador ve la asignatura y sus documentos/recursos/tareas asociados, puede editar documentos (FR-009), no puede eliminar la asignatura ni gestionar accesos (FR-010); terceros no ven ni metadatos (las reglas deniegan `get`).

## Documento colaborativo (extensión de metadatos)

`ApaFormDocument` conserva su forma (`src/features/documents/types.ts`); se añade atribución del último aporte:

```ts
interface ContributionAttribution {
  updatedByUid: string;
  updatedByEmail: string;
  updatedAt: string;        // ya existe como updatedAt; se suma autoría
}
```

**Regla**: cada escritura de un documento de curso compartido exige membresía (propietario o colaborador) y registra `updatedBy*` (FR-014). Sin resolución de conflictos en tiempo real (colaboración asíncrona, fuera de alcance).

## Relaciones

```text
Course (1) ──< Invitation (N)   por courseId; invitación apunta a UN curso
Course (1) ──< CourseMember (N) por courseId; (courseId, uid) único
Invitation (1) ──> CourseMember (0..1)  el reclamo crea la membresía y cierra la invitación
CourseMember (N) ──> ApaFormDocument   vía courseId; la escritura exige membresía
```

**Cascada**: al eliminar un curso se borran sus `invitations` y `courseMembers` (extiende `deleteCourseCascade` en `src/lib/db.ts`); los enlaces pendientes dejan de ser válidos (edge case del spec).
