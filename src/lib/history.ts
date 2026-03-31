import type { ExerciseTemplate, WorkoutSession } from '../types/models';

/** Last completed session for this program day that included this exercise. */
export function getPreviousSessionForExercise(
  exerciseId: string,
  workoutDayId: string,
  sessions: WorkoutSession[]
): WorkoutSession | null {
  const sorted = sessions
    .filter((s) => s.completed && s.workoutDayId === workoutDayId)
    .sort((a, b) => b.date.localeCompare(a.date));
  return sorted.find((s) => s.setLogs.some((l) => l.exerciseId === exerciseId)) ?? null;
}

export function formatPreviousSets(exercise: ExerciseTemplate, session: WorkoutSession | null): string | null {
  if (!session) return null;
  const logs = session.setLogs
    .filter((l) => l.exerciseId === exercise.id && !l.skipped)
    .sort((a, b) => a.setIndex - b.setIndex);
  if (!logs.length) return null;

  const parts = logs.map((l) => {
    if (exercise.targetType === 'holdDuration') {
      return `${l.holdSeconds ?? '—'}s`;
    }
    if (exercise.targetType === 'weightedReps') {
      const w = l.weightKg != null ? `${l.weightKg}kg` : 'bw';
      return `${l.reps ?? '—'}@${w}`;
    }
    if (exercise.targetType === 'bodyweightReps' || exercise.targetType === 'mobility') {
      return `${l.reps ?? '—'} reps`;
    }
    return 'logged';
  });
  return `Last time (${session.date}): ${parts.join(' · ')}`;
}

/** Best estimated 1rm-style max weight for an exercise (simple max kg across sets). */
export function getBestWeightKg(exerciseId: string, sessions: WorkoutSession[]): number | null {
  let max: number | null = null;
  sessions.forEach((s) => {
    s.setLogs.forEach((l) => {
      if (l.exerciseId !== exerciseId || l.skipped || l.weightKg == null) return;
      if (max === null || l.weightKg > max) max = l.weightKg;
    });
  });
  return max;
}

/** Consecutive days with a completed workout, counting backward from your most recent session. */
export function getTrainingStreak(sessions: WorkoutSession[]): number {
  const days = [...new Set(sessions.filter((s) => s.completed).map((s) => s.date))].sort((a, b) =>
    b.localeCompare(a)
  );
  if (!days.length) return 0;
  let streak = 1;
  for (let i = 1; i < days.length; i++) {
    const newer = new Date(days[i - 1] + 'T12:00:00');
    const older = new Date(days[i] + 'T12:00:00');
    const diffDays = Math.round((newer.getTime() - older.getTime()) / 86400000);
    if (diffDays === 1) streak++;
    else break;
  }
  return streak;
}
