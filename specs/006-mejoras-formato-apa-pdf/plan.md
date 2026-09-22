# Implementation Plan: Mejoras de Formato APA y Navegación en el Editor de PDF

**Branch**: `006-mejoras-formato-apa-pdf` | **Date**: 2026-09-21 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from [spec.md](./spec.md)

## Summary

Ajustar el editor APA existente (`src/features/documents/`) para que el PDF exportado sea tipográficamente correcto y navegable: fuente configurable (Times New Roman o Arial, siempre 12 pt) y márgenes APA garantizados en todo documento; año de bibliografía opcional, mostrado como "(s.f.)" cuando falta; tabla de contenido automática con profundidad configurable (1-3 niveles) derivada de las secciones fijas y de los encabezados de nivel 2/3 ya soportados en Desarrollo; y listados opcionales de figuras y de tablas derivados de los títulos que el usuario ya puede asignar a imágenes (y que se extiende a tablas). Todo se implementa como extensiones aditivas y con valores por defecto seguros sobre el modelo, los componentes y el pipeline de vista previa/impresión ya existentes — sin nuevo backend, sin nueva librería de generación de PDF y sin romper documentos guardados antes de esta mejora.

## Technical Context

**Language/Version**: TypeScript 6, React 19, Vite 8

**Primary Dependencies**: TipTap 3 (`StarterKit`, `Table`/`TableRow`/`TableHeader`/`TableCell`, extensión de imagen ya declarada) sin paquetes nuevos; shadcn/ui v4 (`Select`/`ToggleGroup`, `Switch` o `Checkbox`, `Popover`/`Dialog`, `Label`), Tailwind v4, lucide-react, IndexedDB mediante la capa existente (`src/lib/db.ts`). Times New Roman y Arial son fuentes de sistema — no se agrega carga de fuentes web.

**Storage**: IndexedDB vía la capa existente; los campos nuevos (`fontFamily`, `toc`, `lists`) se guardan como parte del documento `ApaFormDocument` ya persistido en el store `apaDocuments`, igual que `pageSize`. Las entradas de tabla de contenido y de los listados de figuras/tablas **no se persisten**: se derivan en cada render desde `sections.development` y las secciones fijas (ver [research.md](./research.md) Decision 4).

**Testing**: No existe framework de pruebas automatizadas en el repositorio. Se usarán `pnpm lint`, `pnpm typecheck`, `pnpm build` y validación manual end-to-end con `pnpm dev` según [quickstart.md](./quickstart.md), igual que en `005-desarrollo-imagenes-tablas`.

**Target Platform**: SPA en navegadores modernos de escritorio y pantallas estrechas; exportación mediante `window.print()` sobre el mismo DOM que la vista previa (sin cambios en el mecanismo de exportación, FR-018).

**Project Type**: Aplicación web frontend modular dentro del SPA existente; todos los cambios viven en `src/features/documents/`.

**Performance Goals**: La vista previa (incluyendo tabla de contenido y listados recién calculados) se actualiza en menos de 3 segundos para documentos habituales de hasta 20 páginas, 20 encabezados de nivel 2/3 y 20 imágenes/tablas tituladas; cambiar fuente, activar/desactivar TOC o listados se refleja de inmediato (recalculo síncrono, sin llamadas de red).

**Constraints**: Offline-first (sin backend, sin dependencia de red para fuentes ni para paginación); no alterar el mecanismo de exportación actual (`window.print()`) ni requerir una librería de generación de PDF nueva; los documentos existentes deben verse y exportarse exactamente igual que hoy mientras el usuario no active las nuevas opciones (SC-007); accesible por teclado y lector de pantalla; la tabla de contenido no puede incluir número de página real por una limitación de los motores de impresión de navegador (ver research.md Decision 3) — se comunica explícitamente en la UI.

**Scale/Scope**: Un usuario local por documento; cambios acotados a `src/features/documents/` (tipos, plantilla, hook de persistencia, componentes de formulario/preview, estilos) y a su integración ya existente en `src/pages/document-editor.tsx`. No se agregan rutas, features ni stores nuevos.

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principio | Estado | Evidencia |
|-----------|--------|-----------|
| I. Component-First Architecture | ✅ Pasa | Se agrega `DocumentFormatControls` como componente autocontenido con props claras, construido sobre primitivas shadcn (`Select`/`ToggleGroup`, `Switch`, `Popover`); se extienden `DevelopmentTableControls` y `BibliographyField` sin romper su interfaz pública. |
| II. Type-Safe Data Modeling | ✅ Pasa | `ApaFontFamily`, `TocSettings`, `ListSettings`, `TocEntry`, `ListEntry` y `DevelopmentTableAttrs` se definen como tipos explícitos en `types.ts` antes de implementar, sin `any`; `normalizeFontFamily`/`normalizeTocSettings`/`normalizeListSettings` siguen el patrón tipado ya usado por `normalizePageSize`. |
| III. Offline-First with Local Persistence | ✅ Pasa | Todo el estado nuevo se guarda en IndexedDB junto con el resto del documento vía el autoguardado existente; las entradas de TOC/listados se derivan en cliente sin red; no se introduce dependencia de un servicio de generación de PDF. |
| IV. Modular Feature Boundaries | ✅ Pasa | Todo el cambio vive en `src/features/documents/` (tipos, `lib/toc.ts`, componentes, estilos) y su único punto de integración externo (`src/pages/document-editor.tsx`) ya existe; no se cruzan límites de otras features. |
| V. Accessible by Default | ✅ Pasa | `DocumentFormatControls` y el nuevo botón de título de tabla usan labels, `aria-pressed`/estado anunciado y navegación por teclado (mismo patrón que los controles de tamaño de papel y zoom ya existentes); el texto de ayuda sobre "(s.f.)" y sobre la ausencia de número de página se expone como texto, no solo color. |

## Project Structure

### Documentation (this feature)

```text
specs/006-mejoras-formato-apa-pdf/
├── plan.md              # Este plan
├── research.md          # Decisiones de Phase 0
├── data-model.md         # Entidades, tipos y validaciones
├── quickstart.md         # Validación manual end-to-end
├── contracts/
│   └── ui-contracts.md   # Contratos de componentes y funciones puras
└── tasks.md              # Se generará después con /speckit-tasks
```

### Source Code (repository root)

```text
src/
├── features/documents/
│   ├── types.ts                              # + ApaFontFamily, TocSettings, ListSettings,
│   │                                          #   TocEntry, ListEntry, DevelopmentTableAttrs,
│   │                                          #   normalize*, campos nuevos en ApaFormDocument
│   ├── apa-template.ts                       # Defaults de fontFamily/toc/lists en documentos nuevos
│   ├── lib/
│   │   ├── apa-format.ts                     # "(s.f.)" cuando year está vacío; isBibEntryComplete
│   │   ├── apa-styles.css                    # Clases de fuente (apa-font-times/arial), estilos
│   │   │                                      #   de #apa-toc, #apa-list-figures, #apa-list-tables
│   │   └── toc.ts                            # NUEVO: extractTocEntries/extractFigureEntries/
│   │                                          #   extractTableEntries (funciones puras)
│   ├── components/
│   │   ├── bibliography-field.tsx            # Año opcional, ayuda "(s.f.)"
│   │   ├── development-field.tsx             # Table.extend con attrs.title; wiring del diálogo
│   │   ├── development-table-controls.tsx    # Botón "Título de tabla" + diálogo
│   │   ├── apa-pdf-preview.tsx               # Fuente por clase; render TOC y listados; numeración
│   │   │                                      #   de figuras/tablas en figcaption/caption
│   │   ├── apa-form-editor.tsx               # Wiring de DocumentFormatControls en PreviewPane
│   │   └── document-format-controls.tsx      # NUEVO: popover de fuente + TOC + listados
│   └── hooks/useApaFormDocument.ts           # normalizeFontFamily/normalizeTocSettings/
│                                              #   normalizeListSettings al cargar; updateFields
│                                              #   admite fontFamily/toc/lists
└── pages/document-editor.tsx                 # Pasa onFormatChange (vía updateFields) a ApaFormEditor
```

**Structure Decision**: Se extiende la feature `documents` existente sin crear módulos nuevos fuera de ella. El único archivo nuevo de lógica es `lib/toc.ts` (funciones puras de extracción, sin estado ni efectos); el único componente nuevo es `document-format-controls.tsx`, colocado junto a los demás componentes del feature y consumido desde `apa-form-editor.tsx` exactamente como ya se consume el selector de tamaño de papel. `apa-pdf-preview.tsx` sigue siendo el único renderer de referencia para pantalla e impresión (principio "preview = PDF" ya establecido en 002/003/005), evitando divergencias entre lo que el usuario ve y lo que se exporta.

### Re-check post-Phase 1

✅ **Pasa**. El diseño de datos (`data-model.md`) mantiene tipos explícitos y funciones de normalización con default seguro para cada campo nuevo, preservando la compatibilidad de documentos existentes (SC-007) sin necesitar una migración explícita. Las entidades derivadas (`TocEntry`, `ListEntry`) se calculan sin estado ni persistencia adicional, evitando desincronización con el contenido real (FR-011). Los contratos de UI (`contracts/ui-contracts.md`) mantienen componentes pequeños y con responsabilidad única, reutilizan primitivas shadcn y preservan las interfaces públicas existentes (`ApaFormEditor`, `BibliographyField`, `DevelopmentTableControls`, `ApaPdfPreview`) extendiéndolas de forma aditiva. No se introduce backend, librería de PDF nueva, ni cruce de límites entre features. La limitación de número de página en la tabla de contenido (research.md Decision 3) es una restricción real del motor de impresión de navegador, documentada y comunicada en la UI, no una violación de un requisito — ningún FR ni acceptance scenario de `spec.md` exige literalmente un número de página junto a cada entrada. No se registran violaciones ni complejidad adicional que justificar.

## Complexity Tracking

Sin violaciones del Constitution Check; no se requiere justificar complejidad adicional.
