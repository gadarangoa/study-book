# Implementation Plan: Desarrollo con Imágenes y Tablas en Editor APA

**Branch**: `005-desarrollo-imagenes-tablas` | **Date**: 2026-09-14 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from [spec.md](./spec.md)

## Summary

Extender el campo Desarrollo del editor APA para admitir imágenes locales embebidas y tablas académicas básicas, manteniendo el contenido como una secuencia estructurada única para edición, vista previa, impresión PDF y autoguardado offline. Se reutilizará la feature modular existente en `src/features/documents/`; las imágenes se validarán y normalizarán antes de insertarse, mientras que las tablas usarán el modelo estructurado ya soportado por el editor enriquecido. No habrá stores separados, URLs remotas ni colaboración.

## Technical Context

**Language/Version**: TypeScript 6, React 19, Vite 8

**Primary Dependencies**: TipTap 3 y extensiones de tabla ya declaradas; extensión de imagen compatible con TipTap si la implementación la requiere; shadcn/ui v4, Tailwind v4, lucide-react, IndexedDB existente

**Storage**: IndexedDB mediante la capa existente; el contenido de Desarrollo se persiste dentro de `ApaFormDocument.sections.development` como JSON estructurado. Las imágenes válidas se embeben en el contenido para conservar el funcionamiento offline.

**Testing**: No existe framework de pruebas automatizadas en el repositorio. Se usarán `pnpm lint`, `pnpm typecheck`, `pnpm build` y validación manual end-to-end con `pnpm dev` según [quickstart.md](./quickstart.md).

**Target Platform**: SPA en navegadores modernos de escritorio y pantallas estrechas; impresión del navegador a PDF con la misma representación de la vista previa.

**Project Type**: Aplicación web frontend modular dentro del SPA existente.

**Performance Goals**: Vista previa actualizada en menos de 3 segundos para documentos habituales de hasta 20 páginas, 10 imágenes y 10 tablas; inserción de imagen en menos de 1 minuto; creación de tabla de hasta 10 × 10 celdas en menos de 2 minutos.

**Constraints**: Offline-first; sin backend ni URLs de imagen remotas; validar formato, tamaño y dimensiones antes de insertar; preservar documentos existentes; accesibilidad por teclado y lector de pantalla; vista previa y PDF deben compartir la representación y estilos APA.

**Scale/Scope**: Un usuario local, documentos APA existentes y nuevos, cambios limitados a la sección Desarrollo y sus superficies de preview/PDF, persistencia y migración necesarias.

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principio | Estado | Evidencia |
|-----------|--------|-----------|
| I. Component-First Architecture | ✅ Pasa | Se extenderán `DevelopmentField` y `ApaPdfPreview` con componentes pequeños para toolbar, inserción de imagen y controles de tabla; se reutilizarán primitivas shadcn para botones, campos, diálogos y mensajes. |
| II. Type-Safe Data Modeling | ✅ Pasa | `ApaDocumentContent` y las entidades de imagen/tabla tendrán contratos tipados; los límites de archivo y atributos de nodos se validarán sin `any`. |
| III. Offline-First with Local Persistence | ✅ Pasa | Las imágenes se embeben en el contenido del documento y las tablas se guardan en IndexedDB mediante el autoguardado existente; no se añade dependencia de red. |
| IV. Modular Feature Boundaries | ✅ Pasa | Todo el cambio vive en `src/features/documents/` y conserva sus interfaces públicas; no se crean módulos globales ni imports internos cruzados. |
| V. Accessible by Default | ✅ Pasa | Los controles tendrán labels, estados anunciados, navegación por teclado y texto alternativo para imágenes; los diálogos de validación tendrán título accesible. |

## Project Structure

### Documentation (this feature)

```text
specs/005-desarrollo-imagenes-tablas/
├── plan.md              # Este plan
├── research.md          # Decisiones de Phase 0
├── data-model.md       # Entidades, nodos y validaciones
├── quickstart.md       # Validación manual end-to-end
├── contracts/
│   └── ui-contracts.md # Contratos de editor, preview y persistencia
└── tasks.md             # Se generará después con /speckit-tasks
```

### Source Code (repository root)

```text
src/
├── features/documents/
│   ├── types.ts                         # Tipos de contenido y documento
│   ├── components/
│   │   ├── development-field.tsx        # Toolbar, imagen y tabla en edición
│   │   ├── development-image-dialog.tsx # Selección, validación y alt text
│   │   ├── development-table-controls.tsx # Operaciones de tabla accesibles
│   │   ├── apa-pdf-preview.tsx           # Renderizado compartido preview/PDF
│   │   └── apa-form-editor.tsx           # Composición existente, si requiere wiring
│   ├── hooks/useApaFormDocument.ts       # Autoguardado y compatibilidad
│   └── lib/development-content.ts        # Validación/normalización de nodos
└── pages/document-editor.tsx             # Integración existente, sin nueva ruta
```

**Structure Decision**: Extender la feature `documents` existente. Se separan los diálogos y controles nuevos para mantener `DevelopmentField` componible; la validación/normalización vive en `lib`, y el preview continúa siendo el renderer de referencia para la impresión. No se crea una aplicación, ruta ni store adicional.

### Re-check post-Phase 1

✅ **Pasa**. El modelo mantiene tipos explícitos para nodos de imagen y tabla, la persistencia continúa en el documento offline existente, los contratos se mantienen dentro de `src/features/documents/`, y los controles de edición/errores incluyen requisitos de teclado, lector de pantalla y texto alternativo. No se introducen violaciones ni complejidad arquitectónica adicional.

## Complexity Tracking

Sin violaciones del Constitution Check; no se requiere justificar complejidad adicional.
| [e.g., Repository pattern] | [specific problem] | [why direct DB access insufficient] |
