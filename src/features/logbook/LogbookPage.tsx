/*
import { useMemo, useState } from 'react';
import { Layout } from '../../components/Layout';
import { useAppState } from '../../store/AppContext';
import { humanDate } from '../../lib/date';
<<<<<<< ours
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
  const { activeSessions: sessions, activePlan: plan } = useAppState();
  if (!plan) return null;
=======

export function LogbookPage() {
  const { sessions, plan } = useAppState();
>>>>>>> theirs
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
<<<<<<< ours
      if (!set.weightKg || set.skipped) return;
=======
      if (!set.weightKg) return;
>>>>>>> theirs
      const current = prs.get(set.exerciseId) ?? 0;
      if (set.weightKg > current) prs.set(set.exerciseId, set.weightKg);
    });
  });

<<<<<<< ours
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
=======
  return (
    <Layout title="Logbook">
      <section className="card grid grid-cols-2 gap-2">
        <input type="date" className="input" value={dateFilter} onChange={(e) => setDateFilter(e.target.value)} />
        <select className="input" value={exerciseFilter} onChange={(e) => setExerciseFilter(e.target.value)}>
          <option value="">All exercises</option>
          {plan.exerciseTemplates.map((exercise) => (
            <option key={exercise.id} value={exercise.id}>
              {exercise.name}
            </option>
          ))}
        </select>
      </section>

      <section className="card space-y-2">
        <h2 className="font-semibold">Personal records (weight)</h2>
        {[...prs.entries()].slice(0, 10).map(([exerciseId, weight]) => {
          const name = plan.exerciseTemplates.find((x) => x.id === exerciseId)?.name ?? exerciseId;
          return (
            <p key={exerciseId} className="text-sm">
              {name}: {weight} kg
            </p>
          );
        })}
>>>>>>> theirs
      </section>

      {filtered
        .slice()
        .sort((a, b) => b.date.localeCompare(a.date))
        .map((session) => (
<<<<<<< ours
          <SessionCard key={session.id} session={session} plan={plan} />
        ))}

      {!filtered.length && <p className="text-center text-sm text-slate-500">No sessions match your filters.</p>}
=======
          <article key={session.id} className="card space-y-1 text-sm">
            <p className="font-medium">{humanDate(session.date)}</p>
            <p>{session.completed ? 'Completed' : 'In progress'}</p>
            {session.workoutNote && <p className="text-slate-500">{session.workoutNote}</p>}
          </article>
        ))}
>>>>>>> theirs
    </Layout>
  );
}
*/

import { useMemo, useState } from 'react';
import { Layout } from '../../components/Layout';
import { useAppState } from '../../store/AppContext';

export function LogbookPage() {
  const { activeSessions, activePlan, activeJournalEntries, saveJournalEntryForActive } = useAppState();
  const [note, setNote] = useState('');
  const [dateFilter, setDateFilter] = useState('');

  const filtered = useMemo(() => activeSessions.filter((session) => !dateFilter || session.date === dateFilter).sort((a, b) => b.date.localeCompare(a.date)), [activeSessions, dateFilter]);

  return (
    <Layout title="Logbook" subtitle="Session history, task-level records, and reflections.">
      <section className="card space-y-3">
        <input className="input" type="date" value={dateFilter} onChange={(event) => setDateFilter(event.target.value)} />
      </section>

      {filtered.map((session) => (
        <section key={session.id} className="card space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-semibold">{session.date}</h2>
              <p className="text-sm text-slate-500">{activePlan?.days.find((day) => day.id === session.workoutDayId)?.name ?? 'Workout'}</p>
            </div>
            <span className="metric-chip">{session.status}</span>
          </div>
          {session.tasks.map((task) => {
            const exercise = activePlan?.exerciseTemplates.find((item) => item.id === task.exerciseId);
            return (
              <div key={task.id} className="rounded-2xl border border-slate-200 p-3 text-sm dark:border-slate-700">
                <p className="font-semibold">{exercise?.name ?? task.exerciseId}</p>
                <p className="text-slate-500">{task.setLogs.map((set) => `${set.reps ?? set.holdSeconds ?? '-'}${set.weightKg != null ? ` @ ${set.weightKg}kg` : ''}`).join(' | ')}</p>
              </div>
            );
          })}
        </section>
      ))}

      <section className="card space-y-3">
        <h2 className="font-semibold">Weekly reflection</h2>
        <textarea className="input min-h-[96px]" value={note} onChange={(event) => setNote(event.target.value)} placeholder="Wins, misses, recovery notes, substitutions..." />
        <button
          type="button"
          className="btn w-full"
          onClick={() => {
            void saveJournalEntryForActive({
              id: crypto.randomUUID(),
              date: new Date().toISOString().slice(0, 10),
              type: 'weekly',
              title: 'Weekly reflection',
              content: note
            });
            setNote('');
          }}
        >
          Save reflection
        </button>
        {activeJournalEntries.slice(0, 4).map((entry) => <p key={entry.id} className="text-sm">{entry.date}: {entry.content}</p>)}
      </section>
    </Layout>
  );
}
