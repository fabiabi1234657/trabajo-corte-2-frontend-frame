import { io } from 'socket.io-client';

const SERVER_URL = process.env.SOCKET_TEST_URL || 'http://localhost:4000';
const ROOM_ID = process.env.SOCKET_TEST_ROOM || 'qa-soc-room';

function wait(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function createClient(playerName, role) {
  const client = io(SERVER_URL, { transports: ['websocket'] });
  const updates = [];

  client.on('connect', () => {
    client.emit('join-room', { roomId: ROOM_ID, playerName, role });
  });

  client.on('update-state', (payload) => {
    updates.push(payload);
  });

  return { client, updates };
}

async function run() {
  const monitor = createClient('Tester Monitor', 'monitor');
  const tech = createClient('Tester Tecnico', 'technician');

  await wait(2500);

  const latest = monitor.updates.at(-1);
  if (!latest || !latest.securityCode) {
    throw new Error('No se recibio update-state inicial con codigo de seguridad.');
  }

  tech.client.emit('action', {
    action: 'validate-security-code',
    payload: { code: latest.securityCode }
  });

  await wait(1800);

  const afterAction = monitor.updates.at(-1);
  const result = {
    roomId: ROOM_ID,
    receivedUpdates: monitor.updates.length,
    initialCode: latest.securityCode,
    currentCode: afterAction?.securityCode,
    lastLog: afterAction?.logMessage,
    lastLevel: afterAction?.level,
    metrics: afterAction?.metrics
  };

  console.log(JSON.stringify(result, null, 2));

  monitor.client.disconnect();
  tech.client.disconnect();
}

run().catch((error) => {
  console.error('Socket tester fallo:', error.message);
  process.exitCode = 1;
});
