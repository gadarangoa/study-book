# Feature Specification: Números de Página Reales en Índice y Listados del Editor APA

**Feature Branch**: `007-numeracion-paginas-indice-pdf`

**Created**: 2026-09-21

**Status**: Draft

**Input**: User description: "Agregar números de página reales a la tabla de contenido automática y a los listados de figuras/tablas del editor APA (feature 006-mejoras-formato-apa-pdf), reemplazando el mecanismo actual de exportación basado en window.print() directo sobre el DOM de vista previa por un repaginado en cliente con la librería Paged.js (100% navegador, sin backend, offline-first), que sí calcula en qué página física cae cada título/figura/tabla y puede resolver target-counter() para mostrar el número de página junto a cada entrada del índice y de los listados. Debe preservarse exactamente el comportamiento APA ya validado: fuente 12pt (Times New Roman/Arial), márgenes de 2.54cm, tamaños Carta y A4, saltos de página entre secciones, numeración de figuras/tablas (\"Figura N\"/\"Tabla N\") ya implementada, y que los documentos existentes se sigan viendo y exportando igual cuando la tabla de contenido/listados estén desactivados. El índice y los listados deben mostrar, junto a cada entrada, el número de página real donde aparece esa sección/figura/tabla en el PDF exportado. Debe evaluarse cuidadosamente el riesgo de introducir Paged.js como nueva dependencia y como paso intermedio en el flujo de exportación (hoy es directo: window.print() sobre la vista previa), incluyendo verificación exhaustiva de que imágenes, tablas, portada y saltos de página se comporten igual que hoy bajo el nuevo motor de paginado antes de dar la funcionalidad por completa."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Índice con número de página real (Priority: P1)

Como alumno, quiero que cada entrada de la tabla de contenido muestre el número de página donde realmente aparece esa sección en el PDF exportado, para entregar un índice académico completo sin tener que revisar el PDF y escribir los números a mano.

**Why this priority**: Es la razón explícita por la que se pidió esta mejora — la versión actual del índice (feature 006) lista los títulos en orden pero sin número de página, y eso lo hace sentir incompleto para un trabajo universitario formal.

**Independent Test**: Puede probarse activando la tabla de contenido en un documento con varias secciones y subtítulos, exportando a PDF, y verificando manualmente que el número junto a cada entrada coincide con la página real donde aparece esa sección en el documento exportado.

**Acceptance Scenarios**:

1. **Given** tengo la tabla de contenido activada en un documento de varias páginas, **When** exporto a PDF, **Then** cada entrada del índice muestra un número de página que coincide con la página real donde aparece esa sección en el PDF.
2. **Given** el índice ya muestra números de página, **When** agrego o quito contenido de modo que una sección se mueva a otra página, **Then** al volver a exportar, el número de página de esa entrada se actualiza automáticamente sin que yo lo edite a mano.
3. **Given** cambio el tamaño de papel (Carta/A4) o la fuente (Times New Roman/Arial), **When** exporto, **Then** los números de página del índice reflejan la paginación resultante de esa combinación específica.
4. **Given** el desarrollo tiene subtítulos de nivel 2 y 3, **When** exporto con profundidad 2 o 3, **Then** cada subtítulo incluido muestra también su propio número de página real.

---

### User Story 2 - Listados de figuras y tablas con número de página real (Priority: P1)

Como alumno, quiero que el listado de figuras y el listado de tablas muestren también el número de página donde aparece cada imagen o tabla, para que estas secciones tengan el mismo nivel de completitud que la tabla de contenido.

**Why this priority**: Los listados de figuras/tablas se construyeron en la mejora anterior con la misma limitación que el índice; corregirlos junto con el índice evita dejar una inconsistencia visible entre ambas secciones del mismo documento.

**Independent Test**: Puede probarse insertando imágenes y tablas tituladas en el desarrollo, activando ambos listados, exportando a PDF, y verificando que el número de página junto a cada "Figura N"/"Tabla N" coincide con la página donde aparece ese elemento.

**Acceptance Scenarios**:

1. **Given** tengo el listado de figuras activado y varias imágenes tituladas en distintas páginas, **When** exporto a PDF, **Then** cada entrada "Figura N" muestra el número de página real donde aparece esa imagen.
2. **Given** tengo el listado de tablas activado, **When** exporto a PDF, **Then** cada entrada "Tabla N" muestra el número de página real donde aparece esa tabla.
3. **Given** una imagen o tabla no tiene título asignado, **When** genero los listados, **Then** ese elemento se sigue omitiendo del listado, igual que hoy (sin número de página que mostrar).

---

### User Story 3 - Documentos existentes y funcionalidad ya validada sin cambios (Priority: P1)

Como alumno con documentos ya creados, quiero que mis documentos actuales (con o sin tabla de contenido/listados desactivados) se sigan viendo y exportando exactamente igual que antes de esta mejora, para no llevarme sorpresas de formato en un trabajo que ya tenía listo.

**Why this priority**: Esta mejora cambia el mecanismo interno de exportación (de impresión directa a un repaginado en cliente) precisamente para calcular páginas reales; ese cambio de motor es el mayor riesgo técnico de la funcionalidad y debe validarse con la misma prioridad que el valor nuevo que entrega.

**Independent Test**: Puede probarse abriendo documentos existentes (de antes y después de esta mejora) con la tabla de contenido y los listados desactivados, exportándolos, y comparando that el resultado (fuente, márgenes, tamaño de papel, saltos de página, numeración de "Figura N"/"Tabla N") es idéntico al que se obtenía antes de esta mejora.

**Acceptance Scenarios**:

1. **Given** un documento tiene la tabla de contenido y ambos listados desactivados, **When** lo exporto, **Then** el PDF resultante es visualmente idéntico al que se generaba antes de esta mejora (misma fuente, márgenes, tamaño de papel y saltos de página).
2. **Given** un documento ya usaba la tabla de contenido o los listados sin número de página (creado con la mejora anterior), **When** lo abro después de esta mejora, **Then** sigue funcionando y ahora muestra números de página reales sin que yo deba reconfigurar nada.
3. **Given** exporto un documento con imágenes y tablas ya tituladas, **When** reviso el resultado, **Then** las leyendas "Figura N"/"Tabla N" junto a cada elemento se muestran exactamente igual que antes (mismo texto, misma numeración), solo que ahora el listado también trae su número de página.

---

### Edge Cases

- ¿Qué ocurre si el sistema no logra calcular con certeza la página de una entrada (p. ej. un caso de contenido irregular)? Esa entrada se muestra sin número de página en vez de arriesgarse a mostrar un número incorrecto o engañoso.
- ¿Qué ocurre con un documento de una sola página? Las entradas del índice y de los listados muestran el número de página correspondiente (normalmente la misma página o la siguiente, según dónde caiga cada elemento), sin comportarse de forma distinta a un documento largo.
- ¿Qué ocurre si un título cae justo en el límite entre dos páginas? Se muestra la página donde efectivamente inicia visualmente ese título en el PDF exportado.
- ¿Qué ocurre si el documento es muy extenso (muchas páginas, encabezados, imágenes y tablas)? El cálculo de páginas puede tardar un poco más, pero debe completarse sin bloquear la interfaz de forma indefinida ni hacer fallar la exportación.
- ¿Qué ocurre si el usuario exporta mientras el contenido todavía se está guardando (autoguardado en curso)? Se mantiene el comportamiento actual de esperar a que el guardado termine antes de calcular páginas y exportar.
- ¿Qué ocurre con documentos que tienen la tabla de contenido activada pero ningún listado, o viceversa? Cada sección calcula y muestra sus propios números de página de forma independiente, sin depender de que las demás estén activas.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: El sistema MUST mostrar, junto a cada entrada de la tabla de contenido, el número de página real donde esa sección o subtítulo aparece en el PDF exportado.
- **FR-002**: El sistema MUST mostrar, junto a cada entrada del listado de figuras y del listado de tablas, el número de página real donde aparece esa imagen o tabla en el PDF exportado.
- **FR-003**: El sistema MUST recalcular automáticamente los números de página cada vez que el contenido, la fuente o el tamaño de papel cambien de forma que afecte la paginación, sin que el usuario deba actualizarlos manualmente.
- **FR-004**: El sistema MUST preservar exactamente el comportamiento APA ya validado por la mejora anterior — fuente de 12 pt (Times New Roman o Arial), márgenes de 2.54 cm, tamaños Carta y A4, saltos de página entre secciones, y la numeración "Figura N"/"Tabla N" ya existente — para todo documento, tenga o no activados el índice y los listados.
- **FR-005**: El sistema MUST exportar de forma visualmente idéntica a como lo hace hoy cualquier documento que tenga la tabla de contenido y ambos listados desactivados, sin introducir ningún cambio perceptible de formato para ese caso.
- **FR-006**: El sistema MUST seguir funcionando completamente sin conexión y sin ningún componente de servidor, consistente con el resto de la aplicación.
- **FR-007**: El sistema MUST omitir el número de página de una entrada en vez de mostrar un número incorrecto cuando no pueda calcularlo con certeza.
- **FR-008**: El sistema MUST permitir obtener números de página reales usando exclusivamente los controles ya existentes ("Incluir tabla de contenido", "Incluir listado de figuras", "Incluir listado de tablas"), sin pasos de configuración adicionales.
- **FR-009**: El sistema MUST completar el cálculo de páginas y la exportación en un tiempo razonable para documentos académicos típicos (hasta unas 30 páginas), sin dejar la interfaz sin respuesta.

### Key Entities

- **Referencia de página**: Dato derivado que asocia una entrada del índice o de un listado (una sección, un subtítulo, una figura o una tabla) con el número de página física donde aparece en el documento exportado. Se recalcula a partir del contenido actual; no se guarda de forma independiente ni puede quedar desactualizado respecto al documento.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: El 100% de las entradas de la tabla de contenido en un PDF exportado muestran un número de página que coincide con la página real de esa sección, verificable abriendo el PDF.
- **SC-002**: El 100% de las entradas de los listados de figuras y de tablas en un PDF exportado muestran un número de página que coincide con la página real de ese elemento.
- **SC-003**: El 100% de los documentos con la tabla de contenido y los listados desactivados se exportan sin ningún cambio visual respecto al comportamiento anterior a esta mejora.
- **SC-004**: Exportar un documento académico típico (hasta 30 páginas) con números de página activados no toma perceptiblemente más tiempo que la exportación actual (diferencia no mayor a unos pocos segundos).
- **SC-005**: Los usuarios obtienen números de página reales sin aprender ningún control nuevo, usando exactamente los mismos interruptores que ya existían para activar el índice y los listados.

## Assumptions

- Se asume que los números de página deben ser correctos en el **PDF exportado** (el resultado final que se entrega); la vista previa en pantalla dentro del editor puede seguir siendo de desplazamiento continuo como hoy, mostrando los números de página calculados en el índice/listados sin necesidad de rediseñar la vista previa como un documento paginado visualmente en pantalla.
- Se asume que el cálculo de páginas se ejecuta en el propio navegador del usuario (sin backend), aceptando como parte del diseño técnico introducir un mecanismo de repaginado en cliente que reemplace la impresión directa actual únicamente para los documentos que tengan el índice o algún listado activado; los documentos sin ninguno de los tres activados siguen exportándose por el mecanismo actual sin cambios, para minimizar el riesgo sobre el comportamiento ya validado.
- Se asume que un número de página omitido (por no poder calcularse con certeza) es preferible a un número incorrecto, siguiendo el mismo criterio conservador ya usado en la mejora anterior para listados sin título.
- Se asume que esta mejora no incluye agregar numeración de página visible en el encabezado o pie de cada página del documento (fuera del índice y los listados); eso seguiría siendo una mejora aparte si se solicita en el futuro.
- Se asume que el rango de documentos académicos típicos (hasta unas 30 páginas, con hasta unas 20 imágenes/tablas tituladas y encabezados) es el caso de uso principal a optimizar; documentos excepcionalmente más extensos pueden tardar más sin que eso se considere una falla.
