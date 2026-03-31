import type { ExerciseSetLog, ExerciseTemplate, WorkoutSession } from '../types/models';

function getTaskLogs(session: WorkoutSession, exerciseId: string): ExerciseSetLog[] {
  const task = session.tasks.find((item) => item.exerciseId === exerciseId);
  return task ? [...task.setLogs].sort((a, b) => a.setIndex - b.setIndex) : [];
}

export function getPreviousSessionForExercise(exerciseId: string, sessions: WorkoutSession[]): WorkoutSession | null {
  return sessions
    .filter((session) => session.status === 'completed' && session.tasks.some((task) => task.exerciseId === exerciseId))
    .sort((a, b) => b.date.localeCompare(a.date))[0] ?? null;
}

export function formatPreviousSets(exercise: ExerciseTemplate, session: WorkoutSession | null): string | null {
  if (!session) return null;
  const logs = getTaskLogs(session, exercise.id).filter((log) => !log.skipped);
  if (!logs.length) return null;
  const parts = logs.map((log) => {
    if (exercise.targetType === 'holdDuration') return `${log.holdSeconds ?? '-'}s`;
    if (exercise.targetType === 'weightedReps') return `${log.reps ?? '-'} @ ${log.weightKg ?? 0}kg`;
    return `${log.reps ?? '-'} reps`;
  });
  return `Last ${session.date}: ${parts.join(' | ')}`;
}

export function getExerciseLastWeight(exerciseId: string, sessions: WorkoutSession[]): number | undefined {
  const previous = getPreviousSessionForExercise(exerciseId, sessions);
  const log = previous ? getTaskLogs(previous, exerciseId).find((item) => item.weightKg != null && !item.skipped) : undefined;
  return log?.weightKg;
}

export function getBestWeightKg(exerciseId: string, sessions: WorkoutSession[]): number | null {
  const weights = sessions.flatMap((session) => getTaskLogs(session, exerciseId).map((log) => log.weightKg).filter((weight): weight is number => weight != null));
  return weights.length ? Math.max(...weights) : null;
}

export function getTrainingStreak(sessions: WorkoutSession[]): number {
  const days = [...new Set(sessions.filter((session) => session.status === 'completed').map((session) => session.date))].sort((a, b) => b.localeCompare(a));
  if (!days.length) return 0;
  let streak = 1;
  for (let index = 1; index < days.length; index += 1) {
    const newer = new Date(`${days[index - 1]}T12:00:00`);
    const older = new Date(`${days[index]}T12:00:00`);
    const diff = Math.round((newer.getTime() - older.getTime()) / 86400000);
    if (diff !== 1) break;
    streak += 1;
  }
  return streak;
}
