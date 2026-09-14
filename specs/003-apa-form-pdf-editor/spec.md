# Feature Specification: Editor APA por Formulario con Vista Previa PDF

**Feature Branch**: `003-apa-form-pdf-editor`

**Created**: 2026-09-10

**Status**: Draft

**Input**: User description: "Analiza este requerimiento: se necesita crear un editor PDF con vista previa del documento con una configuración por defecto para trabajos con norma APA como plantilla. La funcionalidad debe ser transversal pero el progreso de un documento debe estar asociado a un curso o asignatura y lo relacionado a ella, el usuario puede tener varios documentos guardados por asignatura o curso. Intención: Actualmente para un alumno usuario de la plataforma es muy engorroso tener que crear y configurar un documento en formato APA para cada nuevo entregable, por ende, se requiere desarrollar un módulo que permita tener un punto de partida y base para iniciar un nuevo entregable, este puede ser editor basado en un formulario para más practicidad, la funcionalidad debe permitir exportar el PDF. La vista podría dividirse en 2, formulario a la izquierda y PDF preview + PDF controls a la derecha, el formulario debe tener para ingresar: 1. los datos de la portada, 2. Introducción, 3. Desarrollo de la actividad (opcion: textarea tipo wysiwyg), 4. Conclusiones, 5. Bibliografía (dinámico)"

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Iniciar un entregable desde la plantilla APA (Priority: P1)

Como alumno, quiero crear un documento nuevo desde un curso que ya nazca con la configuración APA por defecto (portada, tipografía, interlineado, márgenes, encabezados y secciones base), para no configurar el formato manualmente en cada entregable.

**Why this priority**: Es el valor central del requerimiento: eliminar el trabajo repetitivo de formateo y dar un punto de partida inmediato. Sin esto, el resto del módulo no tiene sentido.

**Independent Test**: Puede probarse creando un documento desde la vista de un curso y verificando que aparece con las cinco secciones del formulario precargadas y la vista previa con formato APA, listo para rellenar.

**Acceptance Scenarios**:

1. **Given** estoy viendo un curso, **When** creo un documento nuevo, **Then** el documento queda asociado a ese curso y nace con la plantilla APA aplicada (portada + secciones base vacías o con texto guía).
2. **Given** acabo de crear un documento, **When** lo abro, **Then** veo el formulario con las secciones (portada, introducción, desarrollo, conclusiones, bibliografía) y la vista previa del PDF con el formato aplicado.
3. **Given** no tengo ningún curso, **When** intento crear un documento, **Then** se me pide seleccionar o crear primero un curso destino en lugar de crear un documento huérfano.

---

### User Story 2 - Rellenar el formulario seccionado con vista previa en vivo (Priority: P1)

Como alumno, quiero completar mi trabajo rellenando un formulario por secciones (portada, introducción, desarrollo con texto enriquecido, conclusiones) viendo al mismo tiempo a la derecha cómo queda el PDF final, para avanzar por partes sin preocuparme del formato.

**Why this priority**: Es la interacción diaria propuesta (vista dividida formulario + preview). Aporta la "practicidad" frente a un editor libre y es lo que diferencia esta variante.

**Independent Test**: Puede probarse rellenando cada campo del formulario y comprobando que la vista previa se actualiza en pocos segundos reflejando portada, secciones y formato APA.

**Acceptance Scenarios**:

1. **Given** estoy editando un documento, **When** completo los datos de la portada (título, integrantes del Team, institución, curso, docente, fecha), **Then** la portada de la vista previa refleja esos datos con el formato APA.
2. **Given** estoy editando, **When** escribo la introducción y las conclusiones en texto simple y el desarrollo en el campo enriquecido (negrita, cursiva, encabezados, listas, alineación), **Then** la vista previa muestra cada sección en orden con el estilo APA correspondiente.
3. **Given** estoy editando, **When** modifico cualquier campo, **Then** mi progreso se guarda automáticamente y al recargar o volver más tarde retomo donde quedé sin pérdida.
4. **Given** uso teclado o lector de pantalla, **When** navego por el formulario y los controles del PDF, **Then** puedo completar todas las acciones principales (rellenar, guardar, exportar) con etiquetas y estados accesibles.

---

### User Story 3 - Gestionar varios documentos por curso o asignatura (Priority: P2)

Como alumno, quiero tener varios documentos guardados por cada curso o asignatura (un entregable por semana o unidad), con su estado de avance visible, para gestionar todos mis trabajos desde el contexto de la materia.

**Why this priority**: El requerimiento exige que el progreso esté asociado al curso aunque la funcionalidad sea transversal. Sin esta organización los documentos quedan sueltos.

**Independent Test**: Puede probarse creando varios documentos en un mismo curso, verificando que se listan solo los de ese curso, y que renombrar, duplicar o eliminar uno no afecta a los demás ni a otros cursos.

**Acceptance Scenarios**:

1. **Given** estoy en un curso con documentos, **When** consulto sus documentos, **Then** veo la lista de ese curso con título, estado de avance y fecha de última modificación.
2. **Given** tengo un documento, **When** lo renombro, duplico o elimino (con confirmación previa), **Then** la lista refleja el cambio y los demás documentos quedan intactos.
3. **Given** tengo documentos en dos cursos distintos, **When** consulto cada curso, **Then** cada uno muestra solo sus propios documentos.
4. **Given** el documento tiene un estado de avance (borrador, en revisión, finalizado), **When** lo cambio manualmente, **Then** el nuevo estado se conserva y se muestra en la lista del curso.

---

### User Story 4 - Gestionar bibliografía dinámica (Priority: P2)

Como alumno, quiero agregar, editar, reordenar y eliminar entradas de bibliografía de forma dinámica, para construir mis referencias en formato APA sin editar el documento final a mano.

**Why this priority**: La bibliografía es la única sección explícitamente dinámica del formulario y la más propensa a errores de formato APA si se hace manual.

**Independent Test**: Puede probarse agregando varias entradas, editando una, eliminando otra y comprobando que la sección de referencias de la vista previa y del PDF refleja la lista actual con formato APA.

**Acceptance Scenarios**:

1. **Given** estoy en la sección de bibliografía, **When** agrego una entrada con sus datos (autor, año, título, fuente), **Then** aparece en la lista y en la sección de referencias de la vista previa con formato APA.
2. **Given** tengo varias entradas, **When** edito, reordeno o elimino una (con confirmación si ya tiene contenido), **Then** la lista y la vista previa se actualizan sin afectar al resto del documento.
3. **Given** dejo una entrada incompleta o con datos inválidos (por ejemplo, año no numérico), **When** intento guardarla, **Then** veo un mensaje que indica qué campo corregir y la entrada no se pierde.

---

### User Story 5 - Exportar el entregable a PDF (Priority: P2)

Como alumno, quiero exportar mi documento a PDF con el formato APA aplicado, para entregar el archivo final al docente.

**Why this priority**: La exportación es el resultado entregable explícito del módulo; sin ella el editor no cumple su propósito, pero depende de que el contenido exista.

**Independent Test**: Puede probarse abriendo un documento con portada, secciones y al menos una referencia, y generando un PDF descargable que coincide con la vista previa.

**Acceptance Scenarios**:

1. **Given** tengo un documento con contenido, **When** lo exporto a PDF, **Then** obtengo un archivo descargable cuyo contenido, orden de secciones y formato coinciden con la vista previa.
2. **Given** el documento incluye portada, desarrollo con formato y lista de referencias, **When** lo exporto, **Then** el PDF conserva ese formato sin contenido truncado ni páginas en blanco injustificadas.
3. **Given** ocurre un error durante la exportación, **When** falla la generación, **Then** veo un mensaje claro, no pierdo mi trabajo y puedo reintentarlo.

---

### Edge Cases

- ¿Qué pasa cuando el usuario intenta crear un documento sin haber seleccionado un curso? Debe exigirse o sugerirse un curso destino; no existen documentos globales sin curso en esta versión.
- ¿Cómo se comporta la exportación con un documento vacío o con solo la plantilla sin editar? Debe producir un PDF válido con la estructura base en lugar de fallar.
- ¿Qué ocurre si el usuario cierra el navegador o recarga a mitad de la edición? El progreso debe conservarse por autoguardado y recuperarse al volver.
- ¿Cómo se manejan documentos largos (muchas páginas o muchas referencias) en la vista previa y en la exportación sin truncar contenido?
- ¿Qué pasa con tildes, ñ, caracteres especiales y símbolos académicos comunes? Deben mostrarse y exportarse correctamente.
- ¿Qué ocurre al eliminar un documento mientras se está editando? La acción debe confirmarse y no provocar pérdida silenciosa de datos.
- ¿Cómo se comporta la vista dividida en pantallas estrechas? El formulario debe seguir siendo usable y la vista previa accesible sin pérdida de contenido.
- ¿Qué pasa si una entrada de bibliografía queda a medio completar? Debe marcarse como pendiente y no romper la vista previa ni la exportación.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: El sistema MUST ofrecer una plantilla por defecto con configuración de norma APA (portada, márgenes, tipografía, tamaño, interlineado, encabezados y secciones base) como punto de partida de cada documento nuevo.
- **FR-002**: El usuario MUST poder crear un documento nuevo asociado a un curso o asignatura existente, partiendo de la plantilla APA sin configuración manual previa.
- **FR-003**: El sistema MUST presentar la vista de edición dividida en dos zonas: formulario de secciones a la izquierda y vista previa del PDF con sus controles a la derecha (en pantallas estrechas, ambas zonas deben seguir accesibles sin pérdida de contenido).
- **FR-004**: El formulario MUST incluir la sección de datos de portada (título del trabajo, integrantes, institución, curso, docente y fecha). Los integrantes MUST provenir del Team del curso: cada integrante se muestra con un checkbox para incluirlo o excluirlo de la portada automáticamente. El docente MUST pre-diligenciarse desde el dato del curso cuando esté disponible (al crear y al editar si el campo está vacío). El título y al menos un integrante son obligatorios (validación inline).
- **FR-005**: El formulario MUST incluir secciones de texto para introducción y conclusiones, con validación de longitud mínima orientativa y mensajes claros. Además MUST incluir una sección opcional de justificación (entre introducción y desarrollo): si se deja vacía, no aparece en la vista previa ni en el PDF.
- **FR-006**: El formulario MUST incluir la sección de desarrollo de la actividad como campo de texto enriquecido que permita al menos negrita, cursiva, encabezados, listas, alineación y citas simples.
- **FR-007**: El formulario MUST incluir una sección de bibliografía dinámica que permita agregar, editar, reordenar y eliminar entradas, cada una con autor, año, título y fuente.
- **FR-008**: El sistema MUST mostrar una vista previa del documento con el formato APA aplicado que se actualice como resultado de la edición en pocos segundos, reflejando portada, orden de secciones y referencias. Cada sección (portada, introducción, desarrollo, conclusiones, referencias) MUST iniciar en una página nueva, con separación visual entre páginas en pantalla.
- **FR-009**: La vista previa MUST incluir controles de PDF: navegación por páginas, acercamiento (zoom), selección de tamaño de papel (Carta o A4) y acción de exportar/descargar. El tamaño y los márgenes (2,54 cm, norma APA) MUST aplicarse por igual a la vista previa y al PDF exportado.
- **FR-010**: El sistema MUST asociar cada documento a un único curso o asignatura y mostrar, dentro de cada curso, la lista de sus documentos con título, estado de avance y fecha de última modificación.
- **FR-011**: El usuario MUST poder renombrar, duplicar y eliminar documentos (la eliminación con confirmación previa) sin afectar a otros documentos ni a otros cursos.
- **FR-012**: El sistema MUST guardar automáticamente el progreso de cada sección del formulario y recuperar el contenido al reabrir el documento, funcionando sin conexión.
- **FR-013**: El sistema MUST permitir exportar cualquier documento a PDF con el formato APA aplicado, generando un archivo descargable fiel a la vista previa.
- **FR-014**: El sistema MUST mostrar el estado de avance de cada documento (borrador, en revisión, finalizado) y permitir cambiarlo manualmente.
- **FR-015**: El sistema MUST informar de forma clara los errores de validación, guardado o exportación, sin pérdida del contenido editado y con opción de reintentar.
- **FR-016**: La vista de edición MUST ser operable con teclado y lector de pantalla en sus acciones principales (rellenar secciones, gestionar bibliografía, guardar, exportar), con etiquetas y estados accesibles.

### Key Entities

- **Documento**: Entregable del alumno. Atributos: título, curso asociado, contenido seccionado (portada, introducción, desarrollo enriquecido, conclusiones, bibliografía), estado de avance (borrador, en revisión, finalizado), fechas de creación y última modificación.
- **Curso / Asignatura**: Contenedor organizativo existente. Relación: un curso tiene cero o muchos documentos; cada documento pertenece a un único curso; la funcionalidad de edición es accesible transversalmente pero el documento siempre vive bajo un curso.
- **Plantilla APA**: Configuración base por defecto (portada, estilos de texto, encabezados, secciones iniciales, formato de citas y referencias). Relación: todo documento nuevo nace de esta plantilla; los cambios posteriores pertenecen solo al documento.
- **Entrada de bibliografía**: Referencia individual dentro de un documento. Atributos: autor, año, título, fuente y orden en la lista. Relación: un documento tiene cero o muchas entradas; el orden determina su aparición en la sección de referencias.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Un alumno crea un documento nuevo con formato APA listo para rellenar en menos de 1 minuto desde la vista del curso, sin configurar formato manualmente.
- **SC-002**: Los cambios en cualquier campo del formulario se reflejan en la vista previa en menos de 3 segundos en documentos de tamaño habitual (hasta ~20 páginas o 50 referencias).
- **SC-003**: El 90% de los alumnos que prueban el módulo logran crear, completar las cinco secciones y exportar a PDF un entregable simple en su primer intento sin ayuda externa.
- **SC-004**: La exportación a PDF produce un archivo válido y descargable en el 95% de los intentos con documentos de tamaño habitual, conservando el contenido y formato mostrados en la vista previa.
- **SC-005**: El 100% de los documentos listados en un curso pertenecen a ese curso (cero documentos huérfanos o mostrados en el curso equivocado) tras operaciones de crear, duplicar o eliminar.
- **SC-006**: Ninguna sesión de edición pierde contenido ante una interrupción (cierre o recarga del navegador): el progreso recuperado coincide con la última edición confirmada por el autoguardado.

## Assumptions

- Se adopta la 7.ª edición de las normas APA en español como configuración por defecto de la plantilla.
- La vista dividida (formulario + vista previa) es la disposición en pantallas amplias; en pantallas estrechas se permite apilar o alternar por pestañas sin perder contenido ni funcionalidad.
- El campo de desarrollo es de texto enriquecido acotado (formato básico académico); no es un procesador completo con tablas, imágenes o notas al pie en esta versión.
- La bibliografía se gestiona como lista estructurada de entradas con formato APA generado por el sistema; no se exige importación desde gestores externos ni detección de duplicados automática en esta versión.
- Se reutilizan el modelo de usuario y de cursos existente: hay un usuario autenticado local y los conceptos de Carrera > Curso ya definidos; no se crea un sistema de cuentas nuevo.
- Todo funciona sin conexión y los datos persisten entre sesiones en el dispositivo; la sincronización en la nube y la colaboración en tiempo real quedan fuera del alcance inicial.
- El alcance inicial excluye corrector gramatical externo, detección de plagio, historial completo de versiones y comentarios colaborativos; el historial se limita a fecha de última modificación.
- La exportación genera un PDF de solo lectura para entrega; no se requiere exportar a otros formatos (Word, LaTeX, HTML) en esta versión.
- Relación con la especificación existente `002-editor-documentos-apa`: esta especificación concreta la variante de editor basado en formulario con vista dividida; si hay conflicto de alcance, esta variante por formulario prevalece para el módulo a construir.
