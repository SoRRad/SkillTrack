import type { ExerciseSetLog, ExerciseTemplate } from '../types/models';
import { ExerciseArtwork } from './exerciseArt/ExerciseArtwork';
import { getExerciseTheme, getExerciseVisual } from '../data/exerciseVisuals';
import { NumberStepper, QuickChips } from './NumberStepper';

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

function loggingCaption(exercise: ExerciseTemplate): string {
  switch (exercise.targetType) {
    case 'weightedReps':
      return 'Strength · load & reps';
    case 'bodyweightReps':
      return 'Bodyweight · reps';
    case 'holdDuration':
      return 'Isometric · hold';
    case 'mobility':
      return 'Mobility · feel';
    case 'noteOnly':
      return 'Warm-up · notes';
    default:
      return 'Training block';
  }
}

function holdQuickSeconds(target?: number): number[] {
  if (target == null) return [10, 15, 20, 30, 45];
  const base = [target - 5, target, target + 5, target + 10, target + 20].filter((n) => n > 0);
  return [...new Set(base)].sort((a, b) => a - b).slice(0, 6);
}

function repQuickValues(exercise: ExerciseTemplate): number[] | null {
  const r = exercise.defaultRepRange;
  if (!r) return null;
  const mid = Math.round((r.min + r.max) / 2);
  return [...new Set([r.min, mid, r.max])].sort((a, b) => a - b);
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
  const visualId = getExerciseVisual(exercise.id);
  const artTheme = getExerciseTheme(exercise.id);

  const targetSummary =
    exercise.targetType === 'holdDuration' && exercise.defaultHoldSeconds
      ? `${exercise.defaultSets}× ~${exercise.defaultHoldSeconds}s hold`
      : exercise.targetType === 'weightedReps' && exercise.defaultRepRange
        ? `${exercise.defaultSets}× ${exercise.defaultRepRange.min}–${exercise.defaultRepRange.max} reps`
        : exercise.targetType === 'bodyweightReps' && exercise.defaultRepRange
          ? `${exercise.defaultSets}× ${exercise.defaultRepRange.min}–${exercise.defaultRepRange.max} reps`
          : exercise.targetType === 'mobility'
            ? `${exercise.defaultSets} rounds`
            : `${exercise.defaultSets} block`;

  const isSkipped = sets.some((s) => s.skipped);
  const repPresets = repQuickValues(exercise);

  return (
    <article className="card space-y-4 overflow-hidden">
      <ExerciseArtwork visualId={visualId} meshClass={`bg-gradient-to-br ${artTheme.mesh}`} caption={loggingCaption(exercise)} />

      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <p className={`text-[11px] font-semibold uppercase tracking-wider ${artTheme.accent}`}>
            {exercise.progressionTag ?? exercise.category}
          </p>
          <h3 className="mt-1 text-lg font-bold leading-snug tracking-tight">{exercise.name}</h3>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            {targetSummary}
            {exercise.restSeconds ? ` · rest ${exercise.restSeconds}s` : ''}
          </p>
        </div>
        {exercise.category !== 'warmup' && (
          <button
            type="button"
            className="btn-secondary shrink-0 px-4 py-2 text-xs font-semibold"
            onClick={onSkipExercise}
            disabled={isSkipped}
          >
            {isSkipped ? 'Skipped' : 'Skip'}
          </button>
        )}
      </div>

      {exercise.notes && (
        <p className="rounded-xl border border-slate-200/80 bg-slate-50/80 px-3 py-2 text-sm text-slate-600 dark:border-slate-700 dark:bg-slate-800/50 dark:text-slate-300">
          {exercise.notes}
        </p>
      )}

      {previousLine && (
        <p className="rounded-xl border border-slate-200/80 bg-white px-3 py-2 text-xs font-medium text-slate-700 dark:border-slate-700 dark:bg-slate-900/60 dark:text-slate-200">
          {previousLine}
        </p>
      )}
      {bestWeightLine && exercise.targetType === 'weightedReps' && (
        <p className="text-xs font-semibold text-brand-700 dark:text-brand-400">{bestWeightLine}</p>
      )}

      {Array.from({ length: exercise.defaultSets }).map((_, setIndex) => {
        const row = (sets.find((s) => s.setIndex === setIndex) ?? emptyRow(exercise.id, setIndex)) as ExerciseSetLog;
        const done = row.completed && !row.skipped;

        return (
          <div
            key={setIndex}
            className={`space-y-3 rounded-2xl border p-4 transition ${
              row.skipped
                ? 'border-amber-300/80 bg-amber-50/90 dark:border-amber-800/60 dark:bg-amber-950/35'
                : done
                  ? 'border-emerald-300/90 bg-emerald-50/90 dark:border-emerald-800/50 dark:bg-emerald-950/30'
                  : 'border-slate-200/90 bg-white/60 dark:border-slate-700/80 dark:bg-slate-900/40'
            }`}
          >
            <div className="flex flex-wrap items-center justify-between gap-2">
              <span className="text-sm font-semibold text-slate-600 dark:text-slate-300">Set {setIndex + 1}</span>
              <button
                type="button"
                role="switch"
                aria-checked={done}
                className={`tap-target rounded-full px-4 py-2 text-sm font-semibold transition ${
                  done ? 'bg-emerald-600 text-white shadow-md' : 'card-muted text-slate-700 dark:text-slate-200'
                }`}
                onClick={() => onPatchSet(setIndex, { completed: !done, skipped: false })}
              >
                {done ? 'Done ✓' : 'Mark done'}
              </button>
            </div>

            {exercise.targetType === 'weightedReps' && (
              <div className="space-y-3">
                <div>
                  <p className="mb-2 text-xs font-medium uppercase tracking-wide text-slate-500">Reps</p>
                  <NumberStepper
                    value={row.reps}
                    onChange={(v) => onPatchSet(setIndex, { reps: v })}
                    min={0}
                    disabled={row.skipped}
                  />
                  {exercise.defaultRepRange && repPresets && (
                    <div className="mt-2">
                      <p className="mb-1 text-[10px] font-medium uppercase text-slate-400">Target zone</p>
                      <QuickChips
                        values={repPresets}
                        active={row.reps}
                        disabled={row.skipped}
                        onPick={(n) => onPatchSet(setIndex, { reps: n })}
                      />
                    </div>
                  )}
                </div>
                <div>
                  <p className="mb-2 text-xs font-medium uppercase tracking-wide text-slate-500">Weight (kg)</p>
                  <NumberStepper
                    value={row.weightKg}
                    onChange={(v) => onPatchSet(setIndex, { weightKg: v })}
                    step={2.5}
                    min={0}
                    disabled={row.skipped}
                    suffix="kg"
                  />
                  <div className="mt-2 flex flex-wrap gap-2">
                    {[-5, -2.5, 2.5, 5].map((delta) => (
                      <button
                        key={delta}
                        type="button"
                        disabled={row.skipped}
                        className="tap-target rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-semibold dark:border-slate-600 dark:bg-slate-800"
                        onClick={() => {
                          const base = row.weightKg ?? 0;
                          onPatchSet(setIndex, { weightKg: Math.max(0, Math.round((base + delta) * 10) / 10) });
                        }}
                      >
                        {delta > 0 ? '+' : ''}
                        {delta} kg
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <p className="mb-2 text-xs font-medium uppercase tracking-wide text-slate-500">RPE</p>
                  <div className="flex flex-wrap gap-2">
                    {rpeOptions.map((n) => (
                      <button
                        key={n}
                        type="button"
                        className={`tap-target min-h-[44px] min-w-[44px] rounded-xl px-3 text-sm font-bold ${
                          row.rpe === n
                            ? 'bg-brand-600 text-white shadow-md dark:bg-brand-500'
                            : 'card-muted text-slate-800 dark:text-slate-100'
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
              <div className="space-y-3">
                <div>
                  <p className="mb-2 text-xs font-medium uppercase tracking-wide text-slate-500">Reps</p>
                  <NumberStepper
                    value={row.reps}
                    onChange={(v) => onPatchSet(setIndex, { reps: v })}
                    min={0}
                    disabled={row.skipped}
                  />
                  {repPresets && (
                    <div className="mt-2">
                      <p className="mb-1 text-[10px] font-medium uppercase text-slate-400">Quick pick</p>
                      <QuickChips
                        values={repPresets}
                        active={row.reps}
                        disabled={row.skipped}
                        onPick={(n) => onPatchSet(setIndex, { reps: n })}
                      />
                    </div>
                  )}
                </div>
                <div>
                  <p className="mb-2 text-xs font-medium uppercase tracking-wide text-slate-500">RPE</p>
                  <div className="flex flex-wrap gap-2">
                    {rpeOptions.map((n) => (
                      <button
                        key={n}
                        type="button"
                        className={`tap-target min-h-[44px] min-w-[44px] rounded-xl px-3 text-sm font-bold ${
                          row.rpe === n
                            ? 'bg-brand-600 text-white shadow-md dark:bg-brand-500'
                            : 'card-muted text-slate-800 dark:text-slate-100'
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
              <div className="space-y-3">
                <div className="flex items-center gap-2 rounded-xl card-muted px-3 py-2 text-xs text-slate-600 dark:text-slate-300">
                  <span className="relative inline-flex h-2 w-2">
                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-brand-400 opacity-60" />
                    <span className="relative inline-flex h-2 w-2 rounded-full bg-brand-500" />
                  </span>
                  Breathe steady — log your best honest hold time.
                </div>
                <div>
                  <p className="mb-2 text-xs font-medium uppercase tracking-wide text-slate-500">Hold (seconds)</p>
                  <NumberStepper
                    value={row.holdSeconds}
                    onChange={(v) => onPatchSet(setIndex, { holdSeconds: v })}
                    step={1}
                    min={0}
                    disabled={row.skipped}
                    suffix="s"
                  />
                  <div className="mt-2">
                    <p className="mb-1 text-[10px] font-medium uppercase text-slate-400">Quick seconds</p>
                    <QuickChips
                      values={holdQuickSeconds(exercise.defaultHoldSeconds)}
                      active={row.holdSeconds}
                      disabled={row.skipped}
                      onPick={(n) => onPatchSet(setIndex, { holdSeconds: n })}
                    />
                  </div>
                </div>
                <div>
                  <p className="mb-2 text-xs font-medium uppercase tracking-wide text-slate-500">Effort (RPE)</p>
                  <div className="flex flex-wrap gap-2">
                    {rpeOptions.map((n) => (
                      <button
                        key={n}
                        type="button"
                        className={`tap-target min-h-[44px] min-w-[44px] rounded-xl px-3 text-sm font-bold ${
                          row.rpe === n
                            ? 'bg-brand-600 text-white shadow-md dark:bg-brand-500'
                            : 'card-muted text-slate-800 dark:text-slate-100'
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
              <div className="space-y-3">
                <p className="text-sm text-slate-600 dark:text-slate-300">
                  Log how it felt — optional reps or seconds for structure.
                </p>
                <div className="grid gap-3 sm:grid-cols-2">
                  <div>
                    <p className="mb-2 text-xs font-medium uppercase tracking-wide text-slate-500">Reps (optional)</p>
                    <NumberStepper
                      value={row.reps}
                      onChange={(v) => onPatchSet(setIndex, { reps: v })}
                      min={0}
                      disabled={row.skipped}
                    />
                  </div>
                  <div>
                    <p className="mb-2 text-xs font-medium uppercase tracking-wide text-slate-500">Seconds (optional)</p>
                    <NumberStepper
                      value={row.holdSeconds}
                      onChange={(v) => onPatchSet(setIndex, { holdSeconds: v })}
                      min={0}
                      disabled={row.skipped}
                      suffix="s"
                    />
                  </div>
                </div>
                <div>
                  <p className="mb-2 text-xs font-medium uppercase tracking-wide text-slate-500">Quality (tap)</p>
                  <div className="flex flex-wrap gap-2">
                    {(
                      [
                        [1, 'Tight'],
                        [2, 'OK'],
                        [3, 'Good'],
                        [4, 'Smooth'],
                        [5, 'Great']
                      ] as const
                    ).map(([val, lab]) => (
                      <button
                        key={val}
                        type="button"
                        disabled={row.skipped}
                        className={`tap-target rounded-xl px-3 py-2 text-xs font-semibold ${
                          row.rpe === val
                            ? 'bg-brand-600 text-white dark:bg-brand-500'
                            : 'card-muted text-slate-800 dark:text-slate-100'
                        }`}
                        onClick={() => onPatchSet(setIndex, { rpe: val })}
                      >
                        {lab}
                      </button>
                    ))}
                  </div>
                  <p className="mt-1 text-[10px] text-slate-400">Maps to RPE field for history (1–5).</p>
                </div>
              </div>
            )}

            {exercise.targetType === 'noteOnly' && (
              <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50/80 p-4 dark:border-slate-600 dark:bg-slate-900/50">
                <p className="text-sm text-slate-600 dark:text-slate-300">
                  Check in after prep: anything stiff, sharp pain, or energy level? Use the exercise note below.
                </p>
              </div>
            )}
          </div>
        );
      })}

      <div className="space-y-2 border-t border-slate-200/80 pt-4 dark:border-slate-700/80">
        <label className="block text-xs font-semibold uppercase tracking-wide text-slate-500">Exercise note</label>
        <textarea
          className="input min-h-[88px] resize-y"
          placeholder="Technique, pain, substitutions…"
          value={exerciseNote}
          onChange={(e) => onExerciseNoteChange(e.target.value)}
        />
        {progressionHint && (
          <p className="rounded-xl border border-emerald-200/80 bg-emerald-50/90 p-3 text-xs font-medium text-emerald-900 dark:border-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-100">
            {progressionHint}
          </p>
        )}
      </div>
    </article>
  );
}