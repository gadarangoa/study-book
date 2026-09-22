# Data Model: Mejoras de Formato APA y Navegación en el Editor de PDF

**Feature**: 006-mejoras-formato-apa-pdf

**Date**: 2026-09-21

Todos los tipos nuevos extienden el modelo existente en `src/features/documents/types.ts`. No se crean colecciones ni tablas de IndexedDB nuevas: todo vive dentro del documento `apaDocuments` ya persistido, igual que `pageSize` hoy.

## Tipos nuevos

### ApaFontFamily

```typescript
export type ApaFontFamily = "times-new-roman" | "arial"

export const APA_FONT_FAMILIES: ApaFontFamily[] = ["times-new-roman", "arial"]

export const APA_FONT_FAMILY_LABELS_ES: Record<ApaFontFamily, string> = {
  "times-new-roman": "Times New Roman",
  arial: "Arial",
}

export const APA_DEFAULT_FONT_FAMILY: ApaFontFamily = "times-new-roman"
```

- **Validación**: `normalizeFontFamily(value: unknown): ApaFontFamily` retorna `value` si es uno de los dos valores permitidos, si no retorna `APA_DEFAULT_FONT_FAMILY` (mismo patrón que `normalizePageSize`).
- **Tamaño de fuente**: fijo en 12 pt para ambas opciones; no es un campo independiente — se aplica vía CSS junto con la clase de fuente, no requiere modelo de datos propio.

### TocSettings

```typescript
export type ApaTocDepth = 1 | 2 | 3

export interface TocSettings {
  enabled: boolean
  depth: ApaTocDepth
}

export const APA_DEFAULT_TOC_SETTINGS: TocSettings = { enabled: false, depth: 2 }
```

- **Validación**: `normalizeTocSettings(value: unknown): TocSettings` — `enabled` se coacciona a `boolean` (default `false`); `depth` se acepta solo si es `1`, `2` o `3` (default `2`) cuando `enabled` es `true`; si `enabled` es `false`, `depth` conserva el último valor elegido por el usuario (para no perder su preferencia al desactivar y reactivar) pero no se usa mientras esté desactivado.
- **Regla**: cuando `enabled` es `false`, no se renderiza ninguna página de tabla de contenido (FR-008, FR-017).

### ListSettings

```typescript
export interface ListSettings {
  figuresEnabled: boolean
  tablesEnabled: boolean
}

export const APA_DEFAULT_LIST_SETTINGS: ListSettings = {
  figuresEnabled: false,
  tablesEnabled: false,
}
```

- **Validación**: `normalizeListSettings(value: unknown): ListSettings` — cada bandera se coacciona a `boolean`, default `false`.
- **Regla**: cada bandera es independiente (FR-014); si está en `true` pero no hay ninguna entrada con título, esa sección del listado se omite igualmente del documento exportado (FR-017), sin mostrarse vacía.

## Extensión de tipos existentes

### ApaFormDocument (extendido)

```typescript
export interface ApaFormDocument {
  // ...campos existentes sin cambios (id, courseId, title, sections, status,
  // pageSize, templateVersion, migratedFrom, updatedByUid, updatedByEmail,
  // createdAt, updatedAt)
  fontFamily: ApaFontFamily
  toc: TocSettings
  lists: ListSettings
}
```

- Estos tres campos se cargan con `normalizeFontFamily`/`normalizeTocSettings`/`normalizeListSettings` en `useApaFormDocument.ts`, en el mismo punto donde ya se normaliza `pageSize` (línea ~119), para que documentos guardados antes de esta mejora reciban los valores por defecto sin migración explícita.
- Se actualizan con `updateFields`, ampliando su firma actual (`Pick<ApaFormDocument, "pageSize" | "title" | "status">`) para incluir `"fontFamily" | "toc" | "lists"`.
- `createApaFormTemplate` (en `apa-template.ts`) inicializa los tres campos con sus valores por defecto para documentos nuevos.

### BibEntry (sin cambios de forma, semántica ajustada)

```typescript
export interface BibEntry {
  id: string
  author: string
  year: string   // "" ahora es válido y significa "sin fecha" → se muestra "(s.f.)"
  title: string
  source: string
  order: number
}
```

- **Validación** (`isBibEntryComplete`): `author.trim().length > 0 && title.trim().length > 0`. `year` ya no participa en la completitud.
- **Validación de formato** (`isValidBibYear`, sin cambios): solo se aplica cuando `year.trim().length > 0`; sigue exigiendo 4 dígitos.
- **Formato de salida** (`formatBibEntry`): usa `"(s.f.)"` en el lugar del año cuando `year` está vacío; en otro caso usa el año tal cual, igual que hoy.

### DevelopmentTableAttrs (nuevo, análogo a DevelopmentImageAttrs)

```typescript
export interface DevelopmentTableAttrs {
  title?: string | null   // caption/título de la tabla, opcional
}
```

- Se agrega como atributo del nodo `table` de TipTap (vía `Table.extend({ addAttributes ... })` en `development-field.tsx`, igual que `DevelopmentImage.extend`).
- **Validación**: texto libre, opcional; una tabla sin `title` (o con `title` vacío) simplemente no aparece en el listado de tablas (FR-016), pero sigue siendo una tabla válida del documento.

## Entidades derivadas (no persistidas)

Estas entidades se calculan en cada render de `ApaPdfPreview` a partir del documento existente (ver [research.md § Decision 4](./research.md)); no tienen almacenamiento propio.

### TocEntry

```typescript
export interface TocEntry {
  id: string          // clave estable para React (p. ej. `${sectionId}` o `${sectionId}-${index}`)
  level: 1 | 2 | 3
  text: string
}
```

- Nivel 1: una entrada por cada sección fija con contenido (Introducción siempre; Justificación, Objetivos solo si tienen contenido, igual que ya decide `ApaPdfPreview` hoy; Desarrollo, Conclusiones, Referencias siempre).
- Niveles 2/3: una entrada por cada nodo `heading` de nivel 2 o 3 dentro de `development.content`, en orden de aparición, respetando el `depth` configurado (si `depth` es 1, no se generan entradas de nivel 2/3; si es 2, se excluyen las de nivel 3).

### ListEntry

```typescript
export interface ListEntry {
  id: string
  number: number   // 1-based, correlativo dentro de su propio tipo (figura o tabla)
  caption: string  // título asignado por el usuario
}
```

- Se genera una lista de `ListEntry` para figuras (nodos `image` con `title` no vacío) y otra independiente para tablas (nodos `table` con `title` no vacío), cada una numerada desde 1 en su propio espacio de numeración.

## Reglas de integridad y compatibilidad

- Ningún campo nuevo es obligatorio para que un documento se considere válido: todos tienen default seguro y se normalizan al cargar (mismo patrón que `pageSize`).
- Ninguna entidad derivada (`TocEntry`, `ListEntry`) se persiste; siempre se recalcula desde `sections.development` y las secciones fijas, garantizando que nunca queden desincronizadas del contenido real (FR-011).
- Los documentos existentes (creados antes de esta mejora) cargan con `fontFamily: "times-new-roman"`, `toc.enabled: false`, `lists.figuresEnabled/tablesEnabled: false`, preservando exactamente su apariencia actual (SC-007).
