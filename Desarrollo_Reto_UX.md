# Desarrollo del Reto UX/UI - SinergIA Lab (DocuInsight)

Basado en la misión establecida para el proyecto de grado **SinergIA Lab** y su plataforma **DocuInsight**, a continuación se desarrolla el taller de Experiencia de Usuario (UX) solicitado, integrando los conceptos de Transformación Digital y diseño centrado en el usuario.

---

## 1. Arquetipo de Usuario (Cliente/Usuario Principal)

**Nombre del Arquetipo:** Carlos, el "Gestor Documental y Auditor de Calidad"  
**Perfil:** Profesional de entre 30 y 45 años, encargado del archivo, cumplimiento y validación de datos en una empresa del sector financiero/legal.  
**Comportamientos y Necesidades:**
- **Metas:** Asegurar que toda la información documental ingrese a los sistemas core de la empresa sin errores y a tiempo. Mantener el cumplimiento legal y facilitar las auditorías.
- **Frustraciones:** Pasa el 60% de su tiempo buscando archivos en cajas y carpetas físicas. Sufre fátiga visual y estrés por la presión de no cometer errores de digitación en datos críticos (NIT, montos, fechas).
- **Relación con la tecnología:** Usa sistemas heredados (legacy) y hojas de cálculo masivas. Está abierto a nuevas herramientas siempre y cuando sean intuitivas y le ahorren tiempo sin agregar pasos extra.

---

## 2. Situación Problema

La empresa maneja bóvedas masivas de documentos físicos (RUT, Certificados de Cámara de Comercio, Cédulas, Contratos) que representan una auténtica "Caja Negra" Documental. Al carecer de un inventario detallado y trazabilidad digital estructurada, la organización enfrenta:
1. **Ineficiencia Operativa extrema:** La revisión y extracción de datos es 100% manual, convirtiéndose en un cuello de botella.
2. **Alto Riesgo Legal y de Cumplimiento:** La información no está indexada de manera confiable, lo que dificulta responder a tiempo ante auditorías, requerimientos legales o procesos judiciales.
3. **Altas Tasas de Error Humano:** La digitación manual de miles de campos diarios provoca inconsistencias críticas, generando datos contaminados u obsoletos que afectan las decisiones de negocio.

---

## 3. Experiencia Actual (Antes de DocuInsight) - Customer Journey Map

**Escenario:** Carlos debe procesar y extraer datos de un lote de 100 carpetas de nuevos clientes (que incluyen RUT, Cámara de Comercio y Cédulas).

* **Fase 1: ANTES (Recepción y Preparación)**
  - *Acción:* Recibe torres de carpetas físicas o correos con múltiples PDFs desorganizados.
  - *Emoción:* Estrés y abrumo.
  - *Punto de dolor:* Volumen inmanejable de documentos sin categorizar.

* **Fase 2: DURANTE (Clasificación y Extracción Manual)**
  - *Acción:* Carlos abre un Excel. Toma el primer documento, lee página por página para saber qué es (¿Es un RUT?). Busca los campos (NIT, Razón Social) y digita la información lentamente, cambiando la vista entre el papel/PDF y la pantalla.
  - *Emoción:* Fática, aburrimiento, propensión al error.
  - *Punto de dolor:* Tareas monótonas que consumen horas; la digitación manual (copiar/pegar) falla con frecuencia. Múltiples re-procesos.

* **Fase 3: DESPUÉS (Archivo y Uso)**
  - *Acción:* Guarda el PDF en una carpeta genérica de Windows o archiva la hoja física en una caja. El Excel se sube al sistema central con retrasos.
  - *Emoción:* Incertidumbre (¿Ingresé bien todos los NIT?).
  - *Punto de dolor:* Información no conectada en tiempo real. Nadie puede auditar fácilmente si el dato del sistema coincide con el documento original rápido.

*(Herramienta sugerida para visualización: Storyboard de un empleado rodeado de papel, transicionando a una pantalla de Excel interminable).*

---

## 4. Nueva Experiencia de Usuario (Con SinergIA Lab / DocuInsight) - Journey Map

**Escenario:** Carlos debe procesar el mismo lote de documentos utilizando la plataforma inteligente DocuInsight.

* **Fase 1: ANTES (Carga)**
  - *Acción:* Carlos arrastra y suelta (Drag & Drop) el lote de PDFs o imágenes directamente en la interfaz web de _Document Intake_ de DocuInsight.
  - *Emoción:* Confianza y tranquilidad.
  - *Punto de mejora:* Interfaz limpia, minimalista y empresarial. Feedback inmediato visual de carga exitosa.

* **Fase 2: DURANTE (Motor Cognitivo y Extracción - Segundos)**
  - *Acción:* El sistema de Visión Artificial (OCR) y Clasificador Documental procesan todo de fondo. Carlos visualiza en pantalla un dashboard de resultados donde el sistema clasifica automáticamente (Ej: "Certificado Cámara de Comercio detectado") y extrae las entidades clave (NER). 
  - *Emoción:* Asombro, control empoderado. 
  - *Punto de mejora:* Carlos ya no digita. Solo revisa la interfaz donde se muestra a la izquierda el documento original y a la derecha los datos estructurados con "niveles de confianza simulados". Solo aprueba o edita una mínima parte.

* **Fase 3: DESPUÉS (Integración y Consulta)**
  - *Acción:* Con un clic, los datos estructurados (en formato JSON/XML) se inyectan en el sistema core de la empresa. Todo queda indexado. 
  - *Emoción:* Satisfacción por el deber cumplido, siente que aporta valor estratégico (análisis) y no trabajo operativo pesado.
  - *Punto de mejora:* Reducción de tiempos de ciclo en un 50% y errores casi nulos (precisión 99%). Auditoría en tiempo real garantizada.

---

## 5. Descripción en Detalle de las Dimensiones (Nueva UX)

**Dimensión Cognitiva (Carga mental):**
La carga cognitiva pasa de "Alta" (leer, identificar, memorizar y tipear) a "Baja/Supervisión". El usuario ya no es un "digitador", sino un validador de calidad. El componente de "Result Viewer" en pantalla dividida (Documento vs. Datos Extraídos) respeta la Ley de proximidad en UX, ayudando a que el ojo haga validaciones en fracciones de segundo.

**Dimensión Temporal:**
Se cumple la promesa de la Transformación Digital en la eficiencia operativa. Procesos que tomaban días (clasificación manual y lectura de contratos/términos) ahora ocurren en segundos gracias a los simuladores OCR + NER automatizados. 

**Dimensión Emocional:**
La ansiedad generada por la responsabilidad legal y financiera de la auditoría humana se mitiga al visualizar "Niveles de Confianza". Si el motor detecta un NIT borroso, lo marcará para revisión manual (Gestión por Excepción), dándole al usuario la tranquilidad de que la máquina es un asistente confiable y no una "cruz" pesada.

**Dimensión Operativa / Gubernanza:**
El Gestor Documental ahora tiene una herramienta de Administración (sin código) que le da autonomía para crear nuevos "Tipos Documentales" y "Prompts" sin depender de TI, fomentando un profundo sentido de pertenencia y adaptabilidad (Escalabilidad agnóstica).

---

## 6. Integración del Concepto del Artículo Científico (Transformación Digital)

De acuerdo con las premisas de la Transformación Digital modernas (y en alineación con el artículo académico sugerido), DocuInsight representa un salto de "Digitización" (pasar de papel a PDF) hacia la verdadera **Transformación Digital y Cognitiva**. 
El artículo y los estándares destacan que la tecnología debe transformar los esquemas operativos y cómo se entrega valor. Aquí, la IA estructurada no solo cambia una herramienta, sino **el proceso completo**: el documento deja de ser un archivo inerte para convertirse en **"datos vivos"** en el instante en que cruza la frontera de validación de DocuInsight, impactando directamente en la reducción de costos y la mitigación de riesgo legal corporativo.

---

## 7. Justificación de Diseño Visual e Interacción (Prototipo V3 Funcional)

Para materializar esta transformación digital en una interfaz que Carlos realmente quiera usar, se aplicaron los siguientes principios de Experiencia de Usuario en el diseño final construido en código:

1.  **Identidad Corporativa Estratégica:** Se abandonó la interfaz monocromática blanca/gris para adoptar una paleta profunda alineada con la marca **SinergIA Lab**. Se implementó una **barra lateral oscura (Azul Corporativo)** que ayuda a encapsular la navegación y reducir la fatiga visual periférica, reservando el color blanco brillante (Canvas) solo para el espacio de trabajo activo donde se necesita máxima concentración. Los botones de acción principal y los estados activos utilizan el **Naranja de acento**, guiando el ojo de Carlos orgánicamente hacia el siguiente paso lógico.
2.  **Validación Inmersiva (Split-Screen):** Basándonos en la Ley de Fitts y la Ley de Proximidad, dividimos la pantalla 50/50. El documento original a la izquierda y la data extraída a la derecha. Esto suprime por completo el "alt-tabbing" y el uso de múltiples monitores, reduciendo el desgaste ocular. Además, se introdujeron controles de Zoom inmersivos sobre el propio PDF.
3.  **Human-in-the-Loop (Gestión Visual del Error):** Carlos sufre ansiedad por no equivocarse. La interfaz mitiga esto aplicando la heurística de "Visibilidad del estado del sistema". Los campos con alta certeza de la IA son transparentes, pero aquellos dudosos se marcan con un claro **punto naranja**. El sistema bloquea cognitivamente y funcionalmente la inyección de datos (botón deshabilitado) hasta que el humano estampa su sello de aprobación (`✔️`), transformando la incertidumbre en un "Check verde" de victoria.
4.  **Feedback en Secuencia de Lotes (Batch Processing):** Al subir 100 carpetas, el sistema no se congela (lo que generaría incertidumbre). Al contrario, muestra una **"Cola de Trabajo"** animada con escáner láser que va procesando de uno en uno, aplicando la heurística de "Mantener al usuario informado", generando un efecto de tranquilidad al dejar que la máquina trabaje.
