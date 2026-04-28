import { io } from 'socket.io-client';
import { create } from 'zustand';

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:4000';

const initialMetrics = {
  rackTemperature: 48,
  bandwidthUsage: 62,
  ddosAttempts: 14,
  coolingPower: 55,
  securityCode: 'N/A',
  serverStatus: 'Operativo',
  emergencyFirewall: false
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
  role: '',
  missionTheme: 'Gestión de Data Center',
  socket: null,
  socketState: 'desconectado',
  isCritical: false,
  metrics: initialMetrics,
  logs: [createLog('Esperando sincronización con el servidor...')],

  registerPlayer: ({ playerName, role, missionTheme }) => {
    set({ playerName, role, missionTheme });
  },

  connectSocket: () => {
    const { socket, playerName, role, missionTheme } = get();

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
      newSocket.emit('client:join', { playerName, role, missionTheme });
    });

    newSocket.on('disconnect', () => {
      set({ socketState: 'desconectado' });
      get().appendLog('Socket desconectado.', 'warn');
    });

    newSocket.on('crisis:update', (payload = {}) => {
      set((state) => ({
        metrics: { ...state.metrics, ...(payload.metrics || {}) },
        isCritical: Boolean(payload.isCritical)
      }));

      if (payload.logMessage) {
        get().appendLog(payload.logMessage, payload.level || 'info');
      }
    });

    newSocket.on('crisis:security-code', (code) => {
      set((state) => ({
        metrics: {
          ...state.metrics,
          securityCode: String(code)
        }
      }));
      get().appendLog('Nuevo código de seguridad recibido.', 'info');
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

    socket.emit('tech:action', {
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
      role: '',
      socket: null,
      socketState: 'desconectado',
      isCritical: false,
      metrics: initialMetrics,
      logs: [createLog('Misión abortada. Regresa al lobby.')]
    });
  }
}));
