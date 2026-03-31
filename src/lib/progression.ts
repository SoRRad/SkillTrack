import type { ExerciseTemplate, WorkoutSession } from '../types/models';

export function getProgressionHint(
  exercise: ExerciseTemplate,
  sessions: WorkoutSession[],
  workoutDayId?: string
): string | null {
  const pool = workoutDayId
    ? sessions.filter((s) => s.workoutDayId === workoutDayId)
    : sessions;
  const recent = pool
    .filter((s) => s.completed)
    .slice()
    .sort((a, b) => b.date.localeCompare(a.date))
    .find((session) => session.setLogs.some((log) => log.exerciseId === exercise.id));

  if (!recent) return null;

  const logs = recent.setLogs.filter((log) => log.exerciseId === exercise.id && log.completed && !log.skipped);
  if (!logs.length) return null;

  if (exercise.targetType === 'weightedReps' && exercise.defaultRepRange) {
    const allHitTop = logs.every((set) => (set.reps ?? 0) >= exercise.defaultRepRange!.max);
    if (allHitTop) return 'All sets hit top range. Consider +2.5 kg next time.';
  }

  if (exercise.targetType === 'holdDuration' && exercise.defaultHoldSeconds) {
    const exceeded = logs.filter((set) => (set.holdSeconds ?? 0) >= exercise.defaultHoldSeconds! + 5).length;
    if (exceeded >= Math.ceil(logs.length * 0.75)) return 'Hold target exceeded consistently. Consider next progression level.';
  }

  return null;
}
