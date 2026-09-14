# Feature Specification: Editor de Documentos APA

**Feature Branch**: `002-editor-documentos-apa`

**Created**: 2026-09-10

**Status**: Draft

**Input**: User description: "Requerimiento: se necesita crear un editor de LaTex, Word o Similar con vista previa del documento con una configuración por defecto para trabajos con norma APA como plantilla. La funcionalidad debe ser transversal pero el progreso de un documento debe estar asociado a un curso o asignatura y lo relacionado a ella, el usuario puede tener varios documentos guardados por asignatura o curso. Intención: Actualmente para un alumno usuario de la plataforma es muy engorroso tener que crear y configurar un documento en formato APA para cada nuevo entregable, por ende, se requiere desarrollar un módulo que permita tener un punto de partida y base para iniciar un nuevo entregable, este puede ser editor LaTex, Word, o similar que permita suplir esta necesidad, la funcionalidad debe permitir exportar a PDF."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Crear un entregable desde la plantilla APA (Priority: P1)

Como alumno, quiero iniciar un nuevo documento a partir de una plantilla con configuración APA por defecto (portada, márgenes, tipografía, interlineado, encabezados y secciones base) para no tener que configurar el formato manualmente en cada entregable.

**Why this priority**: Es el valor central del módulo: elimina el trabajo repetitivo de configurar cada documento y es el punto de partida de todo lo demás.

**Independent Test**: Puede probarse creando un documento nuevo desde un curso y verificando que el documento nace con la estructura y el formato APA aplicados, listo para editar.

**Acceptance Scenarios**:

1. **Given** estoy viendo un curso, **When** creo un documento nuevo, **Then** el documento se crea asociado a ese curso con la plantilla APA aplicada por defecto (portada, secciones base y formato).
2. **Given** acabo de crear un documento, **When** lo abro en el editor, **Then** veo el contenido inicial de la plantilla y puedo empezar a escribir sin configurar nada.
3. **Given** tengo un documento nuevo, **When** edito el texto de la portada (título, nombre, institución, fecha), **Then** los cambios se conservan como parte del documento.

---

### User Story 2 - Editar con vista previa del documento final (Priority: P1)

Como alumno, quiero escribir y dar formato a mi documento viendo al mismo tiempo cómo quedará la versión final, para corregir contenido y presentación sin adivinar el resultado.

**Why this priority**: Sin vista previa fiel al formato, el alumno no puede confiar en que su entregable cumple la norma; es la funcionalidad de uso diario del editor.

**Independent Test**: Puede probarse editando un documento existente (texto, encabezados, listas, citas simples) y comprobando que la vista previa refleja los cambios de forma inmediata y fiel.

**Acceptance Scenarios**:

1. **Given** estoy editando un documento, **When** escribo o aplico formato (negrita, cursiva, encabezados, listas, alineación, citas), **Then** la vista previa muestra el resultado con el estilo APA en pocos segundos.
2. **Given** estoy editando, **When** inserto elementos estructurales (encabezados de sección, párrafos, listas, tablas o figuras básicas con título y numeración), **Then** aparecen correctamente formateados en la vista previa.
3. **Given** estoy editando, **When** cierro o recargo y vuelvo al documento, **Then** mi progreso se conserva (autoguardado) y retomo donde quedé.

---

### User Story 3 - Organizar varios documentos por curso (Priority: P2)

Como alumno, quiero tener varios documentos guardados por cada curso o asignatura (por ejemplo, un entregable por semana o por unidad), con su estado de avance visible, para gestionar todos mis trabajos desde el contexto de la materia.

**Why this priority**: El requerimiento exige que el progreso esté asociado al curso; sin esta organización los documentos quedan sueltos y se pierde la trazabilidad por asignatura.

**Independent Test**: Puede probarse creando varios documentos en un mismo curso, verificando que se listan solo los de ese curso, y que renombrar, duplicar o eliminar uno no afecta a los demás ni a otros cursos.

**Acceptance Scenarios**:

1. **Given** estoy en un curso con documentos existentes, **When** consulto sus documentos, **Then** veo la lista de documentos de ese curso con título y fecha de última modificación.
2. **Given** tengo un documento, **When** lo renombro, duplico o elimino (con confirmación), **Then** la lista del curso refleja el cambio y los demás documentos quedan intactos.
3. **Given** tengo documentos en dos cursos distintos, **When** consulto cada curso, **Then** cada uno muestra solo sus propios documentos.
4. **Given** elimino un curso, **When** confirmo la eliminación, **Then** se me informa qué documentos asociados se eliminarán antes de confirmar.

---

### User Story 4 - Exportar el entregable a PDF (Priority: P2)

Como alumno, quiero exportar mi documento a PDF con el formato APA aplicado, para entregar el archivo final al docente o guardarlo como evidencia.

**Why this priority**: La exportación a PDF es el resultado entregable del módulo, explícitamente requerida; sin ella el editor no cumple su propósito.

**Independent Test**: Puede probarse abriendo un documento con contenido (portada, secciones, alguna cita o tabla) y generando un PDF que conserva el formato APA y puede descargarse o abrirse.

**Acceptance Scenarios**:

1. **Given** tengo un documento con contenido, **When** lo exporto a PDF, **Then** obtengo un archivo descargable cuyo contenido y formato coinciden con la vista previa.
2. **Given** estoy exportando, **When** el documento incluye portada, encabezados, citas, referencias, tablas o figuras, **Then** el PDF conserva ese formato (orden, numeración y estilos) sin contenido truncado.
3. **Given** ocurre un error durante la exportación, **When** falla la generación, **Then** veo un mensaje claro, no pierdo mi trabajo y puedo reintentarlo.

---

### Edge Cases

- ¿Qué pasa cuando el usuario intenta crear un documento sin haber seleccionado o creado un curso? El sistema debe exigir o sugerir un curso destino antes de crear.
- ¿Cómo se comporta el editor con documentos vacíos o con solo la plantilla sin editar? La exportación debe funcionar igualmente y producir un PDF válido.
- ¿Qué ocurre si el usuario pierde la conexión o cierra el navegador a mitad de la edición? El progreso debe conservarse localmente y recuperarse al volver.
- ¿Cómo se manejan contenidos largos (documentos de muchas páginas) en la vista previa y en la exportación sin truncar ni deformar tablas o figuras?
- ¿Qué pasa con caracteres especiales, tildes, ñ y fórmulas o símbolos académicos comunes? Deben mostrarse y exportarse correctamente.
- ¿Qué ocurre al eliminar o duplicar un documento mientras se está editando en otra vista? La acción debe confirmarse y no provocar pérdida silenciosa de datos.
- ¿Cómo se maneja la exportación de un documento que excede un tamaño razonable? Debe informarse al usuario en lugar de fallar sin explicación.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: El sistema MUST ofrecer una plantilla por defecto con configuración de norma APA (portada, márgenes, tipografía, tamaño de letra, interlineado, encabezados y secciones base) como punto de partida de cada documento nuevo.
- **FR-002**: El usuario MUST poder crear un documento nuevo asociado a un curso o asignatura existente, partiendo de la plantilla APA sin configuración manual previa.
- **FR-003**: El sistema MUST proporcionar un editor de texto con formato (equivalente a un editor tipo Word) que permita escribir, editar y aplicar estilos: negrita, cursiva, encabezados, párrafos, listas, alineación y citas simples.
- **FR-004**: El sistema MUST mostrar una vista previa del documento con el formato APA aplicado que se actualice como resultado de la edición en pocos segundos.
- **FR-005**: El sistema MUST permitir estructurar el documento con secciones académicas (portada, resumen, introducción, desarrollo, conclusiones, referencias) editables y reordenables en su contenido.
- **FR-006**: El sistema MUST permitir gestionar referencias básicas: agregar citas en el texto y una lista de referencias con formato APA, visibles en la vista previa y en la exportación.
- **FR-007**: El sistema MUST permitir insertar tablas y figuras básicas con título y numeración, conservando su presentación en la vista previa y en el PDF.
- **FR-008**: El sistema MUST asociar cada documento a un único curso o asignatura y mostrar, dentro de cada curso, la lista de sus documentos con título y fecha de última modificación.
- **FR-009**: El usuario MUST poder renombrar, duplicar y eliminar documentos (la eliminación con confirmación previa) sin afectar a otros documentos ni a otros cursos.
- **FR-010**: El sistema MUST guardar automáticamente el progreso de la edición (autoguardado) y recuperar el contenido al reabrir el documento, funcionando sin conexión.
- **FR-011**: El sistema MUST permitir exportar cualquier documento a PDF con el formato APA aplicado, generando un archivo descargable fiel a la vista previa.
- **FR-012**: El sistema MUST mostrar el estado de avance de cada documento (por ejemplo: borrador, en revisión, finalizado) y permitir cambiarlo manualmente.
- **FR-013**: El sistema MUST informar de forma clara los errores de guardado o exportación, sin pérdida del contenido editado y con opción de reintentar.
- **FR-014**: El editor MUST ser operable con teclado y lector de pantalla en sus acciones principales (crear, editar, guardar, exportar), con etiquetas y estados accesibles.

### Key Entities

- **Documento**: Representa un entregable del alumno. Atributos: título, curso asociado, contenido estructurado (secciones, citas, referencias, tablas/figuras), estado de avance (borrador, en revisión, finalizado), fechas de creación y última modificación.
- **Curso / Asignatura**: Contenedor organizativo existente (definido en el módulo de cursos). Relación: un curso tiene cero o muchos documentos; cada documento pertenece a un único curso.
- **Plantilla APA**: Configuración base por defecto (portada, estilos de texto, encabezados, secciones iniciales, formato de citas y referencias). Relación: todo documento nuevo nace de esta plantilla; los cambios posteriores pertenecen solo al documento.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Un alumno crea un documento nuevo con formato APA listo para editar en menos de 1 minuto desde la vista del curso, sin configurar formato manualmente.
- **SC-002**: Los cambios escritos en el editor se reflejan en la vista previa en menos de 3 segundos en documentos de tamaño habitual (hasta ~20 páginas).
- **SC-003**: El 90% de los alumnos que prueban el módulo logran crear, editar y exportar a PDF un entregable simple en su primer intento sin ayuda externa.
- **SC-004**: La exportación a PDF produce un archivo válido y descargable en el 95% de los intentos con documentos de tamaño habitual, conservando el formato mostrado en la vista previa.
- **SC-005**: El 100% de los documentos listados en un curso pertenecen a ese curso (cero documentos huérfanos o mostrados en el curso equivocado) tras operaciones de crear, duplicar, mover o eliminar.
- **SC-006**: Ninguna sesión de edición pierde contenido ante una interrupción (cierre o recarga del navegador): el progreso recuperado coincide con la última edición confirmada por el autoguardado.

## Assumptions

- El editor es de texto enriquecido tipo Word (WYSIWYG) con la plantilla APA precargada; no se exige al alumno escribir código LaTeX, aunque el contenido académico con símbolos y fórmulas simples debe representarse correctamente.
- Se adopta la 7.ª edición de las normas APA en español como configuración por defecto de la plantilla.
- El modelo de usuario y de cursos existente se reutiliza: hay un usuario autenticado local y los conceptos de Carrera > Curso ya definidos; no se crea un sistema de cuentas nuevo.
- La funcionalidad es transversal (accesible desde cualquier curso) pero los documentos siempre pertenecen a un curso; no existen documentos globales sin curso en esta versión.
- Todo funciona sin conexión y los datos persisten entre sesiones en el dispositivo; la sincronización en la nube y la colaboración en tiempo real quedan fuera del alcance inicial.
- El alcance inicial excluye corrector gramatical externo, detección de plagio, control de versiones histórico completo y comentarios colaborativos; el historial se limita a fecha de última modificación.
- La exportación genera un PDF de solo lectura para entrega; no se requiere exportar a otros formatos (Word, LaTeX, HTML) en esta versión.
