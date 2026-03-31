import type { CheckInLog, ExerciseSetLog, ExerciseTaskProgress, ExerciseTemplate, TrainingPlan, WorkoutDayTemplate, WorkoutSession } from '../types/models';
import { getExerciseLastWeight, formatPreviousSets, getPreviousSessionForExercise } from './history';

function createDefaultSet(exercise: ExerciseTemplate, setIndex: number, sessions: WorkoutSession[]): ExerciseSetLog {
  return {
    id: crypto.randomUUID(),
    exerciseId: exercise.id,
    setIndex,
    reps: exercise.defaultRepRange ? exercise.defaultRepRange.min : undefined,
    holdSeconds: exercise.defaultHoldSeconds,
    weightKg: exercise.targetType === 'weightedReps' ? getExerciseLastWeight(exercise.id, sessions) ?? exercise.defaultWeightKg : undefined,
    completed: false
  };
}

export function buildWorkoutSession(params: {
  userId: string;
  plan: TrainingPlan;
  day: WorkoutDayTemplate;
  priorSessions: WorkoutSession[];
  checkIn?: CheckInLog;
}): WorkoutSession {
  const tasks: ExerciseTaskProgress[] = params.day.exerciseIds.map((exerciseId, index) => {
    const exercise = params.plan.exerciseTemplates.find((item) => item.id === exerciseId);
    if (!exercise) {
      return {
        id: crypto.randomUUID(),
        exerciseId,
        order: index,
        status: 'pending',
        setLogs: []
      };
    }

    const previous = getPreviousSessionForExercise(exercise.id, params.priorSessions);
    return {
      id: crypto.randomUUID(),
      exerciseId: exercise.id,
      order: index,
      status: 'pending',
      restSeconds: exercise.restSeconds,
      notes: exercise.notes,
      coachingCues: exercise.coachingCues,
      previousPerformanceSummary: formatPreviousSets(exercise, previous) ?? undefined,
      setLogs: Array.from({ length: exercise.defaultSets }, (_, setIndex) => createDefaultSet(exercise, setIndex, params.priorSessions))
    };
  });

  return {
    id: crypto.randomUUID(),
    userId: params.userId,
    planId: params.plan.id,
    workoutDayId: params.day.id,
    date: new Date().toISOString().slice(0, 10),
    startedAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    status: 'inProgress',
    currentTaskIndex: 0,
    readiness: params.checkIn?.readiness,
    readinessSuggestion: params.checkIn?.readinessSuggestion,
    tasks
  };
}
