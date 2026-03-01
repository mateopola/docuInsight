Rol: Experto en UX/UI y en la app Docuinsight

Introducción

La Transformación Digital es un proceso holístico que implica la incorporación de tecnología digital en todas las unidades de negocio de una empresa lo que conduce a cambios profundos en su esquema operativo y la forma como entrega valor a sus clientes. A continuación, se describen los aspectos de mayor relevancia de la Transformación Digital.

El gobierno de la Transformación Digital es fundamental para garantizar que los procesos de digitalización en una organización se realicen de manera efectiva, alineada con los objetivos estratégicos y que se maximice el valor de las inversiones tecnológicas. Este gobierno implica la creación de estructuras, procesos, y políticas que supervisen y guíen la adopción y el uso de tecnologías digitales en toda la organización.


A partir del material sobre experiencia de usuario, revise  la nueva experiencia de usuario de su propuesta de proyecto de grado y con esto, desarrolle el presente taller cuyo propósito es evaluar la correcta aplicación de los conceptos relacionados con experiencia de usuario, aplicados a la propuesta de proyecto de grado, para esto, siga las instrucciones:

Describa claramente quien es su cliente o usuario, utilice un arquetipo para su definición. (Esto viene de la Fase de Empatía, previamente desarrollada).

Describa la situación problema de su cliente o usuario (esto viene de la Fase de Definir, previamente desarrollada).

Identifique las diferentes dimensiones de su usuario, antes, durante y después, en su actual realidad, antes de utilizar la solución propuesta por usted. Diseñe un diagrama (puede ser un Journey Map) de la nueva experiencia problema actual o bien haga el storyboard (puede utilizar herramientas como StoryboardThat o Pixton, o hacerlo a mano si prefiere).

Identifique las diferentes dimensiones de su usuario, antes, durante y después, de utilizar su solución (propuesta de proyecto de grado). Diseñe un diagrama (puede ser un Journey Map) de la nueva experiencia resultante o bien haga el storyboard (puede utilizar herramientas como StoryboardThat o Pixton, o hacerlo a mano si prefiere). Asegúrese que los diagramas del numeral 3 y 4 permitan ser comparados para facilitar el entendimiento de lo que era antes y lo que será ahora con su solución.

Describa en detalle cada una de las dimensiones identificadas en la nueva experiencia de usuario.

consulta este articulo coentífico : https://www.unwe.bg/doi/eajournal/2022.3/EA.2022.3.01.pdf


MI caso 
📂 Base de Conocimiento: SinergIA Lab
1. Identidad y Propósito

Proyecto: SinergIA Lab.

Misión: Optimización de la gestión documental física mediante Clasificación y Extracción de Entidades (NER).

Objetivo Core: Transformar texto "muerto" en papel en datos vivos, estructurados y consultables sin intervención manual.

---

### Solución al Taller UX/UI (Preguntas 1 a 6)

#### 1. Arquetipo de Usuario (Cliente/Usuario Principal)
**Nombre del Arquetipo:** Carlos, el "Gestor Documental y Auditor de Calidad"  
**Perfil:** Profesional de entre 30 y 45 años, encargado del archivo, cumplimiento y validación de datos en una empresa del sector financiero/legal.  
**Comportamientos y Necesidades:**
- **Metas:** Asegurar que toda la información documental ingrese a los sistemas core de la empresa sin errores y a tiempo. Mantener el cumplimiento legal y facilitar las auditorías.
- **Frustraciones:** Pasa el 60% de su tiempo buscando archivos en cajas y carpetas físicas. Sufre fátiga visual y estrés por la presión de no cometer errores de digitación en datos críticos (NIT, montos, fechas).
- **Relación con la tecnología:** Usa sistemas heredados (legacy) y hojas de cálculo masivas. Está abierto a nuevas herramientas siempre y cuando sean intuitivas y le ahorren tiempo sin agregar pasos extra.

#### 2. Situación Problema
La empresa maneja bóvedas masivas de documentos físicos (RUT, Certificados de Cámara de Comercio, Cédulas, Contratos) que representan una auténtica "Caja Negra" Documental. Al carecer de un inventario detallado y trazabilidad digital estructurada, la organización enfrenta:
1. **Ineficiencia Operativa extrema:** La revisión y extracción de datos es 100% manual, convirtiéndose en un cuello de botella.
2. **Alto Riesgo Legal y de Cumplimiento:** La información no está indexada de manera confiable, lo que dificulta responder a tiempo.
3. **Altas Tasas de Error Humano:** La digitación manual de miles de campos diarios provoca inconsistencias críticas.

#### 3. Experiencia Actual (Antes de DocuInsight) - Customer Journey Map

**Escenario:** Carlos debe procesar y extraer datos de un lote de 100 carpetas de nuevos clientes.

* **Fase 1: ANTES (Recepción y Preparación)**
  - *Acción:* Recibe torres de carpetas físicas o correos con múltiples PDFs desorganizados.
  - *Emoción:* Estrés y abrumo.
  - *Punto de dolor:* Volumen inmanejable de documentos sin categorizar.

* **Fase 2: DURANTE (Clasificación y Extracción Manual)**
  - *Acción:* Carlos abre un Excel. Toma el primer documento, lee página por página y digita la información lentamente.
  - *Emoción:* Fática, aburrimiento, propensión al error.
  - *Punto de dolor:* Tareas monótonas que consumen horas; la digitación manual falla con frecuencia. Múltiples re-procesos.

* **Fase 3: DESPUÉS (Archivo y Uso)**
  - *Acción:* Guarda el PDF en una carpeta genérica de windows.
  - *Emoción:* Incertidumbre (¿Ingresé bien todos los NIT?).
  - *Punto de dolor:* Información no conectada en tiempo real. Nadie puede auditar fácilmente.

#### 4. Nueva Experiencia de Usuario (Con SinergIA Lab / DocuInsight V3) - Journey Map

**Escenario:** Carlos debe procesar el mismo lote utilizando la plataforma inteligente DocuInsight.

* **Fase 1: ANTES (Carga Masiva - Batch Processing)**
  - *Acción:* Carlos arrastra y suelta (Drag & Drop) el lote de PDFs en la interfaz. El sistema genera una "Cola de Trabajo" visible.
  - *Emoción:* Tranquilidad porque el sistema le informa el estado (Ej: "Procesando documento 3 de 100").
  - *Beneficio:* Interfaz limpia, minimalista y feedback inmediato visual.

* **Fase 2: DURANTE (Motor Cognitivo y Visor Inmersivo)**
  - *Acción:* El sistema procesa todo de fondo. Carlos visualiza una pantalla dividida (Split-Screen): el PDF con zoom a la izquierda y la data estructurada a la derecha. 
  - *Emoción:* Control empoderado y cero fatiga visual. 
  - *Beneficio:* Ya no hace "alt-tab". Solo supervisa y valida los datos marcados con baja confianza (punto naranja) confirmándolos con un check (`✔️`).

* **Fase 3: DESPUÉS (Integración Estructurada y N8N)**
  - *Acción:* Con un clic, los datos validados se exportan en formato JSON y se inyectan a un webhook de automatización (n8n/Core).
  - *Emoción:* Satisfacción por el deber estratégico cumplido.
  - *Beneficio:* Reducción de tiempos en un 50%, precisión 99% y auditoría garantizada.

#### 5. Dimensiones de la Nueva UX

**Dimensión Cognitiva (Carga mental):**
Pasa de "Alta" (leer, identificar y tipear) a "Baja/Supervisión". La pantalla dividida (Ley de Proximidad visual) minimiza los movimientos oculares abruptos.

**Dimensión Temporal:**
Lo que tomaba días ahora ocurre en segundos. El software asume las tareas monótonas, permitiendo a Carlos validar en lote rápidamente.

**Dimensión Emocional:**
La ansiedad por errores se mitiga mediante la *Heurística de Visibilidad del Sistema* (Semáforo de confianza: Validaciones pendientes bloquean el botón de guardar hasta ser confirmadas).

**Dimensión Operativa / Gubernanza:**
Al depender de un Webhook estructurado con herramientas tipo N8N (Inteligencia Operativa), DocsInsight entrega "datos vivos" al instante, permitiendo ejecutar flujos de envío de emails, inserciones SQL o registro en CRMs en piloto automático.

#### 6. Justificación frente al Artículo Científico de Transformación Digital
El artículo resalta que la tecnología debe transformar *esquemas operativos*. DocuInsight V3 no solo digitaliza el papel (esto es digitización básica); sino que ejecuta verdadera Transformación Cognitiva: Toma el PDF estructurado, orquesta el control de calidad Humano (HITL) y distribuye los datos estructurados JSON de forma desatendida, transformando radicalmente la unidad de negocio documental.