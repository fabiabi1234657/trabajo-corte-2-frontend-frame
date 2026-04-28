import cors from 'cors';
import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import swaggerUi from 'swagger-ui-express';
import { swaggerSpec } from './swagger.js';
import {
  applyAction,
  computeCriticalState,
  degradeRoom,
  destroyRoom,
  getOrCreateRoom,
  getRoomsSnapshot,
  registerPlayer,
  removePlayer,
  roomHasPlayers
} from './rooms.js';

const app = express();
app.use(express.json());
app.use(
  cors({
    origin: process.env.CORS_ORIGIN || 'http://localhost:5173',
    credentials: true
  })
);

const httpServer = http.createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: process.env.CORS_ORIGIN || 'http://localhost:5173',
    methods: ['GET', 'POST']
  }
});

const PORT = Number(process.env.PORT || 4000);

function emitState(ioServer, roomEntry, extra = {}) {
  ioServer.to(roomEntry.state.roomId).emit('update-state', {
    roomId: roomEntry.state.roomId,
    metrics: roomEntry.state.metrics,
    securityCode: roomEntry.state.securityCode,
    isCritical: roomEntry.state.isCritical,
    tick: roomEntry.state.tick,
    ...extra
  });
}

function startDegradation(roomEntry) {
  if (roomEntry.intervalRef) {
    return;
  }

  roomEntry.intervalRef = setInterval(() => {
    const result = degradeRoom(roomEntry);
    emitState(io, roomEntry, result);
  }, 1000);
}

function stopDegradation(roomEntry) {
  if (!roomEntry.intervalRef) {
    return;
  }

  clearInterval(roomEntry.intervalRef);
  roomEntry.intervalRef = null;
}

/**
 * @swagger
 * /health:
 *   get:
 *     summary: Verifica disponibilidad del servidor
 *     tags: [System]
 *     responses:
 *       200:
 *         description: Servidor disponible
 */
app.get('/health', (req, res) => {
  res.json({ ok: true, uptime: process.uptime() });
});

/**
 * @swagger
 * /rooms:
 *   get:
 *     summary: Lista las salas activas y su estado
 *     tags: [Rooms]
 *     responses:
 *       200:
 *         description: Estado de salas activas
 */
app.get('/rooms', (req, res) => {
  res.json({ rooms: getRoomsSnapshot() });
});

/**
 * @swagger
 * /rooms/{roomId}:
 *   get:
 *     summary: Obtiene o crea una sala y retorna su estado
 *     tags: [Rooms]
 *     parameters:
 *       - in: path
 *         name: roomId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Estado de sala
 */
app.get('/rooms/:roomId', (req, res) => {
  const room = getOrCreateRoom(req.params.roomId);
  res.json({ room: room.state });
});

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

io.on('connection', (socket) => {
  const handleJoinRoom = (payload = {}) => {
    const roomId = String(payload.roomId || 'default-room');
    const playerName = String(payload.playerName || 'Jugador');
    const role = String(payload.role || 'monitor');

    if (socket.data.roomId && socket.data.roomId !== roomId) {
      socket.leave(socket.data.roomId);
      const previousRoom = getOrCreateRoom(socket.data.roomId);
      removePlayer(previousRoom, socket.id);
      if (!roomHasPlayers(previousRoom)) {
        stopDegradation(previousRoom);
        destroyRoom(previousRoom.state.roomId);
      }
    }

    const room = getOrCreateRoom(roomId);
    socket.join(roomId);
    socket.data.roomId = roomId;

    registerPlayer(room, socket.id, { playerName, role });
    startDegradation(room);

    emitState(io, room, {
      logMessage: `${playerName} (${role}) se unio a la sala ${roomId}.`,
      level: 'info'
    });
  };

  const handleAction = (payload = {}) => {
    const roomId = socket.data.roomId;
    if (!roomId) {
      socket.emit('update-state', {
        logMessage: 'Primero debes unirte a una sala con join-room.',
        level: 'warn'
      });
      return;
    }

    const room = getOrCreateRoom(roomId);
    const result = applyAction(room, payload.action, payload.payload || {});
    computeCriticalState(room);
    emitState(io, room, result);
  };

  socket.on('join-room', (payload = {}) => {
    handleJoinRoom(payload);
  });

  // Alias para clientes antiguos que usan "client:join".
  socket.on('client:join', (payload = {}) => {
    socket.emit('crisis:log', {
      level: 'warn',
      message: 'Evento legacy client:join detectado, redirigido a join-room.'
    });
    handleJoinRoom(payload);
  });

  socket.on('action', (payload = {}) => {
    handleAction(payload);
  });

  // Alias para clientes antiguos que usan "tech:action".
  socket.on('tech:action', (payload = {}) => {
    handleAction(payload);
  });

  socket.on('disconnect', () => {
    const roomId = socket.data.roomId;
    if (!roomId) {
      return;
    }

    const room = getOrCreateRoom(roomId);
    removePlayer(room, socket.id);

    if (!roomHasPlayers(room)) {
      stopDegradation(room);
      destroyRoom(roomId);
      return;
    }

    emitState(io, room, {
      logMessage: 'Un jugador se desconecto de la sala.',
      level: 'warn'
    });
  });
});

httpServer.listen(PORT, () => {
  // eslint-disable-next-line no-console
  console.log(`Crisis brain server escuchando en http://localhost:${PORT}`);
  // eslint-disable-next-line no-console
  console.log(`Swagger en http://localhost:${PORT}/api-docs`);
});
