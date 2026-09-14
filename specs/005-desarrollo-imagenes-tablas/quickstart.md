# Quickstart: Desarrollo con Imágenes y Tablas en Editor APA

**Feature**: 005-desarrollo-imagenes-tablas
**Date**: 2026-09-14

Guía de validación manual end-to-end. El modelo y las interfaces están documentados en [data-model.md](./data-model.md) y [contracts/ui-contracts.md](./contracts/ui-contracts.md).

## Prerequisites

- Dependencias instaladas con `pnpm install`.
- Navegador moderno de escritorio con impresión a PDF.
- Al menos un curso y un documento APA existente, o capacidad de crear ambos.
- Una imagen de prueba PNG, JPEG o WebP menor de 5 MB y con lado mayor menor de 2400 px.
- Una imagen inválida o mayor al límite para probar validación.

## Validation commands

```bash
pnpm lint
pnpm typecheck
pnpm build
pnpm dev
```

Los tres primeros comandos deben finalizar sin errores. `pnpm dev` se usa para ejecutar los escenarios siguientes.

## Scenario 1: Insert and validate an image

1. Abrir un documento APA y situar el cursor dentro de Desarrollo.
2. Insertar la imagen válida y completar un texto alternativo descriptivo.
3. **Esperado**: la imagen aparece en la posición activa, conserva proporción y el estado de guardado pasa a Guardando y luego Guardado.
4. Recargar y reabrir el documento.
5. **Esperado**: la imagen y el texto alternativo siguen presentes sin conexión.
6. Seleccionar un archivo no admitido y uno que supere 5 MB.
7. **Esperado**: cada selección muestra un error claro, no crea un nodo incompleto y no altera el contenido anterior.
8. Insertar una imagen sin alt text y continuar editando.
9. **Esperado**: se muestra aviso accesible de descripción pendiente sin bloquear el borrador.

## Scenario 2: Create and edit a table

1. Situar el cursor en Desarrollo e insertar una tabla de 3 filas por 4 columnas.
2. Completar encabezados y celdas con texto académico.
3. Marcar la primera fila como encabezado.
4. Agregar una fila, eliminar una columna y revisar la tabla activa.
5. **Esperado**: las celdas restantes conservan sus valores, el encabezado se diferencia semánticamente y el texto alrededor permanece intacto.
6. Recargar el documento.
7. **Esperado**: la tabla, sus celdas y su encabezado se recuperan.
8. Crear una tabla vacía y eliminarla.
9. **Esperado**: preview y documento continúan operativos sin eliminar párrafos cercanos.

## Scenario 3: Preview and PDF fidelity

1. Preparar un documento con párrafos, una imagen, una tabla y texto posterior.
2. Revisar la vista previa en escritorio y en pantalla estrecha.
3. **Esperado**: los elementos aparecen en el mismo orden, son legibles y no ocultan contenido; en pantalla estrecha los controles siguen accesibles.
4. Exportar mediante el control existente de PDF.
5. **Esperado**: el PDF contiene el mismo texto, imagen, tabla, encabezados y configuración APA que la vista previa.

## Scenario 4: Existing-document compatibility

1. Abrir un documento anterior que contenga solo texto enriquecido.
2. Editar una frase, guardar y exportar.
3. **Esperado**: el documento conserva su contenido y funciona como antes.
4. Insertar después una imagen y una tabla.
5. **Esperado**: el texto original se conserva y los nuevos elementos se guardan y renderizan.

## Scenario 5: Accessibility and failure recovery

1. Navegar por toolbar, diálogo de imagen, tabla y controles de guardado usando solo teclado.
2. Usar un lector de pantalla para identificar botones, campos, errores, alt text pendiente y estado de guardado.
3. Provocar un error de guardado o exportación y activar Reintentar.
4. **Esperado**: todos los controles tienen nombres comprensibles, los estados se anuncian, el contenido editado permanece disponible y el reintento puede ejecutarse.
