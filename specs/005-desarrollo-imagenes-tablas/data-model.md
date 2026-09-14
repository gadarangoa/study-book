# Data Model: Desarrollo con Imágenes y Tablas en Editor APA

**Feature**: 005-desarrollo-imagenes-tablas
**Date**: 2026-09-14

## Relationship

```text
Course
  └── ApaFormDocument
        └── ApaFormSections
              └── development: ordered rich-content nodes
                    ├── text blocks
                    ├── image nodes
                    └── table nodes
```

No se crean stores independientes para imágenes o tablas. El documento sigue perteneciendo a un único curso y el contenido de Desarrollo permanece dentro del documento persistido en IndexedDB.

## ApaFormDocument

La entidad existente no cambia sus relaciones. `sections.development` evoluciona para admitir nodos visuales y tabulares además de texto.

| Field | Type | Required | Validation / notes |
|---|---|---:|---|
| `id` | string | yes | Identificador existente del documento |
| `courseId` | string | yes | Referencia a un curso existente |
| `sections.development` | structured content | yes | Secuencia ordenada de nodos; debe poder abrirse aunque no contenga imágenes/tablas |
| `templateVersion` | string | yes | Se conserva la versión del documento; la ampliación no debe romper la migración previa |
| `updatedAt` | string | yes | Se actualiza mediante el autoguardado existente |

## ImageNode

Nodo de imagen embebida dentro de `development`.

| Field | Type | Required | Validation / notes |
|---|---|---:|---|
| `type` | literal | yes | `image` |
| `attrs.src` | string | yes | Recurso embebido válido; no URL remota en esta versión |
| `attrs.alt` | string | no | Texto alternativo; vacío se marca como pendiente, no bloquea borradores |
| `attrs.title` | string | no | Título o descripción visible opcional |
| `attrs.mimeType` | enum | yes | `image/png`, `image/jpeg` o `image/webp` |
| `attrs.fileSize` | number | yes | Mayor que cero y como máximo 5 MB |
| `attrs.width` | number | yes | Dimensión original positiva, lado mayor como máximo 2400 px |
| `attrs.height` | number | yes | Dimensión original positiva |

**Rules**:
- El archivo se valida antes de crear el nodo.
- No se persiste un nodo si el tipo, tamaño o dimensión no es válido.
- El renderer debe limitar visualmente el ancho al área de contenido sin distorsionar la proporción.
- El alt text se conserva al editar, recargar y exportar.

## TableNode

Nodo de tabla estructurada dentro de `development`.

| Field | Type | Required | Validation / notes |
|---|---|---:|---|
| `type` | literal | yes | `table` |
| `content` | ordered rows | yes | Una o más filas; puede estar vacía al crearla |
| `tableHeader` | node type | no | Una fila puede marcarse como encabezado |
| `tableRow` | node type | yes | Contiene celdas en orden |
| `tableCell` | node type | yes | Contenido editable, inicialmente vacío o con párrafo |

**Rules**:
- El tamaño inicial se valida como filas y columnas enteras entre 1 y 10 para el flujo principal.
- Agregar o quitar filas/columnas conserva las celdas no afectadas y el orden del documento.
- El usuario puede eliminar una tabla completa.
- Una tabla vacía sigue siendo válida para permitir edición progresiva, pero debe renderizarse sin romper preview/PDF.
- No se incluyen combinación de celdas, fórmulas, importación ni estilos complejos.

## Content Validation

1. El contenido existente de texto debe conservarse sin migración destructiva.
2. Los nodos `image` y `table` deben permanecer en el orden en que fueron insertados.
3. Los nodos no reconocidos deben degradarse localmente con una indicación visible, sin descartar el documento completo.
4. El autoguardado debe persistir la versión completa del desarrollo, no solo el último nodo modificado.
5. La vista previa y la impresión deben interpretar el mismo contenido validado.

## State and Error Handling

- **Validating**: archivo seleccionado o tabla solicitada aún está siendo comprobado.
- **Ready**: nodo válido insertado y disponible para edición.
- **Alt pending**: imagen válida sin texto alternativo; se muestra aviso accesible.
- **Save error**: el contenido permanece en memoria y aparece acción de reintento.
- **Unsupported content**: nodo no reconocido se representa con fallback localizado; el resto del documento continúa operativo.

## Compatibility

Los documentos existentes con desarrollo de texto enriquecido siguen siendo válidos. Al abrirlos no se exige conversión manual; solo los nuevos nodos utilizan las capacidades adicionales. La migración previa de documentos 002 a 003 permanece vigente.
