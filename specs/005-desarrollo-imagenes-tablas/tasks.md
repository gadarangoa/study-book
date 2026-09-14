# Tasks: Desarrollo con Imágenes y Tablas en Editor APA

**Input**: Design documents from `specs/005-desarrollo-imagenes-tablas/`

**Prerequisites**: [plan.md](./plan.md), [spec.md](./spec.md), [research.md](./research.md), [data-model.md](./data-model.md), [contracts/ui-contracts.md](./contracts/ui-contracts.md), [quickstart.md](./quickstart.md)

**Tests**: No se agregan tareas de framework de tests porque la especificación define validación manual end-to-end y los gates existentes `pnpm lint`, `pnpm typecheck` y `pnpm build`.

**Organization**: Las tareas están agrupadas por historia de usuario para permitir entregas incrementales y verificables.

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Preparar dependencias y confirmar la superficie existente del editor sin introducir una nueva ruta o store.

- [X] T001 Revisar `src/features/documents/components/development-field.tsx`, `src/features/documents/components/apa-pdf-preview.tsx`, `src/features/documents/hooks/useApaFormDocument.ts` y `src/features/documents/types.ts`, y documentar en comentarios de trabajo los puntos de extensión para imagen, tabla, preview y autoguardado.
- [X] T002 [P] Añadir una extensión de imagen compatible con TipTap 3 en `package.json` y actualizar `pnpm-lock.yaml`, manteniendo las extensiones de tabla ya declaradas.
- [X] T003 [P] Confirmar en `src/features/documents/types.ts` los tipos compartidos para contenido estructurado y estado de guardado que usarán las nuevas acciones del desarrollo.

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Crear las reglas comunes de contenido, validación y compatibilidad que necesitan todas las historias.

**⚠️ CRITICAL**: Ninguna historia debe comenzar antes de completar esta fase.

- [X] T004 Crear `src/features/documents/lib/development-content.ts` con la política tipada de imágenes: PNG/JPEG/WebP, máximo 5 MB, máximo 2400 px en el lado mayor y rechazo sin mutar el contenido previo.
- [X] T005 Implementar en `src/features/documents/lib/development-content.ts` la conversión segura de un archivo validado a un recurso embebido offline con metadatos de tipo, tamaño, dimensiones, título y texto alternativo.
- [X] T006 [P] Ampliar `src/features/documents/types.ts` con tipos/narrowing para atributos de nodos de imagen y operaciones de tabla sin usar `any`, conservando compatibilidad con `ApaDocumentContent` existente.
- [X] T007 Integrar la normalización defensiva de contenido legado en `src/features/documents/hooks/useApaFormDocument.ts`, preservando nodos de texto existentes y degradando localmente nodos desconocidos sin descartar el documento.
- [X] T008 Ajustar `src/features/documents/lib/apa-styles.css` para que imágenes y tablas respeten el ancho del contenido, mantengan legibilidad y no desborden la página APA en pantalla o impresión.

**Checkpoint**: La política de contenido, el modelo tipado, la compatibilidad y los estilos base están listos; las historias pueden implementarse sobre la misma fuente de verdad.

---

## Phase 3: User Story 1 - Incorporar imágenes al desarrollo (Priority: P1) 🎯 MVP

**Goal**: Insertar, describir, editar, eliminar y persistir imágenes locales dentro de Desarrollo.

**Independent Test**: Abrir un documento APA, insertar una imagen válida con texto alternativo, editar su descripción, recargar y comprobar que la imagen permanece; probar un archivo inválido sin alterar el contenido.

### Implementation for User Story 1

- [X] T009 [P] [US1] Crear `src/features/documents/components/development-image-dialog.tsx` con selector de archivo etiquetado, campo de texto alternativo, título opcional, cancelación, foco accesible y mensajes de validación.
- [X] T010 [US1] Integrar la acción de inserción de imagen en `src/features/documents/components/development-field.tsx`, preservando la posición activa del cursor y emitiendo el contenido completo mediante `onChange`.
- [X] T011 [US1] Añadir en `src/features/documents/components/development-field.tsx` acciones accesibles para seleccionar una imagen, editar alt text/título y eliminarla sin afectar nodos adyacentes.
- [X] T012 [US1] Conectar los cambios de imagen con el autoguardado existente en `src/features/documents/hooks/useApaFormDocument.ts`, incluyendo recuperación después de recarga y acción de reintento.
- [X] T013 [US1] Mostrar el estado de descripción pendiente y los errores de archivo en `src/features/documents/components/development-field.tsx` mediante mensajes textuales asociados a sus controles.

**Checkpoint**: US1 funciona de manera independiente: imágenes válidas se insertan y persisten, los archivos inválidos se rechazan y todos los controles principales son operables.

---

## Phase 4: User Story 2 - Construir tablas académicas básicas (Priority: P1)

**Goal**: Crear y modificar tablas de hasta 10 × 10 celdas con encabezado, filas y columnas editables.

**Independent Test**: Insertar una tabla 3 × 4, editar celdas, marcar la primera fila como encabezado, agregar/eliminar filas y columnas, recargar y eliminar la tabla sin perder el texto cercano.

### Implementation for User Story 2

- [X] T014 [P] [US2] Crear `src/features/documents/components/development-table-controls.tsx` con controles etiquetados para insertar tabla, agregar/eliminar fila, agregar/eliminar columna, alternar encabezado y eliminar tabla.
- [X] T015 [US2] Configurar las extensiones de tabla, fila, celda y encabezado en `src/features/documents/components/development-field.tsx`, manteniendo las herramientas de texto existentes.
- [X] T016 [US2] Integrar la inserción de tabla con validación de filas y columnas entre 1 y 10 en `src/features/documents/components/development-field.tsx`, sin mutar contenido al cancelar o introducir valores inválidos.
- [X] T017 [US2] Conectar las operaciones de filas, columnas, encabezado y eliminación de tabla con el contenido emitido por `src/features/documents/components/development-field.tsx` y el autoguardado de `src/features/documents/hooks/useApaFormDocument.ts`.
- [X] T018 [US2] Añadir estilos de edición y navegación de celdas en `src/features/documents/lib/apa-styles.css` y `src/features/documents/components/development-table-controls.tsx` para teclado, pantallas estrechas y tablas vacías.

**Checkpoint**: US2 funciona de manera independiente: una tabla básica se crea, edita, guarda, recupera y elimina sin afectar el contenido circundante.

---

## Phase 5: User Story 3 - Revisar y entregar un desarrollo enriquecido (Priority: P1)

**Goal**: Representar imágenes y tablas en el orden correcto y exportarlas fielmente junto con el documento APA.

**Independent Test**: Crear un documento con párrafos antes y después, una imagen y una tabla; verificar preview en escritorio/móvil y comparar el PDF exportado con la vista previa.

### Implementation for User Story 3

- [X] T019 [US3] Ampliar `src/features/documents/components/apa-pdf-preview.tsx` para renderizar nodos de imagen con proporción conservada, texto alternativo y fallback accesible cuando falte la descripción.
- [X] T020 [US3] Ampliar `src/features/documents/components/apa-pdf-preview.tsx` para renderizar tablas, celdas y fila de encabezado en el mismo orden del contenido de Desarrollo.
- [X] T021 [US3] Ajustar `src/features/documents/lib/apa-styles.css` para compartir entre pantalla e impresión la paginación, ancho, legibilidad y comportamiento de imágenes/tablas sin contenido truncado.
- [X] T022 [US3] Verificar en `src/pages/document-editor.tsx` y `src/features/documents/components/apa-form-editor.tsx` que la exportación existente espera al autoguardado y utiliza el preview actualizado sin crear una ruta de PDF separada.
- [X] T023 [US3] Añadir mensajes de fallback para nodos no reconocidos en `src/features/documents/components/apa-pdf-preview.tsx`, limitando la degradación al elemento afectado.

**Checkpoint**: US3 funciona de manera independiente: preview y PDF contienen texto, imágenes y tablas en el mismo orden y con la geometría APA esperada.

---

## Phase 6: User Story 4 - Continuar trabajando con documentos existentes (Priority: P2)

**Goal**: Mantener operativos los documentos anteriores y permitir enriquecerlos sin pérdida de contenido.

**Independent Test**: Abrir un documento anterior de texto, editarlo, guardarlo y exportarlo; después insertar una imagen y una tabla y repetir la comprobación.

### Implementation for User Story 4

- [X] T024 [US4] Actualizar `src/features/documents/hooks/useApaFormDocument.ts` para aceptar contenido legado de texto, normalizar atributos opcionales y conservar la migración 002→003 sin convertir manualmente al usuario.
- [X] T025 [US4] Revisar `src/features/documents/components/development-field.tsx` para que documentos sin nodos de imagen/tabla se abran con la toolbar nueva sin cambios visuales ni pérdida de contenido.
- [X] T026 [US4] Revisar `src/features/documents/components/apa-pdf-preview.tsx` para que documentos anteriores se rendericen, guarden y exporten aunque no contengan elementos nuevos.
- [X] T027 [US4] Confirmar en `src/features/documents/types.ts` y `src/features/documents/lib/development-content.ts` que la normalización de nodos desconocidos es conservadora y no usa tipos inseguros.

**Checkpoint**: US4 funciona de manera independiente: documentos existentes continúan siendo editables, persistentes y exportables antes y después de insertar contenido nuevo.

---

## Phase 7: Polish & Cross-Cutting Concerns

**Purpose**: Validar el conjunto completo y cerrar accesibilidad, rendimiento y documentación operativa.

- [X] T028 [P] Revisar labels, foco, estados y anuncios de errores en `src/features/documents/components/development-field.tsx`, `src/features/documents/components/development-image-dialog.tsx` y `src/features/documents/components/development-table-controls.tsx` contra el contrato de accesibilidad.
- [X] T029 [P] Revisar rendimiento y tamaño de contenido embebido en `src/features/documents/lib/development-content.ts` y `src/features/documents/components/apa-pdf-preview.tsx` para el objetivo de 20 páginas, 10 imágenes y 10 tablas.
- [X] T030 [P] Actualizar `src/features/documents/index.ts` si las nuevas políticas o componentes deben exponerse como interfaz pública de la feature.
- [X] T031 Ejecutar `pnpm lint` y corregir errores relacionados con `src/features/documents/` y `src/pages/document-editor.tsx`.
- [X] T032 Ejecutar `pnpm typecheck` y corregir errores de tipos en `src/features/documents/` y `src/pages/document-editor.tsx`.
- [ ] T033 Ejecutar `pnpm build` definido en `package.json` y corregir errores de compilación o empaquetado relacionados con la ampliación.
- [ ] T034 Ejecutar todos los escenarios de [specs/005-desarrollo-imagenes-tablas/quickstart.md](./quickstart.md) con `pnpm dev`, incluyendo validación de archivo, tabla, preview/PDF, compatibilidad y accesibilidad.

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No depende de otras fases; T002 y T003 pueden ejecutarse en paralelo después de T001 si se confirma la superficie actual.
- **Foundational (Phase 2)**: Depende de Phase 1 y bloquea todas las historias; T004/T005 deben preceder a las tareas de inserción de imágenes, y T006/T007 a la integración de contenido.
- **User Stories (Phase 3-6)**: Dependen de Phase 2. US1 y US2 pueden desarrollarse en paralelo porque sus componentes principales son distintos; US3 depende de las capacidades de contenido de US1 y US2; US4 puede comenzar tras Phase 2 y completarse antes o en paralelo con US3.
- **Polish (Phase 7)**: Depende de las historias que se quieran entregar y de la integración de preview/PDF.

### User Story Dependencies

- **US1 (P1)**: Puede comenzar después de Phase 2; es el MVP recomendado y no depende de US2.
- **US2 (P1)**: Puede comenzar después de Phase 2; no depende de US1, aunque comparte `development-field.tsx` y debe coordinar cambios.
- **US3 (P1)**: Depende de US1 y US2 para representar ambos nodos en la salida final.
- **US4 (P2)**: Puede comenzar después de Phase 2; valida compatibilidad transversal y debe quedar completa antes de considerar la feature terminada.

### Within Each User Story

- Validación y tipos preceden a la UI que los consume.
- Los componentes específicos preceden a la integración en `DevelopmentField`.
- La integración de edición/autoguardado precede a la validación manual.
- Preview/PDF se ajusta después de que existan los nodos que debe renderizar.
- Cada checkpoint debe validarse antes de iniciar trabajo dependiente.

## Parallel Opportunities

- **Phase 1**: T002 y T003 son paralelizables después de T001.
- **Phase 2**: T006 puede ejecutarse en paralelo con T004/T005; T008 puede ejecutarse en paralelo con T006/T007 si se acuerdan clases y selectores.
- **US1**: T009 puede prepararse en paralelo con T004/T005 una vez definidos los tipos; T013 es independiente de la conversión del archivo.
- **US2**: T014 y T015 pueden prepararse en paralelo, pero su integración efectiva converge en T016/T017.
- **Entre historias**: US1, US2 y US4 pueden avanzar en paralelo tras Foundation; US3 espera los nodos de ambas historias P1.
- **Polish**: T028, T029 y T030 son paralelizables antes de los gates T031-T033.

## Parallel Example: User Stories 1 and 2

```text
# Después de Phase 2, con dos personas o agentes:
Task A: T009-T013 [US1] Imagen local, diálogo, alt text y persistencia
Task B: T014-T018 [US2] Tabla básica, controles, filas/columnas y persistencia

# Después de completar US1 y US2:
Task C: T019-T023 [US3] Renderer compartido, estilos y exportación
```

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Completar Phase 1 y Phase 2.
2. Completar US1: insertar, validar, describir, eliminar y recuperar imágenes.
3. Ejecutar el escenario independiente de US1 y `pnpm lint`/`pnpm typecheck`.
4. Detenerse para validar la experiencia antes de incorporar tablas.

### Incremental Delivery

1. Phase 1 + Phase 2: contenido tipado, validación y compatibilidad base.
2. US1: imágenes locales embebidas y persistentes.
3. US2: tablas académicas básicas.
4. US3: preview y PDF fieles para ambos elementos.
5. US4: compatibilidad explícita con documentos existentes.
6. Phase 7: gates, quickstart y revisión accesible/performance.

### Notes

- Todas las tareas usan el formato obligatorio `- [ ] T### [P?] [US?] descripción con ruta`.
- No se crean tareas de tests automatizados porque no fueron solicitadas y el repositorio no tiene framework de tests configurado.
- Las tareas con `[P]` solo tocan archivos distintos o preparan trabajo independiente; `development-field.tsx` requiere coordinación cuando US1 y US2 se ejecuten en paralelo.
