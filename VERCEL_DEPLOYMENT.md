# Guía de Publicación en Vercel

Esta aplicación está completamente preparada para desplegarse en **Vercel** como una SPA con Serverless Functions para el Game Master de Gemini.

---

## 🚀 Método 1: Despliegue mediante GitHub (Recomendado)

1. **Subir tu proyecto a un repositorio de GitHub**:
   - Inicializa el repositorio si no lo has hecho:
     ```bash
     git init
     git add .
     git commit -m "feat: preparar para Vercel con serverless functions"
     ```
   - Súbelo a tu cuenta de GitHub (público o privado).

2. **Importar en Vercel**:
   - Inicia sesión en [vercel.com](https://vercel.com).
   - Haz clic en **"Add New..."** → **"Project"**.
   - Selecciona tu repositorio de GitHub.

3. **Configuración de Proyecto**:
   - **Framework Preset**: `Vite` (se detectará automáticamente por `vercel.json`).
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`

4. **Variables de Entorno (CRÍTICO)**:
   - En la sección **Environment Variables**, añade:
     - **Key**: `GEMINI_API_KEY`
     - **Value**: Tu API Key de Google Gemini (obtenida de [Google AI Studio](https://aistudio.google.com/app/apikey)).
   - Selecciona los entornos: *Production*, *Preview* y *Development*.

5. **Desplegar**:
   - Haz clic en **"Deploy"**.
   - En menos de 1 minuto tendrás tu URL pública (ejemplo: `https://tu-aventura.vercel.app`).

---

## 💻 Método 2: Despliegue mediante Vercel CLI

Si prefieres usar la terminal:

1. **Instalar Vercel CLI**:
   ```bash
   npm i -g vercel
   ```

2. **Iniciar sesión y desplegar**:
   ```bash
   vercel
   ```

3. **Añadir la clave de Gemini en la nube**:
   ```bash
   vercel env add GEMINI_API_KEY
   ```
   *(Ingresa tu clave de Gemini cuando te lo solicite y selecciona Production/Preview/Development)*.

4. **Desplegar a Producción**:
   ```bash
   vercel --prod
   ```

---

## 🛠️ Arquitectura configurada:
- **`vercel.json`**: Configura Vite como frontend y enruta las peticiones de API.
- **`api/adventure/turn.ts`**: Función Serverless de Vercel para interactuar con Gemini (`@google/genai`) de forma segura sin exponer tu clave en el cliente.
- **`src/server/adventureLogic.ts`**: Lógica compartida entre el entorno local (`server.ts`) y la función Serverless de Vercel.
