/*
<<<<<<< ours
import { useCallback, useEffect, useMemo, useState } from 'react';
import { ExerciseLogCard } from '../../components/ExerciseLogCard';
=======
import { useMemo, useState } from 'react';
>>>>>>> theirs
import { Layout } from '../../components/Layout';
import { useWorkoutPlan } from '../../hooks/useWorkoutPlan';
import { useAppState } from '../../store/AppContext';
import { isoDate } from '../../lib/date';
<<<<<<< ours
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
*/

import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Layout } from '../../components/Layout';
import { useWorkoutPlan } from '../../hooks/useWorkoutPlan';
import { useAppState } from '../../store/AppContext';
import { isoDate } from '../../lib/date';
import { getReadinessSuggestion } from '../../lib/coach/recommendations';
import { buildWorkoutSession } from '../../lib/workoutSession';

export function TodayPage() {
  const { activeDay, nextDay } = useWorkoutPlan();
  const { activePlan, activeSessions, activeCheckIns, saveCheckInForActive, saveSessionForActive } = useAppState();
  const navigate = useNavigate();
  const [readiness, setReadiness] = useState({ energy: 3 as 1 | 2 | 3 | 4 | 5, soreness: 3 as 1 | 2 | 3 | 4 | 5, sleepQuality: 3 as 1 | 2 | 3 | 4 | 5, motivation: 3 as 1 | 2 | 3 | 4 | 5 });
  const today = isoDate();

  const todayCheckIn = activeCheckIns.find((item) => item.date === today);
  const inProgress = activeSessions.find((session) => session.status === 'inProgress');
  const readinessSuggestion = useMemo(() => getReadinessSuggestion(readiness), [readiness]);

  if (!activePlan || !activeDay) return null;

  return (
    <Layout title="Today" subtitle="Check in, review the session, and launch the guided workout flow.">
      <section className="card space-y-3">
        <p className="section-title">Today's workout</p>
        <h2 className="text-xl font-bold">{activeDay.name}</h2>
        <p className="text-sm text-slate-600 dark:text-slate-300">{activeDay.focus}</p>
        <p className="text-sm text-slate-500">Next up: {nextDay?.name ?? activeDay.name}</p>
      </section>

      <section className="card space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="font-semibold">Daily check-in</h2>
          <span className="metric-chip">{todayCheckIn?.checkedIn ? 'Saved today' : 'Needed today'}</span>
        </div>
        {(['energy', 'soreness', 'sleepQuality', 'motivation'] as const).map((field) => (
          <label key={field} className="block">
            <span className="section-title">{field}</span>
            <input className="input mt-2" type="number" min={1} max={5} value={readiness[field]} onChange={(event) => setReadiness({ ...readiness, [field]: Number(event.target.value) as 1 | 2 | 3 | 4 | 5 })} />
          </label>
        ))}
        <p className="rounded-2xl border border-brand-200 bg-brand-50 px-3 py-2 text-sm text-brand-900 dark:border-brand-900/40 dark:bg-brand-950/30 dark:text-brand-100">
          {readinessSuggestion}
        </p>
        <button
          type="button"
          className="btn w-full"
          onClick={async () => {
            await saveCheckInForActive({
              id: todayCheckIn?.id ?? crypto.randomUUID(),
              date: today,
              checkedIn: true,
              planned: true,
              completed: todayCheckIn?.completed ?? false,
              readiness,
              readinessSuggestion
            });
          }}
        >
          Save check-in
        </button>
      </section>

      <section className="card space-y-3">
        <h2 className="font-semibold">Workout launch</h2>
        <p className="text-sm text-slate-600 dark:text-slate-300">The active session opens one task at a time and saves each step as you move forward.</p>
        <button
          type="button"
          className="btn w-full"
          onClick={async () => {
            if (inProgress) {
              navigate('/workout');
              return;
            }
            const session = buildWorkoutSession({
              userId: activePlan.userId,
              plan: activePlan,
              day: activeDay,
              priorSessions: activeSessions,
              checkIn: todayCheckIn ?? {
                id: crypto.randomUUID(),
                userId: activePlan.userId,
                date: today,
                checkedIn: true,
                planned: true,
                completed: false,
                readiness,
                readinessSuggestion
              }
            });
            await saveSessionForActive(session);
            navigate('/workout');
          }}
        >
          {inProgress ? 'Resume in-progress workout' : 'Start guided workout'}
        </button>
      </section>
    </Layout>
  );
}
/*
export function TodayPage() {
  const { activeDay, activeOrder, plan, goToNextDay, goToPreviousDay, setActiveDayOrder } = useWorkoutPlan();
  const { addSession, activeSessions: sessions } = useAppState();
  if (!plan) return null;
  if (!activeDay || !activeOrder) return null;
=======
import type { ExerciseSetLog } from '../../types/models';
import { getProgressionHint } from '../../lib/progression';

const uid = () => crypto.randomUUID();

export function TodayPage() {
  const { today, plan } = useWorkoutPlan();
  const { addSession, sessions } = useAppState();
>>>>>>> theirs

  const [setLogs, setSetLogs] = useState<ExerciseSetLog[]>([]);
  const [exerciseNotes, setExerciseNotes] = useState<Record<string, string>>({});
  const [workoutNote, setWorkoutNote] = useState('');

<<<<<<< ours
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
=======
  const exerciseTemplates = useMemo(
    () => today.exerciseIds.map((id) => plan.exerciseTemplates.find((e) => e.id === id)).filter(Boolean),
    [today, plan.exerciseTemplates]
  );

  const updateSetLog = (exerciseId: string, setIndex: number, patch: Partial<ExerciseSetLog>) => {
    setSetLogs((prev) => {
      const index = prev.findIndex((x) => x.exerciseId === exerciseId && x.setIndex === setIndex);
      if (index === -1) return [...prev, { id: uid(), exerciseId, setIndex, completed: true, ...patch }];
>>>>>>> theirs
      const next = [...prev];
      next[index] = { ...next[index], ...patch };
      return next;
    });
<<<<<<< ours
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
=======
  };
>>>>>>> theirs

  const completeWorkout = async () => {
    await addSession({
      id: uid(),
<<<<<<< ours
      workoutDayId: activeDay.id,
=======
      workoutDayId: today.id,
>>>>>>> theirs
      date: isoDate(),
      startedAt: new Date().toISOString(),
      completedAt: new Date().toISOString(),
      setLogs,
      exerciseNotes,
<<<<<<< ours
      workoutNote: workoutNote || undefined,
      completed: true
    });
    setSetLogs(buildInitialSets(activeDay.exerciseIds, (id) => plan.exerciseTemplates.find((e) => e.id === id)));
=======
      workoutNote,
      completed: true
    });
    setSetLogs([]);
>>>>>>> theirs
    setExerciseNotes({});
    setWorkoutNote('');
  };

  return (
<<<<<<< ours
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
=======
    <Layout title="Today">
      <section className="card">
        <h2 className="font-semibold">{today.name}</h2>
        <p className="text-sm text-slate-500">{today.focus}</p>
      </section>

      {exerciseTemplates.map((exercise) => {
        if (!exercise) return null;
        return (
          <article key={exercise.id} className="card space-y-3">
            <div>
              <h3 className="font-semibold">{exercise.name}</h3>
              <p className="text-xs text-slate-500">
                {exercise.defaultSets} sets • {exercise.targetType} {exercise.restSeconds ? `• rest ${exercise.restSeconds}s` : ''}
              </p>
            </div>

            {Array.from({ length: exercise.defaultSets }).map((_, i) => (
              <div key={i} className="grid grid-cols-4 gap-2">
                <input className="input" placeholder="Reps" type="number" onChange={(e) => updateSetLog(exercise.id, i, { reps: Number(e.target.value) || undefined })} />
                <input className="input" placeholder="kg" type="number" onChange={(e) => updateSetLog(exercise.id, i, { weightKg: Number(e.target.value) || undefined })} />
                <input className="input" placeholder="sec" type="number" onChange={(e) => updateSetLog(exercise.id, i, { holdSeconds: Number(e.target.value) || undefined })} />
                <input className="input" placeholder="RPE" type="number" min={1} max={10} onChange={(e) => updateSetLog(exercise.id, i, { rpe: Number(e.target.value) || undefined })} />
              </div>
            ))}

            <div className="flex gap-2">
              <button className="btn-secondary" onClick={() => updateSetLog(exercise.id, -1, { skipped: true, completed: false })}>
                Skip exercise
              </button>
            </div>

            <textarea
              className="input"
              placeholder="Exercise note"
              value={exerciseNotes[exercise.id] ?? ''}
              onChange={(e) => setExerciseNotes((prev) => ({ ...prev, [exercise.id]: e.target.value }))}
            />

            {getProgressionHint(exercise, sessions) && (
              <p className="rounded-md bg-emerald-100 p-2 text-xs text-emerald-800 dark:bg-emerald-950 dark:text-emerald-200">
                {getProgressionHint(exercise, sessions)}
              </p>
            )}
          </article>
        );
      })}

      <section className="card space-y-2">
        <textarea className="input" placeholder="Workout note" value={workoutNote} onChange={(e) => setWorkoutNote(e.target.value)} />
        <button className="btn w-full" onClick={completeWorkout}>
>>>>>>> theirs
          Complete workout
        </button>
      </section>
    </Layout>
  );
}
*/
