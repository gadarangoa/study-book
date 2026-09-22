# Quickstart: Mejoras de Formato APA y Navegación en el Editor de PDF

**Feature**: 006-mejoras-formato-apa-pdf

**Date**: 2026-09-21

Guía de validación manual end-to-end. El modelo y las interfaces están documentados en [data-model.md](./data-model.md) y [contracts/ui-contracts.md](./contracts/ui-contracts.md). Las decisiones técnicas (incluyendo la limitación de número de página en la tabla de contenido) están en [research.md](./research.md).

## Prerequisites

- Dependencias instaladas con `pnpm install`.
- Navegador moderno de escritorio con impresión a PDF (para revisar el resultado exportado).
- Al menos un curso y un documento APA existente, o capacidad de crear ambos.
- Un lector de PDF o el propio visor del navegador para medir fuente y márgenes (p. ej. herramienta de inspección de propiedades del documento, o simplemente comparar visualmente el tamaño de letra).

## Validation commands

```bash
pnpm lint
pnpm typecheck
pnpm build
pnpm dev
```

Los tres primeros comandos deben finalizar sin errores. `pnpm dev` se usa para ejecutar los escenarios siguientes.

## Scenario 1: Fuente y márgenes APA en el PDF exportado

1. Abrir un documento APA existente y localizar el nuevo control "Formato" junto al selector de tamaño de papel.
2. Verificar que la fuente activa por defecto es "Times New Roman" y que el documento se ve a 12 pt en la vista previa.
3. Cambiar la fuente a "Arial" y observar que la vista previa completa (portada, secciones, listas, tablas, referencias) cambia de tipografía manteniendo el mismo tamaño.
4. Exportar a PDF con cada fuente.
5. **Esperado**: en ambos PDF, el cuerpo del texto se ve a 12 pt (comparar altura de línea/letra con un documento de referencia si es necesario) y los márgenes son de 2.54 cm en los cuatro lados, para tamaño Carta y para A4.
6. Recargar el documento sin haber elegido fuente explícitamente en uno nuevo.
7. **Esperado**: usa Times New Roman 12 pt por defecto, igual que el comportamiento actual.

## Scenario 2: Referencia bibliográfica sin fecha

1. Ir a la pestaña Bibliografía y agregar una referencia con autor y título, dejando el año vacío.
2. **Esperado**: se guarda sin mostrar "El año es obligatorio.", y aparece en la lista como `Autor (s.f.). Título.`
3. Exportar a PDF.
4. **Esperado**: la referencia aparece en la sección Referencias como `(s.f.)` en el lugar del año.
5. Editar la misma referencia e introducir un año con formato inválido (p. ej. "202").
6. **Esperado**: se muestra el error de formato existente y no se guarda hasta corregirlo o volver a dejarlo vacío.
7. Editar una referencia que ya tenía año y borrarlo intencionalmente.
8. **Esperado**: pasa a mostrarse como `(s.f.)` sin error.

## Scenario 3: Tabla de contenido configurable

1. En Desarrollo, agregar al menos dos encabezados de nivel 2 y uno de nivel 3 anidado bajo uno de ellos.
2. Abrir "Formato" y activar "Incluir tabla de contenido" con profundidad 2.
3. **Esperado**: la vista previa muestra una página de tabla de contenido después de la portada, con las secciones fijas (Introducción, Desarrollo, Conclusiones, Referencias, etc.) y los encabezados de nivel 2, pero no los de nivel 3; sin números de página junto a las entradas (comportamiento esperado y documentado, ver research.md).
4. Cambiar la profundidad a 3.
5. **Esperado**: ahora también aparece el encabezado de nivel 3, con mayor sangría.
6. Editar el texto de uno de los encabezados en Desarrollo.
7. **Esperado**: la tabla de contenido de la vista previa refleja el nuevo texto sin ninguna acción manual adicional.
8. Desactivar la tabla de contenido.
9. **Esperado**: el documento vuelve a exportarse exactamente como antes, sin la página adicional.
10. Probar con un documento sin ningún encabezado de nivel 2/3 en Desarrollo y activar la tabla de contenido.
11. **Esperado**: se muestra solo la lista de secciones fijas, sin errores ni niveles vacíos.

## Scenario 4: Listado de figuras y listado de tablas

1. En Desarrollo, insertar dos imágenes con título ("Diagrama de flujo", "Resultados") y una imagen sin título.
2. Insertar una tabla y asignarle un título ("Comparación de resultados") usando el nuevo botón "Título de tabla".
3. Activar "Incluir listado de figuras" y "Incluir listado de tablas" en Formato.
4. **Esperado**: aparece una página "Listado de figuras" con "Figura 1: Diagrama de flujo" y "Figura 2: Resultados" (la imagen sin título no aparece), y una página "Listado de tablas" con "Tabla 1: Comparación de resultados".
5. Verificar que la leyenda visible junto a cada imagen/tabla titulada muestra el mismo número ("Figura 1", "Figura 2", "Tabla 1").
6. Desactivar solo el listado de tablas.
7. **Esperado**: el listado de figuras sigue apareciendo, el de tablas desaparece, el resto del documento no cambia.
8. Probar en un documento sin ninguna imagen ni tabla titulada, con ambos listados activados.
9. **Esperado**: ninguna de las dos secciones aparece en el PDF (no se muestran páginas vacías).

## Scenario 5: Compatibilidad con documentos existentes

1. Abrir un documento APA creado antes de esta mejora (o uno de un curso previo sin los campos nuevos).
2. **Esperado**: carga sin errores, con fuente Times New Roman 12 pt, tabla de contenido y ambos listados desactivados, exactamente igual que antes de la mejora.
3. Exportar ese documento sin cambiar ninguna opción nueva.
4. **Esperado**: el PDF resultante es visualmente idéntico al que se generaba antes de esta mejora.

## Scenario 6: Accesibilidad

1. Navegar el popover/diálogo "Formato" (selector de fuente, interruptores de TOC y listados, selector de profundidad) usando solo teclado.
2. Usar un lector de pantalla para confirmar que cada control tiene un nombre accesible, que los interruptores anuncian su estado (activado/desactivado) y que el texto de ayuda sobre "(s.f.)" y sobre la ausencia de número de página es perceptible.
3. Repetir la navegación por teclado para el nuevo botón "Título de tabla" y su diálogo.
4. **Esperado**: todos los controles nuevos son operables y comprensibles sin mouse y sin depender únicamente del color.
