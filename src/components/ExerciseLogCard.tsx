import type { ExerciseSetLog, ExerciseTemplate } from '../types/models';

const emptyRow = (exerciseId: string, setIndex: number): ExerciseSetLog => ({
  id: '',
  exerciseId,
  setIndex,
  completed: false
});

const rpeOptions = [6, 7, 8, 9, 10] as const;

function getSetsForExercise(logs: ExerciseSetLog[], exerciseId: string): ExerciseSetLog[] {
  return logs
    .filter((l) => l.exerciseId === exerciseId)
    .sort((a, b) => a.setIndex - b.setIndex);
}

export function ExerciseLogCard({
  exercise,
  allLogs,
  onPatchSet,
  onSkipExercise,
  previousLine,
  bestWeightLine,
  exerciseNote,
  onExerciseNoteChange,
  progressionHint
}: {
  exercise: ExerciseTemplate;
  allLogs: ExerciseSetLog[];
  onPatchSet: (setIndex: number, patch: Partial<ExerciseSetLog>) => void;
  onSkipExercise: () => void;
  previousLine: string | null;
  bestWeightLine: string | null;
  exerciseNote: string;
  onExerciseNoteChange: (value: string) => void;
  progressionHint: string | null;
}) {
  const sets = getSetsForExercise(allLogs, exercise.id);
  const targetSummary =
    exercise.targetType === 'holdDuration' && exercise.defaultHoldSeconds
      ? `${exercise.defaultSets}× ~${exercise.defaultHoldSeconds}s hold`
      : exercise.targetType === 'weightedReps' && exercise.defaultRepRange
        ? `${exercise.defaultSets}× ${exercise.defaultRepRange.min}–${exercise.defaultRepRange.max} reps`
        : exercise.targetType === 'bodyweightReps' && exercise.defaultRepRange
          ? `${exercise.defaultSets}× ${exercise.defaultRepRange.min}–${exercise.defaultRepRange.max} reps`
          : exercise.targetType === 'mobility'
            ? `${exercise.defaultSets} rounds / feel`
            : `${exercise.defaultSets} block`;

  const isSkipped = sets.some((s) => s.skipped);

  return (
    <article className="card space-y-3">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div>
          <h3 className="font-semibold leading-snug">{exercise.name}</h3>
          <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
            {targetSummary}
            {exercise.restSeconds ? ` · rest ${exercise.restSeconds}s` : ''}
            {exercise.progressionTag ? ` · ${exercise.progressionTag}` : ''}
          </p>
        </div>
        {exercise.category !== 'warmup' && (
          <button type="button" className="btn-secondary shrink-0 text-xs" onClick={onSkipExercise} disabled={isSkipped}>
            {isSkipped ? 'Skipped' : 'Skip'}
          </button>
        )}
      </div>

      {exercise.notes && <p className="text-sm text-slate-600 dark:text-slate-300">{exercise.notes}</p>}

      {previousLine && <p className="rounded-lg bg-slate-100 px-3 py-2 text-xs text-slate-700 dark:bg-slate-800 dark:text-slate-200">{previousLine}</p>}
      {bestWeightLine && exercise.targetType === 'weightedReps' && (
        <p className="text-xs font-medium text-brand-600 dark:text-brand-400">{bestWeightLine}</p>
      )}

      {Array.from({ length: exercise.defaultSets }).map((_, setIndex) => {
        const row = (sets.find((s) => s.setIndex === setIndex) ?? emptyRow(exercise.id, setIndex)) as ExerciseSetLog;
        const done = row.completed && !row.skipped;

        return (
          <div
            key={setIndex}
            className={`rounded-lg border p-3 ${
              row.skipped
                ? 'border-amber-200 bg-amber-50/80 dark:border-amber-900/50 dark:bg-amber-950/30'
                : done
                  ? 'border-emerald-200 bg-emerald-50/80 dark:border-emerald-900/50 dark:bg-emerald-950/30'
                  : 'border-slate-200 dark:border-slate-700'
            }`}
          >
            <div className="mb-2 flex items-center justify-between gap-2">
              <span className="text-xs font-medium text-slate-500">Set {setIndex + 1}</span>
              <button
                type="button"
                role="switch"
                aria-checked={done}
                className={`rounded-full px-3 py-1 text-xs font-medium transition ${
                  done ? 'bg-emerald-600 text-white' : 'bg-slate-200 text-slate-700 dark:bg-slate-700 dark:text-slate-200'
                }`}
                onClick={() => onPatchSet(setIndex, { completed: !done, skipped: false })}
              >
                {done ? 'Done' : 'Mark done'}
              </button>
            </div>

            {exercise.targetType === 'weightedReps' && (
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                <label className="text-xs text-slate-500">
                  Reps
                  <input
                    className="input mt-1"
                    type="number"
                    inputMode="decimal"
                    disabled={row.skipped}
                    value={row.reps ?? ''}
                    placeholder="—"
                    onChange={(e) => onPatchSet(setIndex, { reps: Number(e.target.value) || undefined })}
                  />
                </label>
                <label className="text-xs text-slate-500">
                  Weight (kg)
                  <input
                    className="input mt-1"
                    type="number"
                    inputMode="decimal"
                    disabled={row.skipped}
                    value={row.weightKg ?? ''}
                    placeholder="—"
                    onChange={(e) => onPatchSet(setIndex, { weightKg: Number(e.target.value) || undefined })}
                  />
                </label>
                <div className="col-span-2 sm:col-span-2">
                  <span className="text-xs text-slate-500">RPE (tap)</span>
                  <div className="mt-1 flex flex-wrap gap-1">
                    {rpeOptions.map((n) => (
                      <button
                        key={n}
                        type="button"
                        className={`rounded-md px-2 py-1 text-xs font-medium ${
                          row.rpe === n ? 'bg-brand-500 text-white' : 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-200'
                        }`}
                        disabled={row.skipped}
                        onClick={() => onPatchSet(setIndex, { rpe: n })}
                      >
                        {n}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {exercise.targetType === 'bodyweightReps' && (
              <div className="grid grid-cols-2 gap-2">
                <label className="text-xs text-slate-500">
                  Reps
                  <input
                    className="input mt-1"
                    type="number"
                    disabled={row.skipped}
                    value={row.reps ?? ''}
                    placeholder="—"
                    onChange={(e) => onPatchSet(setIndex, { reps: Number(e.target.value) || undefined })}
                  />
                </label>
                <div>
                  <span className="text-xs text-slate-500">RPE</span>
                  <div className="mt-1 flex flex-wrap gap-1">
                    {rpeOptions.map((n) => (
                      <button
                        key={n}
                        type="button"
                        className={`rounded-md px-2 py-1 text-xs font-medium ${
                          row.rpe === n ? 'bg-brand-500 text-white' : 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-200'
                        }`}
                        disabled={row.skipped}
                        onClick={() => onPatchSet(setIndex, { rpe: n })}
                      >
                        {n}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {exercise.targetType === 'holdDuration' && (
              <div className="grid grid-cols-2 gap-2">
                <label className="text-xs text-slate-500">
                  Hold (seconds)
                  <input
                    className="input mt-1"
                    type="number"
                    disabled={row.skipped}
                    value={row.holdSeconds ?? ''}
                    placeholder={`~${exercise.defaultHoldSeconds ?? '—'}`}
                    onChange={(e) => onPatchSet(setIndex, { holdSeconds: Number(e.target.value) || undefined })}
                  />
                </label>
                <div>
                  <span className="text-xs text-slate-500">RPE</span>
                  <div className="mt-1 flex flex-wrap gap-1">
                    {rpeOptions.map((n) => (
                      <button
                        key={n}
                        type="button"
                        className={`rounded-md px-2 py-1 text-xs font-medium ${
                          row.rpe === n ? 'bg-brand-500 text-white' : 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-200'
                        }`}
                        disabled={row.skipped}
                        onClick={() => onPatchSet(setIndex, { rpe: n })}
                      >
                        {n}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {exercise.targetType === 'mobility' && (
              <div className="grid grid-cols-2 gap-2">
                <label className="text-xs text-slate-500">
                  Reps / duration (optional)
                  <input
                    className="input mt-1"
                    type="number"
                    disabled={row.skipped}
                    value={row.reps ?? ''}
                    placeholder="—"
                    onChange={(e) => onPatchSet(setIndex, { reps: Number(e.target.value) || undefined })}
                  />
                </label>
                <label className="text-xs text-slate-500">
                  Seconds (optional)
                  <input
                    className="input mt-1"
                    type="number"
                    disabled={row.skipped}
                    value={row.holdSeconds ?? ''}
                    placeholder="—"
                    onChange={(e) => onPatchSet(setIndex, { holdSeconds: Number(e.target.value) || undefined })}
                  />
                </label>
              </div>
            )}

            {exercise.targetType === 'noteOnly' && (
              <p className="text-xs text-slate-500">Use the note below when you’re done with this block.</p>
            )}
          </div>
        );
      })}

      <div className="space-y-2 border-t border-slate-200 pt-3 dark:border-slate-700">
        <label className="block text-xs font-medium text-slate-500">Exercise note</label>
        <textarea
          className="input"
          placeholder="Technique, pain, substitutions…"
          value={exerciseNote}
          onChange={(e) => onExerciseNoteChange(e.target.value)}
        />
        {progressionHint && (
          <p className="rounded-md bg-emerald-100 p-2 text-xs text-emerald-900 dark:bg-emerald-950 dark:text-emerald-200">
            {progressionHint}
          </p>
        )}
      </div>
    </article>
  );
}
