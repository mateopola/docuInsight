# DocuInsight - Banco Falabella

Prototipo de alta fidelidad para la gestión documental inteligente.

## 🚀 Cómo iniciar en otro PC

### Prerrequisitos
- Tener instalado [Git](https://git-scm.com/downloads)
- Un navegador web moderno (Chrome, Edge, Firefox)
- Opcional: Python (para servidor local) o extensión "Live Server" en VS Code.

### Paso 1: Clonar el repositorio
Abre una terminal (CMD o PowerShell) y ejecuta:
```bash
git clone https://github.com/mateopola/docuInsight.git
cd docuInsight
```

### Paso 2: Ejecutar la aplicación
Como es una aplicación web estática (HTML/JS/CSS), tienes varias opciones:

#### Opción A (Más fácil - Si tienes Python instalado)
Ejecuta este comando en la carpeta del proyecto:
```bash
python -m http.server 8000
```
Luego abre tu navegador en: `http://localhost:8000`

#### Opción B (Con VS Code)
1. Abre la carpeta en VS Code.
2. Instala la extensión **"Live Server"**.
3. Haz clic derecho en `index.html` y selecciona "Open with Live Server".

#### Opción C (Doble Clic)
Simplemente haz doble clic en el archivo `index.html`. 
*Nota: Algunas funciones de navegación podrían requerir un servidor local por seguridad del navegador.*
