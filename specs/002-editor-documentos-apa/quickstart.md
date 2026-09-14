# Quickstart Validation Guide: Editor de Documentos APA

**Feature**: 002-editor-documentos-apa
**Date**: 2026-09-10

## Prerequisites

- Node.js 18+ instalado
- pnpm instalado
- Navegador moderno (Chrome, Firefox, Safari o Edge)

## Setup

```bash
cd study-book
pnpm install
pnpm dev
```

Abrir `http://localhost:5173` en el navegador. Iniciar sesión y crear una
carrera con al menos un curso (ver quickstart de 001) si no existen.

Detalles de contratos y modelo: ver `contracts/ui-contracts.md` y
`data-model.md` (no se duplican aquí).

## Validation Scenarios

### V1: Crear desde plantilla APA (cubre FR-001, FR-002, SC-001)

1. Abrir un curso y crear un documento ("Nuevo documento", título "Ensayo 1").
2. **Expected**: El documento se crea en menos de 1 minuto con portada,
   secciones base (Resumen, Introducción, Desarrollo, Conclusiones,
   Referencias) y formato APA aplicado, listo para editar.

### V2: Editar con vista previa (cubre FR-003 a FR-007, FR-014, SC-002)

1. Abrir el documento; escribir texto y aplicar negrita, cursiva,
   encabezados, listas y una cita simple.
2. **Expected**: La vista previa refleja cada cambio con estilo APA en
   menos de 3 segundos.
3. Insertar una tabla y una figura con título.
4. **Expected**: Aparecen numeradas y formateadas en la vista previa.
5. Navegar solo con teclado por crear → editar → exportar.
6. **Expected**: Todas las acciones principales son alcanzables y tienen
   etiquetas/estados accesibles.

### V3: Varios documentos por curso + autoguardado (cubre FR-008 a FR-010, FR-012, SC-005, SC-006)

1. Crear 3 documentos en el mismo curso; renombrar, duplicar y eliminar uno
   (con confirmación).
2. **Expected**: La lista muestra solo documentos de ese curso con título y
   fecha de modificación; el resto queda intacto; otro curso no muestra
   documentos ajenos.
3. Editar un documento, recargar el navegador y reabrirlo.
4. **Expected**: El contenido recuperado coincide con la última edición
   (autoguardado). Cambiar el estado borrador → en revisión → finalizado.
5. **Expected**: El estado se muestra y persiste.

### V4: Exportar a PDF (cubre FR-011, FR-013, SC-003, SC-004)

1. Con un documento con portada, secciones, una cita y una tabla, exportar a PDF.
2. **Expected**: Se descarga un PDF válido cuyo formato coincide con la
   vista previa, sin contenido truncado.
3. Simular/provocar un fallo de exportación (p. ej., bloquear el diálogo de
   impresión).
4. **Expected**: Mensaje claro, contenido intacto y opción de reintentar.
