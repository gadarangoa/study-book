# Data Model: Editor APA por Formulario con Vista Previa PDF

**Feature**: 003-apa-form-pdf-editor
**Date**: 2026-09-10

## Entity Relationship Diagram

```text
User (auth context, existente)
  └── has many Careers (existente)
       └── has many Courses (existente, sin cambios de esquema)
            └── has many ApaFormDocuments (NUEVO en 003, evoluciona 002)
                 └── has many BibEntries (embebidas, ordenadas)
```

La plantilla APA sigue sin persistirse como entidad: es una constante de código
(secciones iniciales + estilos) versionada junto al feature. Las entradas de
bibliografía se embeben en el documento (no tienen store propio).

## Entities

### ApaFormDocument (nueva, evoluciona `ApaDocument` de 002)

| Field           | Type   | Required | Notes                                                        |
|-----------------|--------|----------|--------------------------------------------------------------|
| id              | string | yes      | UUID, auto-generado                                          |
| courseId        | string | yes      | FK → Course.id (un documento, un curso)                      |
| title           | string | yes      | No vacío, máx. 200 caracteres; refleja portada/título        |
| sections        | object | yes      | `ApaFormSections` (fuente única de verdad, ver abajo)        |
| status          | enum   | yes      | "draft" \| "in_review" \| "finalized"                        |
| pageSize        | enum   | yes      | "letter" (Carta, por defecto APA) \| "a4"                    |
| templateVersion | string | yes      | `"7e-es-form-v1"` para documentos de esta variante           |
| migratedFrom    | string | no       | `"002-tiptap"` si proviene de migración; ausente si es nativo|
| createdAt       | string | yes      | ISO 8601 timestamp                                           |
| updatedAt       | string | yes      | ISO 8601 timestamp (base del autoguardado)                   |

```typescript
interface ApaFormSections {
  cover: CoverData
  introduction: string          // texto plano
  justification: string         // texto plano, opcional: vacío = se omite en preview/PDF
  generalObjective: string      // texto plano
  specificObjectives: SpecificObjective[]  // lista dinámica {id, text}
  development: JSONContent      // fragmento TipTap (formato acotado, R2)
  conclusions: string           // texto plano
  bibliography: BibEntry[]      // ordenada por `order`
}

interface CoverData {
  workTitle: string             // requerido
  authors: string[]             // snapshot de nombres de integrantes del Team; requerido ≥1
  institution: string
  courseName: string            // precargado desde el curso, editable
  teacherName: string
  date: string                  // ISO date (yyyy-mm-dd), precargada con hoy
}

interface BibEntry {
  id: string                    // UUID
  author: string                // requerido, p. ej. "Apellido, N."
  year: string                  // requerido, 4 dígitos numéricos
  title: string                 // requerido
  source: string                // editorial / revista / URL
  order: number                 // posición en la lista (0-based, contiguo)
}

interface SpecificObjective {
  id: string                    // UUID
  text: string                  // texto del objetivo específico
}
```

**Relationships**: Un ApaFormDocument pertenece a exactamente un Course. Un
Course tiene cero o muchos documentos (vía `courseId`).

**Validation**:
- `title`, `cover.workTitle`, `cover.authorName` MUST ser no vacíos.
- `cover.date` MUST ser fecha válida; por defecto la actual.
- `introduction` / `conclusions`: mínimo orientativo (p. ej. 50 caracteres) NO
  bloqueante — se muestra sugerencia, no se impide guardar (borradores
  parciales permitidos).
- `BibEntry`: `author`, `year`, `title` requeridos; `year` MUST ser numérico de
  4 dígitos; `order` contiguo sin huecos tras reordenar/eliminar.
- Entrada incompleta: se conserva como pendiente y el preview/impresión la
  omite o marca, sin romper el resto (edge case del spec).
- `status` solo acepta los tres valores del enum.
- `courseId` MUST referenciar un Course existente.

**State Transitions** (FR-014, cambio manual por el usuario):
- `draft` → `in_review` → `finalized`, con retorno `finalized` → `in_review` →
  `draft`; atajos directos `draft` ↔ `finalized` permitidos.

**Cascade** (igual que 002):
- Eliminar un Course elimina sus documentos (lógica de aplicación, con
  confirmación informada previa).
- Duplicar crea un documento nuevo (nuevo id, `createdAt`/`updatedAt` nuevos,
  mismo `courseId`, título con sufijo " (copia)"); los ids de `BibEntry` se
  regeneran.

### Migración desde 002

Los documentos 002 (`content`: TipTap completo, `APA_TEMPLATE_VERSION`
`"7e-es-v1"`) se migran al abrir/guardar en la variante por formulario:

- `sections.development` = contenido 002 íntegro; `cover` con `workTitle` =
  título del documento y resto vacío (salvo `courseName` precargado y `date`
  actual); `introduction` / `conclusions` vacías; `bibliography` vacía.
- `templateVersion` = `"7e-es-form-v1"`, `migratedFrom` = `"002-tiptap"`.
- La migración es unidireccional y conservadora: ningún texto se descarta.

### ApaTemplate (constante, no persistida)

`createApaFormTemplate(courseName)`: portada vacía con valores guía,
introducción/desarrollo/conclusiones con texto guía orientativo (no counted
como contenido real hasta que el usuario escribe), bibliografía con un ejemplo
marcado como pendiente de completar o eliminar. `title` inicial: "Nuevo
entregable" (el usuario lo renombra; `workTitle` de portada es independiente).

**Regla**: los cambios del usuario viven solo en su documento; la plantilla
nunca muta.

### Course (existente — sin cambios de esquema)

Se reutiliza tal cual; solo se añade la relación "has many ApaFormDocuments".
Ningún campo existente se modifica.

## Storage

IndexedDB, mismo store `apa-documents` de 002 indexado por `courseId`
(esquema v2 con `sections` + `templateVersion`). Sin backend; offline-first
(constitución III). Autoguardado con debounce (~1 s tras la última edición de
cualquier sección) + guardado al desmontar/cerrar (SC-006).
