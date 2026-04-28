import { useState } from 'react';
import { useCrisisStore } from '../store/useCrisisStore';

const ACTIONS = [
  { key: 'increase-cooling', label: 'Aumentar Refrigeración', tone: 'ok' },
  { key: 'restart-servers', label: 'Reiniciar Servidores', tone: 'warn' },
  { key: 'activate-firewall', label: 'Activar Firewall de Emergencia', tone: 'danger' }
];

export function BridgePage() {
  const sendTechAction = useCrisisStore((state) => state.sendTechAction);
  const metrics = useCrisisStore((state) => state.metrics);
  const logs = useCrisisStore((state) => state.logs);

  const [terminalCode, setTerminalCode] = useState('');

  const triggerAction = (action) => {
    sendTechAction({ action });
  };

  return (
    <section className="grid gap-5 lg:grid-cols-[1.2fr_1fr]">
      <article className="rounded-2xl border border-command-line bg-command-panel p-5 shadow-panel">
        <h2 className="font-display text-xl text-slate-100">Puente Técnico (Solo Acción)</h2>
        <p className="mt-1 text-sm text-slate-400">
          Ejecuta maniobras inmediatas y valida códigos recibidos por el Monitor.
        </p>

        <div className="mt-6 grid gap-4 md:grid-cols-2">
          {ACTIONS.map((action) => {
            const classes =
              action.tone === 'danger'
                ? 'border-command-danger bg-command-danger/15 text-command-danger hover:bg-command-danger/25'
                : action.tone === 'warn'
                  ? 'border-command-warn bg-command-warn/15 text-command-warn hover:bg-command-warn/25'
                  : 'border-command-ok bg-command-ok/15 text-command-ok hover:bg-command-ok/25';

            return (
              <button
                key={action.key}
                type="button"
                onClick={() => triggerAction(action.key)}
                className={`rounded-xl border p-4 text-left font-semibold transition ${classes}`}
              >
                {action.label}
              </button>
            );
          })}
        </div>

        <div className="mt-6 rounded-xl border border-command-line bg-slate-950/40 p-4">
          <h3 className="font-display text-sm tracking-wide text-slate-200">Terminal de Comandos</h3>
          <p className="mt-1 text-xs text-slate-500">
            Código vigente del monitor: <span className="font-bold text-command-accent">{metrics.securityCode}</span>
          </p>

          <div className="mt-3 flex flex-col gap-3 md:flex-row">
            <input
              value={terminalCode}
              onChange={(event) => setTerminalCode(event.target.value)}
              placeholder="Ingresar código de seguridad"
              className="w-full rounded-lg border border-command-line bg-slate-900 px-3 py-2 text-slate-100 outline-none transition focus:border-command-accent"
            />
            <button
              type="button"
              onClick={() => {
                sendTechAction({ action: 'validate-security-code', payload: { code: terminalCode } });
                setTerminalCode('');
              }}
              className="rounded-lg border border-command-accent bg-command-accent/20 px-4 py-2 font-semibold text-command-accent transition hover:bg-command-accent/30"
            >
              Ejecutar
            </button>
          </div>
        </div>
      </article>

      <aside className="rounded-2xl border border-command-line bg-command-panel p-5 shadow-panel">
        <h3 className="font-display text-lg text-slate-100">Consola de Confirmaciones</h3>
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
