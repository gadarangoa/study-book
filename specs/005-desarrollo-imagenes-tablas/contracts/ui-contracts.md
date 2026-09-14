# UI Contracts: Desarrollo con Imágenes y Tablas en Editor APA

**Feature**: 005-desarrollo-imagenes-tablas
**Date**: 2026-09-14

## Contract Type

SPA sin API externa. Los contratos describen componentes, acciones y datos del editor que deben permanecer consistentes entre edición, preview, persistencia y exportación.

## DevelopmentField

```typescript
interface DevelopmentFieldProps {
  value: ApaDocumentContent
  onChange: (value: ApaDocumentContent) => void
  onError?: (message: string) => void
}
```

**Responsibilities**:
- Mantener la posición activa del cursor al insertar imagen o tabla.
- Conservar las herramientas de texto enriquecido existentes.
- Exponer controles accesibles para insertar imagen y tabla.
- Emitir el contenido completo actualizado mediante `onChange`.

## Image insertion contract

```typescript
interface DevelopmentImageInput {
  file: File
  alt: string
  title?: string
}

interface DevelopmentImagePolicy {
  acceptedMimeTypes: readonly ["image/png", "image/jpeg", "image/webp"]
  maxBytes: 5_000_000
  maxDimensionPx: 2400
}

interface DevelopmentImageActions {
  insertImage: (input: DevelopmentImageInput) => void
  updateImage: (position: number, patch: { alt?: string; title?: string }) => void
  removeImage: (position: number) => void
}
```

**Behavior**:
- La selección de archivo abre un control etiquetado y no inserta nada hasta validar.
- Formato, tamaño y dimensión inválidos producen un mensaje asociado al control.
- El diálogo solicita texto alternativo y permite cancelar sin cambiar el contenido.
- La imagen seleccionada muestra una acción para editar descripción y otra para eliminarla.
- El estado de alt text vacío se comunica visualmente y mediante texto accesible.

## Table controls contract

```typescript
interface DevelopmentTableInput {
  rows: number
  columns: number
}

interface DevelopmentTableActions {
  insertTable: (input: DevelopmentTableInput) => void
  addRow: () => void
  deleteRow: () => void
  addColumn: () => void
  deleteColumn: () => void
  toggleHeaderRow: () => void
  deleteTable: () => void
}
```

**Behavior**:
- La inserción solicita filas y columnas enteras entre 1 y 10.
- Las acciones de fila/columna operan sobre la tabla activa y anuncian el resultado.
- La fila de encabezado se identifica semánticamente y no solo por color.
- El control de eliminar tabla requiere una tabla activa y no elimina el texto adyacente.
- En pantalla estrecha, los controles siguen alcanzables sin depender de hover.

## Preview and print contract

```typescript
interface ApaPdfPreviewProps {
  document: ApaFormDocument
  zoom?: ApaZoomLevel
}

function renderDevelopment(content: ApaDocumentContent): React.ReactNode
```

**Invariants**:
- `renderDevelopment` conserva el orden de todos los nodos.
- Las imágenes respetan proporción y no exceden el ancho de contenido.
- Las tablas muestran celdas, encabezado cuando exista y contenido legible.
- El renderer de preview y la impresión usan el mismo contenido y estilos APA.
- Un nodo no reconocido produce un fallback local y no detiene la renderización restante.

## Persistence contract

```typescript
interface DevelopmentPersistence {
  updateSections: (patch: Partial<ApaFormSections>) => void
  retrySave: () => Promise<void>
  saveState: "saved" | "saving" | "error"
}
```

**Invariants**:
- Cada cambio de imagen o tabla pasa por el mismo autoguardado que el texto.
- `saveState` se anuncia como texto y el error ofrece reintento.
- Reabrir el documento devuelve el contenido completo del desarrollo.
- No se requiere conexión de red para insertar, guardar o volver a abrir contenido válido.

## Accessibility contract

- Todo botón tiene nombre accesible y estado `aria-pressed` cuando sea toggle.
- El selector de archivo tiene label visible o accesible y mensaje de tipo/tamaño inválido.
- El diálogo de imagen tiene título, foco inicial, foco de retorno y asociación del error.
- La tabla mantiene navegación por teclado dentro de celdas y controles identificables.
- Los avisos de alt text pendiente, guardado y error se exponen como estado textual.
