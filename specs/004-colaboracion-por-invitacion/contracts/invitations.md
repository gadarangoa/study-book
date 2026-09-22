# Contract: Ciclo de Vida de Invitaciones

**Feature**: `specs/004-colaboracion-por-invitacion` | **Date**: 2026-09-13

Operaciones sobre la colección `invitations` (ver [data-model.md](../data-model.md)). Todas requieren usuario autenticado salvo la lectura del enlace de aceptación.

## sendInvitation(courseId, email, courseName)

- **Pre**: actor es propietario del curso (`course.uid == auth.uid` o membresía `owner`); `email` con formato válido; no existe invitación `pending` ni membresía activa para `(courseId, emailLower)`.
- **Post**: se crea `Invitation` en `pending` con `courseName` y `expiresAt = now + 7d`; se devuelve un enlace `/invite/{token}` para copiar y compartir; la invitación aparece en el listado de pendientes del curso.
- **Errores**: `invalid-email` (mensaje claro, sin registro) · `duplicate-active` (informa el estado existente) · `not-owner` (denegado).

## renewInvitation(invitationId)

- **Pre**: invitación en `pending` (o `expired` → se reactiva); actor propietario.
- **Post**: `expiresAt = now + 7d`, `resendCount++`, `status = pending`; se devuelve el mismo enlace `/invite/{token}` para volver a compartirlo.
- **Errores**: `already-accepted` / `revoked` (no reenviables; se informa y se ofrece crear una nueva).

## revokeInvitation(invitationId) / removeMember(courseId, uid)

- **Pre**: actor propietario; confirmación explícita en UI.
- **Post**: invitación → `revoked` (+ `revokedAt`); membresía eliminada de inmediato — el curso desaparece de la vista del colaborador en <1 min (SC-005). El enlace antiguo muestra estado explicativo.
- **Errores**: `not-owner` · `member-not-found` (idempotente: revocar dos veces no falla).

## acceptInvitation(token)

1. Lectura pública del doc `invitations/{token}` (única lectura no autenticada del módulo; solo expone `courseName`, `invitedByEmail`, `status`, `expiresAt`).
2. Si `status != pending` o `now > expiresAt` → pantalla de estado (`expired`/`revoked`/`accepted`) con instrucciones, sin acceso.
3. Si no hay sesión → `/login?redirect=/invite/{token}`; tras auth, volver al paso 4. Si la cuenta autenticada tiene email distinto al invitado → mensaje "esta invitación es para {email}" sin otorgar acceso (FR-007).
4. Batch atómico: `create(courseMembers/{courseId_uid})` + `update(invitation → accepted, acceptedAt, acceptedByUid)`. Las reglas validan vigencia, coincidencia de email y un solo uso efectivo (ID de membresía determinista).
5. Redirección a `/courses/{courseId}` (vista limitada a esa asignatura + editor).

## Listados (propietario)

- `pendingInvitations(courseId)`: `where courseId, status == pending`, ordenadas por `createdAt desc`; el enlace se reconstruye como `${window.location.origin}/invite/${invitationId}`.
- `activeMembers(courseId)`: `where courseId`, con rol y fecha; el propietario distingue su fila (`owner`, sin acción de revocar sobre sí mismo).
