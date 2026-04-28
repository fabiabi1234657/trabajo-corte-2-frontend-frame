import { useCrisisStore } from '../store/useCrisisStore';

function StatBar({ label, value, unit = '%' }) {
  const normalized = Math.max(0, Math.min(100, Number(value) || 0));

  const tone =
    normalized >= 85
      ? 'from-command-danger to-red-400'
      : normalized >= 65
        ? 'from-command-warn to-amber-300'
        : 'from-command-ok to-emerald-300';

  return (
    <article className="rounded-xl border border-command-line bg-slate-950/30 p-4">
      <div className="mb-2 flex items-center justify-between text-sm text-slate-300">
        <span>{label}</span>
        <strong className="font-display text-base text-slate-100">
          {normalized}
          {unit}
        </strong>
      </div>
      <div className="h-3 overflow-hidden rounded-full bg-slate-800">
        <div
          className={`h-full rounded-full bg-gradient-to-r transition-all duration-500 ${tone}`}
          style={{ width: `${normalized}%` }}
        />
      </div>
    </article>
  );
}

export function MonitorPage() {
  const metrics = useCrisisStore((state) => state.metrics);
  const logs = useCrisisStore((state) => state.logs);
  const isCritical = useCrisisStore((state) => state.isCritical);

  return (
    <section className="grid gap-5 lg:grid-cols-[1.35fr_1fr]">
      <div className="space-y-5">
        <article className="rounded-2xl border border-command-line bg-command-panel p-5 shadow-panel">
          <h2 className="font-display text-xl text-slate-100">Panel de Telemetría (Solo Lectura)</h2>
          <p className="mt-1 text-sm text-slate-400">Sincronizado en vivo con el servidor de crisis.</p>

          <div className="mt-5 grid gap-4 md:grid-cols-2">
            <StatBar label="Temperatura de racks" value={metrics.rackTemperature} />
            <StatBar label="Uso de ancho de banda" value={metrics.bandwidthUsage} />
            <StatBar label="Intentos DDoS" value={metrics.ddosAttempts} unit=" evt" />
            <StatBar label="Potencia de refrigeración" value={metrics.coolingPower} />
          </div>
        </article>

        <article className="rounded-2xl border border-command-line bg-command-panel p-5 shadow-panel">
          <h3 className="font-display text-lg text-slate-100">Código de Seguridad</h3>
          <div
            className={`mt-4 rounded-xl border px-4 py-6 text-center font-display text-3xl tracking-[0.2em] ${
              isCritical
                ? 'border-command-danger bg-command-danger/10 text-command-danger'
                : 'border-command-accent bg-command-accent/10 text-command-accent'
            }`}
          >
            {metrics.securityCode}
          </div>
          <p className="mt-3 text-sm text-slate-400">
            Comparte este código con el Técnico para ejecutar protocolos validados.
          </p>
        </article>
      </div>

      <aside className="rounded-2xl border border-command-line bg-command-panel p-5 shadow-panel">
        <h3 className="font-display text-lg text-slate-100">Eventos en Tiempo Real</h3>
        <div className="mt-4 h-[430px] space-y-3 overflow-auto pr-2">
          {logs.map((log) => (
            <article
              key={log.id}
              className="rounded-xl border border-command-line bg-slate-950/45 p-3 text-sm"
            >
              <div className="mb-1 flex items-center justify-between text-xs uppercase text-slate-500">
                <span>{log.level}</span>
                <time>{log.time}</time>
              </div>
              <p className="text-slate-200">{log.message}</p>
            </article>
          ))}
        </div>
      </aside>
    </section>
  );
}
