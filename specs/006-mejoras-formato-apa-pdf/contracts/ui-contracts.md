# UI Contracts: Mejoras de Formato APA y Navegación en el Editor de PDF

**Feature**: 006-mejoras-formato-apa-pdf

**Date**: 2026-09-21

## Contract Type

SPA sin API externa. Los contratos son las interfaces de componentes UI (props y formas de datos), las funciones puras de `lib/` y los tipos de documento. Todo el código vive en `src/features/documents/` y solo se modifican o extienden sus interfaces públicas (constitución IV); no se crean features nuevas ni rutas nuevas. Extiende y prevalece sobre los contratos de `003-apa-form-pdf-editor` y `005-desarrollo-imagenes-tablas` para los aspectos aquí descritos (`ApaFormEditor`, `ApaFormDocument`, `ApaPdfPreview`, controles de tabla en Desarrollo).

## Document format controls

### DocumentFormatControls (nuevo)

```typescript
interface DocumentFormatControlsProps {
  fontFamily: ApaFontFamily
  toc: TocSettings
  lists: ListSettings
  onFontFamilyChange: (fontFamily: ApaFontFamily) => void
  onTocChange: (toc: TocSettings) => void
  onListsChange: (lists: ListSettings) => void
}
```

**Renders**: Popover/diálogo accesible (`Dialog` o `Popover` de shadcn) accionado por un botón "Formato" ubicado junto al selector de tamaño de papel en la barra de herramientas de `PreviewPane`. Contiene:

- Un `Select` o `ToggleGroup` de dos opciones para la fuente (Times New Roman / Arial), con nota fija "12 pt" no editable.
- Un `Switch`/checkbox "Incluir tabla de contenido" que, al activarse, revela un `Select` o `ToggleGroup` de profundidad (1, 2 o 3 niveles) con una descripción corta de qué incluye cada nivel; y un texto de ayuda aclarando que el índice no incluye número de página (ver [research.md § Decision 3](../research.md)).
- Un `Switch`/checkbox "Incluir listado de figuras" y otro "Incluir listado de tablas", independientes entre sí, cada uno con una nota de que solo se listan las imágenes/tablas con título asignado.

Todos los controles tienen `label` asociado, son operables por teclado, y los cambios se aplican de inmediato a la vista previa (mismo patrón de autoguardado que el resto del formulario, vía `onPageSizeChange`/`updateFields`). No bloquea ni exige completar nada para guardar o exportar el documento.

### ApaFormEditor (props extendidas)

```typescript
interface ApaFormEditorProps {
  document: ApaFormDocument
  saveState: "saved" | "saving" | "error"
  teamMembers: Partner[]
  onSectionChange: (patch: Partial<ApaFormSections>) => void
  onPageSizeChange: (pageSize: ApaPageSize) => void
  onFormatChange: (
    patch: Partial<Pick<ApaFormDocument, "fontFamily" | "toc" | "lists">>
  ) => void
  onRetrySave: () => void
  onExportPdf: () => void
}
```

**Cambios**: se agrega `onFormatChange`, cableado en `document-editor.tsx` a `updateFields` (misma función ya usada para `pageSize`). `PreviewPane` recibe y expone `DocumentFormatControls` junto al selector de tamaño de papel existente.

## Bibliography

### BibliographyField (validación actualizada, misma interfaz de props)

```typescript
interface BibliographyFieldProps {
  entries: BibEntry[]
  onAdd: (entry: BibEntryFormData) => void
  onUpdate: (id: string, patch: Partial<BibEntryFormData>) => void
  onRemove: (id: string) => void
  onReorder: (idsInOrder: string[]) => void
}
```

**Cambios de comportamiento** (mismas props, `validateEntry` interno ajustado):

- El campo "Año" deja de mostrar "El año es obligatorio." cuando está vacío; solo se valida el formato (4 dígitos) si el usuario escribió algo.
- El texto de ayuda del campo pasa a indicar, p. ej., "Déjalo vacío si la fuente no tiene fecha (se mostrará como «s.f.»)."
- La vista de la referencia guardada (`formatBibEntry`) muestra `"(s.f.)"` en lugar del año cuando este está vacío, dejando de considerarse "pendiente de completar" solo por falta de año.

## Development: table captions

### DevelopmentTableControls (props extendidas)

```typescript
interface DevelopmentTableControlsProps {
  isTableActive: boolean
  tableTitle: string
  onInsertTable: (rows: number, columns: number) => void
  onAddRow: () => void
  onDeleteRow: () => void
  onAddColumn: () => void
  onDeleteColumn: () => void
  onToggleHeaderRow: () => void
  onDeleteTable: () => void
  onEditTitle: (title: string) => void
}
```

**Cambios**: se agrega un botón "Título de tabla" (habilitado solo cuando `isTableActive`), que abre un diálogo simple (mismo patrón visual que `DevelopmentImageDialog`) con un único campo de texto opcional para el título/caption de la tabla activa. Al guardar, invoca `onEditTitle`, que en `development-field.tsx` actualiza el atributo `title` del nodo `table` seleccionado (mismo mecanismo que `updateAttributes("image", { title })` ya usado para imágenes).

## Preview & PDF rendering

### ApaPdfPreview (props extendidas)

```typescript
interface ApaPdfPreviewProps {
  document: ApaFormDocument   // ya incluye fontFamily, toc, lists
  zoom?: ApaZoomLevel
}
```

**Cambios de renderizado** (misma firma pública, nuevo contenido interno):

- La clase raíz `.apa-document` recibe una clase adicional según `document.fontFamily` (`apa-font-times` por defecto o `apa-font-arial`), que controla `font-family` sin afectar el tamaño (`12pt` fijo).
- Si `document.toc.enabled` es `true`, se renderiza una sección `#apa-toc` (con salto de página propio, igual patrón que `.apa-section-break`) inmediatamente después de la portada y antes de Introducción, generada con `extractTocEntries(document.sections, document.toc.depth)` de `lib/toc.ts`. Cada entrada se muestra con sangría según su nivel; sin columna de número de página (ver research.md § Decision 3).
- Si `document.lists.figuresEnabled` es `true` y `extractFigureEntries(...)` retorna al menos una entrada, se renderiza una sección `#apa-list-figures` ("Listado de figuras") después de la tabla de contenido (o después de la portada si esta está desactivada) y antes de Introducción.
- Si `document.lists.tablesEnabled` es `true` y `extractTableEntries(...)` retorna al menos una entrada, se renderiza análogamente una sección `#apa-list-tables` ("Listado de tablas").
- Ninguna de las tres secciones se renderiza si está desactivada o si no tiene entradas que mostrar (FR-017): no se agregan páginas ni encabezados vacíos.
- Los nodos `image`/`table` con `title` no vacío pasan a mostrar su leyenda numerada ("Figura N: …" / "Tabla N: …") usando el mismo número calculado por `extractFigureEntries`/`extractTableEntries`, para que la numeración visible junto al elemento coincida siempre con la del listado.

## Data layer

### lib/toc.ts (nuevo)

```typescript
export function extractTocEntries(
  sections: ApaFormSections,
  depth: ApaTocDepth
): TocEntry[]

export function extractFigureEntries(
  development: ApaDocumentContent
): ListEntry[]

export function extractTableEntries(
  development: ApaDocumentContent
): ListEntry[]
```

**Contrato**: funciones puras, sin efectos secundarios ni acceso a IndexedDB; reciben el estado actual del documento y retornan listas derivadas listas para renderizar. Se usan tanto en `ApaPdfPreview` (pantalla e impresión) como, si se requiere, en cualquier resumen del formulario (p. ej. mostrar "3 encabezados detectados" junto al interruptor de TOC), reutilizando el mismo cálculo.

### types.ts (adiciones)

```typescript
export function normalizeFontFamily(value: unknown): ApaFontFamily
export function normalizeTocSettings(value: unknown): TocSettings
export function normalizeListSettings(value: unknown): ListSettings
```

**Contrato**: mismas garantías que `normalizePageSize` ya existente — nunca lanzan, siempre retornan un valor válido por defecto ante entradas ausentes o corruptas, para que documentos guardados antes de esta mejora sigan cargando sin errores.
