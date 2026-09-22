# Research: Mejoras de Formato APA y Navegación en el Editor de PDF

**Feature**: 006-mejoras-formato-apa-pdf

**Date**: 2026-09-21

Todas las incógnitas del Technical Context quedan resueltas por inspección directa del código existente (`src/features/documents/`), sin dependencias nuevas. No quedan `NEEDS CLARIFICATION` pendientes.

## Decision 1: Selector de fuente (Arial / Times New Roman, 12 pt)

- **Decision**: Agregar un campo `fontFamily` a nivel de documento (`ApaFontFamily = "times-new-roman" | "arial"`), aplicado mediante una clase CSS en `.apa-document` (p. ej. `apa-font-times` / `apa-font-arial`) que fija `font-family`. El tamaño se mantiene fijo en `12pt` para ambas fuentes — no es configurable, porque el pedido explícito del usuario fue "12 pt y puede ser Arial o Times New Roman", no el par oficial APA de 11pt Arial / 12pt Times.
- **Rationale**: `apa-styles.css` ya centraliza toda la tipografía de `.apa-document`, `.apa-document h1/h2/h3` y `.apa-references` en una sola declaración (`font-family: "Times New Roman", Times, serif; font-size: 12pt;`, [apa-styles.css:11-17](../../src/features/documents/lib/apa-styles.css)) que ya se aplica igual en pantalla y en `@media print` (línea 125, con `!important`). Ambas fuentes son fuentes de sistema estándar (no requieren `@font-face` ni carga de red), por lo que un simple swap de `font-family` por clase es suficiente y no compromete el principio Offline-First.
- **Alternatives considered**:
  - *Selector de tamaño de fuente configurable*: descartado — el usuario pidió explícitamente 12 pt fijo, no un rango; añadir un control de tamaño sería alcance no solicitado (ver `AGENTS.md`/constitución: sin scope creep).
  - *Fuente por sección*: descartado — la constitución (Component-First, sin sobre-ingeniería) y el pedido del usuario apuntan a una fuente uniforme por documento, no combinaciones.

## Decision 2: Año de bibliografía opcional → "(s.f.)"

- **Decision**: `isBibEntryComplete` deja de exigir `isValidBibYear`; solo exige `author` y `title` no vacíos. `formatBibEntry` usa `"(s.f.)"` cuando `year` está vacío, en vez de devolver `""` (lo que hoy marca la referencia entera como "pendiente"). La validación del formulario (`validateEntry` en `bibliography-field.tsx`) deja de mostrar "El año es obligatorio." cuando el campo está vacío, y solo valida formato (4 dígitos) cuando el usuario escribió algo.
- **Rationale**: El código actual (`src/features/documents/lib/apa-format.ts:8-29`, `src/features/documents/components/bibliography-field.tsx:45-55`) ya separa limpiamente "está vacío" de "tiene formato inválido" — el cambio es puntual y no requiere tocar el modelo de datos (`BibEntry.year` ya es `string`, una cadena vacía representa "sin fecha" sin necesitar un nuevo campo booleano ni `null`).
- **Alternatives considered**:
  - *Agregar un campo separado `isUndated: boolean`*: descartado por redundante — una cadena vacía ya es una representación suficiente y sin ambigüedad de "sin fecha", y evita migrar documentos existentes con un campo nuevo.
  - *Aceptar formatos alternativos de fecha (solo mes/año, rangos)*: fuera de alcance según la especificación (ver Assumptions de `spec.md`); se mantiene la validación de 4 dígitos cuando el usuario sí escribe algo.

## Decision 3: Tabla de contenido automática — alcance de "número de página"

- **Decision**: La tabla de contenido se genera como una lista jerárquica de títulos (nivel 1: secciones fijas; nivel 2/3: encabezados dentro de Desarrollo) **sin número de página real** junto a cada entrada. El mecanismo de exportación sigue siendo `window.print()` sobre el DOM de `ApaPdfPreview` (sin cambios, cumpliendo FR-018).
- **Rationale**: Mostrar un número de página correcto junto a cada entrada del índice requiere que el motor de impresión resuelva en qué página física cae cada título (`target-counter()` / CSS Generated Content for Paged Media). Ningún motor de impresión de navegador mainstream (Chromium, Firefox, WebKit/Safari) implementa `target-counter()` en su pipeline de impresión a PDF; solo lo soportan motores especializados (Prince XML, WeasyPrint, Antenna House), que no forman parte de este stack y que introducirían una dependencia de servidor o de generación de PDF fuera del navegador — un cambio de arquitectura mucho mayor que "ajustar el editor existente" y que contradice FR-018 y el principio Offline-First (no hay backend). Es un límite técnico real del navegador, no una elección de producto.
  Esto es compatible con la especificación: ningún requisito o escenario de aceptación de `spec.md` exige literalmente "número de página" en el texto de la entrada — el criterio (US3, escenario 3) es que el usuario "no tenga que escribir números de página a mano", lo cual se cumple igualmente con una lista de títulos autogenerada y ordenada. Las Assumptions de `spec.md` ya excluyen expresamente el numerado de página de encabezado/pie como fuera de alcance; se extiende el mismo criterio a la columna de página de la propia tabla de contenido.
- **Alternatives considered**:
  - *Migrar la exportación a una librería de generación de PDF en el cliente (p. ej. `pdfmake`, `react-pdf`) que sí calcule paginación real*: descartado para este alcance — es un cambio de arquitectura de exportación completo (reescribe el pipeline preview=PDF que hoy garantiza fidelidad "la misma vista se imprime", afecta imágenes, tablas, saltos de página existentes) y excede lo pedido ("ajustes relevantes" sobre el editor actual, no un reemplazo del motor de exportación). Puede evaluarse como una mejora futura independiente si el usuario prioriza números de página reales.
  - *Insertar números de página aproximados estimando líneas por página*: descartado — poco fiable (depende de fuente, imágenes, tablas de tamaño variable) y puede mostrar números incorrectos, peor que no mostrar ninguno.
- **Comunicación al usuario**: se debe dejar explícito en la UI (texto de ayuda breve junto al interruptor de tabla de contenido) que el índice lista los títulos en orden pero no incluye número de página, para no generar expectativas incorrectas.

## Decision 4: Extracción de entradas de TOC y listados (figuras/tablas)

- **Decision**: Crear `src/features/documents/lib/toc.ts` con funciones puras:
  - `extractTocEntries(sections: ApaFormSections, depth: 1 | 2 | 3): TocEntry[]` — recorre las secciones fijas en orden fijo (Introducción, Justificación si tiene texto, Objetivos si aplica, Desarrollo, Conclusiones, Referencias) como nivel 1, y recorre el JSON de `development` buscando nodos `heading` con `attrs.level` 2 o 3 (respetando el `depth` elegido) como niveles 2/3, en el orden en que aparecen.
  - `extractFigureEntries(development: ApaDocumentContent): ListEntry[]` y `extractTableEntries(development: ApaDocumentContent): ListEntry[]` — recorren el JSON de `development` en profundidad, numerando correlativamente (empezando en 1) solo los nodos `image`/`table` cuyo `attrs.title` no esté vacío, en el orden de aparición.
- **Rationale**: El contenido de Desarrollo ya es la única fuente estructurada (JSON de TipTap) de la que se puede derivar jerarquía de títulos e imágenes/tablas tituladas; las demás secciones son texto plano sin estructura de encabezados (confirmado en `apa-pdf-preview.tsx`, que solo usa `renderBlock`/niveles de heading dentro de `development.content`). Mantener estas funciones como puras y sin estado permite reutilizarlas igual en la vista previa de pantalla y en el DOM impreso (mismo principio "preview = PDF" ya usado en el resto del feature), y evita persistir un índice derivado que podría desincronizarse del contenido real.
- **Alternatives considered**:
  - *Persistir las entradas de TOC/listados como parte del documento guardado*: descartado — se desincronizarían del contenido cada vez que el usuario edita un título, violando FR-011 ("debe reflejar los títulos y su orden vigentes... sin acción manual"). Derivarlas en cada render es más simple y siempre consistente.

## Decision 5: Título (caption) de tabla para el listado de tablas

- **Decision**: Extender el nodo `table` de TipTap con un atributo `title` (análogo a `DevelopmentImage.attrs.title` ya existente para imágenes), agregado mediante un `Table.extend({ addAttributes ... })` igual al patrón ya usado para `DevelopmentImage` en `development-field.tsx:39-49`. Se agrega una acción de toolbar "Título de tabla" que abre un diálogo simple (mismo patrón que `DevelopmentImageDialog`) para asignar o editar ese texto cuando el cursor está dentro de una tabla.
- **Rationale**: Las imágenes ya soportan un título opcional usado como leyenda (`figcaption`) y como fuente de datos para un futuro listado; las tablas no tienen ningún campo equivalente. Extender el esquema del nodo con un atributo adicional es el mismo patrón ya validado en el código (`DevelopmentImage.extend`), minimiza el código nuevo y mantiene el título de la tabla dentro del propio documento (offline, sin tablas auxiliares).
- **Alternatives considered**:
  - *Usar el texto del párrafo inmediatamente anterior/siguiente a la tabla como título implícito*: descartado — es ambiguo (ese párrafo podría ser contenido normal, no un título), frágil ante reordenamientos, y dificulta que el usuario entienda qué se está usando como caption.

## Decision 6: Persistencia y compatibilidad hacia atrás

- **Decision**: Los nuevos campos (`fontFamily`, `toc: { enabled, depth }`, `lists: { figuresEnabled, tablesEnabled }`) se agregan a `ApaFormDocument` como campos de nivel superior (junto a `pageSize`), con funciones `normalizeFontFamily`, `normalizeTocSettings`, `normalizeListSettings` análogas a `normalizePageSize` ya existente (`types.ts:17-19`), invocadas en la carga del documento en `useApaFormDocument.ts` (mismo lugar donde ya se normaliza `pageSize`). Los documentos existentes sin estos campos cargan con los valores por defecto: `fontFamily: "times-new-roman"`, `toc.enabled: false`, `lists.figuresEnabled/tablesEnabled: false` — visualmente idénticos a hoy.
- **Rationale**: Es exactamente el patrón ya probado para introducir un campo de documento opcional sin romper documentos guardados (`pageSize`/`normalizePageSize`), consistente con FR-019 y con SC-007 (los documentos existentes no cambian de apariencia).
- **Alternatives considered**:
  - *Versionar el esquema con una migración explícita (`migratedFrom`)*: descartado — no es necesario porque los campos nuevos son aditivos y opcionales; el patrón de normalización con default ya cubre el caso sin requerir detectar ni reescribir documentos antiguos.

## Decision 7: Enfoque de pruebas

- **Decision**: Igual que en `005-desarrollo-imagenes-tablas` — no existe framework de pruebas automatizadas en el repositorio. Se valida con `pnpm lint`, `pnpm typecheck`, `pnpm build` y verificación manual end-to-end (`pnpm dev` + impresión a PDF) siguiendo `quickstart.md`.
- **Rationale**: Consistencia con el resto del proyecto; introducir un framework de pruebas está fuera del alcance de esta mejora de formato.
