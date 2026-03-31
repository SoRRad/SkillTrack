import type { ExerciseTemplate, WorkoutSession } from '../types/models';

export function getProgressionHint(exercise: ExerciseTemplate, sessions: WorkoutSession[]): string | null {
  const recent = sessions
    .filter((session) => session.status === 'completed')
    .sort((a, b) => b.date.localeCompare(a.date))
    .find((session) => session.tasks.some((task) => task.exerciseId === exercise.id));

  if (!recent) return null;

  const task = recent.tasks.find((item) => item.exerciseId === exercise.id);
  if (!task) return null;
  const logs = task.setLogs.filter((log) => log.completed && !log.skipped);
  if (!logs.length) return null;

  if (exercise.targetType === 'weightedReps' && exercise.defaultRepRange) {
    const top = exercise.defaultRepRange.max;
    const allHitTop = logs.every((set) => (set.reps ?? 0) >= top);
    if (allHitTop) return 'You hit the top rep target last time. Add 2.5 kg if form stays crisp.';
  }

  if (exercise.targetType === 'holdDuration' && exercise.defaultHoldSeconds) {
    const average = logs.reduce((sum, set) => sum + (set.holdSeconds ?? 0), 0) / logs.length;
    if (average >= exercise.defaultHoldSeconds + 5) return 'Hold time is ahead of target. You can trial the next progression.';
  }

  return null;
}
