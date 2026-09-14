# Research: Editor APA por Formulario con Vista Previa PDF

**Feature**: 003-apa-form-pdf-editor
**Date**: 2026-09-10

Hereda las decisiones de `002-editor-documentos-apa/research.md` donde siguen
válidas (R2 KaTeX fuera de alcance v1 aquí, R3 impresión, R5 IndexedDB+debounce,
R6 FK+cascada). Lo nuevo de esta variante es el modelo por formulario y la
vista dividida; cada punto cierra un aspecto del Technical Context sin
incógnitas pendientes.

## R1: Fuente única de verdad — modelo estructurado por secciones

**Decision**: El estado del documento es un objeto estructurado `ApaFormSections`
(portada tipada + introducción plana + desarrollo como fragmento TipTap JSON +
conclusiones planas + entradas de bibliografía tipadas). La vista previa y el
PDF se **derivan** de ese modelo mediante un render compositivo; nunca se edita
el DOM de preview directamente.

**Rationale**:
- El spec exige un formulario por secciones con validación por campo (portada
  obligatoria, año numérico, etc.): un único JSON de editor libre (modelo 002)
  no permite validar ni reordenar referencias de forma estructurada.
- Derivar preview/PDF del mismo modelo garantiza por construcción FR-008 y
  FR-013 (fidelidad preview == PDF): ambas superficies son funciones puras del
  mismo estado.
- El desarrollo sigue siendo enriquecido sin contaminar el resto: solo esa
  sección usa el modelo TipTap, acotado al formato académico básico.

**Alternatives considered**:
- Reutilizar el documento TipTap completo de 002 y mapear secciones a nodos:
  validación por sección y bibliografía dinámica exigirían recorrer/mutar el
  árbol del editor en cada cambio (frágil, rompe FR-004/FR-007). Rechazado.
- Formularios no controlados con lectura al exportar: impide preview en vivo y
  autoguardado por sección (rompe FR-008/FR-012). Rechazado.

## R2: Campo de desarrollo enriquecido — fragmento TipTap acotado

**Decision**: La sección de desarrollo usa una instancia TipTap dedicada con
StarterKit + Underline + TextAlign (todas YA en `package.json`), limitada a
negrita, cursiva, encabezados, listas, alineación y citas simples. Su valor es
un fragmento JSON que vive dentro de `ApaFormSections.development`.

**Rationale**:
- Reutiliza la dependencia y el conocimiento de 002 sin añadir peso ni APIs
  nuevas; el subset acotado cumple FR-006 y excluye explícitamente tablas e
  imágenes (fuera de alcance v1 por Assumptions).
- El fragmento se persiste tal cual en IndexedDB y se renderiza en el preview
  con el mismo conversor JSON→DOM que use la app (una sola vía de render).

**Alternatives considered**:
- Textarea markdown con parser propio: añade una sintaxis que el alumno debe
  aprender y un conversor que mantener; contradice la "practicidad" del
  formulario. Rechazado.
- contentEditable hecho a mano: viola el principio de no reinventar primitivas
  y dispara riesgo de bugs. Rechazado.

## R3: Vista previa + controles PDF — mismo DOM que se imprime

**Decision**: La vista previa es el documento APA compuesto (portada +
secciones + referencias formateadas) renderizado en HTML con la hoja APA
compartida; los controles son navegación por páginas (desplazamiento a la
página/ancla), zoom (escala tipográfica del contenedor) y exportar. La
exportación usa `window.print()` sobre ese mismo DOM con `@page`/`@media print`
(igual que 002/R3): preview y PDF comparten fuente y estilos por construcción.

**Rationale**:
- Cumple FR-009 (controles) y SC-004 (fidelidad) sin añadir librerías de PDF:
  cero dependencias nuevas, offline, Unicode correcto, paginación del motor
  del navegador.
- El zoom como escala del contenedor (no del layout de impresión) evita
  divergencias preview/PDF: el zoom solo afecta a pantalla (`@media screen`).

**Alternatives considered**:
- Librería de visor PDF (p. ej. react-pdf) + generación jsPDF: dos pipelines
  de render (pantalla vs archivo) que pueden divergir, más peso y peor calidad
  tipográfica; contradice 002/R3 ya validado. Rechazado.
- Previsualizar con un iframe de PDF generado en cliente: exige generar el PDF
  en cada pulsación (costoso, rompe SC-002). Rechazado.

## R4: Bibliografía dinámica — lista estructurada + formateador puro

**Decision**: Las entradas son objetos `{ id, author, year, title, source, order }`
gestionados como lista (agregar/editar/eliminar con confirmación si tiene
contenido, reordenar con botones subir/bajar accesibles). Un formateador puro
`formatBibEntry(entry): string` produce la cadena APA ("Apellido, N. (año).
Título. Fuente.") usada tanto en preview como en impresión.

**Rationale**:
- Estructurar en lugar de texto libre permite validar (año numérico), reordenar
  sin reeditar y no romper el preview ante entradas incompletas (se marcan
  como pendientes, edge case del spec).
- El formateador puro es testeable manualmente y compartido por ambas
  superficies: una sola regla de formato APA para referencias.

**Alternatives considered**:
- Una entrada como texto libre por línea: imposible validar/reordenar por
  campos y propenso a errores de formato (justo lo que el spec quiere evitar).
  Rechazado.
- Importación desde gestores externos (BibTeX/Zotero): fuera de alcance v1 por
  Assumptions. Rechazado.

## R5: Persistencia y migración — mismo store, esquema v2

**Decision**: Reutilizar el store IndexedDB `apa-documents` (patrón de 002/001)
con debounce (~1 s) + guardado al desmontar. El esquema evoluciona a secciones
(`ApaFormDocument`, `templateVersion: "7e-es-form-v1"`); los documentos 002
existentes (TipTap completo) migran colocando su contenido como desarrollo
inicial con portada/introducción/conclusiones vacías y cero referencias, y se
marca el documento como migrado para no re-migrar.

**Rationale**:
- Consistencia arquitectónica y offline-first (constitución III); evita un
  segundo store y duplicar hooks.
- La migración es conservadora (ningún contenido se pierde: todo el texto
  previo sobrevive en desarrollo) y unidireccional (no se escribe de vuelta al
  formato 002).

**Alternatives considered**:
- Store separado para la variante por formulario: duplica hooks y rompe la
  invariante "un curso tiene N documentos" en dos lugares. Rechazado.
- Sin migración (documentos 002 ilegibles): pérdida de datos del usuario.
  Rechazado.

## R6: Validación y responsive — por sección, apilado con pestañas

**Decision**: Validación inline por sección con mensajes junto al campo (patrón
shadcn FieldGroup): portada exige título y autor; año de bibliografía numérico
de 4 dígitos; introducción/conclusiones con mínimo orientativo no bloqueante.
Layout: rejilla de 2 columnas en pantallas amplias; en estrechas, pestañas
accesibles Formulario/Vista previa (mismo estado, sin pérdida).

**Rationale**:
- La validación no bloqueante por sección permite guardar borradores parciales
  (autoguardado) sin impedir el progreso, cumpliendo FR-015 sin frustrar.
- Las pestañas en móvil reutilizan los mismos componentes (sin duplicar lógica)
  y cumplen el edge case de pantallas estrechas del spec.

**Alternatives considered**:
- Validación bloqueante global al guardar: impide el autoguardado de
  borradores parciales (rompe FR-012). Rechazado.
- Solo apilado con scroll largo en móvil: el preview quedaría enterrado tras
  el formulario; las pestañas lo mantienen a un toque. Rechazado.
