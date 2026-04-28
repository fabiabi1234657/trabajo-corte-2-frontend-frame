# Crisis Ops Frontend

Frontend React para simulación asimétrica de gestión de crisis entre dos roles:

- Monitor: vista de solo lectura con telemetría y código de seguridad.
- Técnico: vista de solo acción para ejecutar protocolos.

## Integrantes

- Nombre completo integrante 1
- Nombre completo integrante 2

## Temática Elegida

- Gestión de Data Center (Infraestructura Cloud)

## Rutas

- `/`: Lobby (registro y selección de rol).
- `/ops/monitor`: Centro de monitoreo.
- `/ops/bridge`: Puente técnico de acciones.

## Tecnologías

- React + Vite
- React Router v7
- Zustand
- Socket.IO Client
- Tailwind CSS

## Configuración rápida

1. Instalar dependencias:

   npm install

2. Configurar la URL del backend de crisis:

   - Copiar `.env.example` a `.env`
   - Ajustar `VITE_SOCKET_URL` (ej: `http://localhost:4000`)

3. Levantar frontend:

   npm run dev

## Integración con Backend

Eventos esperados de socket:

- Emitidos por frontend:
  - `client:join` (al conectar jugador)
  - `tech:action` (acciones del técnico)
- Escuchados por frontend:
  - `crisis:update`
  - `crisis:security-code`
  - `crisis:log`

Con esto, cada acción del Técnico se refleja en tiempo real en la vista del Monitor.

## Entrega (Moodle)

Incluir en la entrega:

- Integrantes (nombres completos)
- Temática elegida
- Enlace al repositorio GitHub
- Este README con instalación básica (`npm install`)
