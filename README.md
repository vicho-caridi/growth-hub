# Growth Hub ⚡

Hub centralizado de herramientas de IA para equipos de SDR y Marketing.

## Stack
- React 18 + Vite + React Router v6
- Anthropic Claude API
- Deploy en Vercel

## Estructura del proyecto

```
src/
├── App.jsx                         # Routing principal
├── main.jsx                        # Entry point
├── context/
│   └── ApiKeyContext.jsx           # API key global (una sola vez al entrar)
├── components/
│   └── Sidebar.jsx                 # Navegación lateral colapsable
├── pages/
│   ├── LoginGate.jsx               # Pantalla de API key
│   ├── Dashboard.jsx               # Home con cards de tools
│   └── ToolPage.jsx                # Wrapper con breadcrumb para cada tool
└── tools/
    ├── registry.js                 # ⭐ FUENTE DE VERDAD — agrega tools aquí
    ├── sdr/
    │   └── sequence-builder/
    │       └── index.jsx
    └── marketing/
        └── (próximas tools)
```

## ➕ Agregar una nueva herramienta (3 pasos)

### Paso 1 — Crear el componente
```bash
# Crea la carpeta de tu tool
mkdir -p src/tools/{equipo}/{nombre-tool}
touch src/tools/{equipo}/{nombre-tool}/index.jsx
```

El componente puede usar `useApiKey()` para acceder a la API key sin pedirla de nuevo:
```jsx
import { useApiKey } from '../../../context/ApiKeyContext'

export default function MiTool() {
  const { apiKey } = useApiKey()
  // apiKey ya está disponible, el usuario ya la ingresó al entrar al hub
  return <div>Mi herramienta</div>
}
```

### Paso 2 — Registrar en registry.js
```js
// src/tools/registry.js
import MiTool from './marketing/mi-tool/index.jsx'

export const TOOLS = [
  // ... tools existentes ...
  {
    id: 'mi-tool',           // URL: /tool/mi-tool
    team: 'marketing',       // 'sdr' | 'marketing'
    label: 'Mi Tool',
    description: 'Descripción corta de lo que hace.',
    icon: '🎯',
    color: '#f59e0b',        // Color accent de la tool
    status: 'active',        // 'active' | 'coming-soon'
    component: MiTool,
  },
]
```

### Paso 3 — ¡Listo!
La tool aparece automáticamente en:
- Dashboard home (card clickeable)
- Sidebar (bajo la sección del equipo)
- Ruta `/tool/mi-tool`

No necesitas tocar `App.jsx`, `Sidebar.jsx` ni `Dashboard.jsx`.

---

## Desarrollo local

```bash
npm install
npm run dev
# → http://localhost:5173
```

## Deploy en Vercel

```bash
# Sube a GitHub, luego en vercel.com:
# Import Project → Framework: Vite → Deploy
```

Sin variables de entorno necesarias. La API key la ingresa cada usuario en la interfaz.

## Script HubSpot

```bash
pip install requests
python hubspot_upload.py --token pat-xxx --json secuencia.json --nombre "Mi Secuencia"
```
