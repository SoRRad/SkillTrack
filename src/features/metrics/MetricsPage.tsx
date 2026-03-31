import { useMemo, useState } from 'react';
import { Layout } from '../../components/Layout';
import { isoDate } from '../../lib/date';
import { useAppState } from '../../store/AppContext';

const energyLabels = ['1 - drained', '2 - low', '3 - okay', '4 - good', '5 - great'] as const;

function toOptionalNumber(value: string): number | undefined {
  return value.trim() ? Number(value) : undefined;
}

export function MetricsPage() {
  const { activeMetrics, activeSessions, saveMetricLogForActive } = useAppState();
  const [form, setForm] = useState({
    date: isoDate(),
    weightKg: '',
    waistCm: '',
    sleepHours: '',
    energyLevel: 3 as 1 | 2 | 3 | 4 | 5,
    note: ''
  });

  const weightTrend = useMemo(
    () => activeMetrics.filter((metric) => metric.weightKg != null).sort((left, right) => right.date.localeCompare(left.date)).slice(0, 7),
    [activeMetrics]
  );
  const recentMetrics = useMemo(
    () => activeMetrics.slice().sort((left, right) => right.date.localeCompare(left.date)).slice(0, 5),
    [activeMetrics]
  );
  const completedSessions = activeSessions.filter((session) => session.status === 'completed').length;

  return (
    <Layout title="Metrics" subtitle="Fast body metrics logging with local history.">
      <section className="card space-y-3">
        <h2 className="font-semibold">Log daily metrics</h2>
        <input className="input" type="date" value={form.date} onChange={(event) => setForm({ ...form, date: event.target.value })} />
        <div className="grid grid-cols-2 gap-2">
          <input className="input" placeholder="Weight kg" type="number" value={form.weightKg} onChange={(event) => setForm({ ...form, weightKg: event.target.value })} />
          <input className="input" placeholder="Waist cm" type="number" value={form.waistCm} onChange={(event) => setForm({ ...form, waistCm: event.target.value })} />
          <input className="input" placeholder="Sleep hours" type="number" step="0.25" value={form.sleepHours} onChange={(event) => setForm({ ...form, sleepHours: event.target.value })} />
          <select className="input" value={form.energyLevel} onChange={(event) => setForm({ ...form, energyLevel: Number(event.target.value) as 1 | 2 | 3 | 4 | 5 })}>
            {[1, 2, 3, 4, 5].map((value) => (
              <option key={value} value={value}>
                {energyLabels[value - 1]}
              </option>
            ))}
          </select>
        </div>
        <textarea className="input min-h-[88px]" placeholder="Daily note" value={form.note} onChange={(event) => setForm({ ...form, note: event.target.value })} />
        <button
          type="button"
          className="btn w-full"
          onClick={async () => {
            await saveMetricLogForActive({
              id: crypto.randomUUID(),
              date: form.date,
              weightKg: toOptionalNumber(form.weightKg),
              waistCm: toOptionalNumber(form.waistCm),
              sleepHours: toOptionalNumber(form.sleepHours),
              energyLevel: form.energyLevel,
              note: form.note.trim() || undefined
            });
            setForm({ ...form, weightKg: '', waistCm: '', sleepHours: '', note: '' });
          }}
        >
          Save metric entry
        </button>
      </section>

      <section className="card space-y-3">
        <h2 className="font-semibold">Recent weight trend</h2>
        {weightTrend.length ? (
          weightTrend.map((entry) => (
            <p key={entry.id} className="text-sm">
              {entry.date}: {entry.weightKg} kg
            </p>
          ))
        ) : (
          <p className="text-sm text-slate-500">No weight entries yet.</p>
        )}
      </section>

      <section className="card space-y-3">
        <h2 className="font-semibold">Recent recovery entries</h2>
        {recentMetrics.length ? (
          recentMetrics.map((entry) => (
            <p key={entry.id} className="text-sm">
              {entry.date}: {entry.sleepHours != null ? `${entry.sleepHours} h sleep` : 'No sleep log'}
              {entry.energyLevel != null ? ` | energy ${entry.energyLevel}/5` : ''}
              {entry.note ? ` | ${entry.note}` : ''}
            </p>
          ))
        ) : (
          <p className="text-sm text-slate-500">No recovery entries yet.</p>
        )}
      </section>

      <section className="card space-y-3">
        <h2 className="font-semibold">Training volume</h2>
        <p className="text-sm">Completed sessions: {completedSessions}</p>
      </section>
    </Layout>
  );
}
