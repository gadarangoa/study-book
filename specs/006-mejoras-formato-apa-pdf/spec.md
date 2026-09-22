# Feature Specification: Mejoras de Formato APA y Navegación en el Editor de PDF

**Feature Branch**: `006-mejoras-formato-apa-pdf`

**Created**: 2026-09-21

**Status**: Draft

**Input**: User description: "Analiza detalladamente la funcionalidad de editor de PDF y realiza los ajustes relevantes para mejorarla, actualmente funciona bien pero con algunos matices, el PDF queda con la letra muy pequeña, la fuente para trabajos APA deberia ser 12 pt y puede ser entre Arial o Times New Roman, la sección de bibliografía exige que todos los campos sean obligatorios pero puede ser que una referencia no tenga una fecha especifica, por ende el usuario deberia poder dejar ese campo vacio y el sistema automáticamente debe tomarlo como (s.f) o al menos no solo limitar el campo a numero con validación de fecha. por otro lado debe asegurarse de tener los márgenes del documento de acuerdo con las normas APA, tambien de ser posible, agregar la tabla de contenidos automática desde 1 hasta 2 o 3 niveles configurado por el usuario, el editor entonces debe permitir agregar titulos de nivel 2 y 3, si es posible analiza la forma de reconocer titulos de imágenes y tablas como para agregar Listado de figuras y Listado de tablas, tambien automático y opcionales, este modulo debe ser muy profesional pero a la vez muy fácil, intuitivo y sin descargar al usuario toda las responsabilidad de configurar un documento, su preocupación debe ser incluir contenido."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Documento exportado con tipografía y márgenes fieles a APA (Priority: P1)

Como alumno, quiero que el PDF exportado use una fuente legible de 12 pt (Times New Roman o Arial, a mi elección) y respete los márgenes de una pulgada (2.54 cm) en todos los lados, para entregar un trabajo que cumpla la norma APA sin tener que corregirlo manualmente después de exportarlo.

**Why this priority**: Es la molestia más directa reportada — el texto se percibe demasiado pequeño en el PDF final — y afecta a todos los documentos existentes y futuros, sin excepción. Es la base sobre la que se apoyan el resto de mejoras.

**Independent Test**: Puede probarse abriendo cualquier documento APA, eligiendo cada opción de fuente disponible, exportando a PDF y verificando con un lector de PDF que el cuerpo del texto mide 12 pt, la fuente es la seleccionada y los márgenes de página son de 2.54 cm en los cuatro lados.

**Acceptance Scenarios**:

1. **Given** estoy editando un documento APA, **When** abro las opciones de formato del documento, **Then** puedo elegir entre "Times New Roman" y "Arial" como fuente del cuerpo del texto.
2. **Given** elegí una fuente, **When** exporto el documento a PDF, **Then** el texto de portada, secciones, listas, tablas y referencias se muestra en esa fuente a 12 pt en la vista previa y en el PDF exportado.
3. **Given** exporto cualquier documento APA, **When** mido los márgenes del PDF resultante, **Then** los cuatro márgenes son de 2.54 cm (1 pulgada), sin importar el tamaño de papel elegido (Carta o A4).
4. **Given** no elijo explícitamente ninguna fuente, **When** creo un documento nuevo o abro uno existente, **Then** el documento usa Times New Roman 12 pt de forma predeterminada, igual que hoy.

---

### User Story 2 - Referencias bibliográficas sin fecha exacta (Priority: P1)

Como alumno, quiero poder guardar una referencia bibliográfica sin indicar un año exacto cuando la fuente no lo tiene, para no verme obligado a inventar una fecha falsa ni a dejar la referencia incompleta.

**Why this priority**: Bloquea hoy la creación de referencias legítimas (p. ej. sitios web, obras clásicas o material sin fecha) y obliga al usuario a introducir datos incorrectos solo para poder guardar. Es una corrección de un defecto funcional, no una mejora cosmética.

**Independent Test**: Puede probarse agregando una referencia con autor y título pero sin año, guardándola, y verificando que aparece en la lista y en el PDF como "(s.f.)" sin errores de validación.

**Acceptance Scenarios**:

1. **Given** estoy agregando o editando una referencia, **When** dejo el campo de año vacío y completo autor y título, **Then** el sistema permite guardar la referencia sin marcarla como error.
2. **Given** una referencia se guardó sin año, **When** se muestra en la lista del formulario o en el PDF exportado, **Then** el año aparece como "(s.f.)" en el lugar donde normalmente iría el año.
3. **Given** estoy escribiendo un año, **When** introduzco un valor que no son 4 dígitos numéricos (p. ej. letras o menos de 4 dígitos), **Then** el sistema muestra un mensaje de error solo si el campo no está vacío, y no impide dejarlo vacío.
4. **Given** una referencia ya tenía un año guardado, **When** la edito y borro el año intencionalmente, **Then** el cambio se guarda y pasa a mostrarse como "(s.f.)".

---

### User Story 3 - Tabla de contenido automática y configurable (Priority: P2)

Como alumno, quiero que el documento incluya una tabla de contenido generada automáticamente a partir de los títulos de mis secciones y subtítulos, y poder elegir cuántos niveles de profundidad mostrar (1, 2 o 3), para entregar un trabajo con apariencia profesional sin tener que armar el índice a mano ni mantenerlo actualizado cada vez que cambio el contenido.

**Why this priority**: Añade valor profesional significativo y es explícitamente solicitada, pero depende de que la jerarquía de títulos (nivel 2 y 3) ya exista en el editor, por lo que se ubica después de las correcciones de formato base.

**Independent Test**: Puede probarse activando la tabla de contenido en un documento con varios subtítulos de nivel 2 y 3 dentro del desarrollo, eligiendo distintas profundidades, y verificando que la lista generada refleja los títulos y su orden, tanto en la vista previa como en el PDF exportado.

**Acceptance Scenarios**:

1. **Given** tengo un documento con secciones (Introducción, Desarrollo, Conclusiones, etc.) y subtítulos de nivel 2 y 3 dentro del desarrollo, **When** activo la tabla de contenido y elijo mostrar hasta el nivel 2, **Then** la tabla de contenido lista las secciones principales y los subtítulos de nivel 2, pero no los de nivel 3.
2. **Given** la tabla de contenido está activa, **When** agrego, elimino o renombro un título en el desarrollo, **Then** la tabla de contenido del PDF exportado refleja el cambio sin ninguna acción manual adicional.
3. **Given** la tabla de contenido está activa, **When** exporto el documento, **Then** cada entrada de la tabla aparece en una página propia previa al resto del contenido y no requiere que el usuario escriba números de página a mano.
4. **Given** no quiero incluir tabla de contenido, **When** la dejo desactivada (opción predeterminada para documentos existentes), **Then** el documento se exporta exactamente como antes, sin ninguna página adicional.
5. **Given** el desarrollo no tiene ningún subtítulo de nivel 2 o 3, **When** activo la tabla de contenido, **Then** la tabla solo muestra las secciones principales del documento, sin dejar niveles vacíos ni errores.

---

### User Story 4 - Listado de figuras y listado de tablas automáticos (Priority: P3)

Como alumno, quiero que el sistema reconozca los títulos que le pongo a mis imágenes y tablas dentro del desarrollo y genere automáticamente un listado de figuras y un listado de tablas, cada uno activable de forma independiente, para completar la presentación formal de mi trabajo sin tener que numerarlas ni transcribir sus títulos a mano.

**Why this priority**: Es la mejora de mayor esfuerzo relativo y de menor frecuencia de uso (solo aplica a documentos con imágenes o tablas tituladas), por lo que se prioriza después de las correcciones de formato y de la tabla de contenido.

**Independent Test**: Puede probarse insertando dos imágenes tituladas y una tabla titulada en el desarrollo, activando ambos listados, y verificando que cada listado numera y transcribe correctamente solo los elementos de su propio tipo, en el orden en que aparecen en el documento.

**Acceptance Scenarios**:

1. **Given** inserté una imagen y le asigné un título descriptivo, **When** activo el listado de figuras, **Then** la imagen aparece en el listado como "Figura 1: [título]" (numeración correlativa según el orden de aparición).
2. **Given** inserté una tabla y le asigné un título descriptivo, **When** activo el listado de tablas, **Then** la tabla aparece en el listado como "Tabla 1: [título]" (numeración correlativa e independiente de la de figuras).
3. **Given** una imagen o tabla no tiene título asignado, **When** genero los listados, **Then** ese elemento sin título no aparece en el listado correspondiente (no se fuerza a poner título para poder exportar).
4. **Given** no tengo ninguna imagen ni tabla titulada en el documento, **When** activo alguno de los listados, **Then** esa sección del listado no se incluye en el PDF exportado (no se muestra una sección vacía).
5. **Given** activo ambos listados o solo uno de ellos, **When** exporto el documento, **Then** solo aparecen los listados que activé, cada uno en su propia página, y el resto del documento no se ve afectado.

---

### Edge Cases

- ¿Qué ocurre si el usuario cambia la fuente después de haber escrito contenido? El cambio se aplica a todo el documento de manera retroactiva; no se guardan fuentes distintas por sección o párrafo.
- ¿Qué ocurre si una referencia bibliográfica no tiene ni autor, ni título, ni año? Se sigue tratando como "pendiente de completar", igual que hoy — solo el campo de año se vuelve opcional.
- ¿Qué ocurre si el usuario introduce un año con formato distinto a 4 dígitos pero no vacío (p. ej. "2024-2025" o "s.f." literal)? Se muestra el mensaje de validación existente y no se guarda hasta corregirlo o vaciarlo.
- ¿Qué ocurre si dos títulos de nivel 2 tienen exactamente el mismo texto? Ambos aparecen como entradas separadas en la tabla de contenido, en el orden en que aparecen en el documento.
- ¿Qué ocurre si el desarrollo tiene un título de nivel 3 sin un título de nivel 2 que lo preceda? Aparece igualmente en la tabla de contenido en su nivel de sangría correspondiente, sin exigir una jerarquía estrictamente anidada.
- ¿Qué ocurre con documentos creados antes de esta mejora? Se abren y exportan con fuente Times New Roman 12 pt y márgenes APA (comportamiento ya vigente), con la tabla de contenido y los listados desactivados por defecto, para no alterar documentos ya finalizados o entregados.
- ¿Qué ocurre si el usuario activa la tabla de contenido o los listados pero el documento aún no tiene título, secciones con contenido o imágenes/tablas? Las secciones automáticas se generan igualmente con la información disponible en ese momento, sin bloquear el guardado ni la exportación.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: El sistema MUST renderizar el cuerpo del documento (portada, secciones fijas, listas, tablas y referencias) a 12 pt tanto en la vista previa como en el PDF exportado, para todo documento APA nuevo o existente.
- **FR-002**: El sistema MUST permitir al usuario elegir la fuente del documento entre "Times New Roman" y "Arial", aplicándose de manera consistente a todo el contenido del documento (portada, secciones, tablas, listas y referencias).
- **FR-003**: El sistema MUST usar "Times New Roman" a 12 pt como fuente predeterminada para documentos que no tengan una fuente elegida explícitamente, preservando el comportamiento actual.
- **FR-004**: El sistema MUST mantener márgenes de 2.54 cm (1 pulgada) en los cuatro lados de cada página del PDF exportado, para ambos tamaños de papel soportados (Carta y A4).
- **FR-005**: El sistema MUST permitir guardar una referencia bibliográfica sin especificar un año.
- **FR-006**: El sistema MUST mostrar "(s.f.)" en lugar del año en cualquier referencia bibliográfica (en el formulario y en el PDF exportado) cuando el campo de año esté vacío.
- **FR-007**: El sistema MUST seguir validando el campo de año cuando el usuario introduzca un valor (debe ser un año de 4 dígitos), pero MUST NOT exigir que el campo tenga contenido para considerar la referencia válida.
- **FR-008**: El sistema MUST permitir al usuario activar o desactivar una tabla de contenido por documento, desactivada por defecto en documentos existentes y nuevos.
- **FR-009**: El sistema MUST permitir al usuario elegir cuántos niveles de profundidad mostrar en la tabla de contenido (1, 2 o 3), cuando esta esté activa.
- **FR-010**: El sistema MUST generar automáticamente las entradas de la tabla de contenido a partir de las secciones fijas del documento (nivel 1) y de los títulos de nivel 2 y 3 que el usuario agregue dentro del desarrollo, sin que el usuario deba escribirlas ni numerarlas manualmente.
- **FR-011**: El sistema MUST actualizar la tabla de contenido automáticamente cada vez que el documento se exporta, reflejando los títulos y su orden vigentes en ese momento, sin acción manual adicional del usuario.
- **FR-012**: El editor de desarrollo MUST seguir permitiendo agregar títulos de nivel 2 y nivel 3 dentro del contenido, tal como ya ocurre hoy, para que existan datos con los que construir la tabla de contenido.
- **FR-013**: El sistema MUST permitir asignar un título/descripción a cada imagen y a cada tabla insertada en el desarrollo (reutilizando el título de imagen ya existente y agregando esa misma capacidad para tablas).
- **FR-014**: El sistema MUST permitir al usuario activar o desactivar, de forma independiente entre sí, un "Listado de figuras" y un "Listado de tablas", ambos desactivados por defecto.
- **FR-015**: Cuando el listado de figuras esté activo, el sistema MUST generar automáticamente una lista numerada correlativamente con las imágenes que tengan título asignado, en el orden en que aparecen en el documento, omitiendo las que no tengan título.
- **FR-016**: Cuando el listado de tablas esté activo, el sistema MUST generar automáticamente una lista numerada correlativamente con las tablas que tengan título asignado, en el orden en que aparecen en el documento, omitiendo las que no tengan título.
- **FR-017**: El sistema MUST omitir por completo del PDF exportado cualquier listado (tabla de contenido, listado de figuras, listado de tablas) que esté desactivado o que no tenga ninguna entrada que mostrar, para no generar páginas o secciones vacías.
- **FR-018**: El sistema MUST mantener el comportamiento de exportación e impresión actual (incluyendo el flujo de guardado previo a exportar) para todos los documentos, ya que las mejoras de este alcance son de formato y estructura, no de mecanismo de exportación.
- **FR-019**: El sistema MUST conservar la posibilidad de configurar tabla de contenido, listados y fuente de forma independiente por cada documento, para no afectar a otros documentos del mismo curso o usuario.

### Key Entities

- **Preferencias de formato del documento**: Datos por documento que indican la fuente elegida (Times New Roman o Arial), si la tabla de contenido está activa y su profundidad (1 a 3), y si el listado de figuras y el listado de tablas están activos. Se guardan junto con el resto del documento APA existente.
- **Entrada de tabla de contenido**: Representa un título del documento (sección fija, o título de nivel 2/3 dentro del desarrollo) con su nivel de jerarquía y su orden de aparición; se deriva del contenido existente, no se almacena por separado.
- **Título de figura / título de tabla**: Texto descriptivo asociado a una imagen o tabla del desarrollo, usado tanto como leyenda visible junto al elemento como para construir la entrada correspondiente en el listado de figuras o de tablas.
- **Referencia bibliográfica**: Entidad ya existente (autor, año, título, fuente); el año pasa de ser obligatorio a ser opcional, mostrándose como "(s.f.)" cuando está vacío.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: El 100% de los documentos exportados a PDF muestran el cuerpo del texto a 12 pt en la fuente elegida por el usuario (o Times New Roman por defecto), verificable con cualquier lector de PDF.
- **SC-002**: El 100% de los documentos exportados a PDF tienen márgenes de 2.54 cm en los cuatro lados, sin importar el tamaño de papel elegido.
- **SC-003**: Los usuarios pueden guardar una referencia bibliográfica sin fecha en menos de 10 segundos, sin encontrarse con ningún mensaje de error bloqueante.
- **SC-004**: Un documento con 5 o más títulos de nivel 2/3 genera una tabla de contenido completa y en el orden correcto sin que el usuario edite manualmente ni una sola entrada.
- **SC-005**: Un documento con imágenes y tablas tituladas genera listados de figuras y de tablas cuya numeración coincide en el 100% de los casos con el orden real de aparición en el documento.
- **SC-006**: Activar o desactivar la tabla de contenido o cualquiera de los listados requiere una sola acción del usuario (sin pasos de configuración adicionales ni conocimientos técnicos previos).
- **SC-007**: Los documentos existentes creados antes de esta mejora se siguen exportando sin cambios visuales no solicitados (misma fuente, mismos márgenes, sin tabla de contenido ni listados añadidos automáticamente).

## Assumptions

- Se asume que "12 pt" y la elección entre Arial y Times New Roman aplican de forma uniforme a todo el cuerpo del documento (no se ofrece una combinación de fuentes distintas por sección), siguiendo el pedido explícito del usuario.
- Se asume que los márgenes de 2.54 cm (1 pulgada) en los cuatro lados ya son el estándar deseado por el usuario (norma APA general), y que el ajuste consiste en garantizar que se cumplan siempre, incluidos los casos ya cubiertos hoy.
- Se asume que la tabla de contenido usa como nivel 1 las secciones fijas ya existentes del documento (Introducción, Justificación, Objetivos, Desarrollo, Conclusiones, Referencias) y como niveles 2 y 3 los títulos que el usuario agrega dentro del desarrollo con las herramientas "Encabezado 2" y "Encabezado 3" ya disponibles en el editor.
- Se asume que la tabla de contenido, el listado de figuras y el listado de tablas están desactivados por defecto tanto en documentos nuevos como existentes, para que el usuario decida activarlos y no se altere la apariencia de trabajos ya finalizados o entregados.
- Se asume que el título de una tabla es un campo de texto simple asociado a la tabla (equivalente al título ya existente para imágenes), y no un sistema de numeración o etiquetado manual a cargo del usuario.
- Se asume que el numerado de página en el encabezado o pie de página (un requisito adicional y distinto de las normas APA) queda fuera del alcance de esta mejora, salvo que se solicite explícitamente en una iteración futura.
- Se asume que la validación de año ya existente (4 dígitos numéricos) se mantiene sin cambios salvo por dejar de ser obligatoria; no se solicitan otros formatos de fecha (mes/año, rangos, etc.).
