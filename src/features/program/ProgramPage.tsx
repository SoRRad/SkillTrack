import { Layout } from '../../components/Layout';
import { useWorkoutPlan } from '../../hooks/useWorkoutPlan';
import { getWarmupBlocks, getWarmupSummary } from '../../lib/warmup';

function targetLabel(sets: number, repRange?: { min: number; max: number }, holdSeconds?: number) {
  if (repRange) return `${sets} x ${repRange.min}-${repRange.max} reps`;
  if (holdSeconds) return `${sets} x ${holdSeconds}s hold`;
  return `${sets} sets`;
}

export function ProgramPage() {
  const { plan } = useWorkoutPlan();
  if (!plan) return null;

  return (
    <Layout title="Plan" subtitle="Rule-based local plan generated from onboarding, goals, equipment, limitations, and saved progress.">
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
            <p key={note} className="text-sm text-slate-600 dark:text-slate-300">
              {note}
            </p>
          ))}
          <div className="space-y-2">
            {day.exerciseIds.map((exerciseId, index) => {
              const exercise = plan.exerciseTemplates.find((item) => item.id === exerciseId);
              if (!exercise) return null;
              return (
                <article key={`${day.id}-${exerciseId}-${index}`} className="rounded-2xl border border-slate-200 p-3 dark:border-slate-700">
                  <p className="section-title">
                    {index + 1}. {exercise.category}
                  </p>
                  <h3 className="mt-1 font-semibold">{exercise.name}</h3>
                  <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">
                    {targetLabel(exercise.defaultSets, exercise.defaultRepRange, exercise.defaultHoldSeconds)}
                    {exercise.restSeconds ? ` | rest ${exercise.restSeconds}s` : ''}
                  </p>
                  {exercise.notes ? <p className="mt-2 text-sm text-slate-500">{exercise.notes}</p> : null}
                  {exercise.category === 'warmup' ? (
                    <div className="mt-3 space-y-2 rounded-2xl border border-brand-200 bg-brand-50/70 p-3 dark:border-brand-900/40 dark:bg-brand-950/20">
                      <p className="font-semibold">Warm-up flow</p>
                      <p className="text-sm text-slate-600 dark:text-slate-300">{getWarmupSummary(day.focus)}</p>
                      {getWarmupBlocks(day.focus).map((block) => (
                        <p key={block.title} className="text-sm">
                          <span className="font-medium">{block.title}:</span> {block.detail}
                        </p>
                      ))}
                    </div>
                  ) : null}
                  {exercise.coachingCues?.length ? (
                    <div className="mt-2 flex flex-wrap gap-2">
                      {exercise.coachingCues.map((cue) => (
                        <span key={cue} className="metric-chip">
                          {cue}
                        </span>
                      ))}
                    </div>
                  ) : null}
                  {exercise.substitutions?.length ? (
                    <p className="mt-2 text-xs text-slate-500">Substitutions: {exercise.substitutions.join(', ')}</p>
                  ) : null}
                </article>
              );
            })}
          </div>
        </section>
      ))}
    </Layout>
  );
}
