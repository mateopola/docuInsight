# Experiencia de Usuario: DocuInsight V2 (Propuesta SinergIA Lab)

Como experto en UX/UI, este documento establece el **Plan de Rediseño y Nueva Experiencia ("El Después")** para DocuInsight. El objetivo fundamental es evolucionar la plataforma de un MVP técnico a una solución corporativa "Premium" (alineada con la estética de SinergIA Lab / Banco Falabella), optimizando drásticamente la carga cognitiva del usuario principal: el Auditor o Gestor Documental ("Carlos").

---

## 1. Principios de la Nueva Experiencia (El "Después")

El rediseño no es solo cosmético (UI), sino estructural (UX), anclado en tres principios de Interacción Cognitiva:

1.  **"Cero Fricción al Ingresar" (Seamless Intake):** La plataforma debe invitar al usuario a la acción. El proceso de arrastrar múltiples PDFs debe sentirse fluido, con feedback instantáneo y micro-interacciones (animaciones) que eliminen la incertidumbre.
2.  **Transparencia de la IA (Trust-by-Design):** El usuario ("Carlos") requiere validación rápida, no "adivinanzas". Cada extracción (NER) debe presentar un nivel de confianza codificado por colores hiper-reconocibles (Verde = Seguro, Ámbar = Revisar, Rojo = Obligatorio validar).
3.  **Estética Corporativa Premium (SinergIA Lab):**
    *   **Paleta de Colores (Basada en el Logo):**
        *   **Primario (Acento Energético):** Azul SinergIA (`#005ab0`). Se usará para botones principales, estados activos y líneas de escaneo láser.
        *   **Secundario (Calidez/Alerta):** Cobrizo/Naranja (`#b17455`). Ideal para notificaciones secundarias o llamadas de atención sutiles.
        *   **Fondos y Texto (Profesionalidad):** Gris Carbón Oscuro (`#41454d`) para textos principales y jerarquías fuertes, contrastando sobre blancos puros y platas muy claros (`#f8f9fa`).
    *   **"Glassmorphism" sutil:** Menús laterales y dashboards con ligeras transparencias y bordes desenfocados para dar profundidad, evocando modernidad y tecnología (IA).
    *   **Limpieza Visual:** Espacios en blanco masivos (White Space). "Menos es más". El foco debe estar *solo* en el documento y en el dato.

---

## 2. Plan Funcional: Comparativa Antes vs. Después (Journey)

### Fase 1: El Tablero de Mando (Dashboard)
*   **Antes:** Colores azules genéricos, disposición apretada y elementos de control sin foco.
*   **El Después (V2):**
    *   **Esquema de Color:** Tonos limpios con acentos en Azul SinergIA (`#005ab0`) y fondos claros (`#f8f9fa`) para máxima legibilidad.
    *   **Métricas de "Valor":** Las tarjetas de KPIs ("Ahorro de Tiempo", "Precisión OCR") ahora tendrán sutiles sombras (elevación CSS) e iconos modernos. Los números usarán una tipografía geométrica contundente (ej. *Inter* o *Outfit*) en color Carbón (`#41454d`).
    *   **Gráficos Interactivos:** Gráficas de dona y barras con paletas que combinen con la marca, resaltando (con un suave hover) exactamente dónde el sistema está aportando más valor.

### Fase 2: Ingesta de Documentos (Document Intake)
*   **Antes:** Un campo transversal, sin gracia, que ocupa espacio sin interactividad real ni feedback visual antes del arranque.
*   **El Después (V2):**
    *   **Drag & Drop Inmersivo:** Una zona central prominente (con borde dashed en color primario). Al arrastrar el documento, la zona entera debe reaccionar (brillar o cambiar de opacidad).
    *   **Micro-animaciones de IA:** Al procesar, no solo mostrar "Cargando...". Implementaremos una animación de escaneo (una línea láser estilo OCR que baje por una silueta de PDF), comunicando que la *Inteligencia Artificial está trabajando*.

### Fase 3: Validación Cognitiva ("Human-in-the-Loop")
*   **Antes:** Pantalla partida (Split-screen) rudimentaria donde los inputs de texto (NIT, Nombres) lucen como un formulario web anticuado.
*   **El Después (V2):**
    *   **Foco Láser (Side-by-Side Optimizado):** A la izquierda, un visor avanzado de PDF con zoom. A la derecha, un formulario "in-line". Los inputs del formulario web tradicional desaparecen; en su lugar, el usuario verá el texto extraído como si fuera "texto puro" con un fondo muy suave, y solo al hacer clic o *hover*, se revelará un pequeño lápiz para edición fluida.
    *   **Escala de Confianza Visual:**
        *   Nivel de Confianza ~99%: La entidad (ej. "Razón Social") tiene un micro-punto verde al lado.
        *   Nivel de Confianza <75%: Micro-punto naranja sutil, llamando la atención del auditor sin alarmar.

### Fase 4: Gobierno y Administración (No-Code)
*   **Antes:** Tabla plana y ventanas superpuestas (modales) abruptas que rompen el contexto. Editores de "Prompt" de IA que parecen HTML de 1999.
*   **El Después (V2):**
    *   **Modales Deslizables (Drawers / Side panels):** En vez de un "salto" al centro de la pantalla, la configuración se deslizará elegantemente desde un panel lateral derecho.
    *   **Botones Tipo "Toggle" iOS:** Reemplazaremos checkboxes básicos por botones de activación con transición suave.
    *   **Prompt Workspace:** El área donde se configura la "Lógica IA" ya no es un `textarea` común. Será un espacio con fondo oscuro (estilo editor de código moderno), enfatizando que en ese lugar se configura el "Cerebro" de DocuInsight.

---

## 3. Guía Rápida de Implementación Tecnológica

Para construir esta segunda iteración de UX y UI, abordaremos el código con las siguientes capas:

1.  **Fundacional (`styles.css`):**
    *   Implementación de Variables CSS (Tokens de Diseño extraídos del Logo).
    *   Fijar paleta corporativa: `--primary-color: #005ab0; --accent-color: #b17455; --text-main: #41454d; --bg-light: #f8f9fa; --glass-bg: rgba(255,255,255,0.8);`
    *   Tipografía Google Fonts: `Inter` o `Roboto` (Weights: 300, 400, 600, 800).
2.  **Estructural (`index.html`):**
    *   Reescribir las jerarquías HTML. Limpiar los modales intrusivos para preparar los paneles laterales (drawers) deslizantes.
3.  **Conductual (`app.js`):**
    *   Añadir el motor de transiciones y micro-interacciones. Refinar el tiempo de espera del escaneo simulado para sincronizar las nuevas animaciones (líneas de escaneo láser en el intake).

## Conclusión Ejecutiva

El paso a la **V2** asegura que SinergIA Lab deje de ser visto como un "script que funciona por detrás" para proyectarse como el **Ecosistema Definitivo de Inteligencia Documental** del banco. Es decir: la herramienta ya automatiza el 80% del tiempo operativo; el objetivo de este rediseño es hacer que el auditor disfrute y confíe plenamente en el 20% de tiempo restante que pasa supervisando la herramienta.
