# Feature Specification: Trabajo Colaborativo por Invitación

**Feature Branch**: `004-colaboracion-por-invitacion`

**Created**: 2026-09-13

**Status**: Draft

**Input**: User description: "Se requiere agregar la funcionalidad de trabajo colaborativo por invitación. Cuando un usuario ingresa a una asignatura, éste puede enviar una invitación a los miembros del equipo para que estos puedan ingresar al módulo de editor de documentos para realizar su respectivo aporte, la invitación es por correo y se debe usar los servicios de Firebase para autenticación, los miembros invitados solamente pueden ver y acceder a la asignatura correspondiente."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Invitar colaboradores a una asignatura (Priority: P1)

Como propietario de una asignatura (quien la creó), quiero invitar por correo a miembros de mi equipo desde la vista de la asignatura, para que puedan colaborar en los documentos de esa materia.

**Why this priority**: Es el punto de entrada de toda la colaboración; sin invitación no hay acceso de invitados ni aportes.

**Independent Test**: Puede probarse abriendo una asignatura propia, enviando una invitación a un correo, y verificando que la invitación queda registrada como pendiente y el destinatario recibe el correo con el enlace de acceso.

**Acceptance Scenarios**:

1. **Given** estoy autenticado y veo una asignatura de mi propiedad, **When** ingreso un correo válido del equipo y envío la invitación, **Then** el sistema registra la invitación como pendiente y envía un correo con un enlace de aceptación asociado a esa asignatura.
2. **Given** estoy en la vista de la asignatura, **When** consulto la lista de colaboradores e invitaciones, **Then** veo quiénes tienen acceso activo y qué invitaciones siguen pendientes.
3. **Given** envío una invitación a un correo con formato inválido, **When** intento enviarla, **Then** el sistema rechaza el envío con un mensaje claro y no registra la invitación.

---

### User Story 2 - Aceptar invitación y acceder solo a la asignatura invitada (Priority: P1)

Como miembro invitado, quiero aceptar la invitación recibida por correo y autenticarme, para acceder únicamente a la asignatura compartida y aportar en su editor de documentos.

**Why this priority**: Garantiza el valor principal para el invitado (aportar) y la restricción clave de seguridad (aislamiento por asignatura).

**Independent Test**: Puede probarse aceptando el enlace desde un correo invitado, completando la autenticación, y verificando que solo es visible la asignatura invitada y su editor de documentos.

**Acceptance Scenarios**:

1. **Given** recibí un correo de invitación, **When** abro el enlace e inicio sesión o creo mi cuenta, **Then** obtengo acceso a la asignatura indicada y veo sus documentos en el editor.
2. **Given** soy un invitado autenticado con acceso a la asignatura A, **When** intento ver el listado general o la asignatura B no compartida, **Then** no las veo ni puedo abrirlas (acceso denegado o lista limitada a mis asignaturas).
3. **Given** soy un invitado con acceso, **When** edito un documento de la asignatura compartida y guardo, **Then** mi aporte queda registrado y es visible para el propietario y demás colaboradores de esa asignatura.

---

### User Story 3 - Gestionar y revocar accesos (Priority: P2)

Como propietario de la asignatura, quiero reenviar invitaciones pendientes y retirar el acceso a un colaborador, para mantener el control del equipo de trabajo.

**Why this priority**: Sin gestión del ciclo de vida (reenvío, expiración, revocación), las invitaciones quedan obsoletas y el propietario pierde control.

**Independent Test**: Puede probarse reenviando una invitación pendiente, revocando el acceso de un colaborador activo, y verificando que el colaborador revocado pierde el acceso a la asignatura.

**Acceptance Scenarios**:

1. **Given** tengo una invitación pendiente, **When** la reenvío, **Then** se genera un nuevo aviso por correo y la invitación sigue válida.
2. **Given** tengo un colaborador activo, **When** le retiro el acceso y confirmo, **Then** deja de ver la asignatura y no puede abrir sus documentos.
3. **Given** una invitación expiró o fue revocada, **When** el destinatario abre el enlace antiguo, **Then** ve un mensaje que explica el estado (expirada/revocada) y qué hacer a continuación.

---

### Edge Cases

- ¿Qué pasa cuando se invita dos veces al mismo correo para la misma asignatura? El sistema debe impedir duplicados activos e informar que ya existe una invitación pendiente o un acceso activo.
- ¿Qué pasa cuando el invitado no tiene cuenta? El enlace debe permitirle crearla con el mismo correo invitado y luego otorgar el acceso automáticamente.
- ¿Qué pasa cuando el invitado intenta registrarse o iniciar sesión con un correo distinto al invitado? El sistema no debe otorgar acceso automáticamente a la asignatura.
- ¿Qué pasa cuando el enlace de invitación expiró? El destinatario ve un estado claro y el propietario puede reenviar una nueva invitación.
- ¿Qué pasa cuando el propietario elimina la asignatura? Las invitaciones pendientes y accesos asociados dejan de ser válidos.
- ¿Qué pasa cuando un invitado intenta adivinar la URL de otra asignatura? El sistema deniega el acceso y no revela contenido.
- ¿Qué pasa cuando el correo de invitación no llega (rebote, spam, error de envío)? El propietario ve el estado de envío/entrega y puede reenviar.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: El sistema MUST permitir al propietario de una asignatura enviar una invitación por correo a un miembro del equipo desde el contexto de esa asignatura.
- **FR-002**: El sistema MUST validar el correo invitado (formato válido) antes de registrar y enviar la invitación, y MUST mostrar un mensaje claro si es inválido.
- **FR-003**: El sistema MUST impedir invitaciones duplicadas activas (misma asignatura + mismo correo con invitación pendiente o acceso activo) e informar el estado existente.
- **FR-004**: Cada invitación MUST estar asociada a una única asignatura y contener un mecanismo de aceptación de un solo equipo/asignatura (enlace con identificador único, vigencia limitada).
- **FR-005**: El sistema MUST enviar un correo de invitación que identifique la asignatura, quién invita y una acción clara de aceptación.
- **FR-006**: El sistema MUST autenticar a los invitados con el servicio de autenticación adoptado por el producto (Firebase Authentication, restricción explícita del solicitante), aceptando usuarios nuevos (registro) y existentes (inicio de sesión).
- **FR-007**: El sistema MUST otorgar acceso a la asignatura solo cuando el correo autenticado coincida con el correo invitado y la invitación esté vigente.
- **FR-008**: Los miembros invitados MUST poder ver y abrir únicamente las asignaturas donde tienen acceso (propias o aceptadas); el sistema MUST denegar el acceso a cualquier otra asignatura.
- **FR-009**: Los miembros invitados MUST poder listar, abrir y editar los documentos de la asignatura compartida en el módulo editor para realizar su aporte, conservando sus cambios.
- **FR-010**: Los miembros invitados MUST NOT poder eliminar la asignatura compartida, ni gestionar (invitar/revocar) a otros colaboradores, ni ver asignaturas no compartidas.
- **FR-011**: El propietario MUST poder ver la lista de colaboradores con acceso y de invitaciones pendientes por asignatura.
- **FR-012**: El propietario MUST poder reenviar una invitación pendiente y revocar el acceso de un colaborador (con confirmación); tras la revocación el acceso MUST quedar invalidado de inmediato.
- **FR-013**: Las invitaciones MUST tener vigencia limitada y estados distinguibles (pendiente, aceptada, expirada, revocada); un enlace expirado o revocado MUST mostrar un mensaje explicativo y no otorgar acceso.
- **FR-014**: El sistema MUST registrar qué usuario realizó cada aporte en los documentos colaborativos (autoría visible del aporte).

### Key Entities

- **Asignatura**: Materia o curso que agrupa documentos; tiene un propietario y una lista de accesos compartidos. Solo su propietario puede invitar o revocar.
- **Invitación**: Solicitud de acceso a una asignatura específica; atributos: correo destinatario, asignatura destino, quien invita, estado (pendiente/aceptada/expirada/revocada), fecha de emisión y vencimiento.
- **Colaborador (acceso)**: Vínculo entre un usuario autenticado y una asignatura compartida; determina visibilidad limitada y permiso de aporte en el editor.
- **Documento colaborativo**: Entregable dentro de una asignatura compartida; conserva historial/autoría de aportes de propietario y colaboradores.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Un propietario puede invitar a un colaborador desde una asignatura y el invitado recibe el correo en menos de 2 minutos en el 95% de los casos.
- **SC-002**: El 90% de los invitados que reciben el correo logran aceptar, autenticarse y abrir la asignatura compartida al primer intento sin ayuda.
- **SC-003**: El 100% de los intentos de un invitado por abrir una asignatura no compartida son denegados (aislamiento total por asignatura).
- **SC-004**: El 100% de los aportes de colaboradores en el editor quedan guardados y visibles para el equipo de la asignatura tras recargar.
- **SC-005**: Tras revocar un acceso, el colaborador pierde la visibilidad de la asignatura en menos de 1 minuto en el 99% de los casos.

## Assumptions

- Se asume que cada asignatura tiene un único propietario (quien la creó) con derechos de invitación; la co-propiedad queda fuera de alcance.
- Se asume una vigencia por defecto de 7 días para las invitaciones, renovable mediante reenvío.
- Se asume que el correo invitado es el identificador de acceso: solo la cuenta con ese mismo correo obtiene el acceso.
- Se asume que los invitados tienen rol fijo de "colaborador con aporte" (ver + editar documentos); un rol de solo lectura queda fuera de alcance de esta versión.
- Se depende del servicio de autenticación Firebase Authentication y de un servicio de envío de correos; la configuración de cuentas remitentes y plantillas se define en planificación.
- Se asume que la colaboración es asíncrona (editar y guardar aportes); la edición simultánea en tiempo real queda fuera de alcance salvo que se defina en planificación.
- Restricción de constitución: el producto es offline-first con persistencia local (Principio III); esta funcionalidad introduce identidad remota y uso compartido, por lo que requiere una excepción o enmienda de alcance para datos colaborativos.
