# Experiencia de Usuario Actual: DocuInsight (Antes del Rediseño)

Este documento detalla la experiencia de usuario (UX) actual de la plataforma DocuInsight, utilizando capturas de pantalla tomadas directamente de la versión actual del sistema (`http://localhost:8000`). Este análisis sirve como línea base ("Antes") para identificar oportunidades de mejora en interfaces, flujos y arquitectura de información de cara a la propuesta de proyecto de grado (SinergIA Lab).

---

## 1. El Tablero de Control (Dashboard)

El primer punto de contacto del usuario al ingresar a la plataforma es el Tablero de Control.

![Tablero de Control Actua - Métricas Generales](C:\Users\mateo\.gemini\antigravity\brain\75f6b4b9-6bd5-446f-8eeb-d0e8833fa097\tablero_de_control_1772241731008.png)

**Análisis de la Experiencia:**
*   **Lo positivo:** Ofrece una visión rápida de indicadores clave (KPIs) como el volumen de documentos procesados, tiempo promedio (1.2s) y un gráfico de dona limpio mostrando la distribución documental. Cumple su función informativa.
*   **Oportunidades de Mejora (Pain points visuales):** 
    *   La paleta de colores actual (azules genéricos) carece de identidad de marca (SinergIA Lab). 
    *   Los componentes se sienten muy "planos" (falta de jerarquía visual y sombras suaves que den profundidad moderna).
    *   La disposición de las tarjetas podría optimizarse para pantallas más amplias.

---

## 2. Flujo de Carga de Documentos (Document Intake)

Esta es la vista principal de operación diaria, donde el Gestor Documental ingresa al sistema los archivos físicos digitalizados (PDFs/Imágenes).

![Interfaz de Carga de Documentos](C:\Users\mateo\.gemini\antigravity\brain\75f6b4b9-6bd5-446f-8eeb-d0e8833fa097\cargar_documento_1772241739058.png)

**Análisis de la Experiencia:**
*   **Lo positivo:** Tiene una zona de "Arrastrar y Soltar" bien definida que centraliza la acción principal. Es un flujo de un solo paso que reduce la carga cognitiva.
*   **Oportunidades de Mejora (Pain points visuales):**
    *   La caja de carga transversal ocupa mucho espacio vertical pero se siente vacía y poco inmersiva.
    *   Falta de animaciones (micro-interacciones) al arrastrar un archivo o un feedback visual más evidente cuando un archivo se carga exitosamente antes de pasar al procesamiento.

### Simulación del Procesamiento Cognitivo (OCR + NER)
Durante el tiempo de espera (1.2 segundos simulados), el usuario ve esta barra de progreso:

![Simulador de Extracción y OCR](C:\Users\mateo\.gemini\antigravity\brain\75f6b4b9-6bd5-446f-8eeb-d0e8833fa097\ocr_progress_bar_1772241852077.png)

**Análisis de la Experiencia:**
*   Da un buen feedback comunicando "Inteligencia Artificial" trabajando paso a paso (Ingesta, Clasificación, Extracción). 

---

## 3. Resultados Actuales y Validación (Human-in-the-loop)

Una vez que el motor cognitivo (simulado) procesa el documento, el usuario navega a la sección de Resultados para revisar las extracciones NER.

![Tabla de Resultados Actuales](C:\Users\mateo\.gemini\antigravity\brain\75f6b4b9-6bd5-446f-8eeb-d0e8833fa097\resultados_actuales_1772241746761.png)

**Análisis de la Experiencia:**
*   **Lo positivo:** La presentación en formato tabla es correcta para entornos corporativos. Las etiquetas (badges) de color verde para el status "Procesado" y los porcentajes de confianza comunican certeza.
*   **Oportunidades de Mejora (Pain points visuales):**
    *   La tabla es bastante básica. Las alertas de confianza no tienen suficiente contraste si hubieran documentos con baja confianza donde se requeriría color naranja/rojo.

### Vista de Validación ("Human-in-the-loop")
Al hacer clic en "Ver / Validar", el auditor entra a esta vista crítica de lado a lado (Documento original vs Entidades estructuradas).

![Vista de Validación y Resultados de Extracción](C:\Users\mateo\.gemini\antigravity\brain\75f6b4b9-6bd5-446f-8eeb-d0e8833fa097\results_page_with_data_1772241858022.png)

**Análisis de la Experiencia:**
*   **Lo Positivo:** Es el core del valor. El auditor ya no digita. Solo mira a la izquierda (PDF) y a la derecha (Campos como "Razón Social"), valida y "Almacena en Gestor Documental" con un solo clic.
*   **Oportunidades de Mejora:** Visualmente, los campos de validación lucen como un formulario básico web (inputs grises y cuadrados). Debería lucir más limpio y permitir edición rápida "in-line" si el motor OCR se equivocó en un caracter.

---

## 4. Módulo de Administración y Configuración No-Code

El corazón del valor de la herramienta para escalar a diferentes tipos documentales sin requerir a un desarrollador.

**Vista General de Tipos Documentales:**
![Listado de Tipos Documentales](C:\Users\mateo\.gemini\antigravity\brain\75f6b4b9-6bd5-446f-8eeb-d0e8833fa097\administracion_1772241754966.png)

**Análisis de la Experiencia:**
*   **Lo positivo:** Organización clara estilo acordeón/tarjetas que agrupa "Subseries" (ej. RUT bajo Identificación Tributaria). Los iconos de engranaje para configuración son estándar y reconocibles.
*   **Oportunidades de Mejora:** Visualmente, se siente como una interfaz de administración muy técnica ("backend-ish"). Podría ser más amigable y "wizard-like" para usuarios de negocio (gestores documentales).

**Modal de Configuración de Campos y Prompt (No-Code):**
![Modal de Configuración](C:\Users\mateo\.gemini\antigravity\brain\75f6b4b9-6bd5-446f-8eeb-d0e8833fa097\configuracion_no_code_1772241765625.png)

**Análisis de la Experiencia:**
*   **Lo positivo:** Aquí radica el mayor poder de la plataforma. Permite a un usuario no técnico definir checkboxes de campos (NIT, Razón Social) y, crucialmente, editar el "Prompt del Sistema" que guía al modelo.
*   **Oportunidades de Mejora:** El modal corta el contexto de forma abrupta y el área de texto del "Prompt" luce como un HTML antiguo. Faltan interacciones suaves (Ej. switches tipo iOS).

**Modal de Nuevo Tipo Documental:**
![Creación de Categoría](C:\Users\mateo\.gemini\antigravity\brain\75f6b4b9-6bd5-446f-8eeb-d0e8833fa097\admin_new_doctype_modal_1772241865963.png)

**Modal de Entrenamiento de Nuevo Modelo (Subserie):**
![Entrenar Nuevo Tipo Documental](C:\Users\mateo\.gemini\antigravity\brain\75f6b4b9-6bd5-446f-8eeb-d0e8833fa097\admin_train_model_modal_detail_1772241875150.png)

---

## Conclusión

El flujo funcional ("Journey") de la aplicación actual es correcto y resuelve directamente el problema de la "Caja Negra" documental (automatizar la clasificación y extracción). Sin embargo, a nivel de **Interfaz de Usuario (UI)**, la aplicación luce como un "Producto Mínimo Viable (MVP)" técnico. 

Para que SinergIA Lab sea percibido como una solución corporativa "Transformacional y Cognitiva", es imperativo:
1.  **Elevar la estética:** Incorporar tipografía moderna, paleta de colores armoniosa y espaciados adecuados.
2.  **Añadir dinamismo:** Usar efectos de *Hover*, modales superpuestos con desenfoque (glassmorphism) e interacciones suaves en la carga.
3.  **Reforzar ayudas visuales:** Utilizar jerarquía de colores para los niveles de confianza del modelo de IA (verde/ámbar/rojo) para hacer el proceso de validación aún más rápido cognitivamente.
