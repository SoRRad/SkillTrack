import { Layout } from '../../components/Layout';
import { useAppState } from '../../store/AppContext';

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
  const { plan } = useAppState();

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
                </li>
              );
            })}
          </ol>
        </section>
      ))}
    </Layout>
  );
}
