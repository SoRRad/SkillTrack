import { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ExerciseMedia } from '../../components/ExerciseMedia';
import { Layout } from '../../components/Layout';
import { getProgressionHint } from '../../lib/progression';
import {
  completeWorkoutSession,
  getPendingTaskCount,
  getTaskStatus,
  moveTaskIndex,
  skipTask,
  toggleTaskCompletionBlock,
  updateTaskNote,
  updateTaskSetLog
} from '../../lib/workoutSession';
import { getWarmupBlocks, getWarmupSummary } from '../../lib/warmup';
import { useAppState } from '../../store/AppContext';
import type { WorkoutSession } from '../../types/models';

export function ActiveWorkoutPage() {
  const { activePlan, activeSessions, activeCheckIns, activeSettings, saveSessionForActive, saveCheckInForActive, updateActiveSettings } = useAppState();
  const navigate = useNavigate();
  const persistedSession = activeSessions.find((item) => item.status === 'inProgress') ?? null;
  const [draftSession, setDraftSession] = useState<WorkoutSession | null>(persistedSession);
  const [sessionDirty, setSessionDirty] = useState(false);

  useEffect(() => {
    setDraftSession(persistedSession);
    setSessionDirty(false);
  }, [persistedSession?.id]);

  useEffect(() => {
    if (!draftSession || !sessionDirty) {
      return;
    }

    const timeout = window.setTimeout(() => {
      setSessionDirty(false);
      void saveSessionForActive(draftSession);
    }, 250);

    return () => window.clearTimeout(timeout);
  }, [draftSession, saveSessionForActive, sessionDirty]);

  useEffect(() => {
    return () => {
      if (draftSession && sessionDirty) {
        void saveSessionForActive(draftSession);
      }
    };
  }, [draftSession, saveSessionForActive, sessionDirty]);

  const currentTask = useMemo(
    () => (draftSession ? draftSession.tasks[draftSession.currentTaskIndex] ?? null : null),
    [draftSession]
  );
  const exercise = useMemo(
    () => (currentTask && activePlan ? activePlan.exerciseTemplates.find((item) => item.id === currentTask.exerciseId) ?? null : null),
    [activePlan, currentTask]
  );
  const sessionCheckIn = useMemo(
    () => (draftSession ? activeCheckIns.find((item) => item.date === draftSession.date) : undefined),
    [activeCheckIns, draftSession]
  );

  const flushSession = useCallback(
    async (nextSession: WorkoutSession) => {
      setDraftSession(nextSession);
      setSessionDirty(false);
      await saveSessionForActive(nextSession);
    },
    [saveSessionForActive]
  );

  const updateDraftSession = useCallback((updater: (session: WorkoutSession) => WorkoutSession) => {
    setDraftSession((current) => {
      if (!current) {
        return current;
      }

      const nextSession = updater(current);
      setSessionDirty(true);
      return nextSession;
    });
  }, []);

  if (!draftSession || !currentTask || !activePlan || !exercise) {
    return (
      <Layout title="Active Workout" subtitle="No active session found.">
        <button type="button" className="btn" onClick={() => navigate('/today')}>
          Back to Today
        </button>
      </Layout>
    );
  }

  const day = activePlan.days.find((item) => item.id === draftSession.workoutDayId) ?? null;
  const progress = Math.round(((draftSession.currentTaskIndex + 1) / draftSession.tasks.length) * 100);
  const pendingTaskCount = getPendingTaskCount(draftSession);
  const previous = currentTask.previousPerformanceSummary ?? 'No previous performance for this movement yet.';
  const warmupBlocks = getWarmupBlocks(day?.focus ?? exercise.name);
  const currentDayOrder = day?.order ?? activeSettings?.activeWorkoutDayOrder ?? 1;
  const nextDayOrder = currentDayOrder >= activePlan.days.length ? 1 : currentDayOrder + 1;
  const usesCompletionToggle = exercise.targetType === 'noteOnly' || exercise.targetType === 'mobility';
  const blockDone = currentTask.setLogs.every((set) => set.completed && !set.skipped);
  const progressionHint = getProgressionHint(exercise, activeSessions.filter((item) => item.id !== draftSession.id));
  const currentTaskStatus = getTaskStatus(currentTask);

  const patchSet = (setIndex: number, patch: Partial<(typeof currentTask.setLogs)[number]>) => {
    updateDraftSession((session) => updateTaskSetLog(session, currentTask.id, setIndex, patch));
  };

  const completeWorkout = async () => {
    if (pendingTaskCount > 0) {
      const confirmed = window.confirm('Finish workout and mark the remaining pending tasks as skipped?');
      if (!confirmed) {
        return;
      }
    }

    const completedSession = completeWorkoutSession(draftSession);
    await flushSession(completedSession);
    await saveCheckInForActive({
      id: sessionCheckIn?.id ?? crypto.randomUUID(),
      date: completedSession.date,
      checkedIn: true,
      planned: sessionCheckIn?.planned ?? true,
      completed: true,
      missedReason: undefined,
      missedNote: undefined,
      readiness: completedSession.readiness,
      readinessSuggestion: completedSession.readinessSuggestion
    });
    await updateActiveSettings({ activeWorkoutDayOrder: nextDayOrder });
    navigate('/summary');
  };

  return (
    <Layout title="Active Workout" subtitle={`${draftSession.currentTaskIndex + 1} of ${draftSession.tasks.length} tasks`}>
      <section className="card space-y-3">
        <div className="flex items-center justify-between">
          <span className="section-title">Progress</span>
          <span className="metric-chip">{progress}%</span>
        </div>
        <div className="h-2 rounded-full bg-slate-200 dark:bg-slate-800">
          <div className="h-full rounded-full bg-brand-500" style={{ width: `${progress}%` }} />
        </div>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          Autosaves locally after short pauses and reopens this exact checkpoint if you leave.
        </p>
      </section>

      <section className="card space-y-4">
        <ExerciseMedia exercise={exercise} />

        <div className="flex items-start justify-between gap-3">
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
          <span className="metric-chip">{currentTaskStatus}</span>
        </div>

        <p className="rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-900/40">
          {previous}
        </p>
        {progressionHint ? (
          <p className="rounded-2xl border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-900 dark:border-emerald-900/40 dark:bg-emerald-950/30 dark:text-emerald-100">
            {progressionHint}
          </p>
        ) : null}

        {exercise.notes || currentTask.coachingCues?.length ? (
          <div className="rounded-2xl border border-slate-200 bg-slate-50 px-3 py-3 text-sm dark:border-slate-700 dark:bg-slate-900/40">
            {exercise.notes ? <p>{exercise.notes}</p> : null}
            {currentTask.coachingCues?.length ? (
              <div className="mt-3 flex flex-wrap gap-2">
                {currentTask.coachingCues.map((cue) => (
                  <span key={cue} className="metric-chip">
                    {cue}
                  </span>
                ))}
              </div>
            ) : null}
          </div>
        ) : null}

        {exercise.category === 'warmup' ? (
          <div className="rounded-2xl border border-brand-200 bg-brand-50/70 px-3 py-3 text-sm dark:border-brand-900/40 dark:bg-brand-950/20">
            <p className="font-semibold">Warm-up details</p>
            <p className="mt-1 text-slate-600 dark:text-slate-300">{getWarmupSummary(day?.focus ?? exercise.name)}</p>
            <div className="mt-3 space-y-2">
              {warmupBlocks.map((block) => (
                <p key={block.title}>
                  <span className="font-medium">{block.title}:</span> {block.detail}
                </p>
              ))}
            </div>
          </div>
        ) : null}

        {usesCompletionToggle ? (
          <div className="rounded-2xl border border-slate-200 p-3 dark:border-slate-700">
            <p className="font-semibold">Completion</p>
            <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
              For warm-up and movement-prep blocks, confirm completion and add any useful note.
            </p>
            <button
              type="button"
              className="btn mt-3 w-full"
              onClick={() => updateDraftSession((session) => toggleTaskCompletionBlock(session, currentTask.id, !blockDone))}
            >
              {blockDone ? 'Mark block incomplete' : 'Mark block done'}
            </button>
          </div>
        ) : (
          currentTask.setLogs.map((set) => (
            <div key={set.id} className="rounded-2xl border border-slate-200 p-3 dark:border-slate-700">
              <div className="flex items-center justify-between gap-3">
                <p className="font-semibold">Set {set.setIndex + 1}</p>
                <span className="text-xs text-slate-500">{set.skipped ? 'Skipped' : set.completed ? 'Logged' : 'Pending'}</span>
              </div>
              <div className={`mt-2 grid gap-2 ${exercise.targetType === 'weightedReps' ? 'grid-cols-2' : 'grid-cols-1'}`}>
                {exercise.targetType === 'weightedReps' || exercise.targetType === 'bodyweightReps' ? (
                  <input
                    className="input"
                    type="number"
                    placeholder={exercise.defaultRepRange ? `${exercise.defaultRepRange.min}` : 'Reps'}
                    value={set.reps ?? ''}
                    onChange={(event) => patchSet(set.setIndex, { reps: Number(event.target.value) || undefined })}
                  />
                ) : null}
                {exercise.targetType === 'weightedReps' ? (
                  <input
                    className="input"
                    type="number"
                    placeholder="Weight kg"
                    value={set.weightKg ?? ''}
                    onChange={(event) => patchSet(set.setIndex, { weightKg: Number(event.target.value) || undefined })}
                  />
                ) : null}
                {exercise.targetType === 'holdDuration' ? (
                  <input
                    className="input"
                    type="number"
                    placeholder={exercise.defaultHoldSeconds ? `${exercise.defaultHoldSeconds}` : 'Hold sec'}
                    value={set.holdSeconds ?? ''}
                    onChange={(event) => patchSet(set.setIndex, { holdSeconds: Number(event.target.value) || undefined })}
                  />
                ) : null}
              </div>
            </div>
          ))
        )}

        <textarea
          className="input min-h-[88px]"
          placeholder="Task notes or coaching notes"
          value={currentTask.taskNote ?? ''}
          onChange={(event) => updateDraftSession((session) => updateTaskNote(session, currentTask.id, event.target.value))}
        />

        <div className="grid grid-cols-3 gap-2">
          <button
            type="button"
            className="btn-secondary"
            onClick={() => void flushSession(moveTaskIndex(draftSession, -1))}
            disabled={draftSession.currentTaskIndex === 0}
          >
            Back
          </button>
          <button
            type="button"
            className="btn-secondary"
            onClick={() => void flushSession(skipTask(draftSession, currentTask.id))}
          >
            Skip
          </button>
          {draftSession.currentTaskIndex === draftSession.tasks.length - 1 ? (
            <button type="button" className="btn" onClick={() => void completeWorkout()}>
              Finish
            </button>
          ) : (
            <button type="button" className="btn" onClick={() => void flushSession(moveTaskIndex(draftSession, 1))}>
              Next
            </button>
          )}
        </div>
      </section>
    </Layout>
  );
}
