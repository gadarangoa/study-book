# Research: Editor de Documentos APA

**Feature**: 002-editor-documentos-apa
**Date**: 2026-09-10

## R1: Editor de texto enriquecido — TipTap

**Decision**: TipTap v3 (basado en ProseMirror) como motor del editor, con su modelo de documento JSON como fuente única de verdad.

**Rationale**:
- El repositorio no tiene ninguna dependencia de edición; hay que elegir una.
- TipTap es el estándar de facto para rich-text en React: headless (sin estilos impuestos, compatible con shadcn/Tailwind), extensible por nodos (tablas, citas, figuras con título/numeración) y con salida JSON estructurada.
- El JSON estructurado permite renderizar el mismo documento en tres superficies (editor editable, vista previa de solo lectura, DOM de impresión para PDF) sin conversiones frágiles HTML↔modelo.
- Soporta historial deshacer/rehacer nativo y accesibilidad de teclado razonable sobre contentEditable.

**Alternatives considered**:
- Lexical (Meta): potente pero API más verbosa y ecosistema de extensiones menor para tablas/serialización simple. Rechazado.
- Quill / react-quill: modelo Delta menos expresivo, proyecto en mantenimiento irregular, estilos propios difíciles de integrar con shadcn. Rechazado.
- contentEditable hecho a mano: viola el principio de no reinventar primitivas y dispara riesgo de bugs de formato. Rechazado.
- Exigir sintaxis LaTeX al alumno: contradice el supuesto del spec (editor tipo Word, sin código). Rechazado.

## R2: Símbolos y fórmulas simples — KaTeX

**Decision**: KaTeX para renderizar fórmulas/símbolos académicos simples dentro del documento.

**Rationale**:
- La constitución ya prevé "KaTeX o MathJax (TBD)"; KaTeX resuelve el TBD.
- KaTeX es rápido (render síncrono sin reflow), liviano (~30KB), sin dependencias de red en tiempo de ejecución (offline-first) y sus estilos se imprimen bien a PDF.
- Cubre el alcance del spec: símbolos y fórmulas simples, no un motor LaTeX completo.

**Alternatives considered**:
- MathJax: render de mayor fidelidad tipográfica pero más pesado y asíncrono; innecesario para el alcance. Rechazado.
- Ningún soporte de fórmulas: incumple el supuesto del spec ("símbolos y fórmulas simples"). Rechazado.

## R3: Exportación a PDF — impresión del navegador con CSS @page

**Decision**: Exportar a PDF mediante la impresión del navegador (`window.print()`) sobre el DOM de la vista previa, con hoja de estilos de impresión dedicada (`@page`, `@media print`) que implementa la norma APA.

**Rationale**:
- Garantiza por construcción el requisito FR-011/SC-004: el PDF es fiel a la vista previa porque **es** la vista previa impresa (mismo DOM, mismos estilos).
- Cero dependencias nuevas, funciona offline, respeta tildes/ñ/Unicode y resuelve paginación, tablas y figuras con el motor del navegador.
- La alternativa jsPDF/html2canvas rasteriza o reconstruye el layout y produce PDFs de peor calidad tipográfica con alto costo de mantenimiento.

**Alternatives considered**:
- jsPDF + html2canvas: captura como imagen (texto no seleccionable, archivos pesados, mala paginación). Rechazado.
- Generación LaTeX + compilador: requiere toolchain nativo o servicio externo; rompe offline-first. Rechazado.
- Servicio backend de conversión: no existe backend y el principio offline-first lo prohíbe. Rechazado.

## R4: Estilos APA compartidos — una sola hoja print/preview

**Decision**: Un único módulo de estilos APA (márgenes 2.54 cm vía `@page`, Times New Roman 12pt, doble interlineado, sangría de primera línea, portada centrada, encabezados con niveles APA 7.ª ed.) aplicado tanto a la vista previa en pantalla como a la impresión.

**Rationale**:
- Elimina la clase de bugs "se ve bien pero imprime mal": preview y PDF comparten reglas, solo cambia el viewport.
- La plantilla por defecto (FR-001) se implementa como documento TipTap inicial + estos estilos, no como código de formato repetido.

**Alternatives considered**:
- Estilos separados para preview e impresión: duplica mantenimiento y riesgo de divergencia. Rechazado.

## R5: Autoguardado y persistencia — IndexedDB + debounce (patrón 001)

**Decision**: Reutilizar la capa de persistencia IndexedDB introducida en 001 (mismo patrón de hooks `useXxx`), guardando el JSON TipTap con debounce (~1s tras la última edición) más guardado al desmontar/cerrar.

**Rationale**:
- Consistencia arquitectónica: el spec y la constitución exigen offline-first con persistencia local; 001 ya resolvió almacenamiento/patrón de hooks.
- Los documentos (JSON de hasta ~20 páginas) caben holgadamente en IndexedDB; localStorage se evita por límites de tamaño y serialización (ver R1 de 001).
- El debounce evita escrituras por cada pulsación; el guardado al desmontar cubre el cierre del navegador (SC-006).

**Alternatives considered**:
- Guardado manual con botón: peor UX y riesgo de pérdida; incumple FR-010. Rechazado.
- Guardado por pulsación sin debounce: escrituras excesivas a IndexedDB. Rechazado.
- Nueva capa de storage separada: duplica código, viola el límite modular. Rechazado.

## R6: Relaciones y borrado en cascada — FK + lógica de aplicación (patrón 001)

**Decision**: `document.courseId` como FK a `Course.id`; borrado en cascada implementado en lógica de aplicación (al eliminar un curso, eliminar sus documentos tras confirmación informada — FR de US-3 escenario 4).

**Rationale**: Idéntico patrón al R3 de 001 (referencing + cascade en app). Sin cambios de esquema en entidades existentes.

**Alternatives considered**:
- Embedir documentos dentro del curso: reescribe el curso en cada pulsación (con autoguardado) y rompe el patrón de 001. Rechazado.
