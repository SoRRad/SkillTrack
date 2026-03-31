import { useCallback, useEffect, useMemo, useState } from 'react';
import { ExerciseLogCard } from '../../components/ExerciseLogCard';
import { Layout } from '../../components/Layout';
import { useWorkoutPlan } from '../../hooks/useWorkoutPlan';
import { useAppState } from '../../store/AppContext';
import { isoDate } from '../../lib/date';
import type { ExerciseSetLog, ExerciseTemplate } from '../../types/models';
import { getProgressionHint } from '../../lib/progression';
import { formatPreviousSets, getBestWeightKg, getPreviousSessionForExercise } from '../../lib/history';

const uid = () => crypto.randomUUID();

function buildInitialSets(exerciseIds: string[], getTemplate: (id: string) => { id: string; defaultSets: number } | undefined): ExerciseSetLog[] {
  const logs: ExerciseSetLog[] = [];
  for (const eid of exerciseIds) {
    const ex = getTemplate(eid);
    if (!ex) continue;
    for (let i = 0; i < ex.defaultSets; i++) {
      logs.push({ id: uid(), exerciseId: ex.id, setIndex: i, completed: false });
    }
  }
  return logs;
}

export function TodayPage() {
  const { activeDay, activeOrder, plan, goToNextDay, goToPreviousDay, setActiveDayOrder } = useWorkoutPlan();
  const { addSession, sessions } = useAppState();

  const [setLogs, setSetLogs] = useState<ExerciseSetLog[]>([]);
  const [exerciseNotes, setExerciseNotes] = useState<Record<string, string>>({});
  const [workoutNote, setWorkoutNote] = useState('');

  const exerciseTemplates = useMemo((): ExerciseTemplate[] => {
    return activeDay.exerciseIds
      .map((id) => plan.exerciseTemplates.find((e) => e.id === id))
      .filter((e): e is ExerciseTemplate => Boolean(e));
  }, [activeDay.exerciseIds, plan.exerciseTemplates]);

  useEffect(() => {
    setSetLogs(
      buildInitialSets(activeDay.exerciseIds, (id) => plan.exerciseTemplates.find((e) => e.id === id))
    );
    setExerciseNotes({});
    setWorkoutNote('');
  }, [activeDay.id, plan.exerciseTemplates, activeDay.exerciseIds]);

  const patchSet = useCallback((exerciseId: string, setIndex: number, patch: Partial<ExerciseSetLog>) => {
    setSetLogs((prev) => {
      const index = prev.findIndex((x) => x.exerciseId === exerciseId && x.setIndex === setIndex);
      if (index === -1) {
        return [...prev, { id: uid(), exerciseId, setIndex, completed: false, ...patch }];
      }
      const next = [...prev];
      next[index] = { ...next[index], ...patch };
      return next;
    });
  }, []);

  const skipExercise = useCallback(
    (exerciseId: string, setCount: number) => {
      setSetLogs((prev) => {
        const next = [...prev];
        for (let i = 0; i < setCount; i++) {
          const idx = next.findIndex((x) => x.exerciseId === exerciseId && x.setIndex === i);
          if (idx === -1) next.push({ id: uid(), exerciseId, setIndex: i, completed: false, skipped: true });
          else next[idx] = { ...next[idx], skipped: true, completed: false };
        }
        return next;
      });
    },
    []
  );

  const completeWorkout = async () => {
    await addSession({
      id: uid(),
      workoutDayId: activeDay.id,
      date: isoDate(),
      startedAt: new Date().toISOString(),
      completedAt: new Date().toISOString(),
      setLogs,
      exerciseNotes,
      workoutNote: workoutNote || undefined,
      completed: true
    });
    setSetLogs(buildInitialSets(activeDay.exerciseIds, (id) => plan.exerciseTemplates.find((e) => e.id === id)));
    setExerciseNotes({});
    setWorkoutNote('');
  };

  return (
    <Layout title="Today" subtitle="Training day">
      <section className="card space-y-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between">
          <button type="button" className="btn-secondary order-2 w-full sm:order-1 sm:w-auto" onClick={goToPreviousDay}>
            ← Previous day
          </button>
          <div className="order-1 flex flex-1 justify-center gap-2 sm:order-2">
            {([1, 2, 3] as const).map((n) => (
              <button
                key={n}
                type="button"
                className={`tap-target min-h-[48px] min-w-[52px] flex-1 rounded-2xl px-2 text-sm font-bold transition sm:flex-none sm:px-4 ${
                  activeOrder === n
                    ? 'bg-brand-600 text-white shadow-md ring-2 ring-brand-400/40 dark:bg-brand-500'
                    : 'card-muted text-slate-800 dark:text-slate-100'
                }`}
                onClick={() => setActiveDayOrder(n)}
              >
                Day {n}
              </button>
            ))}
          </div>
          <button type="button" className="btn-secondary order-3 w-full sm:w-auto" onClick={goToNextDay}>
            Next day →
          </button>
        </div>
        <div>
          <h2 className="text-xl font-bold tracking-tight">{activeDay.name}</h2>
          <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">{activeDay.focus}</p>
        </div>
        <p className="text-xs leading-relaxed text-slate-500 dark:text-slate-400">
          Swipe your rotation day-by-day. What you log always matches the session shown here — not the calendar alone.
        </p>
      </section>

      {exerciseTemplates.map((exercise) => {
        const prevSession = getPreviousSessionForExercise(exercise.id, activeDay.id, sessions);
        const previousLine = formatPreviousSets(exercise, prevSession);
        const best = getBestWeightKg(exercise.id, sessions);
        const bestWeightLine =
          exercise.targetType === 'weightedReps' && best != null ? `Best logged weight (all time): ${best} kg` : null;
        const hint = getProgressionHint(exercise, sessions, activeDay.id);

        return (
          <ExerciseLogCard
            key={exercise.id}
            exercise={exercise}
            allLogs={setLogs}
            onPatchSet={(setIndex, patch) => patchSet(exercise.id, setIndex, patch)}
            onSkipExercise={() => skipExercise(exercise.id, exercise.defaultSets)}
            previousLine={previousLine}
            bestWeightLine={bestWeightLine}
            exerciseNote={exerciseNotes[exercise.id] ?? ''}
            onExerciseNoteChange={(value) => setExerciseNotes((prev) => ({ ...prev, [exercise.id]: value }))}
            progressionHint={hint}
          />
        );
      })}

      <section className="card space-y-3">
        <label className="block text-xs font-semibold uppercase tracking-wide text-slate-500">Workout note</label>
        <textarea
          className="input min-h-[100px] resize-y"
          placeholder="Overall session: energy, sleep, what to adjust next time…"
          value={workoutNote}
          onChange={(e) => setWorkoutNote(e.target.value)}
        />
        <button type="button" className="btn w-full text-base shadow-lg" onClick={() => void completeWorkout()}>
          Complete workout
        </button>
      </section>
    </Layout>
  );
}
