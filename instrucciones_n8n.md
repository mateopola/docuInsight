# Guía de Modificación del Flujo n8n (Paso a Paso)

Dado que es más seguro hacer esto directamente en la interfaz gráfica de n8n para que genere correctamente los IDs internos de nodos y conexiones visuales, aquí tienes el paso a paso detallado para lograr tu arquitectura parametrizada:

## 1. Eliminar el nodo actual de extracción
1. Ve a tu flujo en `http://localhost:5678`.
2. Busca el nodo llamado **"06_IA_Clasificar_y_Extraer_Metadatos"**.
3. Bórralo (y también borra el *Google Gemini Chat Model* y el *Structured Output Parser* que están conectados a este nodo).
4. El nodo anterior a este debería ser **"05_Normalizar_Texto"**. Su salida quedará temporalmente al aire.

## 2. Crear Paso A: Clasificación Rápida
*Objetivo: Saber qué tipo documental es para ir a buscar sus reglas a Supabase.*

1. Agrega un nuevo nodo: **Basic LLM Chain** (o un nodo *Agent* si prefieres). Llámalo: `A_IA_Clasificador`.
2. Conecta la salida de **"05_Normalizar_Texto"** a la entrada de `A_IA_Clasificador`.
3. Conecta a la izquierda de `A_IA_Clasificador` un nuevo nodo **Google Gemini Chat Model**.
4. En las configuraciones de `A_IA_Clasificador`:
   - **System Message/Prompt:** Escribe esto:
     > Eres un clasificador de documentos. Lee el texto y adivina el tipo de documento. Devuelve RESPUESTA_SIMPLE. Las únicas opciones de respuesta válidas son exactamente: "RUT" o "Cámara_Comercio". Si no es ninguno, devuelve "Desconocido".
   - **Text:** Arrastra el output de texto limpio de tu paso de "05_Normalizar_Texto" (ej: `{{ $json.text }}`)

## 3. Crear Paso B: Consulta a Supabase
*Objetivo: Traer el prompt y el JSON Schema desde la tabla `configuracion_documentos`.*

1. Agrega un nuevo nodo **Supabase**. Llámalo: `B_Config_Supabase`.
2. Conecta la salida de `A_IA_Clasificador` a la entrada de `B_Config_Supabase`.
3. Configuración del nodo Supabase:
   - **Resource:** Row
   - **Operation:** Get
   - **Table:** `configuracion_documentos`
   - Activa **Limit** y pon `1`.
   - Agrega en **Match Columns**:
     - Nombre de columna: `tipo_documento`
     - Valor de columna: Aquí arrastras la salida del paso A. (Ej. `{{ $json.output }}` o `{{ $json.text }}` dependiendo de cómo salga del LLM anterior).
4. *(Opcional)*: Puedes meter un nodo IF después de esto. Si el nodo Supabase no devuelve nada (estado vacío o "Desconocido"), envías el flujo a fin/error. Si encuentra la fila, prosigue.

## 4. Crear Paso C: Extracción Final Parametrizada
*Objetivo: Realizar la súper extracción usando los parámetros dinámicos.*

1. Agrega otro nodo **Basic LLM Chain** o **Agent**. Llámalo: `C_IA_Extractor_Dinamico`.
2. Conecta la salida del nodo `B_Config_Supabase` a este nuevo nodo.
3. Conecta un nuevo nodo **Google Gemini Chat Model** al lado izquierdo.
4. Conecta un nuevo nodo **Structured Output Parser** al lado izquierdo del LLM Chain.
5. **Configuraciones Mágicas (La Clave de este Desarrollo):**
   - Haz clic en `C_IA_Extractor_Dinamico`. En el **System Prompt**, en vez de escribir un texto, ve a "Expression" y arroja la propiedad `prompt_sistema` que acaba de entregar el nodo de Supabase:
     ```
     {{ $json.prompt_sistema }}
     ```
   - En el campo **Text / Input** del LLM, arrastra el texto completo original del documento. *Asegúrate de tomarlo del nodo "05_Normalizar_Texto" u "04_Extraer_Texto" en el panel izquierdo (pestaña Nodes).*
     ```
     {{ $('05_Normalizar_Texto').item.json.text }}
     ```
   - Haz clic en el nodo **Structured Output Parser**. En el campo de **JSON Schema Example**, en vez de escribir un JSON a mano, activa la vista "Expression" y arroja la propiedad `esquema_metadatos` del nodo Supabase:
     ```
     {{ JSON.stringify($json.esquema_metadatos) }}
     ```

## 5. Reconexión Final
1. Conecta la salida de tu nuevo y poderoso `C_IA_Extractor_Dinamico` al nodo original **"DB_Registro_Completado"**.
2. Abre "DB_Registro_Completado" y asegúrate de que el campo `resultado_ia` siga arrastrando la salida final correcta que acaba de parir el parser estructurado (ej. `{{ $json }}`).
3. Guarda el flujo (**Save**).

¡Y listo! Cuando lances un documento, el flujo leerá la base de datos de manera agnóstica. Si mañana creas en Supabase la fila para "Factura", el flujo ya está listo para leer Facturas sin que entres jamás a n8n de nuevo.
