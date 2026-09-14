# Quickstart: Editor APA por Formulario con Vista Previa PDF

**Feature**: 003-apa-form-pdf-editor
**Date**: 2026-09-10

Guía de validación manual end-to-end (sin framework de tests en el repo).
Detalles de datos en [data-model.md](./data-model.md) y de componentes en
[contracts/ui-contracts.md](./contracts/ui-contracts.md).

## Prerequisites

- Dependencias instaladas (`pnpm install`) y `pnpm dev` corriendo.
- Al menos un curso existente (o crear uno desde el módulo de cursos).
- Navegador moderno de escritorio con impresión a PDF (Chrome/Edge/Firefox/Safari).

## Validate

### 1. Crear un entregable desde el curso (US-1, SC-001)

1. Abrir un curso y crear un documento nuevo.
2. **Esperado**: el documento nace asociado a ese curso con la plantilla
   seccionada (portada + 4 secciones + bibliografía) y la vista previa muestra
   el formato APA. Tiempo: menos de 1 minuto, sin configurar formato.
3. Intentar crear un documento sin curso → **esperado**: se pide
   seleccionar/crear un curso destino, no se crea documento huérfano.

### 2. Rellenar el formulario con preview en vivo (US-2, SC-002)

1. Completar portada (título + autor obligatorios), introducción, desarrollo
   (negrita/cursiva/lista), conclusiones.
2. **Esperado**: cada cambio se refleja en la vista previa de la derecha en
   menos de 3 segundos, con portada y secciones en orden APA.
3. Recargar el navegador a mitad de edición → **esperado**: el contenido se
   recupera (autoguardado, SC-006).
4. Navegar todo el formulario y los controles solo con teclado + lector de
   pantalla → **esperado**: todas las acciones (rellenar, guardar, exportar)
   son operables y anunciadas.

### 3. Bibliografía dinámica (US-4)

1. Agregar 3 entradas, editar una, reordenar con subir/bajar, eliminar una
   (confirmar).
2. **Esperado**: la sección de referencias del preview refleja la lista actual
   con formato "Autor (año). Título. Fuente."; una entrada con año inválido
   muestra qué corregir sin perder datos ni romper el preview.

### 4. Varios documentos por curso (US-3, SC-005)

1. Crear 3 documentos en el curso A y 1 en el curso B; renombrar, duplicar y
   eliminar (con confirmación) uno de A.
2. **Esperado**: cada curso lista solo sus documentos (título, estado, fecha);
   las operaciones no afectan a otros documentos ni cursos. Cambiar el estado
   (borrador → en revisión → finalizado) se conserva y muestra.

### 5. Exportar a PDF (US-5, SC-004)

1. Con un documento completo (portada + secciones + ≥1 referencia), pulsar
   "Exportar PDF" y guardar con el diálogo de impresión.
2. **Esperado**: PDF válido descargable, idéntico a la vista previa (orden,
   formato, referencias, tildes/ñ). Probar también con un documento vacío →
   PDF válido con la estructura base.
3. Controles del preview: cambiar zoom (solo afecta pantalla), navegar
   anterior/siguiente página.
4. Reducir la ventana a ancho móvil → **esperado**: pestañas
   Formulario/Vista previa, sin pérdida de contenido.

## Gates

```bash
pnpm lint        # cero errores
pnpm typecheck   # cero errores
```

`pnpm build` opcional como verificación final antes de dar por válido el feature.
