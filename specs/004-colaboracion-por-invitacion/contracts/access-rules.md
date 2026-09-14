# Contract: Control de Acceso (Reglas Firestore)

**Feature**: `specs/004-colaboracion-por-invitacion` | **Date**: 2026-09-13

El aislamiento por asignatura (SC-003, FR-008/FR-010) se impone en `firestore.rules`. El filtrado en cliente es solo UX. Funciones de ayuda (pseudocódigo de reglas):

```text
function signedIn() { return request.auth != null; }
function emailLower() { return request.auth.token.email.lower(); }
function isOwner(courseId) {
  return signedIn() && (
    get(/databases/$(database)/documents/courses/$(courseId)).data.uid == request.auth.uid
    || (exists(/databases/$(database)/documents/courseMembers/$(courseId + "_" + request.auth.uid))
        && get(...).data.role == "owner"));
}
function isMember(courseId) {
  return isOwner(courseId)
    || (signedIn() && exists(/databases/$(database)/documents/courseMembers/$(courseId + "_" + request.auth.uid)));
}
```

## Matriz de acceso

| Recurso | Propietario | Colaborador | Tercero (autenticado, sin vínculo) | Anónimo |
|---|---|---|---|---|
| `courses/{id}` leer | ✅ | ✅ (solo con membresía) | ❌ | ❌ |
| `courses/{id}` actualizar/eliminar | ✅ | ❌ | ❌ | ❌ |
| `apaDocuments`, `resources`, `tasks`, `scheduleEntries`, `partners` del curso | ✅ todo | ✅ leer + escribir docs (aporte) | ❌ | ❌ |
| `invitations` listar por curso / crear / reenviar / revocar | ✅ | ❌ | ❌ | �❌ |
| `invitations/{token}` leer para aceptación | ✅ | ✅ | ✅ (autenticado o no: solo metadatos públicos) | ✅ (solo metadatos públicos) |
| `courseMembers` leer por curso | ✅ + miembros | ✅ (lectura) | ❌ | ❌ |
| `courseMembers` crear (reclamo) | ✅ | vía batch con invitación válida | ❌ | ❌ |
| `courseMembers` borrar (revocar) | ✅ | ❌ | ❌ | ❌ |
| `mail` (correo) | crear ✅ | ❌ | ❌ | ❌ |

## Reglas de reclamo (batch aceptación)

Permitir `create(courseMembers/{courseId_uid})` + `update(invitations/{token} → accepted)` solo si, evaluado contra el estado comprometido:

1. `invitation.status == "pending"` y `invitation.expiresAt > request.time`;
2. `invitation.emailLower == emailLower()` (correo autenticado = correo invitado);
3. `courseMembers` creado con `courseId == invitation.courseId`, `uid == request.auth.uid`, `role == "collaborator"`;
4. la actualización de la invitación solo cambia `status → "accepted"` + `acceptedAt/acceptedByUid`.

## Notas

- `partners` (nombres de equipo para portadas) sigue siendo dato del propietario; los colaboradores lo leen pero no lo editan salvo que el editor lo requiera (decisión de implementación: lectura).
- La revocación es borrado de membresía: las reglas dejan de autorizar de inmediato (SC-005); no se requiere invalidar tokens porque Firestore evalúa reglas por solicitud.
- Índices requeridos: `courseMembers(uid)`, `courseMembers(courseId)`, `invitations(courseId, emailLower, status)`.
