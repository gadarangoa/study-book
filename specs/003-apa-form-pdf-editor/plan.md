# Implementation Plan: Editor APA por Formulario con Vista Previa PDF

**Branch**: `003-apa-form-pdf-editor` | **Date**: 2026-09-10 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/003-apa-form-pdf-editor/spec.md`

## Summary

Variante por formulario del editor APA (prevalece sobre `002-editor-documentos-apa` según el spec): vista dividida con formulario seccionado a la izquierda (portada, introducción, desarrollo enriquecido, conclusiones, bibliografía dinámica) y vista previa del PDF con controles a la derecha. Cada documento nace de la plantilla APA 7.ª ed. en español, vive asociado a un único curso (varios por curso), con autoguardado offline y exportación a PDF fiel a la vista previa. Enfoque técnico (ver [research.md](./research.md)): modelo de datos estructurado por secciones como fuente única de verdad (el desarrollo reutiliza TipTap como fragmento), preview y PDF comparten el mismo DOM impreso vía `window.print()` con hoja APA compartida, y persistencia en el store IndexedDB `apa-documents` con debounce.

## Technical Context

**Language/Version**: TypeScript 6, React 19 + Vite 8

**Primary Dependencies**: TipTap v3 (fragmento enriquecido del desarrollo, YA instalada), shadcn/ui v4 + Tailwind v4 (formulario, listas, diálogos), React Router v8 (rutas), capa IndexedDB existente (persistencia)

**Storage**: IndexedDB, store `apa-documents` indexado por `courseId` (offline-first, sin backend); el esquema evoluciona de documento TipTap completo (002) a secciones estructuradas v2 con migración documentada en [data-model.md](./data-model.md)

**Testing**: Sin framework de tests en el repo; validación manual con `pnpm dev` según [quickstart.md](./quickstart.md) + `pnpm lint` y `pnpm typecheck` en cero errores (puertas de la constitución)

**Target Platform**: SPA en navegadores modernos de escritorio (Chrome, Firefox, Safari, Edge); impresión a PDF del navegador como salida; en pantallas estrechas la vista dividida se apila/alterna por pestañas

**Project Type**: Web application frontend (feature modular dentro del SPA existente, `src/features/documents/`)

**Performance Goals**: Vista previa actualizada en <3 s en documentos habituales de hasta ~20 páginas o 50 referencias (SC-002); creación de documento en <1 min (SC-001); exportación a PDF exitosa ≥95% (SC-004)

**Constraints**: Offline-capable (FR-012); fidelidad preview == PDF por construcción (mismo DOM/estilos); accesibilidad por teclado y lector de pantalla en acciones principales (FR-016); formato enriquecido del desarrollo acotado a lo académico básico (sin tablas/imágenes en v1)

**Scale/Scope**: Un usuario local; decenas de cursos; varios documentos por curso; 6 componentes + 2 hooks + 1 formateador de referencias + 2 rutas

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principio | Estado | Evidencia |
|-----------|--------|-----------|
| I. Component-First (shadcn, sin divs con estilo manual si existe primitiva) | ✅ Pasa | Formulario con FieldGroup/Input/Textarea, lista de bibliografía, diálogos de confirmación y controles PDF con primitivas shadcn; estilos solo vía Tailwind + hoja APA compartida |
| II. Type-Safe (interfaces antes de implementar, sin `any`) | ✅ Pasa | [data-model.md](./data-model.md) y [contracts/ui-contracts.md](./contracts/ui-contracts.md) definen `ApaFormSections`, `CoverData`, `BibEntry` y props antes del código |
| III. Offline-First con persistencia local | ✅ Pasa | IndexedDB + autoguardado con debounce; funciona sin conexión; sin backend ni sincronización (fuera de alcance) |
| IV. Límites modulares (`src/features/documents/`, interfaces públicas) | ✅ Pasa | Todo el código nuevo vive en `src/features/documents/`; `Course` se importa de su feature, no se redefine |
| V. Accesible por defecto | ✅ Pasa | Labels/errores por sección, reorden de bibliografía con botones (no solo arrastre), estado de guardado como texto, controles PDF navegables por teclado, diálogos con título |

*Re-check post-Phase 1*: el diseño mantiene los cinco principios; sin violaciones que justificar (sin tabla de Complexity Tracking).

## Project Structure

### Documentation (this feature)

```text
specs/003-apa-form-pdf-editor/
├── plan.md              # This file (/speckit.plan command output)
├── research.md          # Phase 0 output (/speckit.plan command)
├── data-model.md        # Phase 1 output (/speckit.plan command)
├── quickstart.md        # Phase 1 output (/speckit.plan command)
├── contracts/           # Phase 1 output (/speckit.plan command)
│   └── ui-contracts.md  # Props, hooks, rutas y formateador APA
└── tasks.md             # Phase 2 output (/speckit.tasks command - NOT created by /speckit.plan)
```

### Source Code (repository root)

```text
src/
├── features/
│   └── documents/                 # Feature existente, se extiende (variante por formulario)
│       ├── types.ts               # + ApaFormSections, CoverData, BibEntry (v2)
│       ├── apa-template.ts        # + createApaFormTemplate() (plantilla seccionada)
│       ├── lib/
│       │   ├── apa-format.ts      # Formateador de referencias APA (autor, año, título, fuente)
│       │   └── apa-styles.css     # Hoja APA compartida preview/impresión (si no existe de 002)
│       ├── hooks/
│       │   ├── useApaDocuments.ts  # Lista por curso: crear/renombrar/duplicar/eliminar/estado
│       │   └── useApaFormDocument.ts # Detalle + autoguardado con debounce por secciones
│       └── components/
│           ├── DocumentList.tsx        # Reutiliza/extiende el de 002 (título, estado, fecha)
│           ├── ApaFormEditor.tsx       # Vista dividida: formulario + preview (tabs en móvil)
│           ├── CoverFields.tsx         # Sección 1: datos de portada
│           ├── SectionFields.tsx       # Secciones 2 y 4: introducción y conclusiones
│           ├── DevelopmentField.tsx    # Sección 3: TipTap acotado (fragmento)
│           ├── BibliographyField.tsx   # Sección 5: lista dinámica + editor de entrada
│           └── ApaPdfPreview.tsx       # Preview compositivo + controles (páginas, zoom, exportar)
├── routes/                        # Integración en rutas de curso (ver contratos)
└── index.css                      # Import de la hoja de impresión si aplica
```

**Structure Decision**: Feature modular dentro del SPA existente (opción "Single project"): se extiende `src/features/documents/` creado para 002 con el modelo seccionado v2, seis componentes nuevos y un formateador de referencias. Sin nuevos proyectos ni paquetes.

## Complexity Tracking

> Sin violaciones del Constitution Check; esta sección queda vacía por diseño.
