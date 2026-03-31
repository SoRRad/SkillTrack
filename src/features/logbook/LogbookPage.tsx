import { useMemo, useState } from 'react';
import { Layout } from '../../components/Layout';
import { useAppState } from '../../store/AppContext';

function formatTaskSummary(taskLabel: string, summary: string): string {
  return `${taskLabel}: ${summary}`;
}

export function LogbookPage() {
  const { activeSessions, activePlan, activeJournalEntries, saveJournalEntryForActive } = useAppState();
  const [note, setNote] = useState('');
  const [dateFilter, setDateFilter] = useState('');
  const [exerciseFilter, setExerciseFilter] = useState('');

  const filteredSessions = useMemo(
    () =>
      activeSessions
        .filter((session) => {
          const matchesDate = dateFilter ? session.date === dateFilter : true;
          const matchesExercise = exerciseFilter ? session.tasks.some((task) => task.exerciseId === exerciseFilter) : true;
          return matchesDate && matchesExercise;
        })
        .sort((left, right) => right.date.localeCompare(left.date)),
    [activeSessions, dateFilter, exerciseFilter]
  );

  const personalRecords = useMemo(() => {
    const records = new Map<string, number>();
    activeSessions.forEach((session) => {
      session.tasks.forEach((task) => {
        task.setLogs.forEach((set) => {
          if (set.skipped || set.weightKg == null) return;
          const current = records.get(task.exerciseId) ?? 0;
          if (set.weightKg > current) {
            records.set(task.exerciseId, set.weightKg);
          }
        });
      });
    });
    return [...records.entries()].sort((left, right) => right[1] - left[1]);
  }, [activeSessions]);

  return (
    <Layout title="Logbook" subtitle="Session history, task-level records, and reflections.">
      <section className="card grid gap-2 sm:grid-cols-2">
        <input className="input" type="date" value={dateFilter} onChange={(event) => setDateFilter(event.target.value)} />
        <select className="input" value={exerciseFilter} onChange={(event) => setExerciseFilter(event.target.value)}>
          <option value="">All exercises</option>
          {activePlan?.exerciseTemplates.map((exercise) => (
            <option key={exercise.id} value={exercise.id}>
              {exercise.name}
            </option>
          ))}
        </select>
      </section>

      <section className="card space-y-3">
        <h2 className="font-semibold">Personal records</h2>
        {personalRecords.length ? (
          personalRecords.slice(0, 12).map(([exerciseId, weight]) => {
            const exercise = activePlan?.exerciseTemplates.find((item) => item.id === exerciseId);
            return (
              <p key={exerciseId} className="text-sm">
                <span className="font-medium">{exercise?.name ?? exerciseId}</span>: {weight} kg
              </p>
            );
          })
        ) : (
          <p className="text-sm text-slate-500">Log weighted sets to start building PRs.</p>
        )}
      </section>

      {filteredSessions.length ? (
        filteredSessions.map((session) => {
          const day = activePlan?.days.find((item) => item.id === session.workoutDayId);
          const completedTasks = session.tasks.filter((task) => task.status === 'completed').length;
          const skippedTasks = session.tasks.filter((task) => task.status === 'skipped').length;

          return (
            <section key={session.id} className="card space-y-3">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <h2 className="font-semibold">{session.date}</h2>
                  <p className="text-sm text-slate-500">{day?.name ?? 'Workout'} | {completedTasks}/{session.tasks.length} tasks completed</p>
                </div>
                <span className="metric-chip">{session.status}</span>
              </div>
              {session.workoutNote ? <p className="text-sm text-slate-600 dark:text-slate-300">{session.workoutNote}</p> : null}
              {skippedTasks ? <p className="text-sm text-slate-500">Skipped tasks: {skippedTasks}</p> : null}
              <div className="space-y-2">
                {session.tasks.map((task) => {
                  const exercise = activePlan?.exerciseTemplates.find((item) => item.id === task.exerciseId);
                  const summary = task.setLogs.length
                    ? task.setLogs
                        .map((set) => {
                          if (set.skipped) return 'skipped';
                          if (set.holdSeconds != null) return `${set.holdSeconds}s`;
                          if (set.reps != null && set.weightKg != null) return `${set.reps} @ ${set.weightKg}kg`;
                          if (set.reps != null) return `${set.reps} reps`;
                          return set.completed ? 'done' : 'pending';
                        })
                        .join(' | ')
                    : task.taskNote?.trim() || 'No logged detail';

                  return (
                    <div key={task.id} className="rounded-2xl border border-slate-200 p-3 text-sm dark:border-slate-700">
                      <div className="flex items-center justify-between gap-3">
                        <p className="font-semibold">{exercise?.name ?? task.exerciseId}</p>
                        <span className="text-xs text-slate-500">{task.status}</span>
                      </div>
                      <p className="mt-2 text-slate-600 dark:text-slate-300">
                        {formatTaskSummary(exercise?.name ?? task.exerciseId, summary).replace(`${exercise?.name ?? task.exerciseId}: `, '')}
                      </p>
                      {task.taskNote ? <p className="mt-2 text-xs text-slate-500">Note: {task.taskNote}</p> : null}
                    </div>
                  );
                })}
              </div>
            </section>
          );
        })
      ) : (
        <p className="text-center text-sm text-slate-500">No sessions match your filters.</p>
      )}

      <section className="card space-y-3">
        <h2 className="font-semibold">Weekly reflection</h2>
        <textarea className="input min-h-[96px]" value={note} onChange={(event) => setNote(event.target.value)} placeholder="Wins, misses, recovery notes, substitutions..." />
        <button
          type="button"
          className="btn w-full"
          onClick={async () => {
            if (!note.trim()) return;
            await saveJournalEntryForActive({
              id: crypto.randomUUID(),
              date: new Date().toISOString().slice(0, 10),
              type: 'weekly',
              title: 'Weekly reflection',
              content: note.trim()
            });
            setNote('');
          }}
        >
          Save reflection
        </button>
        {activeJournalEntries.slice(0, 4).map((entry) => (
          <p key={entry.id} className="text-sm">
            {entry.date}: {entry.content}
          </p>
        ))}
      </section>
    </Layout>
  );
}
