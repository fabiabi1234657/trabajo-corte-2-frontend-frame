# Crisis Ops - SOC (Frontend + Brain Server)

Sistema asimetrico de gestion de crisis en la tematica de Ciberseguridad (SOC), con dos roles:

- Monitor: solo lectura de telemetria y codigo de seguridad.
- Tecnico: solo accion para ejecutar protocolos de respuesta.

## Integrantes

- Fabian Andres Coral Garcia
- Yamith alexander Ardila Cabrera

## Tematica Elegida

- Ciberseguridad (SOC)



## Arquitectura

- Frontend: React + React Router v7 + Zustand + Tailwind.
- Servidor (Cerebro): Node.js + Express + Socket.io + Swagger.

## Estructura

- Frontend en la raiz del proyecto.
- Backend en la carpeta `server/`.

## Instalacion

1. Instalar frontend:

   npm install

2. Configurar frontend:

   - Copiar `.env.example` a `.env`
   - Definir `VITE_SOCKET_URL=http://localhost:4000`

3. Instalar backend:

   cd server
   npm install

## Ejecucion

1. Iniciar backend (terminal 1):

   cd server
   npm run dev

2. Iniciar frontend (terminal 2):

   npm run dev

3. Abrir dos navegadores/pestanas, ingresar con mismo `roomId` y roles distintos.

## Rutas Frontend

- `/`: Lobby (registro, rol e ID de sala).
- `/ops/monitor`: Panel del Monitor (solo lectura).
- `/ops/bridge`: Panel del Tecnico (solo accion).

## API REST (Swagger)

- Swagger UI: `http://localhost:4000/api-docs`
- Health: `GET http://localhost:4000/health`
- Salas activas: `GET http://localhost:4000/rooms`
- Estado de una sala: `GET http://localhost:4000/rooms/:roomId`

## Eventos Socket.io

- Cliente -> Servidor:
  - `join-room` payload: `{ roomId, playerName, role }`
  - `action` payload: `{ action, payload }`

- Servidor -> Clientes de la sala:
  - `update-state` payload: `{ roomId, metrics, securityCode, isCritical, tick, logMessage, level }`

## Logica Implementada en el Cerebro

- Salas multiples por `roomId` (partidas simultaneas).
- Degradacion automatica cada segundo (`setInterval`) aumentando riesgo SOC.
- Validacion de codigo `validate-security-code` enviada por el Tecnico.
- Acciones SOC:
  - `isolate-network`
  - `generate-decrypt-key`
  - `block-ip-ports`

## Pruebas Obligatorias

1. Swagger:
   - Entrar a `http://localhost:4000/api-docs`
   - Probar `GET /health`, `GET /rooms` y `GET /rooms/{roomId}`

2. Socket Tester (Postman):
   - Conectar a `ws://localhost:4000/socket.io/?EIO=4&transport=websocket` (o cliente Socket.io de Postman)
   - Emitir `join-room` desde dos clientes con mismo `roomId`
   - Emitir `action` y confirmar recepcion de `update-state` en tiempo real

3. Socket Tester automatico (Node):
    - Ejecutar con backend activo:
       - `cd server`
       - `npm run test:socket`
    - El script crea 2 clientes, envia `join-room`, ejecuta `action` y muestra JSON con evidencia de `update-state`.

## Entrega Moodle

- Integrantes (nombres completos de la pareja)
- Tematica elegida: Ciberseguridad (SOC)
- Enlace al repositorio GitHub
- README con instalacion basica (`npm install`)

Nota: si solo cursas Electiva, entregar como minimo el servidor funcional probado con Swagger y Socket Tester.
