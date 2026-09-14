# UI Contracts: Editor APA por Formulario con Vista Previa PDF

**Feature**: 003-apa-form-pdf-editor
**Date**: 2026-09-10

## Contract Type

SPA sin API externa. Los contratos son las interfaces de componentes UI (props
y formas de datos), los hooks del feature, el formateador de referencias y las
rutas. Todo el código vive en `src/features/documents/` y solo expone su
interfaz pública (constitución IV); `Course` se importa de su feature, no se
redefine. Extiende y prevalece sobre los contratos de 002 para la variante por
formulario (`DocumentList` se reutiliza; `DocumentEditor` libre de 002 queda
sustituido por `ApaFormEditor`).

## Form Components

### ApaFormEditor (vista dividida)

```typescript
interface ApaFormEditorProps {
  document: ApaFormDocument
  saveState: "saved" | "saving" | "error"
  teamMembers: Partner[]   // integrantes del Team del curso (Partner importa de su feature)
  onSectionChange: (patch: Partial<ApaFormSections>) => void
  onRetrySave: () => void
  onExportPdf: () => void
}
```

**Renders**: Rejilla de 2 columnas (formulario | preview) en pantallas amplias;
pestañas accesibles Formulario/Vista previa en estrechas. Muestra estado de
autoguardado como texto ("Guardado", "Guardando…", "Error al guardar —
reintentar"), nunca solo con color. Orquesta las cinco secciones y `ApaPdfPreview`.

### CoverFields (sección 1)

```typescript
interface CoverFieldsProps {
  value: CoverData
  teamMembers: Partner[]   // cada integrante con checkbox incluir/excluir
  onChange: (patch: Partial<CoverData>) => void
}
```

**Renders**: FieldGroup shadcn con título del trabajo (requerido, error
inline), lista de integrantes del Team con checkbox por alumno (marcar agrega
su nombre a la portada, desmarcar lo quita; al menos un integrante requerido),
institución, curso (precargado), docente y fecha. Validación inline por campo,
no bloqueante del autoguardado. Si el curso no tiene integrantes, indica que
se agreguen en la sección Team.

### SectionFields (secciones 2 y 4)

```typescript
interface SectionFieldsProps {
  introduction: string
  conclusions: string
  onChange: (patch: Pick<ApaFormSections, "introduction" | "conclusions">) => void
}
```

**Renders**: Dos textareas etiquetados con contador/longitud orientativa y
sugerencia de mínimo no bloqueante.

### DevelopmentField (sección 3)

```typescript
interface DevelopmentFieldProps {
  value: JSONContent       // fragmento TipTap
  onChange: (value: JSONContent) => void
}
```

**Renders**: Instancia TipTap acotada (negrita, cursiva, encabezados, listas,
alineación, cita simple) con barra de herramientas de primitivas shadcn.
Operable por teclado.

### BibliographyField (sección 5)

```typescript
interface BibliographyFieldProps {
  entries: BibEntry[]
  onAdd: (entry: Omit<BibEntry, "id" | "order">) => void
  onUpdate: (id: string, patch: Partial<BibEntry>) => void
  onRemove: (id: string) => void      // con confirmación si tiene contenido
  onReorder: (idsInOrder: string[]) => void
}
```

**Renders**: Lista dinámica de entradas con formulario inline por entrada
(autor, año numérico 4 dígitos, título, fuente), botones subir/bajar
accesibles por teclado, eliminar con Dialog de confirmación y mensajes de
validación inline. Entrada incompleta marcada como pendiente.

### ApaPdfPreview (+ controles)

```typescript
interface ApaPdfPreviewProps {
  document: ApaFormDocument
  zoom?: 75 | 100 | 125 | 150       // solo pantalla; impresión siempre al 100%
  onZoomChange: (zoom: 75 | 100 | 125 | 150) => void
  onPageSizeChange: (pageSize: "letter" | "a4") => void
  onExportPdf: () => void
}

interface PdfPageState {
  currentPage: number
  totalPages: number
  onGoToPage: (page: number) => void
}
```

**Renders**: Documento APA compuesto (portada + introducción + desarrollo +
conclusiones + referencias formateadas) con la hoja APA compartida — es el
mismo DOM que se imprime (`window.print()`), fidelidad por construcción.
Controles: anterior/siguiente página (desplazamiento), selector de zoom (solo
`@media screen`) y botón "Exportar PDF". Navegables por teclado con etiquetas.

## Formatter Contract

```typescript
function formatBibEntry(entry: BibEntry): string
// "Apellido, N. (año). Título. Fuente."
// Entrada incompleta → devuelve "" y el llamador la marca como pendiente.
```

Puro, sin dependencias: misma salida en preview e impresión.

## Hook Contracts

### useApaDocuments (lista por curso)

```typescript
function useApaDocuments(courseId: string): {
  documents: ApaFormDocument[]
  isLoading: boolean
  createDocument: (courseName: string) => Promise<ApaFormDocument>  // desde plantilla seccionada
  renameDocument: (id: string, title: string) => Promise<ApaFormDocument>
  duplicateDocument: (id: string) => Promise<ApaFormDocument>
  deleteDocument: (id: string) => Promise<void>                     // con confirmación en UI
  changeStatus: (id: string, status: ApaDocumentStatus) => Promise<ApaFormDocument>
}
```

Sigue el patrón de hooks IndexedDB de 001/002 (lectura/escritura local, sin
estado global externo).

### useApaFormDocument (detalle + autoguardado)

```typescript
function useApaFormDocument(documentId: string): {
  document: ApaFormDocument | undefined
  isLoading: boolean
  saveState: "saved" | "saving" | "error"
  updateSections: (patch: Partial<ApaFormSections>) => void  // debounced persist (~1 s)
  retrySave: () => Promise<void>
}
```

Aplica la migración 002→v2 al cargar un documento antiguo (ver data-model.md).

## Route Contracts

| Route                                              | Component                        | Params                 | Layout         |
|----------------------------------------------------|----------------------------------|------------------------|----------------|
| `/courses/:courseId/documents`                     | DocumentList (reutilizada, v2)   | courseId (UUID)        | AppLayout      |
| `/courses/:courseId/documents/:documentId`         | ApaFormEditor (+ ApaPdfPreview)  | courseId, documentId   | AppLayout (editor) |

La lista de documentos se integra además como sección/tab dentro del detalle
de curso existente, reutilizando `DocumentList` con el modelo v2.
