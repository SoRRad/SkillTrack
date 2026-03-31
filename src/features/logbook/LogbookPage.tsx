import { useMemo, useState } from 'react';
import { Layout } from '../../components/Layout';
import { useAppState } from '../../store/AppContext';
import { humanDate } from '../../lib/date';
import type { ExerciseSetLog, Plan, WorkoutSession } from '../../types/models';

function sortEntriesByDayOrder(
  map: Map<string, ExerciseSetLog[]>,
  exerciseIds?: string[]
): [string, ExerciseSetLog[]][] {
  const order = exerciseIds ?? [];
  return [...map.entries()].sort((a, b) => {
    const ia = order.indexOf(a[0]);
    const ib = order.indexOf(b[0]);
    if (ia === -1 && ib === -1) return 0;
    if (ia === -1) return 1;
    if (ib === -1) return -1;
    return ia - ib;
  });
}

function SessionCard({ session, plan }: { session: WorkoutSession; plan: Plan }) {
  const [open, setOpen] = useState(false);
  const day = plan.days.find((d) => d.id === session.workoutDayId);

  const byExercise = new Map<string, typeof session.setLogs>();
  session.setLogs.forEach((log) => {
    const list = byExercise.get(log.exerciseId) ?? [];
    list.push(log);
    byExercise.set(log.exerciseId, list);
  });
  byExercise.forEach((logs) => logs.sort((a, b) => a.setIndex - b.setIndex));

  return (
    <article className="card space-y-2 text-sm">
      <button type="button" className="flex w-full items-start justify-between gap-2 text-left" onClick={() => setOpen((o) => !o)}>
        <div>
          <p className="font-semibold">{humanDate(session.date)}</p>
          <p className="text-slate-500 dark:text-slate-400">{day?.name ?? 'Workout'}</p>
        </div>
        <span className="shrink-0 text-xs text-slate-500">{open ? 'Hide' : 'Details'}</span>
      </button>
      <p className="text-xs text-slate-500">{session.completed ? 'Completed' : 'In progress'}</p>
      {session.workoutNote && <p className="text-slate-600 dark:text-slate-300">{session.workoutNote}</p>}

      {open && (
        <div className="space-y-3 border-t border-slate-200 pt-3 dark:border-slate-700">
          {sortEntriesByDayOrder(byExercise, day?.exerciseIds).map(([exerciseId, logs]) => {
            const name = plan.exerciseTemplates.find((e) => e.id === exerciseId)?.name ?? exerciseId;
            const note = session.exerciseNotes[exerciseId];
            return (
              <div key={exerciseId}>
                <p className="font-medium">{name}</p>
                <ul className="mt-1 list-inside list-disc text-xs text-slate-600 dark:text-slate-400">
                  {logs.map((l) => (
                    <li key={l.id}>
                      Set {l.setIndex + 1}
                      {l.skipped ? ' — skipped' : ''}
                      {l.reps != null ? ` · ${l.reps} reps` : ''}
                      {l.weightKg != null ? ` · ${l.weightKg} kg` : ''}
                      {l.holdSeconds != null ? ` · ${l.holdSeconds}s` : ''}
                      {l.rpe != null ? ` · RPE ${l.rpe}` : ''}
                    </li>
                  ))}
                </ul>
                {note && <p className="mt-1 text-xs text-slate-500">{note}</p>}
              </div>
            );
          })}
        </div>
      )}
    </article>
  );
}

export function LogbookPage() {
  const { sessions, plan } = useAppState();
  const [dateFilter, setDateFilter] = useState('');
  const [exerciseFilter, setExerciseFilter] = useState('');

  const filtered = useMemo(
    () =>
      sessions.filter((session) => {
        const byDate = dateFilter ? session.date === dateFilter : true;
        const byExercise = exerciseFilter ? session.setLogs.some((log) => log.exerciseId === exerciseFilter) : true;
        return byDate && byExercise;
      }),
    [sessions, dateFilter, exerciseFilter]
  );

  const prs = new Map<string, number>();
  sessions.forEach((session) => {
    session.setLogs.forEach((set) => {
      if (!set.weightKg || set.skipped) return;
      const current = prs.get(set.exerciseId) ?? 0;
      if (set.weightKg > current) prs.set(set.exerciseId, set.weightKg);
    });
  });

  const prList = [...prs.entries()].sort((a, b) => b[1] - a[1]);

  return (
    <Layout title="Logbook" subtitle="History, filters, and weight PRs">
      <section className="card grid gap-2 sm:grid-cols-2">
        <label className="text-xs font-medium text-slate-500">
          Filter by date
          <input type="date" className="input mt-1" value={dateFilter} onChange={(e) => setDateFilter(e.target.value)} />
        </label>
        <label className="text-xs font-medium text-slate-500">
          Filter by exercise
          <select className="input mt-1" value={exerciseFilter} onChange={(e) => setExerciseFilter(e.target.value)}>
            <option value="">All exercises</option>
            {plan.exerciseTemplates.map((exercise) => (
              <option key={exercise.id} value={exercise.id}>
                {exercise.name}
              </option>
            ))}
          </select>
        </label>
      </section>

      <section className="card space-y-2">
        <h2 className="font-semibold">Personal records (max weight)</h2>
        {prList.length ? (
          prList.slice(0, 12).map(([exerciseId, weight]) => {
            const name = plan.exerciseTemplates.find((x) => x.id === exerciseId)?.name ?? exerciseId;
            return (
              <p key={exerciseId} className="text-sm">
                <span className="font-medium">{name}</span> — {weight} kg
              </p>
            );
          })
        ) : (
          <p className="text-sm text-slate-500">Log weighted sets on Today to populate PRs.</p>
        )}
      </section>

      {filtered
        .slice()
        .sort((a, b) => b.date.localeCompare(a.date))
        .map((session) => (
          <SessionCard key={session.id} session={session} plan={plan} />
        ))}

      {!filtered.length && <p className="text-center text-sm text-slate-500">No sessions match your filters.</p>}
    </Layout>
  );
}
