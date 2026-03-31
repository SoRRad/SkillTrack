/*
import { Layout } from '../../components/Layout';
<<<<<<< ours
import { useWorkoutPlan } from '../../hooks/useWorkoutPlan';

function targetLabel(
  targetType: string,
  sets: number,
  repRange?: { min: number; max: number },
  holdSec?: number
): string {
  switch (targetType) {
    case 'weightedReps':
      return repRange ? `${sets}× ${repRange.min}–${repRange.max} reps` : `${sets} sets`;
    case 'bodyweightReps':
      return repRange ? `${sets}× ${repRange.min}–${repRange.max} reps` : `${sets} sets`;
    case 'holdDuration':
      return holdSec ? `${sets}× ~${holdSec}s hold` : `${sets} holds`;
    case 'mobility':
      return `${sets} rounds`;
    case 'noteOnly':
      return 'Notes / prep';
    default:
      return `${sets} sets`;
  }
}

export function ProgramPage() {
  const { plan } = useWorkoutPlan();
  if (!plan) return null;

  return (
    <Layout title="Program" subtitle="3-day rotation — edit later in backup or v2 editor">
      {plan.days.map((day) => (
        <section key={day.id} className="card space-y-3">
          <div>
            <h2 className="text-lg font-semibold">{day.name}</h2>
            <p className="text-sm text-slate-500 dark:text-slate-400">{day.focus}</p>
          </div>
          <ol className="space-y-3">
            {day.exerciseIds.map((id, index) => {
              const exercise = plan.exerciseTemplates.find((item) => item.id === id);
              if (!exercise) return null;
              return (
                <li key={id} className="rounded-lg border border-slate-200 p-3 dark:border-slate-700">
                  <p className="text-xs font-medium text-slate-500 dark:text-slate-400">
                    {index + 1}. {exercise.category}
                    {exercise.isSkill ? ' · skill' : ''}
                  </p>
                  <p className="font-medium">{exercise.name}</p>
                  <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">
                    {targetLabel(exercise.targetType, exercise.defaultSets, exercise.defaultRepRange, exercise.defaultHoldSeconds)}
                    {exercise.restSeconds ? ` · rest ${exercise.restSeconds}s` : ''}
                  </p>
                  {exercise.progressionTag && (
                    <p className="mt-1 text-xs text-brand-700 dark:text-brand-400">Progression: {exercise.progressionTag}</p>
                  )}
                  {exercise.notes && <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">{exercise.notes}</p>}
                  {exercise.substitutions?.length ? (
                    <p className="mt-1 text-xs text-slate-500">Subs: {exercise.substitutions.join(', ')}</p>
                  ) : null}
=======
import { useAppState } from '../../store/AppContext';

export function ProgramPage() {
  const { plan } = useAppState();

  return (
    <Layout title="Program">
      {plan.days.map((day) => (
        <section key={day.id} className="card space-y-2">
          <h2 className="font-semibold">{day.name}</h2>
          <p className="text-sm text-slate-500">{day.focus}</p>
          <ol className="list-decimal space-y-1 pl-5 text-sm">
            {day.exerciseIds.map((id) => {
              const exercise = plan.exerciseTemplates.find((item) => item.id === id);
              if (!exercise) return null;
              return (
                <li key={id}>
                  {exercise.name} — {exercise.defaultSets} sets{' '}
                  {exercise.defaultRepRange ? `(${exercise.defaultRepRange.min}-${exercise.defaultRepRange.max} reps)` : ''}
                  {exercise.defaultHoldSeconds ? `(${exercise.defaultHoldSeconds}s)` : ''}
                  {exercise.progressionTag ? ` • ${exercise.progressionTag}` : ''}
>>>>>>> theirs
                </li>
              );
            })}
          </ol>
        </section>
      ))}
    </Layout>
  );
}
*/

import { Layout } from '../../components/Layout';
import { useWorkoutPlan } from '../../hooks/useWorkoutPlan';

function targetLabel(sets: number, repRange?: { min: number; max: number }, holdSeconds?: number) {
  if (repRange) return `${sets} x ${repRange.min}-${repRange.max} reps`;
  if (holdSeconds) return `${sets} x ${holdSeconds}s hold`;
  return `${sets} sets`;
}

export function ProgramPage() {
  const { plan } = useWorkoutPlan();
  if (!plan) return null;

  return (
    <Layout title="Program" subtitle="Rule-based local plan generated from onboarding, goals, equipment, and history.">
      {plan.days.map((day) => (
        <section key={day.id} className="card space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="section-title">{day.phase}</p>
              <h2 className="mt-2 text-xl font-bold">{day.name}</h2>
              <p className="text-sm text-slate-600 dark:text-slate-300">{day.focus}</p>
            </div>
            <span className="metric-chip">{day.durationMinutes} min</span>
          </div>
          {day.notes?.map((note) => (
            <p key={note} className="text-sm text-slate-600 dark:text-slate-300">{note}</p>
          ))}
          <div className="space-y-2">
            {day.exerciseIds.map((exerciseId, index) => {
              const exercise = plan.exerciseTemplates.find((item) => item.id === exerciseId);
              if (!exercise) return null;
              return (
                <article key={exerciseId} className="rounded-2xl border border-slate-200 p-3 dark:border-slate-700">
                  <p className="section-title">{index + 1}. {exercise.category}</p>
                  <h3 className="mt-1 font-semibold">{exercise.name}</h3>
                  <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">
                    {targetLabel(exercise.defaultSets, exercise.defaultRepRange, exercise.defaultHoldSeconds)}
                    {exercise.restSeconds ? ` | rest ${exercise.restSeconds}s` : ''}
                  </p>
                  {exercise.notes ? <p className="mt-2 text-sm text-slate-500">{exercise.notes}</p> : null}
                  {exercise.substitutions?.length ? <p className="mt-2 text-xs text-slate-500">Substitutions: {exercise.substitutions.join(', ')}</p> : null}
                </article>
              );
            })}
          </div>
        </section>
      ))}
    </Layout>
  );
}
