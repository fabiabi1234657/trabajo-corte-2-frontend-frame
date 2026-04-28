import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCrisisStore } from '../store/useCrisisStore';

export function LobbyPage() {
  const navigate = useNavigate();
  const registerPlayer = useCrisisStore((state) => state.registerPlayer);
  const connectSocket = useCrisisStore((state) => state.connectSocket);

  const [playerName, setPlayerName] = useState('');
  const [roomId, setRoomId] = useState('soc-room-01');
  const [role, setRole] = useState('monitor');

  const onSubmit = (event) => {
    event.preventDefault();

    if (!playerName.trim() || !roomId.trim()) {
      return;
    }

    registerPlayer({
      playerName: playerName.trim(),
      roomId: roomId.trim(),
      role
    });
    connectSocket();

    navigate(role === 'monitor' ? '/ops/monitor' : '/ops/bridge');
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden px-4 py-8">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_right,_rgba(76,201,240,0.2),_transparent_40%),radial-gradient(circle_at_bottom_left,_rgba(247,185,85,0.14),_transparent_38%)]" />

      <section className="relative w-full max-w-2xl animate-riseIn rounded-3xl border border-command-line bg-command-panel/95 p-6 shadow-panel md:p-8">
        <p className="font-display text-sm tracking-[0.24em] text-command-accent">INICIAR MISIÓN</p>
        <h2 className="mt-3 font-display text-3xl text-slate-100">Sistema Asimétrico de Gestión de Crisis</h2>
        <p className="mt-3 text-slate-300">
          El Monitor interpreta telemetria SOC y el Tecnico ejecuta comandos de respuesta.
          Coordinen decisiones en tiempo real para contener la crisis de ciberseguridad.
        </p>

        <form onSubmit={onSubmit} className="mt-8 space-y-5">
          <label className="block">
            <span className="mb-2 block text-sm text-slate-300">Nombre del Jugador</span>
            <input
              value={playerName}
              onChange={(event) => setPlayerName(event.target.value)}
              placeholder="Ej: Ana Martínez"
              className="w-full rounded-xl border border-command-line bg-slate-950/70 px-4 py-3 text-slate-100 outline-none transition focus:border-command-accent"
              required
            />
          </label>

          <label className="block">
            <span className="mb-2 block text-sm text-slate-300">Rol</span>
            <div className="grid gap-3 md:grid-cols-2">
              <button
                type="button"
                onClick={() => setRole('monitor')}
                className={`rounded-xl border px-4 py-3 text-left transition ${
                  role === 'monitor'
                    ? 'border-command-accent bg-command-accent/20 text-command-accent'
                    : 'border-command-line bg-slate-950/40 text-slate-200 hover:border-slate-500'
                }`}
              >
                <p className="font-semibold">Monitor</p>
                <p className="text-sm opacity-80">Visualiza indicadores y códigos.</p>
              </button>

              <button
                type="button"
                onClick={() => setRole('technician')}
                className={`rounded-xl border px-4 py-3 text-left transition ${
                  role === 'technician'
                    ? 'border-command-warn bg-command-warn/20 text-command-warn'
                    : 'border-command-line bg-slate-950/40 text-slate-200 hover:border-slate-500'
                }`}
              >
                <p className="font-semibold">Técnico</p>
                <p className="text-sm opacity-80">Ejecuta acciones y protocolos.</p>
              </button>
            </div>
          </label>

          <label className="block">
            <span className="mb-2 block text-sm text-slate-300">ID de Sala</span>
            <input
              value={roomId}
              onChange={(event) => setRoomId(event.target.value)}
              placeholder="Ej: pareja-azul"
              className="w-full rounded-xl border border-command-line bg-slate-950/70 px-4 py-3 text-slate-100 outline-none transition focus:border-command-accent"
              required
            />
            <p className="mt-2 text-xs text-slate-500">Tematica fija: Ciberseguridad (SOC).</p>
          </label>

          <button
            type="submit"
            className="w-full rounded-xl bg-gradient-to-r from-cyan-500 to-sky-400 px-4 py-3 font-display text-sm tracking-widest text-slate-900 transition hover:brightness-110"
          >
            CONECTAR Y ENTRAR AL CENTRO DE MANDO
          </button>
        </form>
      </section>
    </div>
  );
}
