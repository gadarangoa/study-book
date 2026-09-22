# Quickstart: Trabajo Colaborativo por Invitación

**Feature**: `specs/004-colaboracion-por-invitacion` | **Date**: 2026-09-13
Guía de validación end-to-end (sin código de implementación; el detalle vive en [data-model.md](./data-model.md) y [contracts/](./contracts/invitations.md)).

## Prerrequisitos

- Node + `pnpm install` en la raíz del repo.
- Proyecto Firebase con Auth (Email/Password) y Firestore; variables `VITE_FIREBASE_*` en `.env`.
- El propietario debe poder compartir manualmente el enlace generado; no se requiere Trigger Email ni configuración SMTP.
- `firestore.rules` e índices de [contracts/access-rules.md](./contracts/access-rules.md) desplegados (o emulador con las reglas del repo).
- Dos cuentas/correos de prueba: `owner@ejemplo.com`, `guest@ejemplo.com`.

## Arranque local

```sh
pnpm install
VITE_USE_FIREBASE_EMULATORS=true pnpm dev   # Auth :9099, Firestore :8080
pnpm typecheck && pnpm lint                  # gates de constitución
```

## Escenarios de validación

### E1 — Invitar (US1; FR-001/002/003/005; SC-001)

1. Como `owner`, abre una asignatura propia → `/courses/:courseId/team` → "Invitar" → ingresa `guest@ejemplo.com`.
2. Esperado: la invitación aparece en "Pendientes" y la interfaz muestra un enlace `/invite/<token>` para copiar y compartir.
3. Repite con el mismo correo → esperado: mensaje `duplicate-active`, sin nueva invitación.
4. Prueba `no-es-correo` → esperado: error claro, sin registro.

### E2 — Aceptar con aislamiento (US2; FR-006/007/008/009; SC-002/003/004)

1. En navegación privada abre el enlace (sin sesión) → esperado: pantalla `valid` con materia, invitador y vencimiento; al aceptar te pide login.
2. Crea/inicia sesión como `guest@ejemplo.com` → esperado: acceso concedido, redirección al curso; dashboard **solo** muestra esa asignatura.
3. Intenta abrir otra asignatura por URL (`/courses/<otro-id>`) → esperado: denegado, sin contenido (SC-003).
4. Edita un documento del curso compartido, guarda y recarga → esperado: aporte visible con tu autoría para el equipo (SC-004, FR-014).
5. Repite el flujo con una cuenta de correo **distinto** al invitado → esperado: pantalla `wrong-email`, sin acceso.

### E3 — Gestionar y revocar (US3; FR-011/012/013; SC-005)

1. Como `owner`, copia o renueva el enlace pendiente → esperado: enlace disponible, `resendCount` incrementado al renovar y vigencia extendida 7 días.
2. Revoca al colaborador (con confirmación) → esperado: en <1 min el invitado deja de ver la asignatura y sus documentos fallan con denegado.
3. Abre un enlace expirado/revocado → esperado: mensaje `expired`/`revoked` explicativo, sin acceso.
4. Elimina el curso (con su cascada) → esperado: invitaciones y membresías asociadas dejan de ser válidas.

### E4 — Accesibilidad y teclado (Constitución V)

Tabula todo el diálogo de invitación y la página `/invite/:token` solo con teclado; verifica foco visible, labels anunciados, errores en vivo y que los estados no dependen solo del color.

## Criterios de salida

- E1–E4 en verde; `pnpm typecheck` y `pnpm lint` sin errores; `resendCount`, `acceptedByUid` y `updatedBy*` auditables en consola Firestore.
