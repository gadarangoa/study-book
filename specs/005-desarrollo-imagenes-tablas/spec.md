# Feature Specification: Desarrollo con Imágenes y Tablas en Editor APA

**Feature Branch**: `005-desarrollo-imagenes-tablas`

**Created**: 2026-09-14

**Status**: Draft

**Input**: User description: "se requiere para expandir la funcionalidad de Editor en la sección del desarrollo para que soporte imágenes, tablas como parte de un desarrollo completo dentro de un documento de trabajo universitario y no solo un texto plano"

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Incorporar imágenes al desarrollo (Priority: P1)

Como alumno, quiero insertar imágenes desde mi dispositivo dentro del desarrollo de mi documento universitario, para explicar resultados, evidencias o conceptos sin tener que trabajar fuera del editor.

**Why this priority**: Las imágenes son una parte esencial de muchos trabajos académicos y constituyen la ampliación principal solicitada frente al desarrollo compuesto únicamente por texto.

**Independent Test**: Puede probarse abriendo un documento APA existente, incorporando una imagen válida con texto alternativo y verificando que queda visible en el desarrollo y en la vista previa.

**Acceptance Scenarios**:

1. **Given** estoy editando el desarrollo, **When** selecciono una imagen válida desde mi dispositivo, **Then** la imagen se inserta en la posición activa y puedo proporcionar un texto alternativo descriptivo.
2. **Given** el desarrollo contiene una imagen, **When** cambio su texto alternativo o la elimino, **Then** la vista previa refleja el cambio sin afectar el texto ni otros elementos del documento.
3. **Given** el documento contiene una imagen insertada, **When** cierro y vuelvo a abrir el documento, **Then** la imagen y sus datos asociados se conservan.

### User Story 2 - Construir tablas académicas básicas (Priority: P1)

Como alumno, quiero crear y editar tablas dentro del desarrollo, para presentar datos, comparaciones y resultados de forma ordenada en mi trabajo universitario.

**Why this priority**: Las tablas permiten representar información académica que no puede expresarse adecuadamente como texto corrido y son la segunda capacidad explícitamente solicitada.

**Independent Test**: Puede probarse creando una tabla, editando sus celdas, agregando y eliminando filas y columnas, y verificando que el resultado aparece en la vista previa.

**Acceptance Scenarios**:

1. **Given** estoy editando el desarrollo, **When** inserto una tabla e indico un número inicial de filas y columnas, **Then** aparece una tabla editable en la posición activa.
2. **Given** existe una tabla, **When** escribo en sus celdas y marco una fila como encabezado, **Then** el contenido y la diferenciación del encabezado se reflejan en la vista previa.
3. **Given** existe una tabla, **When** agrego o elimino filas y columnas, **Then** la tabla conserva las celdas restantes y el resto del desarrollo permanece intacto.
4. **Given** existe una tabla, **When** decido eliminarla, **Then** la tabla desaparece sin eliminar el contenido que la rodea.

### User Story 3 - Revisar y entregar un desarrollo enriquecido (Priority: P1)

Como alumno, quiero revisar imágenes y tablas dentro de la vista previa APA y exportarlas junto con el documento, para entregar un trabajo completo y coherente.

**Why this priority**: Insertar elementos solo aporta valor si se conservan en la presentación final y en el PDF que recibe el docente.

**Independent Test**: Puede probarse con un documento que contenga texto, una imagen y una tabla, comparando la vista previa con el PDF exportado y recargando el documento antes de exportar.

**Acceptance Scenarios**:

1. **Given** el desarrollo contiene texto, imágenes y tablas, **When** consulto la vista previa, **Then** los elementos aparecen en el mismo orden, con el contenido legible y sin ocultar el texto cercano.
2. **Given** la vista previa muestra un desarrollo enriquecido, **When** exporto el documento, **Then** el PDF contiene las imágenes y tablas en posiciones equivalentes y conserva el texto alternativo como información accesible cuando corresponda.
3. **Given** modifico una imagen o tabla, **When** el guardado automático termina, **Then** el estado de guardado se informa y el contenido reaparece después de una recarga.

### User Story 4 - Continuar trabajando con documentos existentes (Priority: P2)

Como alumno, quiero abrir documentos creados antes de esta ampliación y seguir editándolos sin perder su contenido, para que la mejora no rompa mis entregables actuales.

**Why this priority**: La ampliación se aplica a documentos existentes y nuevos; la continuidad del trabajo es necesaria para adoptarla sin migraciones manuales del usuario.

**Independent Test**: Puede probarse abriendo un documento anterior que solo contiene texto, editándolo sin insertar elementos nuevos y comprobando que se visualiza, guarda y exporta igual que antes.

**Acceptance Scenarios**:

1. **Given** existe un documento anterior con desarrollo de texto enriquecido, **When** lo abro, **Then** su contenido se muestra sin errores y puedo seguir editándolo.
2. **Given** abro un documento anterior, **When** agrego una imagen o tabla, **Then** el documento conserva el texto existente y acepta los nuevos elementos.

### Edge Cases

- Si el usuario selecciona un archivo que no es una imagen admitida, el editor debe rechazarlo con un mensaje claro y conservar el contenido anterior.
- Si una imagen supera el límite permitido de tamaño o dimensiones, el editor debe informar el motivo y no insertar un elemento incompleto.
- Si una imagen no tiene texto alternativo, debe marcarse como pendiente de completar sin bloquear la edición del resto del documento.
- Si una tabla se crea sin contenido, debe poder editarse o eliminarse sin romper la vista previa ni la exportación.
- Si una tabla tiene muchas filas o columnas, debe permanecer legible y no ocultar contenido fuera del área visible de edición.
- Si el guardado falla después de insertar una imagen o tabla, el contenido editado debe permanecer disponible para reintentar el guardado.
- Si el usuario recarga o cierra el navegador durante la edición, el último contenido confirmado por el guardado automático debe recuperarse.
- Si un documento anterior contiene estructuras de texto no reconocidas por la ampliación, su contenido legible debe conservarse y la vista previa debe degradar solo el elemento no reconocido, sin descartar el documento completo.
- En pantallas estrechas y con teclado o lector de pantalla, los controles de imagen y tabla deben seguir siendo accesibles y tener nombres, estados y mensajes comprensibles.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: El editor MUST permitir insertar imágenes desde el dispositivo del usuario dentro de la sección Desarrollo del documento.
- **FR-002**: El sistema MUST aceptar únicamente formatos de imagen definidos como admitidos y MUST comunicar el motivo cuando un archivo no sea válido.
- **FR-003**: El sistema MUST aplicar un límite de tamaño por imagen y MUST rechazar archivos que lo superen sin modificar el contenido previamente editado.
- **FR-004**: Cada imagen MUST permitir registrar y editar un texto alternativo descriptivo, y el editor MUST indicar cuando ese dato esté pendiente.
- **FR-005**: El usuario MUST poder seleccionar una imagen insertada, editar sus datos disponibles y eliminarla sin afectar el texto u otros elementos del desarrollo.
- **FR-006**: El editor MUST permitir crear tablas dentro de Desarrollo definiendo un número inicial de filas y columnas.
- **FR-007**: El usuario MUST poder editar el contenido de las celdas de una tabla, agregar o eliminar filas y columnas, y marcar una fila como encabezado.
- **FR-008**: El usuario MUST poder eliminar una tabla completa sin perder el contenido que la precede o sucede.
- **FR-009**: El sistema MUST conservar el orden relativo entre párrafos, imágenes y tablas al mostrarlos en la vista previa y al exportar el documento.
- **FR-010**: La vista previa MUST representar las imágenes y tablas de forma legible, sin ocultar contenido, y MUST actualizarse en menos de 3 segundos para documentos habituales de hasta 20 páginas, 10 imágenes y 10 tablas.
- **FR-011**: La exportación a PDF MUST incluir las imágenes y tablas visibles en la vista previa, conservar el contenido de sus celdas y mantener la configuración APA del documento.
- **FR-012**: El sistema MUST guardar automáticamente las imágenes, sus textos alternativos, las tablas y sus cambios junto con el resto del contenido del documento.
- **FR-013**: El sistema MUST recuperar el contenido válido de imágenes y tablas al reabrir el documento, incluso después de recargar el navegador o trabajar sin conexión.
- **FR-014**: Los documentos existentes anteriores a esta ampliación MUST poder abrirse, editarse, guardarse y exportarse sin pérdida de su contenido legible.
- **FR-015**: Los controles para insertar, editar y eliminar imágenes y tablas MUST ser operables con teclado y lector de pantalla, con etiquetas, estados y mensajes de error accesibles.
- **FR-016**: El sistema MUST informar claramente los errores de inserción, validación, guardado o exportación y MUST ofrecer una acción de reintento cuando corresponda.

### Key Entities *(include if feature involves data)*

- **Contenido del desarrollo**: Secuencia ordenada de párrafos, formatos de texto, imágenes y tablas que forma la sección principal del trabajo universitario.
- **Imagen del desarrollo**: Recurso visual incorporado desde el dispositivo, con datos de formato, tamaño y texto alternativo; pertenece a un único documento y conserva su posición dentro del desarrollo.
- **Tabla académica**: Estructura con filas, columnas, celdas editables y una posible fila de encabezado; pertenece a un único documento y conserva el orden de sus elementos.
- **Documento APA**: Entregable existente asociado a un curso, con portada, secciones académicas, desarrollo enriquecido, referencias, vista previa, estado y fechas de modificación.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Un alumno puede insertar una imagen válida con texto alternativo en menos de 1 minuto y verla en el desarrollo sin configurar formato de página manualmente.
- **SC-002**: Un alumno puede crear una tabla de hasta 10 filas por 10 columnas, completar sus celdas y marcar su encabezado en menos de 2 minutos.
- **SC-003**: El 95% de las imágenes y tablas válidas guardadas en documentos habituales reaparece sin pérdida tras cerrar, recargar y volver a abrir el documento.
- **SC-004**: El 95% de las exportaciones de documentos habituales que contienen imágenes y tablas produce un PDF descargable cuyo contenido coincide con la vista previa.
- **SC-005**: En una prueba con al menos 20 documentos existentes, el 100% conserva su texto legible y puede abrirse, guardarse y exportarse después de activar la ampliación.
- **SC-006**: Al menos el 90% de los usuarios de prueba puede insertar una imagen y una tabla, editarlas y exportar el documento en su primer intento sin ayuda externa.
- **SC-007**: Todos los controles principales de imágenes y tablas pueden alcanzarse y operarse mediante teclado, y cada error de validación se anuncia con un mensaje comprensible para lectores de pantalla.

## Assumptions

- La ampliación se aplica únicamente a la sección Desarrollo del editor APA existente; portada, introducción, justificación, objetivos, conclusiones y bibliografía mantienen su comportamiento actual.
- Las imágenes se incorporan desde el dispositivo y quedan embebidas en el documento; no se incluyen imágenes remotas mediante URL.
- El límite exacto de tamaño, los formatos admitidos y las dimensiones máximas se definirán durante la planificación respetando la experiencia offline y la capacidad razonable del navegador.
- Las tablas son académicas básicas: edición de texto en celdas, inserción y eliminación de filas o columnas y fila de encabezado; no incluyen combinación de celdas, fórmulas, estilos complejos ni importación desde hojas de cálculo.
- La vista previa y el PDF conservan la norma APA ya definida por el documento, incluidos tamaño de papel y márgenes.
- Los datos siguen funcionando sin conexión y se guardan en el dispositivo; la sincronización en la nube, colaboración en tiempo real, comentarios y control histórico de versiones quedan fuera de alcance.
- Los documentos existentes se consideran válidos aunque no contengan imágenes ni tablas; la ampliación no requiere que el usuario los convierta manualmente.
- La aplicación reutiliza la autenticación, asociación a cursos y modelo de documentos existentes; esta feature no crea documentos independientes ni modifica la organización por curso.
