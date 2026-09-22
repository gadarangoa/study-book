# Tasks: Mejoras de Formato APA y Navegación en el Editor de PDF

**Input**: Design documents from `specs/006-mejoras-formato-apa-pdf/`

**Prerequisites**: [plan.md](./plan.md), [spec.md](./spec.md), [research.md](./research.md), [data-model.md](./data-model.md), [contracts/ui-contracts.md](./contracts/ui-contracts.md), [quickstart.md](./quickstart.md)

**Tests**: No se agregan tareas de framework de tests porque la especificación no las solicita y el repositorio no tiene framework de tests automatizadas configurado; la validación es manual end-to-end vía `quickstart.md` más los gates `pnpm lint`/`pnpm typecheck`/`pnpm build`.

**Organization**: Las tareas están agrupadas por historia de usuario (spec.md) para permitir entregas incrementales y verificables de forma independiente.

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Confirmar la superficie existente que se va a extender, sin introducir dependencias nuevas (research.md confirma que no se requiere ningún paquete adicional).

- [X] T001 Revisar `src/features/documents/types.ts`, `src/features/documents/apa-template.ts`, `src/features/documents/hooks/useApaFormDocument.ts`, `src/features/documents/lib/apa-format.ts`, `src/features/documents/lib/apa-styles.css`, `src/features/documents/components/apa-pdf-preview.tsx`, `src/features/documents/components/apa-form-editor.tsx`, `src/features/documents/components/bibliography-field.tsx`, `src/features/documents/components/development-field.tsx` y `src/features/documents/components/development-table-controls.tsx`, confirmando los puntos de extensión exactos descritos en [data-model.md](./data-model.md) y [contracts/ui-contracts.md](./contracts/ui-contracts.md).

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Crear el modelo de datos compartido (fuente, TOC, listados) del que dependen todas las historias.

**⚠️ CRITICAL**: Ninguna historia debe comenzar antes de completar esta fase.

- [X] T002 Ampliar `src/features/documents/types.ts` con `ApaFontFamily`, `APA_FONT_FAMILIES`, `APA_FONT_FAMILY_LABELS_ES`, `APA_DEFAULT_FONT_FAMILY`, `ApaTocDepth`, `TocSettings`, `APA_DEFAULT_TOC_SETTINGS`, `ListSettings`, `APA_DEFAULT_LIST_SETTINGS`, `TocEntry`, `ListEntry`, las funciones `normalizeFontFamily`, `normalizeTocSettings`, `normalizeListSettings`, y la extensión de `ApaFormDocument` con los campos `fontFamily`, `toc`, `lists`, exactamente según [data-model.md](./data-model.md).
- [X] T003 [P] Actualizar `src/features/documents/apa-template.ts` para que `createApaFormTemplate` (y cualquier otro punto de creación de documento nuevo) inicialice `fontFamily: APA_DEFAULT_FONT_FAMILY`, `toc: APA_DEFAULT_TOC_SETTINGS` y `lists: APA_DEFAULT_LIST_SETTINGS`.
- [X] T004 Actualizar `src/features/documents/hooks/useApaFormDocument.ts` para normalizar `fontFamily`/`toc`/`lists` con `normalizeFontFamily`/`normalizeTocSettings`/`normalizeListSettings` al cargar un documento (mismo punto donde ya se normaliza `pageSize`), y ampliar la firma de `updateFields` a `Pick<ApaFormDocument, "pageSize" | "title" | "status" | "fontFamily" | "toc" | "lists">`.

**Checkpoint**: El modelo de documento soporta fuente, TOC y listados con defaults seguros; los documentos existentes siguen cargando sin cambios visuales. Las historias de usuario pueden implementarse.

---

## Phase 3: User Story 1 - Documento exportado con tipografía y márgenes fieles a APA (Priority: P1) 🎯 MVP

**Goal**: El PDF exportado usa 12 pt en la fuente elegida (Times New Roman o Arial) y respeta los márgenes de 2.54 cm en los cuatro lados.

**Independent Test**: Elegir cada fuente disponible, exportar a PDF y verificar con un lector de PDF que el cuerpo del texto mide 12 pt en la fuente elegida y que los márgenes son de 2.54 cm en los cuatro lados, para Carta y A4.

### Implementation for User Story 1

- [X] T005 [P] [US1] Crear `src/features/documents/components/document-format-controls.tsx` con `DocumentFormatControlsProps` completas (`fontFamily`, `toc`, `lists` y sus `onChange`, según [contracts/ui-contracts.md](./contracts/ui-contracts.md)), implementando por ahora el selector de fuente (Times New Roman / Arial) etiquetado con nota fija "12 pt"; los controles de TOC y listados se agregan en fases posteriores dentro del mismo componente.
- [X] T006 [US1] Integrar `DocumentFormatControls` en `PreviewPane` dentro de `src/features/documents/components/apa-form-editor.tsx`, junto al selector de tamaño de papel, y agregar `onFormatChange` a `ApaFormEditorProps`.
- [X] T007 [US1] Cablear `onFormatChange` en `src/pages/document-editor.tsx` hacia `updateFields` (mismo patrón que `onPageSizeChange`).
- [X] T008 [P] [US1] Añadir en `src/features/documents/lib/apa-styles.css` las clases `apa-font-times` y `apa-font-arial` que fijan `font-family` sobre `.apa-document`, manteniendo `font-size: 12pt` fijo tanto en pantalla como en `@media print`.
- [X] T009 [US1] Aplicar la clase de fuente correspondiente a `document.fontFamily` sobre la raíz `.apa-document` en `src/features/documents/components/apa-pdf-preview.tsx`.
- [X] T010 [US1] Auditar `src/features/documents/lib/apa-styles.css` (regla `@page`) y `ApaPageStyle` en `src/features/documents/components/apa-pdf-preview.tsx` para confirmar que los márgenes de 2.54 cm se mantienen para tamaño Carta y A4 con ambas fuentes, corrigiendo cualquier regla que los altere.

**Checkpoint**: US1 funciona de manera independiente: el usuario elige fuente, la vista previa y el PDF exportado se ven a 12 pt en esa fuente, y los márgenes APA se cumplen en ambos tamaños de papel.

---

## Phase 4: User Story 2 - Referencias bibliográficas sin fecha exacta (Priority: P1)

**Goal**: Una referencia bibliográfica se puede guardar sin año, mostrándose como "(s.f.)".

**Independent Test**: Agregar una referencia con autor y título pero sin año, guardarla, y verificar que aparece en la lista y en el PDF como "(s.f.)" sin errores de validación bloqueantes.

### Implementation for User Story 2

- [X] T011 [P] [US2] Actualizar `src/features/documents/lib/apa-format.ts`: `isBibEntryComplete` deja de exigir `isValidBibYear` (solo `author` y `title` no vacíos), y `formatBibEntry` retorna `"(s.f.)"` en el lugar del año cuando `year` está vacío en vez de devolver cadena vacía.
- [X] T012 [P] [US2] Actualizar `validateEntry` en `src/features/documents/components/bibliography-field.tsx` para no marcar error cuando el campo "Año" esté vacío (solo validar formato de 4 dígitos si el usuario escribió algo), y actualizar el placeholder/texto de ayuda del campo para indicar que puede dejarse vacío y se mostrará como "(s.f.)".

**Checkpoint**: US2 funciona de manera independiente: referencias sin año se guardan, muestran "(s.f.)" en formulario y PDF, y el formato inválido (no vacío) sigue bloqueando el guardado.

---

## Phase 5: User Story 3 - Tabla de contenido automática y configurable (Priority: P2)

**Goal**: El documento incluye una tabla de contenido generada automáticamente con la profundidad (1-3 niveles) que el usuario elija.

**Independent Test**: Con un documento que tenga subtítulos de nivel 2 y 3 en Desarrollo, activar la tabla de contenido con distintas profundidades y verificar que la lista generada refleja los títulos y su orden, en la vista previa y en el PDF exportado.

### Implementation for User Story 3

- [X] T013 [P] [US3] Crear `src/features/documents/lib/toc.ts` con `extractTocEntries(sections: ApaFormSections, depth: ApaTocDepth): TocEntry[]` (función pura), recorriendo las secciones fijas como nivel 1 y los encabezados de nivel 2/3 dentro de `sections.development` según [data-model.md](./data-model.md) y [research.md](./research.md) (Decision 4).
- [X] T014 [US3] Extender `src/features/documents/components/document-format-controls.tsx` con el interruptor "Incluir tabla de contenido" y el selector de profundidad (1, 2 o 3 niveles), incluyendo el texto de ayuda que aclara que el índice no incluye número de página.
- [X] T015 [US3] Renderizar en `src/features/documents/components/apa-pdf-preview.tsx` la sección `#apa-toc` (después de la portada, antes de Introducción) usando `extractTocEntries`, omitiéndola por completo cuando `document.toc.enabled` sea `false` o no haya entradas.
- [X] T016 [P] [US3] Añadir en `src/features/documents/lib/apa-styles.css` los estilos de `#apa-toc` (sangría por nivel, salto de página propio en pantalla e impresión).

**Checkpoint**: US3 funciona de manera independiente: activar/desactivar la tabla de contenido y cambiar su profundidad actualiza la vista previa y el PDF sin acción manual adicional, y documentos sin encabezados de nivel 2/3 muestran solo las secciones fijas.

---

## Phase 6: User Story 4 - Listado de figuras y listado de tablas automáticos (Priority: P3)

**Goal**: El sistema genera automáticamente un listado de figuras y un listado de tablas, activables de forma independiente, a partir de los títulos que el usuario asigna a imágenes y tablas.

**Independent Test**: Insertar imágenes y una tabla tituladas (y alguna sin título) en Desarrollo, activar ambos listados y verificar que cada uno numera y transcribe correctamente solo los elementos de su tipo con título, en el orden de aparición.

### Implementation for User Story 4

- [X] T017 [P] [US4] Agregar `DevelopmentTableAttrs` en `src/features/documents/types.ts` según [data-model.md](./data-model.md).
- [X] T018 [US4] Extender el nodo `table` en `src/features/documents/components/development-field.tsx` con `Table.extend({ addAttributes ... })` para soportar el atributo `title` (mismo patrón que `DevelopmentImage.extend`).
- [X] T019 [US4] Añadir el botón "Título de tabla" y su diálogo (mismo patrón visual que `DevelopmentImageDialog`) en `src/features/documents/components/development-table-controls.tsx`, habilitado solo cuando `isTableActive`, e integrarlo en `development-field.tsx` para invocar `updateAttributes("table", { title })` sobre la tabla activa.
- [X] T020 [P] [US4] Extender `src/features/documents/lib/toc.ts` con `extractFigureEntries(development)` y `extractTableEntries(development)` (funciones puras), numerando correlativamente solo los nodos `image`/`table` con `title` no vacío, en orden de aparición, según [data-model.md](./data-model.md).
- [X] T021 [US4] Extender `src/features/documents/components/document-format-controls.tsx` con los interruptores independientes "Incluir listado de figuras" e "Incluir listado de tablas".
- [X] T022 [US4] Renderizar en `src/features/documents/components/apa-pdf-preview.tsx` las secciones `#apa-list-figures` y `#apa-list-tables` (usando `extractFigureEntries`/`extractTableEntries`, cada una omitida si está desactivada o sin entradas), y actualizar el `figcaption` de imagen y la leyenda de tabla para mostrar "Figura N: …"/"Tabla N: …" con la misma numeración.
- [X] T023 [P] [US4] Añadir en `src/features/documents/lib/apa-styles.css` los estilos de `#apa-list-figures`, `#apa-list-tables` y las leyendas numeradas de figura/tabla.

**Checkpoint**: US4 funciona de manera independiente: cada listado se activa por separado, solo incluye elementos con título, la numeración coincide entre la leyenda junto al elemento y el listado, y no aparecen secciones vacías.

---

## Phase 7: Polish & Cross-Cutting Concerns

**Purpose**: Cerrar accesibilidad, rendimiento y validar el conjunto completo.

- [X] T024 [P] Revisar labels, `aria-pressed`/estado anunciado, foco y navegación por teclado de `src/features/documents/components/document-format-controls.tsx` y del diálogo de título de tabla en `src/features/documents/components/development-table-controls.tsx`.
- [X] T025 [P] Revisar el rendimiento de `src/features/documents/lib/toc.ts` y del renderizado de `apa-pdf-preview.tsx` para documentos con hasta 20 encabezados de nivel 2/3 y 20 imágenes/tablas tituladas, confirmando el objetivo de actualización en menos de 3 segundos del plan.
- [X] T026 Ejecutar `pnpm lint` y corregir errores relacionados con `src/features/documents/` y `src/pages/document-editor.tsx`.
- [X] T027 Ejecutar `pnpm typecheck` y corregir errores de tipos en `src/features/documents/` y `src/pages/document-editor.tsx`.
- [X] T028 Ejecutar `pnpm build` y corregir errores de compilación o empaquetado relacionados con la ampliación.
- [ ] T029 Ejecutar todos los escenarios de [specs/006-mejoras-formato-apa-pdf/quickstart.md](./quickstart.md) con `pnpm dev`, incluyendo fuente/márgenes, bibliografía sin fecha, tabla de contenido, listados, compatibilidad con documentos existentes y accesibilidad.

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: Sin dependencias; T001 es la única tarea y precede a todo lo demás.
- **Foundational (Phase 2)**: Depende de Phase 1 y bloquea todas las historias; T002 debe completarse antes de T004 (usa los tipos y funciones de normalización) y antes de cualquier tarea de historia que use `ApaFontFamily`/`TocSettings`/`ListSettings`.
- **User Stories (Phase 3-6)**: Todas dependen de Phase 2. US1 y US2 son completamente independientes entre sí (no comparten archivos). US3 y US4 dependen de que exista `document-format-controls.tsx` (creado en US1, T005) para extenderlo con sus propios controles, y de `lib/toc.ts` (creado en US3, T013) — US4 lo extiende en T020 en vez de crearlo de nuevo.
- **Polish (Phase 7)**: Depende de las historias que se quieran entregar.

### User Story Dependencies

- **US1 (P1)**: Puede comenzar después de Phase 2; es el MVP recomendado. Crea `document-format-controls.tsx`, que US3 y US4 extenderán.
- **US2 (P1)**: Puede comenzar después de Phase 2, en paralelo con US1; no comparte ningún archivo con US1.
- **US3 (P2)**: Puede comenzar después de Phase 2, pero para no generar conflictos de archivo debe completarse después de US1 (extiende `document-format-controls.tsx` y `apa-pdf-preview.tsx`, ambos tocados por US1).
- **US4 (P3)**: Debe completarse después de US1 y US3 (extiende `document-format-controls.tsx`, `apa-pdf-preview.tsx` y `lib/toc.ts` creados/tocados por ambas).

### Within Each User Story

- El modelo de datos (Phase 2) precede a cualquier UI que lo consuma.
- Dentro de US1: el componente de formato (T005) precede a su integración (T006-T007); los estilos de fuente (T008) preceden a su aplicación en el preview (T009); la auditoría de márgenes (T010) cierra la historia.
- Dentro de US3/US4: la función de extracción pura (`lib/toc.ts`) precede al control de UI y al renderizado en preview.
- Cada checkpoint debe validarse antes de iniciar la siguiente historia que dependa de los mismos archivos.

## Parallel Opportunities

- **Phase 2**: T003 (`apa-template.ts`) puede avanzar en paralelo con T002 (`types.ts`) consultando los nombres exactos ya fijados en [data-model.md](./data-model.md); T004 depende de T002.
- **US1**: T005 y T008 tocan archivos distintos (`document-format-controls.tsx` y `apa-styles.css`) y pueden avanzar en paralelo.
- **US2**: T011 (`apa-format.ts`) y T012 (`bibliography-field.tsx`) tocan archivos distintos y pueden avanzar en paralelo.
- **US3**: T013 (`lib/toc.ts`) puede avanzar en paralelo con T016 (estilos); ambos preceden a T015 (render).
- **US4**: T017 (tipo) y T020 (funciones de extracción) pueden avanzar en paralelo entre sí; T023 (estilos) puede avanzar en paralelo con T017-T020.
- **Entre historias**: US1 y US2 pueden avanzar en paralelo tras Phase 2. US3 y US4 deben esperar a que `document-format-controls.tsx` exista (US1) y, en el caso de US4, a que `lib/toc.ts` exista (US3).
- **Polish**: T024 y T025 son paralelizables antes de los gates T026-T028.

## Parallel Example: User Stories 1 and 2

```text
# Después de Phase 2, con dos personas o agentes:
Task A: T005-T010 [US1] Selector de fuente, wiring, clases de fuente y auditoría de márgenes
Task B: T011-T012 [US2] Año de bibliografía opcional y "(s.f.)"

# Después de completar US1:
Task C: T013-T016 [US3] Tabla de contenido configurable

# Después de completar US1 y US3:
Task D: T017-T023 [US4] Título de tabla, listados de figuras y de tablas
```

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Completar Phase 1 y Phase 2.
2. Completar US1: selector de fuente, 12 pt fijo y márgenes APA confirmados.
3. Ejecutar el escenario 1 de [quickstart.md](./quickstart.md) y `pnpm lint`/`pnpm typecheck`.
4. Detenerse para validar la experiencia antes de continuar.

### Incremental Delivery

1. Phase 1 + Phase 2: modelo de datos compartido con defaults seguros.
2. US1: fuente y márgenes APA fieles (MVP, resuelve la queja principal de "letra muy pequeña").
3. US2: bibliografía sin fecha exacta (independiente de US1, puede entregarse en paralelo o inmediatamente después).
4. US3: tabla de contenido automática y configurable.
5. US4: listado de figuras y listado de tablas automáticos.
6. Phase 7: gates, quickstart completo y revisión de accesibilidad/rendimiento.

### Notes

- Todas las tareas usan el formato obligatorio `- [ ] T### [P?] [US?] descripción con ruta`.
- No se crean tareas de tests automatizados porque no fueron solicitadas y el repositorio no tiene framework de tests configurado.
- `document-format-controls.tsx`, `apa-pdf-preview.tsx` y `lib/toc.ts` son archivos compartidos entre varias historias (US1/US3/US4): coordinar si se trabajan en paralelo por distintas personas o agentes para evitar conflictos de fusión.
