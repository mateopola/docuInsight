Documento de Implementación
DocuInsight – Plataforma de Comprensión Documental
1. Propósito

DocuInsight es una aplicación diseñada para interpretar documentos empresariales, identificar su naturaleza documental y estructurar automáticamente la información relevante mediante procesamiento cognitivo configurable.

La solución permite convertir documentos no estructurados en datos organizados listos para operación, análisis o gestión documental.

2. Alcance Funcional

La aplicación permite:

✔ Cargar documentos desde interfaz web.
✔ Clasificarlos automáticamente según tipología documental.
✔ Extraer entidades nombradas según configuración administrativa.
✔ Administrar tipos documentales sin desarrollo.
✔ Definir prompts específicos por tipo documental.
✔ Simular procesamiento cognitivo sin dependencia de servicios externos.
✔ Visualizar resultados estructurados en tiempo real.

3. Tipologías Documentales Configuradas
3.1 Identificación Tributaria

Subserie: Registro Único Tributario – RUT

Campos definidos:

NIT

Razón Social

Nombre Comercial

Estado

Actividad Económica

Dirección

Municipio

Departamento

Responsabilidades fiscales

Fecha de generación

Representante asociado

3.2 Existencia y Representación Legal

Subserie: Certificado Cámara de Comercio

Campos definidos:

Razón social

Número de matrícula

Fecha de constitución

Estado de la sociedad

Representante legal

Objeto social (resumen inteligente)

Dirección comercial

Ciudad

Actividad económica principal

3.3 Identificación Personal

Subserie: Cédula de Ciudadanía

Campos definidos:

Número de documento

Nombres

Apellidos

Fecha de nacimiento

Lugar de nacimiento

Fecha de expedición

Lugar de expedición

Sexo

4. Módulo de Administración (Clave del Mensaje de Valor)

DocuInsight incluye un Administrador de Inteligencia Documental que permite construir la lógica sin tocar código.

Permite:
Crear Tipos Documentales
+ Nuevo Tipo Documental

Definir Subseries
Tipo: Identificación Tributaria
 └── Subserie: RUT

Definir Campos a Extraer

Checklist configurable:

[✔] NIT
[✔] Razón Social
[✔] Actividad Económica
[✔] Responsabilidades

Versionar configuraciones

Cada cambio genera versión documental.

5. Editor de Prompt por Documento

DocuInsight permite definir el comportamiento semántico según el documento detectado.

Ejemplo configuración RUT:

Analiza un Registro Único Tributario colombiano.
Identifica información fiscal estructurada.
Normaliza actividades económicas.
Devuelve los datos en formato JSON validado.


Ejemplo Cámara de Comercio:

Analiza certificado de existencia y representación legal.
Resume objeto social en máximo 3 líneas.
Identifica representante legal vigente.
Extrae información registral clave.


Ejemplo Cédula:

Identifica datos biográficos del titular.
Normaliza nombres en formato mayúscula sostenida.
Detecta lugar y fecha de expedición.


⚠️ El prompt es editable desde UI.
⚠️ No requiere redeploy.
⚠️ No requiere entrenamiento.

6. Arquitectura E2E (Real - Integración Serverless)

La aplicación ha migrado de una arquitectura simulada a una integración real end-to-end orientada a microservicios:

Flujo Real:
1. Carga Documento (UI FrontEnd)
   ↓
2. Despacho Asíncrono a Webhook
   ↓
3. n8n Orquestador (Genera ID, Extrae texto con OCR/Gemini)
   ↓
4. Persistencia en Base de Datos (Supabase PostgreSQL)
   ↓
5. Notificación Tiempo Real WebSocket (Suscripción FrontEnd)
   ↓
6. Visualización de Resultados y Dashboard de Métricas con datos en vivo.

7. Diseño Técnico y Stack

La solución consume servicios externos para procesamiento y almacenamiento continuo:

✔ **Frontend:** HTML5, CSS3, Vanilla JS (PDF.js, Chart.js).
✔ **Backend/Base de Datos:** Supabase (PostgreSQL, Realtime, Auth).
✔ **Orquestación/Cognitivo:** n8n (Workflows asíncronos) integrando la API de Gemini para la extracción y OCR inteligente.

Servicios de Consulta:
El frontend ejecuta consultas SQL directas vía el SDK de Supabase para alimentar tanto el flujo operativo (bandeja de entrada) como la capa analítica (dashboard).

8. Experiencia de Usuario

Usuario carga documento →
DocuInsight lo entiende →
Sistema muestra:

Tipo documental detectado

Campos extraídos

Nivel de confianza simulado

Documento original + datos estructurados

PROMPT COMPLETO PARA CONSTRUIRLO EN ANTIGRAVITY CLI

Usa este prompt EXACTO:

PROMPT

Construir una aplicación web llamada DocuInsight orientada a procesamiento documental inteligente completamente simulado (mock-driven), sin consumo de APIs externas.

La aplicación debe funcionar de manera autónoma utilizando reglas internas, procesamiento local y simulación de inteligencia documental.

Módulos a Construir
1. Document Intake

Permitir cargar PDF o imagen.

Mostrar preview del documento.

2. OCR Simulator

No usar OCR real.

Implementar:

Parser de texto base.

Plantillas de lectura según documento.

Simulación de extracción textual.

3. Document Classifier (Rule-Based)

Clasificar documentos usando:

Palabras clave detectadas.

Estructura visual.

Expresiones regulares.

Clasificaciones posibles:

RUT

Cámara de Comercio

Cédula

datos mock de la simulación
{
  "administration": {
    "documentTypes": [
      {
        "id": "DT-001",
        "name": "Identificación Tributaria",
        "description": "Documentos relacionados con obligaciones y registros fiscales."
      },
      {
        "id": "DT-002",
        "name": "Existencia y Representación Legal",
        "description": "Documentos corporativos y registrales."
      },
      {
        "id": "DT-003",
        "name": "Identificación Personal",
        "description": "Documentos de identidad de personas naturales."
      }
    ],
    "subSeries": [
      {
        "id": "SS-001",
        "typeId": "DT-001",
        "name": "Registro Único Tributario - RUT",
        "promptTemplate": "Analiza un Registro Único Tributario colombiano. Identifica información fiscal estructurada. Normaliza actividades económicas. Devuelve los datos en formato JSON validado.",
        "fields": [
          {"key": "nit", "label": "NIT", "active": true},
          {"key": "razonSocial", "label": "Razón Social", "active": true},
          {"key": "nombreComercial", "label": "Nombre Comercial", "active": true},
          {"key": "actividadEconomica", "label": "Actividad Económica", "active": true},
          {"key": "direccion", "label": "Dirección", "active": true},
          {"key": "municipio", "label": "Municipio", "active": true},
          {"key": "departamento", "label": "Departamento", "active": true},
          {"key": "responsabilidades", "label": "Responsabilidades fiscales", "active": true},
          {"key": "fechaGeneracion", "label": "Fecha de generación", "active": true},
          {"key": "representante", "label": "Representante asociado", "active": true}
        ]
      },
      {
        "id": "SS-002",
        "typeId": "DT-002",
        "name": "Certificado Cámara de Comercio",
        "promptTemplate": "Analiza certificado de existencia y representación legal. Resume objeto social en máximo 3 líneas. Identifica representante legal vigente. Extrae información registral clave.",
        "fields": [
          {"key": "razonSocial", "label": "Razón social", "active": true},
          {"key": "matricula", "label": "Número de matrícula", "active": true},
          {"key": "fechaConstitucion", "label": "Fecha de constitución", "active": true},
          {"key": "representanteLegal", "label": "Representante legal", "active": true},
          {"key": "objetoSocial", "label": "Objeto social (resumen)", "active": true},
          {"key": "direccion", "label": "Dirección comercial", "active": true},
          {"key": "ciudad", "label": "Ciudad", "active": true}
        ]
      },
      {
        "id": "SS-003",
        "typeId": "DT-003",
        "name": "Cédula de Ciudadanía",
        "promptTemplate": "Identifica datos biográficos del titular. Normaliza nombres en formato mayúscula sostenida. Detecta lugar y fecha de expedición.",
        "fields": [
          {"key": "numeroDocumento", "label": "Número de documento", "active": true},
          {"key": "nombres", "label": "Nombres", "active": true},
          {"key": "apellidos", "label": "Apellidos", "active": true},
          {"key": "fechaNacimiento", "label": "Fecha de nacimiento", "active": true},
          {"key": "lugarNacimiento", "label": "Lugar de nacimiento", "active": true},
          {"key": "fechaExpedicion", "label": "Fecha de expedición", "active": true},
          {"key": "lugarExpedicion", "label": "Lugar de expedición", "active": true},
          {"key": "sexo", "label": "Sexo", "active": true}
        ]
      }
    ]
  },
  "mockExtractions": {
    "rut.pdf": {
      "detectedSubSeriesId": "SS-001",
      "confidenceScore": 0.98,
      "extractedData": {
        "nit": "900689899-6",
        "razonSocial": "DISTRISEGURIDAD, SERVICIOS Y ACCESORIOS S.A.S.",
        "nombreComercial": "DISERVA S.A.S.",
        "actividadEconomica": "4690 - Comercio al por mayor no especializado",
        "direccion": "CR 51 9 A SUR 01",
        "municipio": "Medellín",
        "departamento": "Antioquia",
        "responsabilidades": "05, 07, 09, 11, 10, 14, 42",
        "fechaGeneracion": "04-03-2019",
        "representante": "ZAPATA ALZATE JULLIETH PAOLA"
      }
    },
    "32.2CertificadoCamaradeCodeBgta.pdf": {
      "detectedSubSeriesId": "SS-002",
      "confidenceScore": 0.95,
      "extractedData": {
        "razonSocial": "SOSTENIBILIDAD LEGAL SAS",
        "matricula": "02529040",
        "fechaConstitucion": "24 DE DICIEMBRE DE 2014",
        "representanteLegal": "AMAYA VILLAREAL ALVARO FRANCISCO",
        "objetoSocial": "Prestación de servicios legales, asesoría y consultoría a entidades públicas y privadas en asuntos de sostenibilidad, consumo responsable, derechos humanos e ingeniería.",
        "direccion": "CR 13 NO. 101 38 AP 202",
        "ciudad": "BOGOTA D.C."
      }
    },
    "Cedula dos caras.pdf": {
      "detectedSubSeriesId": "SS-003",
      "confidenceScore": 0.99,
      "extractedData": {
        "numeroDocumento": "1.020.818.311",
        "nombres": "MATEO",
        "apellidos": "POLANCO RODRIGUEZ",
        "fechaNacimiento": "22-AGO-1996",
        "lugarNacimiento": "BOGOTA D.C (CUNDINAMARCA)",
        "fechaExpedicion": "29-AGO-2014",
        "lugarExpedicion": "BOGOTA D.C.",
        "sexo": "M"
      }
    }
  }
}

4. Extraction Engine (Simulado)

Motor que:

Recibe texto detectado.

Recibe prompt configurado.

Aplica reglas heurísticas.

Devuelve entidades estructuradas.

No usar IA real.

Simular comportamiento determinístico configurable.

5. Administration Module

Pantalla para:

Crear Tipo Documental
Crear Subserie
Crear serie
Definir Campos a Extraer
Activar / Desactivar Campos
Versionar configuración

Modelo interno:

DocumentType
SubType
FieldDefinition
PromptTemplate
MockExtractionProfile

6. Prompt Editor

UI editable con:

Campo de prompt.

Historial de versiones.

Asociación a subserie documental.

El prompt afecta reglas simuladas de extracción.

7. Processing Orchestrator

Pipeline configurable:

Upload → Simulated OCR → Classification → Prompt Resolution → Mock Extraction → Structured Output

8. Results Viewer

Mostrar:

✔ Documento cargado
✔ Tipo detectado
✔ Campos extraídos
✔ JSON estructurado
✔ Nivel de confianza simulado

9. Plan de Despliegue y Orquestación Backend (Docker & n8n)

Se contempla la posibilidad de encapsular el orquestador (n8n) en un contenedor Docker para despliegues locales, on-premise o cloud de manera ágil:
- Un entorno orquestado con `docker-compose` para levantar la base de datos de n8n y su worker, conectándose a Supabase remoto.
- Esto permite un ambiente asilado e idéntico para todos los desarrolladores.
- Los Dashboards y métricas reaccionan *exclusivamente* a los datos producidos por la interacción n8n <-> Supabase.

10. Diseño UX

Estética:

Empresarial

Minimalista

Enfocado en interpretación documental

Dashboard claro de resultados

Resultado Esperado



Quiero que haya un side bar a la izquierda donde este el menu

Logo: C:\Users\mateo\Desktop\DocuInsight\logo SinergIA Lab.png

Una aplicación que demuestre cómo una organización puede:

✔ Gobernar su inteligencia documental
✔ Parametrizar extracción sin desarrollo
✔ Entender documentos automáticamente
✔ Escalar a cualquier tipología futura