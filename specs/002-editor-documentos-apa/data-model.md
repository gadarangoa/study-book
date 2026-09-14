# Data Model: Editor de Documentos APA

**Feature**: 002-editor-documentos-apa
**Date**: 2026-09-10

## Entity Relationship Diagram

```text
User (auth context)
  └── has many Careers
       └── has many Courses
            ├── has many Resources (001, existente)
            ├── has many Tasks (001, existente)
            ├── has many Partners (001, existente)
            ├── has many ScheduleEntries (001, existente)
            └── has many ApaDocuments (NUEVO en 002)
```

La plantilla APA no se persiste como entidad: es una constante de código
(documento inicial + estilos) versionada junto al feature.

## Entities

### ApaDocument (nueva)

| Field     | Type   | Required | Notes                                              |
|-----------|--------|----------|----------------------------------------------------|
| id        | string | yes      | UUID, auto-generado                                |
| courseId  | string | yes      | FK → Course.id (un documento, un curso)            |
| title     | string | yes      | No vacío, editable por el usuario                  |
| content   | object | yes      | Documento TipTap JSON (fuente única de verdad)     |
| status    | enum   | yes      | "draft" \| "in_review" \| "finalized"              |
| createdAt | string | yes      | ISO 8601 timestamp                                 |
| updatedAt | string | yes      | ISO 8601 timestamp (base del autoguardado)         |

**Relationships**: Un ApaDocument pertenece a exactamente un Course.
Un Course tiene cero o muchos ApaDocuments (vía `document.courseId`).

**Validation**:
- `title` MUST ser no vacío (máx. 200 caracteres).
- `courseId` MUST referenciar un Course existente; crear con curso inexistente es error.
- `content` MUST ser un documento TipTap JSON válido; si está corrupto, el editor abre plantilla vacía válida y conserva copia de recuperación (no pérdida silenciosa).
- `status` solo acepta los tres valores del enum.

**State Transitions** (FR-012, cambio manual por el usuario):
- `draft` → `in_review` (marcar en revisión)
- `in_review` → `draft` (devolver a borrador)
- `in_review` → `finalized` (marcar finalizado)
- `finalized` → `in_review` (reabrir)
- Transiciones directas `draft` ↔ `finalized` permitidas (atajo manual).

**Cascade**:
- Eliminar un Course elimina sus ApaDocuments (lógica de aplicación, con confirmación informada previa — spec US-3 escenario 4).
- Duplicar un documento crea un ApaDocument nuevo (nuevo id, `createdAt`/`updatedAt` nuevos, mismo `courseId`, título con sufijo " (copia)").

### ApaTemplate (constante, no persistida)

Documento TipTap JSON inicial + metadatos de portada, versionado en código
(`APA_TEMPLATE_VERSION`, p. ej. `"7e-es-v1"` para APA 7.ª ed. en español):

- Campos de portada: título del trabajo, nombre del autor, institución, curso, docente, fecha.
- Secciones base: Resumen, Introducción, Desarrollo, Conclusiones, Referencias.
- Estilos por defecto aplicados en render: Times New Roman 12pt, doble espacio, márgenes 2.54 cm, sangría de primera línea 1.27 cm, encabezados por niveles APA.

**Regla**: los cambios del usuario viven solo en su ApaDocument; la plantilla nunca muta.

### Course (existente, 001 — sin cambios de esquema)

Se reutiliza tal cual. Solo se añade la relación "has many ApaDocuments".
Ningún campo existente se modifica (principio de modelado versionado: esta
feature no altera esquemas previos).

## Storage

IndexedDB, mismo patrón y (si la capa lo permite) mismo object store
familiar que 001 con un store nuevo `apa-documents` indexado por `courseId`.
Sin backend; offline-first (constitución III).
