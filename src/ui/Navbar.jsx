import { useNavigate } from 'react-router-dom';
import { useCrisisStore } from '../store/useCrisisStore';

const roleLabel = {
  monitor: 'Monitor',
  technician: 'Técnico'
};

export function Navbar() {
  const navigate = useNavigate();
  const playerName = useCrisisStore((state) => state.playerName);
  const role = useCrisisStore((state) => state.role);
  const missionTheme = useCrisisStore((state) => state.missionTheme);
  const socketState = useCrisisStore((state) => state.socketState);
  const isCritical = useCrisisStore((state) => state.isCritical);
  const abortMission = useCrisisStore((state) => state.abortMission);

  const stateColor =
    socketState === 'conectado'
      ? 'text-command-ok'
      : socketState === 'conectando'
        ? 'text-command-warn'
        : 'text-command-danger';

  return (
    <header
      className={`mx-auto flex w-full max-w-7xl flex-col gap-4 rounded-2xl border border-command-line bg-command-panel/90 p-4 shadow-panel backdrop-blur ${
        isCritical ? 'animate-critical border-command-danger' : ''
      }`}
    >
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="font-display text-xl tracking-wide text-slate-100 md:text-2xl">
          Crisis Command Center
        </h1>
        <button
          type="button"
          onClick={() => {
            abortMission();
            navigate('/');
          }}
          className="rounded-lg border border-command-danger bg-command-danger/20 px-4 py-2 text-sm font-semibold text-command-danger transition hover:bg-command-danger/35"
        >
          Abortar Misión
        </button>
      </div>

      <div className="grid gap-3 text-sm text-slate-200 md:grid-cols-4">
        <div className="rounded-lg border border-command-line bg-slate-950/30 p-3">
          <p className="text-slate-400">Jugador</p>
          <p className="font-semibold">{playerName || 'No registrado'}</p>
        </div>
        <div className="rounded-lg border border-command-line bg-slate-950/30 p-3">
          <p className="text-slate-400">Rol</p>
          <p className="font-semibold">{roleLabel[role] || 'Sin rol'}</p>
        </div>
        <div className="rounded-lg border border-command-line bg-slate-950/30 p-3">
          <p className="text-slate-400">Estado Socket</p>
          <p className={`font-semibold uppercase ${stateColor}`}>{socketState}</p>
        </div>
        <div className="rounded-lg border border-command-line bg-slate-950/30 p-3">
          <p className="text-slate-400">Temática</p>
          <p className="font-semibold">{missionTheme}</p>
        </div>
      </div>
    </header>
  );
}
