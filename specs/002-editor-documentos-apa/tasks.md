# Tasks: Editor de Documentos APA

**Input**: Design documents from `/specs/002-editor-documentos-apa/`

**Prerequisites**: plan.md (required), spec.md (required for user stories), research.md, data-model.md, contracts/

**Tests**: No se solicitan tests automatizados en el spec (sin framework de tests en el repo); la validación es manual vía `quickstart.md` + `pnpm lint` y `pnpm typecheck`.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

## Path Conventions

- Feature modular en SPA existente: `src/features/documents/` (components/, hooks/, types.ts), estilos y plantilla co-ubicados, rutas en `src/pages/` + router existente, store IndexedDB en `src/lib/`.

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Dependencias y estructura base del feature

- [X] T001 Instalar dependencias TipTap v3 (@tiptap/react, @tiptap/starter-kit, @tiptap/extension-table, @tiptap/extension-text-align) y KaTeX con `pnpm add` en `package.json`
- [X] T002 [P] Crear estructura del feature `src/features/documents/` con `components/`, `hooks/`, `types.ts`, `apa-template.ts`, `apa-print.css` (archivos vacíos/placeholder con exports mínimos)
- [X] T003 [P] Verificar baseline `pnpm typecheck` y `pnpm lint` en cero errores antes de implementar

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Tipos, plantilla, estilos APA, persistencia y hooks base que TODAS las historias necesitan

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [X] T004 Definir tipos `ApaDocument`, `ApaDocumentStatus`, `ApaDocumentContent`, `ApaDocumentFormData`, `APA_TEMPLATE_VERSION` en `src/features/documents/types.ts`
- [X] T005 [P] Implementar plantilla inicial APA 7.ª ed. en español (portada + secciones base como JSON TipTap) en `src/features/documents/apa-template.ts`
- [X] T006 [P] Implementar hoja de estilos APA compartida preview/impresión (`@page` 2.54 cm, Times New Roman 12pt, doble espacio, portada, niveles de encabezado) en `src/features/documents/apa-print.css`
- [X] T007 Crear store IndexedDB `apa-documents` indexado por `courseId` en `src/lib/` (siguiendo el patrón de 001)
- [X] T008 Implementar hooks `useApaDocuments(courseId)` y `useApaDocument(documentId)` con autoguardado debounced y `saveState` en `src/features/documents/hooks/useApaDocuments.ts` y `src/features/documents/hooks/useApaDocument.ts`
- [X] T009 Añadir rutas `/courses/:courseId/documents` y `/courses/:courseId/documents/:documentId` en el router existente (`src/` router + `src/pages/`)
- [X] T010 Verificar `pnpm typecheck` y `pnpm lint` en cero errores tras la fundación

**Checkpoint**: Foundation ready - user story implementation can now begin in parallel

---

## Phase 3: User Story 1 - Crear un entregable desde la plantilla APA (Priority: P1) 🎯 MVP

**Goal**: Crear un documento nuevo desde un curso que nace con la plantilla APA aplicada, listo para editar

**Independent Test**: Desde un curso, crear "Ensayo 1" y comprobar que abre con portada, secciones base y formato APA sin configuración manual (quickstart V1)

### Implementation for User Story 1

- [X] T011 [P] [US1] Implementar `DocumentForm` (dialog shadcn con título requerido, crear/renombrar) en `src/features/documents/components/DocumentForm.tsx`
- [X] T012 [US1] Implementar creación desde plantilla (nuevo id, `courseId`, contenido = `apa-template.ts`, estado `draft`) y apertura del editor en `src/pages/` (vista de documentos del curso)
- [X] T013 [US1] Integrar botón "Nuevo documento" en el detalle de curso existente (`src/features/courses/`, solo consumo de la interfaz pública de documents)
- [X] T014 [US1] Implementar `ApaTemplateNotice` (aviso de versión de plantilla) en `src/features/documents/components/ApaTemplateNotice.tsx`
- [X] T015 [US1] Validar quickstart V1 manual + `pnpm typecheck` y `pnpm lint`

**Checkpoint**: At this point, User Story 1 should be fully functional and testable independently

---

## Phase 4: User Story 2 - Editar con vista previa del documento final (Priority: P2)

**Goal**: Editor enriquecido con toolbar y vista previa APA en vivo, con autoguardado y soporte de citas, tablas, figuras y fórmulas simples

**Independent Test**: Editar texto, formato, cita, tabla y figura; la preview refleja cada cambio en <3 s; navegación por teclado completa (quickstart V2)

### Implementation for User Story 2

- [X] T016 [P] [US2] Implementar `DocumentEditor` (TipTap editable + toolbar shadcn: formato, encabezados, listas, alineación, cita, tabla, figura, fórmula) en `src/features/documents/components/DocumentEditor.tsx`
- [X] T017 [P] [US2] Implementar `DocumentPreview` (render solo-lectura con `apa-print.css`, mismo DOM que se imprime) en `src/features/documents/components/DocumentPreview.tsx`
- [X] T018 [P] [US2] Integrar nodo de fórmula KaTeX (render offline + estilos imprimibles) en `src/features/documents/components/DocumentEditor.tsx`
- [X] T019 [US2] Conectar editor ↔ `useApaDocument` (debounce ~1s, guardado al desmontar, indicador de estado como texto + reintento) y layout editor/preview en la ruta `/:documentId`
- [X] T020 [US2] Validar quickstart V2 manual (incluye pasada de teclado y lector de pantalla) + `pnpm typecheck` y `pnpm lint`

**Checkpoint**: At this point, User Stories 1 AND 2 should both work independently

---

## Phase 5: User Story 3 - Organizar varios documentos por curso (Priority: P2)

**Goal**: Lista de documentos por curso con renombrar, duplicar, eliminar (confirmada), estados de avance y cascada informada al eliminar el curso

**Independent Test**: 3 documentos en un curso (renombrar/duplicar/eliminar uno sin afectar otros ni otros cursos); recarga conserva progreso; estados persisten (quickstart V3)

### Implementation for User Story 3

- [X] T021 [P] [US3] Implementar `DocumentList` (título, badge de estado, fecha de modificación, menú abrir/renombrar/duplicar/eliminar, estado vacío) en `src/features/documents/components/DocumentList.tsx`
- [X] T022 [US3] Implementar renombrar, duplicar (" (copia)", nuevo id) y eliminar con Dialog de confirmación usando `useApaDocuments` en `src/pages/` (vista de documentos del curso)
- [X] T023 [US3] Implementar cambio manual de estado `draft` ↔ `in_review` ↔ `finalized` en `src/features/documents/components/DocumentList.tsx`
- [X] T024 [US3] Integrar `DocumentList` como sección del detalle de curso existente e informar documentos afectados al eliminar un curso (`src/features/courses/`, borrado en cascada en lógica de aplicación)
- [X] T025 [US3] Validar quickstart V3 manual + `pnpm typecheck` y `pnpm lint`

**Checkpoint**: All user stories should now be independently functional

---

## Phase 6: User Story 4 - Exportar el entregable a PDF (Priority: P2)

**Goal**: Exportación a PDF fiel a la vista previa (mismo DOM/estilos vía impresión) con manejo claro de errores y reintento

**Independent Test**: Documento con portada, cita y tabla exporta a PDF válido idéntico a la preview; el fallo muestra mensaje sin perder contenido (quickstart V4)

### Implementation for User Story 4

- [X] T026 [US4] Implementar flujo de exportación (`window.print()` sobre el DOM de `DocumentPreview` + reglas `@media print`) y botón "Exportar PDF" en `src/features/documents/components/DocumentEditor.tsx`
- [X] T027 [US4] Endurecer impresión de documentos largos (reglas de salto de página, tablas/figuras sin truncar, Unicode/tildes) en `src/features/documents/apa-print.css`
- [X] T028 [US4] Implementar aviso de error de exportación con reintento y garantía de no pérdida en `src/features/documents/components/DocumentEditor.tsx`
- [X] T029 [US4] Validar quickstart V4 manual (PDF de documento con portada, cita, tabla y figura) + `pnpm typecheck` y `pnpm lint`

**Checkpoint**: All user stories should now be independently functional

---

## Phase 7: Polish & Cross-Cutting Concerns

**Purpose**: Verificación integral y accesibilidad final

- [X] T030 [P] Ejecutar guía completa `specs/002-editor-documentos-apa/quickstart.md` (V1–V4) y corregir regresiones
- [X] T031 [P] Pasada de accesibilidad (teclado, labels/aria, títulos de Dialogs, estados no solo por color) en `src/features/documents/components/`
- [X] T032 Verificación final `pnpm dev` en navegador + `pnpm typecheck` y `pnpm lint` en cero errores

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion - BLOCKS all user stories
- **User Stories (Phase 3-6)**: All depend on Foundational phase completion
  - User stories can then proceed in parallel (if staffed)
  - Or sequentially in priority order (US1 → US2 → US3 → US4)
- **Polish (Phase 7)**: Depends on all desired user stories being complete

### User Story Dependencies

- **User Story 1 (P1)**: Can start after Foundational (Phase 2) - No dependencies on other stories
- **User Story 2 (P2)**: Can start after Foundational (Phase 2) - integra el documento creado en US1 pero testeable con documentos seed
- **User Story 3 (P2)**: Can start after Foundational (Phase 2) - integra US1/US2 pero testeable con documentos seed
- **User Story 4 (P2)**: Can start after Foundational (Phase 2) - requiere `DocumentPreview` de US2 para el DOM de impresión (dependencia real: hacer US2 antes o en paralelo con contrato estable)

### Within Each User Story

- Core implementation before integration
- Story complete before moving to next priority
- `pnpm typecheck` + `pnpm lint` como puertas tras cada historia

### Parallel Opportunities

- T002 + T003 (setup, archivos distintos) en paralelo
- T005 + T006 (plantilla y estilos, archivos distintos) en paralelo
- T016 + T017 + T018 (editor, preview, KaTeX) en paralelo tras fundación si hay capacidad (nota: T018 toca el mismo archivo que T016 — secuenciar si una sola persona)
- T021 puede iniciar en paralelo con US2 una vez completa la fundación
- T030 + T031 (quickstart y a11y) en paralelo

---

## Parallel Example: User Story 2

```bash
# Launch independent files for User Story 2 together:
Task: "Implementar DocumentPreview en src/features/documents/components/DocumentPreview.tsx"
Task: "Integrar nodo de fórmula KaTeX (tras T016 si un solo desarrollador, mismo archivo)"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup
2. Complete Phase 2: Foundational (CRITICAL - blocks all stories)
3. Complete Phase 3: User Story 1
4. **STOP and VALIDATE**: Test User Story 1 independently (quickstart V1)
5. Deploy/demo if ready

### Incremental Delivery

1. Complete Setup + Foundational → Foundation ready
2. Add User Story 1 → Test independently → Deploy/Demo (MVP!)
3. Add User Story 2 → Test independently → Deploy/Demo (editor usable end-to-end con US1)
4. Add User Story 3 → Test independently → Deploy/Demo (gestión por curso)
5. Add User Story 4 → Test independently → Deploy/Demo (PDF entregable)
6. Each story adds value without breaking previous stories

### Parallel Team Strategy

With multiple developers:

1. Team completes Setup + Foundational together
2. Once Foundational is done:
   - Developer A: User Story 1 + User Story 4 (creación y exportación)
   - Developer B: User Story 2 (editor + preview)
   - Developer C: User Story 3 (lista y gestión)
3. Stories complete and integrate independently (US4 necesita el contrato de `DocumentPreview` de US2)

---

## Notes

- [P] tasks = different files, no dependencies
- [Story] label maps task to specific user story for traceability
- Each user story should be independently completable and testable
- Commit after each task or logical group
- Stop at any checkpoint to validate story independently
- T018 y T016 comparten archivo: en equipo de una persona, hacerlos secuencialmente
- Trazabilidad: US1→FR-001/FR-002, US2→FR-003–FR-007/FR-010/FR-014, US3→FR-008/FR-009/FR-012, US4→FR-011/FR-013
