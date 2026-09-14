# UI Contracts: Editor de Documentos APA

**Feature**: 002-editor-documentos-apa
**Date**: 2026-09-10

## Contract Type

SPA sin API externa. Los contratos son las interfaces de componentes UI
(props y formas de datos), los hooks del feature y las rutas. Todo el código
vive en `src/features/documents/` y solo expone su interfaz pública
(constitución IV); los tipos previos (`Career`, `Course`) se importan de sus
features, no se redefinen.

## Document Components

### DocumentList

```typescript
interface DocumentListProps {
  documents: ApaDocumentWithMeta[]
  onCreate: () => void
  onOpen: (documentId: string) => void
  onRename: (document: ApaDocument) => void
  onDuplicate: (documentId: string) => void
  onDelete: (document: ApaDocument) => void
  onStatusChange: (documentId: string, status: ApaDocumentStatus) => void
}

interface ApaDocumentWithMeta extends ApaDocument {
  wordCount: number
}
```

**Renders**: Lista de documentos del curso con título, estado de avance
(badge, no solo color), fecha de última modificación y menú de acciones
(abrir, renombrar, duplicar, eliminar). Estado vacío con acción "Crear
documento". La eliminación usa Dialog de confirmación con título accesible.

### DocumentForm (crear / renombrar)

```typescript
interface DocumentFormProps {
  document?: ApaDocument  // undefined para crear, poblado para renombrar
  onSubmit: (data: DocumentFormData) => void
  onCancel: () => void
}

interface DocumentFormData {
  title: string
}
```

**Renders**: Dialog con input de título (requerido). Crear inicializa el
contenido desde la plantilla APA (el usuario no elige plantilla en v1).

### DocumentEditor

```typescript
interface DocumentEditorProps {
  document: ApaDocument
  saveState: "saved" | "saving" | "error"
  onChange: (content: ApaDocumentContent) => void
  onRetrySave: () => void
  onExportPdf: () => void
}
```

**Renders**: Barra de herramientas (formato, encabezados, listas,
alineación, cita, tabla, figura, fórmula simple — con primitivas shadcn),
superficie editable TipTap y botón "Exportar PDF". Indica estado de
autoguardado como texto ("Guardado", "Guardando…", "Error al guardar —
reintentar"), nunca solo con color.

### DocumentPreview

```typescript
interface DocumentPreviewProps {
  content: ApaDocumentContent
}
```

**Renders**: Vista de solo lectura del mismo documento con los estilos APA
aplicados (la misma hoja que usa la impresión). Es el DOM que se imprime al
exportar: preview y PDF comparten fuente y estilos por construcción.

### ApaTemplateNotice

```typescript
interface ApaTemplateNoticeProps {
  templateVersion: string  // p.ej. "7e-es-v1"
}
```

**Renders**: Aviso discreto no bloqueante indicando que el documento nació
de la plantilla APA (edición y versión). Informa, no interrumpe.

## Hook Contracts

### useApaDocuments

```typescript
function useApaDocuments(courseId: string): {
  documents: ApaDocumentWithMeta[]
  isLoading: boolean
  createDocument: (data: DocumentFormData) => Promise<ApaDocument>
  updateDocument: (id: string, data: Partial<Pick<ApaDocument, "title" | "status">>) => Promise<ApaDocument>
  saveContent: (id: string, content: ApaDocumentContent) => Promise<void>  // con debounce en el llamador
  duplicateDocument: (id: string) => Promise<ApaDocument>
  deleteDocument: (id: string) => Promise<void>
}
```

Sigue el patrón de `useResources`/`useTasks` de 001 (lectura/escritura a
IndexedDB, sin estado global externo).

### useApaDocument (detalle + autoguardado)

```typescript
function useApaDocument(documentId: string): {
  document: ApaDocument | undefined
  isLoading: boolean
  saveState: "saved" | "saving" | "error"
  updateContent: (content: ApaDocumentContent) => void  // debounced persist
  retrySave: () => Promise<void>
}
```

## Route Contracts

| Route                              | Component     | Params          | Layout    |
|------------------------------------|---------------|-----------------|-----------|
| `/courses/:courseId/documents`     | DocumentList  | courseId (UUID) | AppLayout |
| `/courses/:courseId/documents/:documentId` | DocumentEditor (+ Preview) | courseId, documentId (UUID) | AppLayout (editor) |

La lista de documentos se integra además como sección/tab dentro del detalle
de curso existente (CourseDetail), reutilizando `DocumentList`.
