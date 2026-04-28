import { io } from 'socket.io-client';
import { create } from 'zustand';

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:4000';

const initialMetrics = {
  suspiciousTraffic: 30,
  encryptedFilesPercent: 12,
  anomalousAccessLogs: 25,
  isolatedNetworkZones: 0,
  emergencyPortBlocks: 0,
  securityCode: 'N/A',
  responseStatus: 'Estable'
};

function createLog(message, level = 'info') {
  return {
    id: crypto.randomUUID(),
    time: new Date().toLocaleTimeString('es-CO', { hour12: false }),
    message,
    level
  };
}

export const useCrisisStore = create((set, get) => ({
  playerName: '',
  roomId: '',
  role: '',
  missionTheme: 'Ciberseguridad (SOC)',
  socket: null,
  socketState: 'desconectado',
  isCritical: false,
  metrics: initialMetrics,
  logs: [createLog('Esperando sincronización con el servidor...')],

  registerPlayer: ({ playerName, roomId, role }) => {
    set({ playerName, roomId, role, missionTheme: 'Ciberseguridad (SOC)' });
  },

  connectSocket: () => {
    const { socket, playerName, roomId, role } = get();

    if (socket) {
      return;
    }

    const newSocket = io(SOCKET_URL, {
      transports: ['websocket'],
      autoConnect: true
    });

    set({ socket: newSocket, socketState: 'conectando' });

    newSocket.on('connect', () => {
      set({ socketState: 'conectado' });
      get().appendLog('Conectado al servidor de crisis.', 'success');
      newSocket.emit('join-room', { playerName, roomId, role });
    });

    newSocket.on('disconnect', () => {
      set({ socketState: 'desconectado' });
      get().appendLog('Socket desconectado.', 'warn');
    });

    newSocket.on('update-state', (payload = {}) => {
      set((state) => ({
        metrics: {
          ...state.metrics,
          ...(payload.metrics || {}),
          securityCode: String(payload.securityCode || state.metrics.securityCode),
          responseStatus: payload.isCritical ? 'Critico' : 'Estable'
        },
        isCritical: Boolean(payload.isCritical)
      }));

      if (payload.logMessage) {
        get().appendLog(payload.logMessage, payload.level || 'info');
      }
    });

    newSocket.on('crisis:log', (entry) => {
      if (!entry?.message) {
        return;
      }
      get().appendLog(entry.message, entry.level || 'info');
    });
  },

  appendLog: (message, level = 'info') => {
    set((state) => ({
      logs: [createLog(message, level), ...state.logs].slice(0, 80)
    }));
  },

  sendTechAction: ({ action, payload = {} }) => {
    const { socket } = get();

    if (!socket) {
      get().appendLog('No hay socket conectado para enviar la acción.', 'danger');
      return;
    }

    socket.emit('action', {
      action,
      payload,
      sentAt: new Date().toISOString()
    });

    get().appendLog(`Acción enviada: ${action}`, 'success');
  },

  abortMission: () => {
    const { socket } = get();

    if (socket) {
      socket.removeAllListeners();
      socket.disconnect();
    }

    set({
      playerName: '',
      roomId: '',
      role: '',
      socket: null,
      socketState: 'desconectado',
      isCritical: false,
      metrics: initialMetrics,
      logs: [createLog('Misión abortada. Regresa al lobby.')]
    });
  }
}));
