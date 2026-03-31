import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Layout } from '../../components/Layout';
import { useAppState } from '../../store/AppContext';
import { getProgressionHint } from '../../lib/progression';

export function ActiveWorkoutPage() {
  const { activePlan, activeSessions, saveSessionForActive, saveCheckInForActive } = useAppState();
  const navigate = useNavigate();
  const session = activeSessions.find((item) => item.status === 'inProgress');
  const [imageFailed, setImageFailed] = useState(false);

  const currentTask = useMemo(() => (session ? session.tasks[session.currentTaskIndex] : null), [session]);
  const exercise = useMemo(
    () => (currentTask && activePlan ? activePlan.exerciseTemplates.find((item) => item.id === currentTask.exerciseId) ?? null : null),
    [activePlan, currentTask]
  );

  if (!session || !currentTask || !activePlan || !exercise) {
    return (
      <Layout title="Active Workout" subtitle="No active session found.">
        <button type="button" className="btn" onClick={() => navigate('/today')}>
          Back to Today
        </button>
      </Layout>
    );
  }

  const progress = Math.round(((session.currentTaskIndex + 1) / session.tasks.length) * 100);
  const previous = currentTask.previousPerformanceSummary ?? 'No previous performance for this movement yet.';

  const patchSet = (setIndex: number, patch: Partial<(typeof currentTask.setLogs)[number]>) => {
    const nextTasks = session.tasks.map((task) =>
      task.id !== currentTask.id
        ? task
        : {
            ...task,
            setLogs: task.setLogs.map((set) => (set.setIndex === setIndex ? { ...set, ...patch, completed: true, skipped: false } : set))
          }
    );
    void saveSessionForActive({ ...session, tasks: nextTasks, updatedAt: new Date().toISOString() });
  };

  const move = async (direction: -1 | 1) => {
    const nextIndex = Math.max(0, Math.min(session.tasks.length - 1, session.currentTaskIndex + direction));
    const status = nextIndex === session.tasks.length - 1 && direction === 1 && currentTask.status !== 'skipped' ? session.status : session.status;
    await saveSessionForActive({
      ...session,
      status,
      currentTaskIndex: nextIndex,
      tasks: session.tasks.map((task) => (task.id === currentTask.id ? { ...task, status: task.status === 'pending' ? 'completed' : task.status } : task)),
      updatedAt: new Date().toISOString()
    });
  };

  const completeWorkout = async () => {
    const completedSession = {
      ...session,
      status: 'completed' as const,
      completedAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      currentTaskIndex: session.tasks.length - 1
    };
    await saveSessionForActive(completedSession);
    await saveCheckInForActive({
      id: crypto.randomUUID(),
      date: session.date,
      checkedIn: true,
      planned: true,
      completed: true,
      readiness: session.readiness,
      readinessSuggestion: session.readinessSuggestion
    });
    navigate('/logbook');
  };

  return (
    <Layout title="Active Workout" subtitle={`${session.currentTaskIndex + 1} of ${session.tasks.length} tasks`}>
      <section className="card space-y-3">
        <div className="flex items-center justify-between">
          <span className="section-title">Progress</span>
          <span className="metric-chip">{progress}%</span>
        </div>
        <div className="h-2 rounded-full bg-slate-200 dark:bg-slate-800">
          <div className="h-full rounded-full bg-brand-500" style={{ width: `${progress}%` }} />
        </div>
      </section>

      <section className="card space-y-4">
        {!imageFailed && exercise.imageUrl ? (
          <img src={exercise.imageUrl} alt={exercise.name} className="h-48 w-full rounded-2xl object-cover" onError={() => setImageFailed(true)} />
        ) : (
          <div className="flex h-48 items-center justify-center rounded-2xl bg-slate-100 text-sm text-slate-500 dark:bg-slate-900/40">
            Exercise image unavailable. Fallback art can be added later.
          </div>
        )}

        <div>
          <p className="section-title">{exercise.category}</p>
          <h2 className="mt-2 text-2xl font-bold">{exercise.name}</h2>
          <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">
            {exercise.defaultSets} sets
            {exercise.defaultRepRange ? ` | ${exercise.defaultRepRange.min}-${exercise.defaultRepRange.max} reps` : ''}
            {exercise.defaultHoldSeconds ? ` | ${exercise.defaultHoldSeconds}s hold` : ''}
            {exercise.restSeconds ? ` | rest ${exercise.restSeconds}s` : ''}
          </p>
        </div>

        <p className="rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-900/40">{previous}</p>
        {getProgressionHint(exercise, activeSessions.filter((item) => item.id !== session.id)) ? (
          <p className="rounded-2xl border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-900 dark:border-emerald-900/40 dark:bg-emerald-950/30 dark:text-emerald-100">
            {getProgressionHint(exercise, activeSessions.filter((item) => item.id !== session.id))}
          </p>
        ) : null}

        {currentTask.setLogs.map((set) => (
          <div key={set.id} className="rounded-2xl border border-slate-200 p-3 dark:border-slate-700">
            <p className="font-semibold">Set {set.setIndex + 1}</p>
            <div className="mt-2 grid grid-cols-2 gap-2">
              <input className="input" type="number" placeholder={exercise.defaultRepRange ? `${exercise.defaultRepRange.min}` : 'Reps'} value={set.reps ?? ''} onChange={(event) => patchSet(set.setIndex, { reps: Number(event.target.value) || undefined })} />
              <input className="input" type="number" placeholder={exercise.targetType === 'weightedReps' ? `${set.weightKg ?? ''}` : 'Weight kg'} value={set.weightKg ?? ''} onChange={(event) => patchSet(set.setIndex, { weightKg: Number(event.target.value) || undefined })} />
              <input className="input" type="number" placeholder={exercise.defaultHoldSeconds ? `${exercise.defaultHoldSeconds}` : 'Hold sec'} value={set.holdSeconds ?? ''} onChange={(event) => patchSet(set.setIndex, { holdSeconds: Number(event.target.value) || undefined })} />
              <input className="input" type="number" min={1} max={10} placeholder="RPE" value={set.rpe ?? ''} onChange={(event) => patchSet(set.setIndex, { rpe: Number(event.target.value) || undefined })} />
            </div>
          </div>
        ))}

        <textarea className="input min-h-[88px]" placeholder="Task notes or coaching notes" value={currentTask.taskNote ?? ''} onChange={(event) => {
          const nextTasks = session.tasks.map((task) => (task.id === currentTask.id ? { ...task, taskNote: event.target.value } : task));
          void saveSessionForActive({ ...session, tasks: nextTasks, updatedAt: new Date().toISOString() });
        }} />

        <div className="grid grid-cols-3 gap-2">
          <button type="button" className="btn-secondary" onClick={() => move(-1)} disabled={session.currentTaskIndex === 0}>
            Back
          </button>
          <button
            type="button"
            className="btn-secondary"
            onClick={async () => {
              await saveSessionForActive({
                ...session,
                tasks: session.tasks.map((task) => (task.id === currentTask.id ? { ...task, status: 'skipped' } : task)),
                currentTaskIndex: Math.min(session.tasks.length - 1, session.currentTaskIndex + 1),
                updatedAt: new Date().toISOString()
              });
            }}
          >
            Skip
          </button>
          {session.currentTaskIndex === session.tasks.length - 1 ? (
            <button type="button" className="btn" onClick={completeWorkout}>
              Finish
            </button>
          ) : (
            <button type="button" className="btn" onClick={() => move(1)}>
              Next
            </button>
          )}
        </div>
      </section>
    </Layout>
  );
}
