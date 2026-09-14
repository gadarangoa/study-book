# Research: Desarrollo con Imágenes y Tablas en Editor APA

**Feature**: 005-desarrollo-imagenes-tablas
**Date**: 2026-09-14

## Decision 1: Mantener un único contenido estructurado para edición, preview y PDF

**Decision**: Las imágenes y tablas se representarán como nodos dentro de `sections.development`, junto con párrafos, encabezados, listas y citas existentes.

**Rationale**: El editor actual ya trata el JSON del desarrollo como fuente única de verdad y el preview lo renderiza para impresión. Mantener esa frontera evita sincronizar un modelo paralelo y conserva el orden relativo entre texto, imágenes y tablas.

**Alternatives considered**:
- Guardar imágenes y tablas en colecciones separadas: rechazado porque complicaría el orden del contenido y la recuperación offline.
- Crear campos separados fuera de Desarrollo: rechazado porque no permite intercalar una imagen o tabla en la posición académica donde se necesita.
- Reemplazar el editor por un procesador de documentos completo: rechazado por alcance y riesgo de regresión.

## Decision 2: Embebido local para imágenes

**Decision**: Una imagen seleccionada desde el dispositivo se valida antes de insertarse y se almacena embebida en el contenido del documento, con texto alternativo y metadatos mínimos de presentación.

**Rationale**: El producto debe funcionar sin conexión y el usuario espera recuperar el documento sin depender de una URL externa. La validación previa evita insertar recursos no soportados o incompletos.

**Alternatives considered**:
- Guardar solo una URL local o remota: rechazado porque puede dejar de existir o no estar disponible offline.
- Subir a un servicio externo: rechazado porque introduce backend, autenticación, latencia y un alcance fuera de la feature.
- Aceptar cualquier archivo y resolverlo durante el preview: rechazado porque desplaza el error a una etapa tardía y puede romper exportación.

**Resolved constraints**:
- Formatos admitidos iniciales: PNG, JPEG y WebP.
- Límite inicial por archivo: 5 MB.
- Dimensión máxima inicial: 2400 px en el lado mayor; las imágenes mayores se rechazan con una instrucción clara.
- El límite es una decisión operativa revisable durante implementación, no un contrato visible de formato APA.

## Decision 3: Tablas académicas básicas

**Decision**: Se reutilizan las extensiones de tabla ya declaradas en el proyecto. La primera versión permite crear una tabla, editar celdas, agregar/eliminar filas y columnas, marcar fila de encabezado y eliminar la tabla.

**Rationale**: Cubre la necesidad académica indicada y aprovecha dependencias existentes sin introducir un modelo propio de celdas. La capacidad queda deliberadamente acotada para preservar usabilidad y accesibilidad.

**Alternatives considered**:
- Tablas como texto tabulado: rechazado porque pierde estructura, edición de filas/columnas y representación consistente en PDF.
- Editor de tablas avanzado con combinación de celdas y estilos complejos: rechazado por alcance, complejidad de accesibilidad y falta de requisito.
- Importación desde hojas de cálculo: rechazada por no estar solicitada y por introducir decisiones de formato adicionales.

## Decision 4: Texto alternativo y degradación segura

**Decision**: El texto alternativo se solicita al insertar la imagen, puede editarse después y se marca como pendiente si queda vacío. Un nodo no reconocido no debe descartar el resto del documento.

**Rationale**: El texto alternativo es necesario para accesibilidad y la degradación localizada protege documentos existentes ante contenido inesperado.

**Alternatives considered**:
- Hacer obligatorio el texto alternativo para guardar: rechazado porque impediría borradores parciales.
- Omitir imágenes sin alt text silenciosamente: rechazado por pérdida de contenido y accesibilidad.

## Decision 5: Preview y PDF comparten renderer y estilos

**Decision**: El preview y la impresión seguirán utilizando el mismo árbol de contenido y las mismas reglas APA; la implementación deberá añadir renderizado de imagen y tabla a ese renderer, no generar un PDF independiente.

**Rationale**: Es la forma existente de garantizar que lo revisado por el estudiante coincide con lo exportado. Reduce divergencias de paginación, estilos y orden.

**Alternatives considered**:
- Generar un PDF con una ruta de renderizado separada: rechazado por riesgo de diferencias entre preview y entrega.
- Convertir a HTML externo antes de exportar: rechazado porque duplica formato y complica offline.

## Decision 6: Validación disponible en el repositorio

**Decision**: Se usarán los gates existentes (`pnpm lint`, `pnpm typecheck`, `pnpm build`) y una guía manual end-to-end con `pnpm dev`, ya que no hay framework de tests configurado.

**Rationale**: Coincide con la constitución y con el patrón de la feature 003. Las pruebas manuales cubrirán inserción, edición, persistencia, preview, PDF, accesibilidad y compatibilidad.

**Alternatives considered**:
- Añadir un framework de tests como parte de esta feature: diferido para evitar ampliar el alcance; se dejarán escenarios reproducibles para automatización futura.
