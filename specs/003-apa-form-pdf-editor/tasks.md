# Tasks: Editor APA por Formulario con Vista Previa PDF

**Input**: Design documents from `/specs/003-apa-form-pdf-editor/`

**Prerequisites**: plan.md, spec.md (5 user stories), research.md, data-model.md, contracts/ui-contracts.md, quickstart.md

**Tests**: No se solicitan tests automatizados en el spec y el repo no tiene framework de tests; la validación es manual según quickstart.md + gates `pnpm lint` / `pnpm typecheck`.

**Organization**: Tareas agrupadas por historia de usuario; cada fase es un incremento independientemente comprobable.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Verificar entorno y primitivas UI necesarias antes de implementar.

- [X] T001 Verificar entorno: `pnpm install`, `pnpm dev` arranca, TipTap/underline/text-align ya instalados (sin dependencias nuevas según research R2/R3)
- [X] T002 [P] Auditar primitivas shadcn necesarias (Dialog, FieldGroup/Input, Textarea, Button, Tabs, Badge) en `src/components/` y agregar las faltantes con `npx shadcn@latest add`

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Modelo de datos v2, plantilla, persistencia, formateador, estilos compartidos y hooks — todo lo que las historias necesitan.

**⚠️ CRITICAL**: No user story work can begin until this phase is complete.

- [X] T003 [P] Extender tipos en `src/features/documents/types.ts`: `ApaFormSections`, `CoverData`, `BibEntry`, `ApaFormDocument`, `APA_FORM_TEMPLATE_VERSION`, guards sin `any` (data-model.md)
- [X] T004 [P] Implementar formateador puro `formatBibEntry` en `src/features/documents/lib/apa-format.ts` (research R4)
- [X] T005 [P] Crear hoja APA compartida preview/impresión en `src/features/documents/lib/apa-styles.css` (márgenes 2.54cm, Times 12pt, doble espacio, `@page`/`@media print` base)
- [X] T006 Implementar `createApaFormTemplate(courseName)` en `src/features/documents/apa-template.ts` (depende de T003)
- [X] T007 Registrar store `apaDocuments` en `StoreMap` de `src/lib/db.ts`, extender `deleteByCourseId` e incluirlo en `deleteCourseCascade` (depende de T003; sigue el patrón Firestore existente, research R5 adaptado)
- [X] T008 Actualizar `firestore.rules` y `firestore.indexes.json` para la colección `apaDocuments` (lectura/escritura por `uid`, consulta por `courseId`)
- [X] T009 Implementar hook `useApaDocuments(courseId)` en `src/features/documents/hooks/useApaDocuments.ts` (crear/renombrar/duplicar/eliminar/estado; depende de T003, T007)
- [X] T010 Implementar hook `useApaFormDocument(documentId)` en `src/features/documents/hooks/useApaFormDocument.ts` (autoguardado con debounce ~1s + al desmontar, `saveState`, migración 002→v2; depende de T003, T006, T007)
- [X] T011 Crear interfaz pública del feature en `src/features/documents/index.ts` (re-exporta tipos, template, hooks, formateador; constitución IV)

**Checkpoint**: Foundation ready - user story implementation can now begin.

---

## Phase 3: User Story 1 - Iniciar un entregable desde la plantilla APA (Priority: P1) 🎯 MVP

**Goal**: Crear un documento desde un curso que nace con la plantilla APA y se abre en la ruta del editor mostrando la vista previa del documento base.

**Independent Test**: Crear un documento desde la vista de un curso; verificar que queda asociado a ese curso, que la ruta del editor se abre y que la vista previa muestra portada + secciones base con formato APA en menos de 1 minuto. Sin curso, se pide seleccionar/crear uno (no hay huérfanos).

- [X] T012 [P] [US1] Crear componente `ApaPdfPreview` (render de solo lectura, data-driven) en `src/features/documents/components/apa-pdf-preview.tsx` (portada + secciones + referencias vía `formatBibEntry`; es el DOM que se imprimirá)
- [X] T013 [P] [US1] Crear diálogo de creación `DocumentCreateDialog` en `src/features/documents/components/document-create-dialog.tsx` (título requerido, crea desde plantilla vía `useApaDocuments`)
- [X] T014 [US1] Integrar punto de entrada de creación en `src/pages/course-detail.tsx` (sección "Documentos APA" con diálogo y navegación al editor; la página usa `CourseLanding`, no el componente `course-detail.tsx`)
- [X] T015 [US1] Registrar ruta `/courses/:courseId/documents/:documentId` en `src/App.tsx` y crear página shell en `src/pages/document-editor.tsx` (carga `useApaFormDocument`, renderiza `ApaPdfPreview` + aviso de plantilla; el formulario llega en US2)

**Checkpoint**: US1 funciona sola — crear → abrir → ver preview APA de la plantilla.

---

## Phase 4: User Story 2 - Rellenar el formulario seccionado con vista previa en vivo (Priority: P1)

**Goal**: Vista dividida formulario (izquierda) + preview (derecha) con binding en vivo y autoguardado por sección.

**Independent Test**: Rellenar portada, introducción, desarrollo (negrita/cursiva/listas) y conclusiones; cada cambio se refleja en el preview en <3s; recargar conserva el progreso; todo operable por teclado/lector.

**Depends on**: US1 (ruta del editor, `ApaPdfPreview`).

- [X] T016 [P] [US2] Crear `CoverFields` en `src/features/documents/components/cover-fields.tsx` (FieldGroup shadcn, título/autor requeridos con error inline)
- [X] T017 [P] [US2] Crear `SectionFields` (introducción + conclusiones) en `src/features/documents/components/section-fields.tsx` (textareas con mínimo orientativo no bloqueante)
- [X] T018 [P] [US2] Crear `DevelopmentField` (TipTap acotado: negrita, cursiva, encabezados, listas, alineación, cita) en `src/features/documents/components/development-field.tsx`
- [X] T019 [US2] Crear `BibliographyField` (versión US2: lista derivada de solo lectura + estado vacío) en `src/features/documents/components/bibliography-field.tsx` (la gestión dinámica completa llega en US4, mismo archivo)
- [X] T020 [US2] Crear vista dividida `ApaFormEditor` en `src/features/documents/components/apa-form-editor.tsx` (rejilla 2 col + pestañas en móvil, indicador de guardado como texto, integra T016–T019 con `updateSections` y `ApaPdfPreview` en vivo) y usarla en `src/pages/document-editor.tsx`

**Checkpoint**: US1 + US2 funcionan — crear, rellenar por secciones y ver el PDF en vivo con autoguardado.

---

## Phase 5: User Story 3 - Gestionar varios documentos por curso (Priority: P2)

**Goal**: Lista de documentos por curso con título, estado y fecha; renombrar, duplicar, eliminar (confirmada) y cambio de estado.

**Independent Test**: Varios documentos en dos cursos; cada curso lista solo los suyos; renombrar/duplicar/eliminar/cambiar estado no afecta a otros; eliminar curso informa qué documentos se borrarán.

**Depends on**: Foundational (hooks); reutiliza US1/US2 para crear/abrir.

- [X] T021 [P] [US3] Crear `DocumentList` en `src/features/documents/components/document-list.tsx` (título, badge de estado —no solo color—, fecha, menú abrir/renombrar/duplicar/eliminar/cambiar estado, estado vacío con crear)
- [X] T022 [US3] Registrar ruta `/courses/:courseId/documents` en `src/App.tsx`, crear página en `src/pages/documents.tsx` e integrar la lista como sección/tab en `src/features/courses/components/course-detail.tsx`
- [X] T023 [US3] Implementar renombrar, duplicar y cambio de estado (borrador/en revisión/finalizado) con diálogos shadcn con título accesible (usa `useApaDocuments`; puede vivir en `document-list.tsx` + diálogos en `document-create-dialog.tsx` reutilizado)
- [X] T024 [US3] Implementar eliminación con Dialog de confirmación informada (incluye aviso de cascada al eliminar curso en `course-detail.tsx`)

**Checkpoint**: US1–US3 funcionan — ciclo completo crear/editar/organizar por curso.

---

## Phase 6: User Story 4 - Gestionar bibliografía dinámica (Priority: P2)

**Goal**: Agregar, editar, reordenar y eliminar entradas de bibliografía con validación, reflejadas en preview y PDF.

**Independent Test**: Agregar 3 entradas, editar una, reordenar, eliminar una (confirmada); referencias en preview con formato APA; año inválido muestra qué corregir sin perder datos ni romper el preview.

**Depends on**: US2 (`BibliographyField` base en el mismo archivo).

- [X] T025 [US4] Extender `src/features/documents/components/bibliography-field.tsx` con agregar/editar/eliminar entradas (formulario inline: autor, año, título, fuente; eliminar con confirmación si tiene contenido)
- [X] T026 [US4] Añadir reordenar con botones subir/bajar por teclado, validación inline (año numérico 4 dígitos, campos requeridos) y marcado de entrada pendiente/incompleta sin romper preview/exportación en `src/features/documents/components/bibliography-field.tsx`

**Checkpoint**: US1–US4 funcionan — bibliografía totalmente dinámica.

---

## Phase 7: User Story 5 - Exportar el entregable a PDF (Priority: P2)

**Goal**: Controles del preview (páginas, zoom, exportar) y exportación a PDF fiel a la vista previa con manejo de errores.

**Independent Test**: Exportar documento completo → PDF descargable idéntico al preview (incluye tildes/ñ); documento vacío → PDF válido con estructura base; error → mensaje claro sin pérdida + reintento.

**Depends on**: US1/US2 (`ApaPdfPreview`, estilos base de Phase 2).

- [X] T027 [US5] Añadir controles a `src/features/documents/components/apa-pdf-preview.tsx` (anterior/siguiente página por desplazamiento, selector de zoom solo `@media screen`, botón "Exportar PDF"; navegables por teclado)
- [X] T028 [US5] Finalizar reglas `@media print` en `src/features/documents/lib/apa-styles.css` (saltos de página, repetición de encabezados, sin truncar) e implementar `onExportPdf` vía `window.print()` con estado de error y reintento en `src/pages/document-editor.tsx`

**Checkpoint**: Las 5 historias funcionan — crear, editar, organizar, referenciar y exportar.

---

## Phase 8: Polish & Cross-Cutting Concerns

**Purpose**: Accesibilidad, responsive, validación end-to-end y gates de la constitución.

- [X] T029 [P] Pestañas accesibles Formulario/Vista previa en pantallas estrechas en `src/features/documents/components/apa-form-editor.tsx` (mismo estado, sin pérdida)
- [X] T030 [P] Revisión de accesibilidad: labels, `aria`, diálogos con título, estado de guardado/estado de avance nunca solo con color, foco visible (archivos de `src/features/documents/components/`)
- [X] T031 Ejecutar validación completa de `specs/003-apa-form-pdf-editor/quickstart.md` con `pnpm dev` (5 escenarios + casos borde: vacío, largo, caracteres especiales)
- [X] T032 Gates finales: `pnpm lint`, `pnpm typecheck` y `pnpm build` en cero errores

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Setup - BLOCKS all user stories
- **User Stories (Phase 3–7)**: All depend on Foundational; además US2→US1, US4→US2 (mismo archivo), US5→US1/US2
- **Polish (Phase 8)**: Depends on all user stories being complete

### User Story Dependencies

- **US1 (P1)**: After Foundational - No dependencies on other stories - 🎯 MVP (crear + ver preview de plantilla)
- **US2 (P1)**: After US1 - extiende la página del editor con el formulario (MVP usable real: US1+US2)
- **US3 (P2)**: After Foundational - integrable en paralelo con US2 a nivel de archivos distintos, pero se recomienda tras US1/US2
- **US4 (P2)**: After US2 - modifica `bibliography-field.tsx` creado en US2 (mismo archivo, secuencial)
- **US5 (P2)**: After US1/US2 - extiende `apa-pdf-preview.tsx` y `apa-styles.css` (mismos archivos, secuencial)

### Within Each User Story

- Componentes en archivos distintos marcados [P] pueden implementarse en paralelo (contratos fijan props)
- Tareas sobre el mismo archivo (T025→T026, T027→T028 parcialmente) son secuenciales
- Completar la historia y validarla con su Independent Test antes de pasar a la siguiente

### Parallel Opportunities

- Phase 1: T002 en paralelo con T001
- Phase 2: T003+T004+T005 en paralelo; T006/T009/T010 arrancan tras T003+T007; T008 en paralelo con todo (archivos distintos)
- Phase 3: T012+T013 en paralelo; T014+T015 tras ellos
- Phase 4: T016+T017+T018+T019 en paralelo; T020 tras ellos
- Phase 5: T021 independiente; T022–T024 secuenciales (mismos archivos de integración)
- Phase 8: T029+T030 en paralelo; T031→T032 secuenciales

---

## Parallel Example: Phase 4 (User Story 2)

```bash
# Lanzar secciones del formulario en paralelo (archivos distintos, props fijadas en contratos):
Task: "Crear CoverFields en src/features/documents/components/cover-fields.tsx"
Task: "Crear SectionFields en src/features/documents/components/section-fields.tsx"
Task: "Crear DevelopmentField en src/features/documents/components/development-field.tsx"
Task: "Crear BibliographyField (solo lectura) en src/features/documents/components/bibliography-field.tsx"
# Después, ensamblar:
Task: "Crear ApaFormEditor en src/features/documents/components/apa-form-editor.tsx"
```

---

## Implementation Strategy

### MVP First (US1 + US2)

1. Complete Phase 1: Setup
2. Complete Phase 2: Foundational (CRITICAL - blocks all stories)
3. Complete Phase 3: US1 (crear + preview de plantilla) → validar
4. Complete Phase 4: US2 (formulario + preview en vivo) → validar
5. **STOP and VALIDATE**: crear, rellenar las 5 secciones y comprobar preview + autoguardado (quickstart §1–2)

### Incremental Delivery

1. Setup + Foundational → base lista
2. + US1 → crear y previsualizar plantilla (demo)
3. + US2 → editor por formulario usable (MVP real)
4. + US3 → organización por curso
5. + US4 → bibliografía dinámica
6. + US5 → controles PDF + exportación (feature completo)
7. + Polish → gates y validación quickstart completa

---

## Notes

- [P] tasks = different files, no dependencies
- [Story] label maps task to specific user story for traceability
- Desviación documentada respecto a plan/research: la persistencia sigue el patrón Firestore real de `src/lib/db.ts` (StoreMap + cascada), no IndexedDB directo; el comportamiento offline-first se mantiene vía las capacidades del SDK existente
- Commit after each task or logical group; stop at any checkpoint to validate
- Format validation: las 32 tareas cumplen `- [ ] [ID] ([P]?) ([Story]?) Descripción con ruta exacta`
