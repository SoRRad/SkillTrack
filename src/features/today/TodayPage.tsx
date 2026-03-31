import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Layout } from '../../components/Layout';
import { useWorkoutPlan } from '../../hooks/useWorkoutPlan';
import { getReadinessSuggestion } from '../../lib/coach/recommendations';
import { isoDate } from '../../lib/date';
import { buildWorkoutSession } from '../../lib/workoutSession';
import { getWarmupBlocks, getWarmupSummary } from '../../lib/warmup';
import { useAppState } from '../../store/AppContext';

export function TodayPage() {
  const { activeDay, nextDay } = useWorkoutPlan();
  const { activePlan, activeSessions, activeCheckIns, saveCheckInForActive, saveSessionForActive } = useAppState();
  const navigate = useNavigate();
  const [readiness, setReadiness] = useState({
    energy: 3 as 1 | 2 | 3 | 4 | 5,
    soreness: 3 as 1 | 2 | 3 | 4 | 5,
    sleepQuality: 3 as 1 | 2 | 3 | 4 | 5,
    motivation: 3 as 1 | 2 | 3 | 4 | 5
  });
  const today = isoDate();

  const todayCheckIn = activeCheckIns.find((item) => item.date === today);
  const inProgress = activeSessions.find((session) => session.status === 'inProgress');
  const sessionDay = inProgress ? activePlan?.days.find((day) => day.id === inProgress.workoutDayId) ?? null : null;
  const displayDay = sessionDay ?? activeDay;
  const currentCheckpoint = inProgress ? inProgress.tasks[inProgress.currentTaskIndex] : null;
  const checkpointExercise =
    currentCheckpoint && activePlan
      ? activePlan.exerciseTemplates.find((item) => item.id === currentCheckpoint.exerciseId) ?? null
      : null;
  const readinessSuggestion = useMemo(() => getReadinessSuggestion(readiness), [readiness]);
  const warmupBlocks = useMemo(() => (displayDay ? getWarmupBlocks(displayDay.focus) : []), [displayDay]);

  useEffect(() => {
    if (todayCheckIn?.readiness) {
      setReadiness(todayCheckIn.readiness);
    }
  }, [todayCheckIn?.id, todayCheckIn?.readiness]);

  if (!activePlan || !displayDay) {
    return null;
  }

  return (
    <Layout title="Today Workout" subtitle="Check in, review the warm-up and session focus, then continue from the saved checkpoint or launch today's workout.">
      <section className="card space-y-3">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="section-title">{inProgress ? 'Saved checkpoint' : "Today's workout"}</p>
            <h2 className="text-xl font-bold">{displayDay.name}</h2>
            <p className="text-sm text-slate-600 dark:text-slate-300">{displayDay.focus}</p>
          </div>
          <span className="metric-chip">{displayDay.durationMinutes} min</span>
        </div>
        <p className="text-sm text-slate-500">
          {inProgress
            ? `Resume at ${checkpointExercise?.name ?? 'the next task'} | step ${inProgress.currentTaskIndex + 1} of ${inProgress.tasks.length}`
            : `Next up after this: ${nextDay?.name ?? displayDay.name}`}
        </p>
      </section>

      <section className="card space-y-3">
        <div className="flex items-center justify-between gap-3">
          <h2 className="font-semibold">Warm-up details</h2>
          <span className="metric-chip">8-12 min</span>
        </div>
        <p className="text-sm text-slate-600 dark:text-slate-300">{getWarmupSummary(displayDay.focus)}</p>
        <div className="space-y-2">
          {warmupBlocks.map((block) => (
            <div key={block.title} className="rounded-2xl border border-slate-200 p-3 text-sm dark:border-slate-700">
              <p className="font-semibold">{block.title}</p>
              <p className="mt-1 text-slate-600 dark:text-slate-300">{block.detail}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="card space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="font-semibold">Daily check-in</h2>
          <span className="metric-chip">{todayCheckIn?.checkedIn ? 'Saved today' : 'Needed today'}</span>
        </div>
        {(['energy', 'soreness', 'sleepQuality', 'motivation'] as const).map((field) => (
          <label key={field} className="block">
            <span className="section-title">{field}</span>
            <input
              className="input mt-2"
              type="number"
              min={1}
              max={5}
              value={readiness[field]}
              onChange={(event) => setReadiness({ ...readiness, [field]: Number(event.target.value) as 1 | 2 | 3 | 4 | 5 })}
            />
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
        <p className="text-sm text-slate-600 dark:text-slate-300">
          The active session opens one task at a time and saves each step as you move forward.
        </p>
        <button
          type="button"
          className="btn w-full"
          onClick={async () => {
            if (inProgress) {
              navigate('/workout');
              return;
            }

            const fallbackCheckIn = {
              id: crypto.randomUUID(),
              userId: activePlan.userId,
              date: today,
              checkedIn: true,
              planned: true,
              completed: false,
              readiness,
              readinessSuggestion
            };
            const session = buildWorkoutSession({
              userId: activePlan.userId,
              plan: activePlan,
              day: displayDay,
              priorSessions: activeSessions,
              checkIn: todayCheckIn ?? fallbackCheckIn
            });

            if (!todayCheckIn) {
              await saveCheckInForActive(fallbackCheckIn);
            }
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
