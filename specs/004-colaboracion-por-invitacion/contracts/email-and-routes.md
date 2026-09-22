# Contract: Correo de Invitación y Ruta de Aceptación

**Feature**: `specs/004-colaboracion-por-invitacion` | **Date**: 2026-09-13

## Enlace de invitación

La aplicación genera y muestra un enlace para copiar y compartir manualmente. No escribe en la colección `mail` ni depende de Trigger Email, SMTP o SendGrid.

El enlace tiene el formato:

```text
<APP_URL>/invite/<token>
```

El token es el ID aleatorio del documento de `invitations`, permanece válido durante 7 días y sigue asociado al correo invitado.

El correo puede comunicarse por cualquier canal externo; si se habilita un proveedor de correo en el futuro, deberá usar la misma URL.

### Plantilla informativa opcional

Texto que el propietario puede acompañar al enlace:

```text
to: <email invitado>
message:
  subject: "<invitedByEmail> te invitó a colaborar en <courseName> (StudyBook)"
  text: |
    Hola,
    <invitedByEmail> te invitó a colaborar en la asignatura "<courseName>".
    Acepta aquí: <APP_URL>/invite/<token> (válido 7 días).
    Deberás iniciar sesión o crear tu cuenta con este mismo correo: <email>.
    Si no esperabas este mensaje, ignóralo.
  html: <misma información + botón "Aceptar invitación" → /invite/<token>>
```

**Requisitos**: español; identifica asignatura + quién invita + acción clara; incluye el correo destinatario esperado (evita confusión de cuentas, FR-007); enlace con token no adivinable y vigencia (FR-004/FR-013).

## Ruta pública `/invite/:token` (`InviteAcceptPage`)

- Fuera de `ProtectedRoute` (como `/login` en `src/App.tsx`).
- Estados de pantalla (texto + icono, nunca solo color):
  - `loading` — "Verificando invitación…"
  - `valid` — muestra `courseName`, `invitedByEmail`, vencimiento y botón "Aceptar y continuar" (si no hay sesión, primero login/signup con redirect de vuelta).
  - `accepted` — "Ya formas parte de <courseName>" + botón al curso.
  - `expired` — "Esta invitación venció el <fecha>. Pide al propietario que la reenvíe."
  - `revoked` — "Esta invitación fue retirada por el propietario."
  - `wrong-email` — "Esta invitación es para <email>. Inicia sesión con esa cuenta." + opción de cambiar de cuenta.
  - `not-found` — "Enlace no válido."
- Tras reclamo exitoso → `navigate(/courses/{courseId})`. El invitado solo ve esa asignatura (listas globales filtradas por membresía, FR-008).
- Accesibilidad (Constitución V): foco inicial en el heading, botón principal con `aria-describedby` del vencimiento, errores en región `aria-live`, navegación completa por teclado, título de `Dialog`/página para lector de pantalla.

## Extensión de `TeamPage` (`/courses/:courseId/team`)

- Botón "Invitar" (solo propietario; los colaboradores no lo ven — FR-010) abre `InviteDialog`: campo email con `Label`, validación de formato, error `duplicate-active` con el estado existente.
- Secciones: "Miembros" (`member-list`: nombre/correo, rol, fecha, acción Revocar con confirmación) e "Invitaciones pendientes" (`invitation-list`: correo, vencimiento, `resendCount`, acción Reenviar).
