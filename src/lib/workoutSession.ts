import type {
  CheckInLog,
  ExerciseSetLog,
  ExerciseTaskProgress,
  ExerciseTemplate,
  TrainingPlan,
  WorkoutDayTemplate,
  WorkoutSession
} from '../types/models';
import { formatPreviousSets, getExerciseLastWeight, getPreviousSessionForExercise } from './history';

function nowIso(): string {
  return new Date().toISOString();
}

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

export function getTaskStatus(task: ExerciseTaskProgress): ExerciseTaskProgress['status'] {
  const totalSets = task.setLogs.length;
  const skippedSets = task.setLogs.filter((set) => set.skipped).length;
  const completedSets = task.setLogs.filter((set) => set.completed && !set.skipped).length;

  if (totalSets > 0 && skippedSets === totalSets) {
    return 'skipped';
  }

  if (totalSets > 0 && skippedSets + completedSets === totalSets) {
    return 'completed';
  }

  if (totalSets === 0 && task.taskNote?.trim()) {
    return 'completed';
  }

  return 'pending';
}

function updateTask(session: WorkoutSession, taskId: string, updater: (task: ExerciseTaskProgress) => ExerciseTaskProgress): WorkoutSession {
  const tasks = session.tasks.map((task) => {
    if (task.id !== taskId) {
      return task;
    }

    const nextTask = updater(task);
    return {
      ...nextTask,
      status: getTaskStatus(nextTask)
    };
  });

  return {
    ...session,
    tasks,
    updatedAt: nowIso()
  };
}

export function updateTaskSetLog(
  session: WorkoutSession,
  taskId: string,
  setIndex: number,
  patch: Partial<ExerciseSetLog>
): WorkoutSession {
  return updateTask(session, taskId, (task) => ({
    ...task,
    setLogs: task.setLogs.map((set) =>
      set.setIndex === setIndex
        ? {
            ...set,
            ...patch,
            completed:
              patch.completed ??
              (Boolean(
                patch.reps != null ||
                  patch.weightKg != null ||
                  patch.holdSeconds != null ||
                  patch.rpe != null ||
                  patch.note != null
              ) ||
                set.completed),
            skipped: patch.skipped ?? false
          }
        : set
    )
  }));
}

export function updateTaskNote(session: WorkoutSession, taskId: string, taskNote: string): WorkoutSession {
  return updateTask(session, taskId, (task) => ({
    ...task,
    taskNote
  }));
}

export function toggleTaskCompletionBlock(session: WorkoutSession, taskId: string, completed: boolean): WorkoutSession {
  return updateTask(session, taskId, (task) => ({
    ...task,
    setLogs: task.setLogs.map((set) => ({
      ...set,
      completed,
      skipped: false
    }))
  }));
}

export function skipTask(session: WorkoutSession, taskId: string): WorkoutSession {
  const nextSession = updateTask(session, taskId, (task) => ({
    ...task,
    setLogs: task.setLogs.map((set) => ({
      ...set,
      completed: false,
      skipped: true
    }))
  }));

  return {
    ...nextSession,
    currentTaskIndex: Math.min(nextSession.tasks.length - 1, nextSession.currentTaskIndex + 1)
  };
}

export function moveTaskIndex(session: WorkoutSession, direction: -1 | 1): WorkoutSession {
  return {
    ...session,
    currentTaskIndex: Math.max(0, Math.min(session.tasks.length - 1, session.currentTaskIndex + direction)),
    updatedAt: nowIso()
  };
}

export function getPendingTaskCount(session: WorkoutSession): number {
  return session.tasks.filter((task) => getTaskStatus(task) === 'pending').length;
}

export function completeWorkoutSession(session: WorkoutSession): WorkoutSession {
  const tasks = session.tasks.map((task) => {
    if (getTaskStatus(task) !== 'pending') {
      return {
        ...task,
        status: getTaskStatus(task)
      };
    }

    return {
      ...task,
      status: 'skipped' as const,
      setLogs: task.setLogs.map((set) => ({
        ...set,
        completed: false,
        skipped: true
      }))
    };
  });

  return {
    ...session,
    status: 'completed',
    completedAt: nowIso(),
    updatedAt: nowIso(),
    currentTaskIndex: Math.max(0, tasks.length - 1),
    tasks
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

  const startedAt = nowIso();

  return {
    id: crypto.randomUUID(),
    userId: params.userId,
    planId: params.plan.id,
    workoutDayId: params.day.id,
    date: startedAt.slice(0, 10),
    startedAt,
    updatedAt: startedAt,
    status: 'inProgress',
    currentTaskIndex: 0,
    readiness: params.checkIn?.readiness,
    readinessSuggestion: params.checkIn?.readinessSuggestion,
    tasks
  };
}
