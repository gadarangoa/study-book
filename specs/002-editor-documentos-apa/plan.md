# Implementation Plan: Editor de Documentos APA

**Branch**: `002-editor-documentos-apa` | **Date**: 2026-09-10 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/002-editor-documentos-apa/spec.md`

## Summary

Módulo transversal de edición de entregables académicos: cada documento nace
de una plantilla con formato APA 7.ª ed. por defecto, se edita en un editor
de texto enriquecido con vista previa fiel y vive asociado a un curso
(varios documentos por curso), con autoguardado offline y exportación a PDF
idéntica a la vista previa. Enfoque técnico (ver [research.md](./research.md)):
TipTap como motor con su JSON como fuente única para editor/preview/impresión,
KaTeX para fórmulas simples, exportación vía impresión del navegador con CSS
`@page` compartido, y persistencia en IndexedDB reutilizando el patrón de
hooks de 001.

## Technical Context

**Language/Version**: TypeScript 6, React 19 + Vite 8

**Primary Dependencies**: TipTap v3 (editor, NUEVA), KaTeX (fórmulas, NUEVA),
shadcn/ui v4 + Tailwind v4 (UI), React Router v8 (rutas), `idb`/capa IndexedDB
existente de 001 (persistencia)

**Storage**: IndexedDB, store nuevo `apa-documents` indexado por `courseId`
(offline-first, sin backend)

**Testing**: Sin framework de tests en el repo; validación manual con `pnpm dev`
según [quickstart.md](./quickstart.md) + `pnpm lint` y `pnpm typecheck` en cero
errores (puertas de la constitución)

**Target Platform**: SPA en navegadores modernos de escritorio (Chrome, Firefox,
Safari, Edge); impresión a PDF del navegador como salida

**Project Type**: Web application frontend (feature modular dentro del SPA existente)

**Performance Goals**: Vista previa actualizada en <3 s en documentos de hasta
~20 páginas (SC-002); creación de documento en <1 min (SC-001); exportación a
PDF exitosa ≥95% en documentos habituales (SC-004)

**Constraints**: Offline-capable (funciona sin conexión, FR-010); fidelidad
preview == PDF por construcción (mismo DOM/estilos); accesibilidad por teclado
y lector de pantalla en acciones principales (FR-014)

**Scale/Scope**: Un usuario local; decenas de cursos; varios documentos por
curso de hasta ~20 páginas; 5 componentes + 2 hooks + 2 rutas nuevas

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principio | Evaluación |
|-----------|------------|
| I. Component-First (shadcn) | ✅ PASS — Toolbar con Button/Toggle/Select, diálogos (crear/renombrar/eliminar) con Dialog, badges de estado; sin divs con estilo manual donde exista primitiva. |
| II. Type-Safe Data Modeling | ✅ PASS — `ApaDocument`, `ApaDocumentStatus`, `ApaDocumentContent` definidos en `types.ts` antes de implementar; sin `any`; sin cambios a esquemas de 001. |
| III. Offline-First (IndexedDB) | ✅ PASS — Persistencia 100% local en IndexedDB con el patrón de 001; impresión/PDF y KaTeX funcionan sin red; sin backend. |
| IV. Modular Boundaries (`src/features/documents/`) | ✅ PASS — Todo el código en `src/features/documents/` (`components/`, `hooks/`, `types.ts`, estilos APA); Course/Career solo vía imports públicos; expone `DocumentList` para el detalle de curso. |
| V. Accessible by Default | ✅ PASS — Acciones por teclado, labels/aria en toolbar y formularios, Dialogs con título, estado de guardado como texto (no solo color). |

Re-check post-Phase 1: el diseño (data-model, contratos) no introduce
violaciones — sin excepciones que justificar. Nuevas dependencias (TipTap,
KaTeX) son bibliotecas de UI/render, no capas arquitectónicas.

## Project Structure

### Documentation (this feature)

```text
specs/002-editor-documentos-apa/
├── plan.md              # This file (/speckit.plan command output)
├── research.md          # Phase 0 output (/speckit.plan command)
├── data-model.md        # Phase 1 output (/speckit.plan command)
├── quickstart.md        # Phase 1 output (/speckit.plan command)
├── contracts/           # Phase 1 output (/speckit.plan command)
│   └── ui-contracts.md
├── checklists/
│   └── requirements.md
└── tasks.md             # Phase 2 output (/speckit.tasks command - NOT created by /speckit.plan)
```

### Source Code (repository root)

```text
src/
├── features/
│   ├── documents/                  # NUEVO (feature 002)
│   │   ├── components/
│   │   │   ├── DocumentList.tsx
│   │   │   ├── DocumentForm.tsx
│   │   │   ├── DocumentEditor.tsx
│   │   │   ├── DocumentPreview.tsx
│   │   │   └── ApaTemplateNotice.tsx
│   │   ├── hooks/
│   │   │   ├── useApaDocuments.ts
│   │   │   └── useApaDocument.ts
│   │   ├── apa-template.ts          # plantilla inicial + APA_TEMPLATE_VERSION
│   │   ├── apa-print.css            # estilos APA compartidos preview/impresión
│   │   └── types.ts
│   ├── courses/                     # EXISTENTE (solo integra DocumentList en detalle)
│   └── ... (careers, resources, tasks, partners, auth sin cambios)
├── pages/                           # rutas /courses/:courseId/documents[/:documentId]
└── lib/                             # capa IndexedDB existente (nuevo store)
```

**Structure Decision**: Feature autocontenido en `src/features/documents/`
según constitución IV, reutilizando la capa IndexedDB (`lib/`) y las rutas de
cursos existentes. Sin backend ni paquetes nuevos fuera de TipTap/KaTeX.

## Complexity Tracking

> Sin violaciones a la constitución — nada que justificar.
