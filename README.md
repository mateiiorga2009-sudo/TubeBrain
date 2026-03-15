## TubeBrain - Mini app de ideas para YouTube

Estructura del proyecto:

- `frontend`: HTML, CSS y JS puro.
- `backend`: Node.js + Express + OpenAI.

### 1. Requisitos previos

- Tener instalado **Node.js** (versión 18 o superior recomendada).
- Tener una **API Key de OpenAI**.

### 2. Configurar el backend

1. Abre una terminal en:

   ```bash
   cd "C:\Users\drive\Desktop\WEB CREADORES CONTENIDO\backend"
   ```

2. Instala las dependencias:

   ```bash
   npm install
   ```

3. Crea un archivo `.env` dentro de la carpeta `backend` con este contenido:

   ```bash
   OPENAI_API_KEY=TU_API_KEY_AQUI
   PORT=3000
   ```

4. Inicia el servidor:

   ```bash
   npm start
   ```

   Verás algo como:

   ```bash
   TubeBrain backend escuchando en http://localhost:3000
   ```

### 3. Abrir el frontend

1. Ve a la carpeta:

   ```bash
   cd "C:\Users\drive\Desktop\WEB CREADORES CONTENIDO\frontend"
   ```

2. Abre el archivo `index.html` con tu navegador (doble clic o botón derecho → Abrir con…).

3. Escribe una idea de video en el cuadro de texto y pulsa **“Generar contenido”**.

Si todo está correcto, verás:

- 10 títulos virales.
- 3 ideas de miniatura.
- Un gancho de 10 segundos.
- Una estructura sencilla del video.

