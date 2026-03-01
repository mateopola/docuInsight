# Ecosistema SinergIA Lab: Plan de Cumplimiento UX (V3 Funcional)

Basado en la lectura profunda del documento `Desarrollo_Reto_UX.md`, la actual Versión 2 de DocuInsight ha resuelto la **apariencia (UI), las interacciones asíncronas y el gobierno (Drawers)**.

Sin embargo, para cumplir al 100% con la promesa de Transformación Digital ("El Nuevo Journey de Carlos"), debemos implementar las siguientes **funcionalidades núcleo (Core Engine)**. A continuación, el plan paso a paso para lograrlo:

---

## Fase 1: Ingesta Masiva y Cola de Trabajo (Batch Processing)
*El documento exige procesar un "lote de 100 carpetas" sin fricción.*

*   [x] **Paso 1.1: Habilitar Carga Múltiple.** Modificar el `input type="file"` en `index.html` para incluir el atributo `multiple`.
*   [x] **Paso 1.2: UI de Cola de Documentos.** Diseñar una barra lateral o pestaña inferior que enliste los documentos subidos (ej. "3 de 100 procesados"), permitiendo a Carlos ver el progreso general.
*   [x] **Paso 1.3: Procesamiento en Lote (JS).** Modificar `processCurrentFile` en `app.js` para iterar sobre un array de archivos (Queue), mostrando el escaneo láser por cada documento que va entrando.

## Fase 2: Visor Inmersivo Split-Screen (Full PDF)
*El documento exige "un visor avanzado de PDF con zoom" a la izquierda para evitar fatiga visual.*

*   [x] **Paso 2.1: Integración de Motor PDF.** Incluir la librería `PDF.js` (u objeto `<embed>`) en la estructura del Dashboard (sección `.preview-panel`).
*   [x] **Paso 2.2: Renderizado Dinámico.** Enlazar el archivo seleccionado en el "Drag & Drop" para que se pinte en el visor real, reemplazando el cuadro gris "No hay documento seleccionado".
*   [x] **Paso 2.3: Controles de Lectura.** Añadir botones de Zoom (Lupa +/-) y Paginación (Siguiente/Anterior) flotantes sobre el PDF para ayudar a Carlos a confirmar datos pequeños sin esfuerzo.

## Fase 3: Aprobación Forzada (Gestión por Excepción)
*El documento exige que "Si el motor detecta un NIT borroso, lo marcará para revisión manual".*

*   [x] **Paso 3.1: Bloqueo de Guardado.** Si la función `renderResults` detecta un nivel de confianza bajo (punto naranja, <75%), el botón "Guardar" debe estar en estado `disabled`.
*   [x] **Paso 3.2: Confirmación Interactiva.** Carlos debe hacer clic en la caja de texto (hover del lápiz) y pulsar un pequeño "check (✔️)" o presionar Enter para confirmar que el dato es correcto.
*   [x] **Paso 3.3: Cambio de Estado.** El punto naranja cambia a verde tras la validación humana, desbloqueando el envío al sistema core.

## Fase 4: Exportación e Inyección Estructurada (JSON/XML)
*El documento exige que "Con un clic, los datos estructurados se inyectan en el sistema core".*

*   [x] **Paso 4.1: Estructuración del Payload.** Modificar la función `storeDocument` para que, en lugar de alertar, compile todos los campos extrídos en un objeto JSON puro.
*   [x] **Paso 4.2: Animación de Inyección.** Crear un modal tipo "Uploading to Core" con una barra de progreso que emule la transferencia hacia Azure o los servidores de SinergIA.
*   [x] **Paso 4.3: Feedback de Trazabilidad.** Mostrar un toast final confirmando "Lote #8493 indexado en Base de Datos Principal con éxito", cerrando el ciclo emocional de Carlos (Tranquilidad y Control).

---

### Siguientes Pasos (Next Action)
Si deseas que empiece a programar alguna de estas Fases ahora mismo sobre la V2 actual (ejs: Integrar Visor PDF Real o Múltiple Carga), indícame por cuál empezamos.
