import { useMemo, useState } from 'react';
import { Layout } from '../../components/Layout';
import { useAppState } from '../../store/AppContext';
import { isoDate } from '../../lib/date';

const energyLabels = ['1 — drained', '2 — low', '3 — ok', '4 — good', '5 — great'] as const;

export function MetricsPage() {
  const { metrics, sessions, addMetricLog } = useAppState();
  const [form, setForm] = useState({ date: isoDate(), weightKg: '', waistCm: '', sleepHours: '', energyLevel: 3 as 1 | 2 | 3 | 4 | 5, note: '' });

  const weightSeries = useMemo(() => metrics.filter((m) => m.weightKg != null).sort((a, b) => a.date.localeCompare(b.date)), [metrics]);
  const last14 = weightSeries.slice(-14);
  const maxW = last14.length ? Math.max(...last14.map((m) => m.weightKg!)) : 0;
  const minW = last14.length ? Math.min(...last14.map((m) => m.weightKg!)) : 0;

  return (
    <Layout title="Metrics" subtitle="Body comp, recovery, and trends">
      <section className="card space-y-3">
        <h2 className="font-semibold">Log daily metrics</h2>
        <label className="text-xs font-medium text-slate-500">
          Date
          <input className="input mt-1" type="date" value={form.date} onChange={(e) => setForm((prev) => ({ ...prev, date: e.target.value }))} />
        </label>
        <div className="grid grid-cols-2 gap-2">
          <label className="text-xs text-slate-500">
            Weight (kg)
            <input
              className="input mt-1"
              type="number"
              inputMode="decimal"
              value={form.weightKg}
              onChange={(e) => setForm((prev) => ({ ...prev, weightKg: e.target.value }))}
            />
          </label>
          <label className="text-xs text-slate-500">
            Waist (cm)
            <input
              className="input mt-1"
              type="number"
              inputMode="decimal"
              value={form.waistCm}
              onChange={(e) => setForm((prev) => ({ ...prev, waistCm: e.target.value }))}
            />
          </label>
          <label className="text-xs text-slate-500">
            Sleep (hours)
            <input
              className="input mt-1"
              type="number"
              inputMode="decimal"
              step="0.25"
              value={form.sleepHours}
              onChange={(e) => setForm((prev) => ({ ...prev, sleepHours: e.target.value }))}
            />
          </label>
          <div>
            <p className="text-xs text-slate-500">Energy (tap)</p>
            <div className="mt-1 flex flex-wrap gap-1">
              {([1, 2, 3, 4, 5] as const).map((n) => (
                <button
                  key={n}
                  type="button"
                  className={`rounded-lg px-2.5 py-1.5 text-xs font-medium ${
                    form.energyLevel === n ? 'bg-brand-500 text-white' : 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-200'
                  }`}
                  onClick={() => setForm((prev) => ({ ...prev, energyLevel: n }))}
                  title={energyLabels[n - 1]}
                >
                  {n}
                </button>
              ))}
            </div>
            <p className="mt-1 text-[10px] text-slate-500">{energyLabels[form.energyLevel - 1]}</p>
          </div>
        </div>
        <label className="text-xs text-slate-500">
          Note
          <textarea className="input mt-1 min-h-[72px]" value={form.note} onChange={(e) => setForm((prev) => ({ ...prev, note: e.target.value }))} />
        </label>
        <button
          type="button"
          className="btn w-full"
          onClick={() =>
            void addMetricLog({
              id: crypto.randomUUID(),
              date: form.date,
              weightKg: form.weightKg ? Number(form.weightKg) : undefined,
              waistCm: form.waistCm ? Number(form.waistCm) : undefined,
              sleepHours: form.sleepHours ? Number(form.sleepHours) : undefined,
              energyLevel: form.energyLevel,
              note: form.note || undefined
            })
          }
        >
          Save entry
        </button>
      </section>

      <section className="card space-y-3">
        <h2 className="font-semibold">Body weight trend</h2>
        {last14.length ? (
          <div className="space-y-2">
            <div className="flex h-24 items-end gap-1">
              {last14.map((entry) => {
                const span = maxW - minW || 1;
                const h = ((entry.weightKg! - minW) / span) * 100;
                return (
                  <div key={entry.id} className="flex min-w-0 flex-1 flex-col items-center justify-end gap-1" title={`${entry.date}: ${entry.weightKg} kg`}>
                    <div
                      className="w-full max-w-[28px] rounded-t bg-brand-500/80"
                      style={{ height: `${Math.max(8, h)}%` }}
                    />
                    <span className="truncate text-[9px] text-slate-500">{entry.date.slice(5)}</span>
                  </div>
                );
              })}
            </div>
            <p className="text-xs text-slate-500">
              Range in window: {minW.toFixed(1)}–{maxW.toFixed(1)} kg
            </p>
          </div>
        ) : (
          <p className="text-sm text-slate-500">Add weight entries to see bars.</p>
        )}
      </section>

      <section className="card space-y-2">
        <h2 className="font-semibold">Workout volume</h2>
        <p className="text-sm">Completed sessions (all time): {sessions.filter((s) => s.completed).length}</p>
        <p className="text-xs text-slate-500">Skill history lives on the Skills page; training sessions on Logbook.</p>
      </section>
    </Layout>
  );
}
