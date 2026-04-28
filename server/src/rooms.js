const rooms = new Map();

function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

function generateSecurityCode() {
  return String(randomInt(100000, 999999));
}

function buildInitialState(roomId) {
  return {
    roomId,
    createdAt: new Date().toISOString(),
    tick: 0,
    securityCode: generateSecurityCode(),
    isCritical: false,
    metrics: {
      suspiciousTraffic: 30,
      encryptedFilesPercent: 12,
      anomalousAccessLogs: 25,
      isolatedNetworkZones: 0,
      emergencyPortBlocks: 0
    },
    players: {}
  };
}

export function getOrCreateRoom(roomId) {
  const normalized = String(roomId || 'default-room').trim() || 'default-room';

  if (!rooms.has(normalized)) {
    rooms.set(normalized, {
      state: buildInitialState(normalized),
      intervalRef: null
    });
  }

  return rooms.get(normalized);
}

export function getRoomsSnapshot() {
  return Array.from(rooms.values()).map((room) => ({
    roomId: room.state.roomId,
    players: Object.values(room.state.players).map((player) => ({
      playerName: player.playerName,
      role: player.role
    })),
    tick: room.state.tick,
    isCritical: room.state.isCritical,
    metrics: room.state.metrics,
    securityCode: room.state.securityCode
  }));
}

export function registerPlayer(roomEntry, socketId, playerData) {
  roomEntry.state.players[socketId] = {
    socketId,
    playerName: playerData.playerName || 'Jugador',
    role: playerData.role || 'monitor'
  };
}

export function removePlayer(roomEntry, socketId) {
  delete roomEntry.state.players[socketId];
}

export function roomHasPlayers(roomEntry) {
  return Object.keys(roomEntry.state.players).length > 0;
}

export function degradeRoom(roomEntry) {
  const state = roomEntry.state;
  state.tick += 1;

  state.metrics.suspiciousTraffic = clamp(state.metrics.suspiciousTraffic + randomInt(2, 6), 0, 100);
  state.metrics.encryptedFilesPercent = clamp(
    state.metrics.encryptedFilesPercent + randomInt(1, 4),
    0,
    100
  );
  state.metrics.anomalousAccessLogs = clamp(
    state.metrics.anomalousAccessLogs + randomInt(1, 5),
    0,
    100
  );

  if (state.tick % 20 === 0) {
    state.securityCode = generateSecurityCode();
  }

  state.isCritical =
    state.metrics.suspiciousTraffic >= 75 ||
    state.metrics.encryptedFilesPercent >= 60 ||
    state.metrics.anomalousAccessLogs >= 70;

  return {
    logMessage: 'Degradacion automatica: aumentan indicadores de riesgo SOC.',
    level: state.isCritical ? 'danger' : 'warn'
  };
}

export function applyAction(roomEntry, actionName, payload = {}) {
  const state = roomEntry.state;
  const metrics = state.metrics;
  const action = String(actionName || '').trim();

  if (!action) {
    return {
      logMessage: 'Accion vacia ignorada por el servidor.',
      level: 'warn'
    };
  }

  if (action === 'validate-security-code') {
    const submitted = String(payload.code || '').trim();
    const isValid = submitted.length > 0 && submitted === state.securityCode;

    if (!isValid) {
      metrics.suspiciousTraffic = clamp(metrics.suspiciousTraffic + 5, 0, 100);
      metrics.anomalousAccessLogs = clamp(metrics.anomalousAccessLogs + 4, 0, 100);

      return {
        logMessage: 'Codigo invalido. Se detectan nuevos intentos de intrusion.',
        level: 'danger'
      };
    }

    metrics.encryptedFilesPercent = clamp(metrics.encryptedFilesPercent - 22, 0, 100);
    metrics.suspiciousTraffic = clamp(metrics.suspiciousTraffic - 12, 0, 100);
    metrics.anomalousAccessLogs = clamp(metrics.anomalousAccessLogs - 9, 0, 100);
    state.securityCode = generateSecurityCode();

    return {
      logMessage: 'Codigo validado. Se revierte parte del ransomware y se rota la clave.',
      level: 'success'
    };
  }

  if (action === 'isolate-network' || action === 'isolate-segment') {
    metrics.isolatedNetworkZones = clamp(metrics.isolatedNetworkZones + 1, 0, 12);
    metrics.suspiciousTraffic = clamp(metrics.suspiciousTraffic - 18, 0, 100);
    metrics.anomalousAccessLogs = clamp(metrics.anomalousAccessLogs - 8, 0, 100);

    return {
      logMessage: 'Segmento de red aislado por el tecnico.',
      level: 'success'
    };
  }

  if (action === 'block-ip-ports' || action === 'activate-port-block') {
    metrics.emergencyPortBlocks = clamp(metrics.emergencyPortBlocks + 1, 0, 20);
    metrics.suspiciousTraffic = clamp(metrics.suspiciousTraffic - 10, 0, 100);

    return {
      logMessage: 'Puertos/IP sospechosos bloqueados en modo emergencia.',
      level: 'success'
    };
  }

  if (action === 'generate-decrypt-key' || action === 'generate-key') {
    metrics.encryptedFilesPercent = clamp(metrics.encryptedFilesPercent - 15, 0, 100);

    return {
      logMessage: 'Llaves temporales generadas para descifrado controlado.',
      level: 'success'
    };
  }

  return {
    logMessage: `Accion no reconocida: ${action}`,
    level: 'warn'
  };
}

export function computeCriticalState(roomEntry) {
  const m = roomEntry.state.metrics;
  roomEntry.state.isCritical =
    m.suspiciousTraffic >= 75 || m.encryptedFilesPercent >= 60 || m.anomalousAccessLogs >= 70;
}

export function destroyRoom(roomId) {
  rooms.delete(roomId);
}
