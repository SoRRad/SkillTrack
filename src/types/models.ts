export type TargetType = 'weightedReps' | 'bodyweightReps' | 'holdDuration' | 'mobility' | 'noteOnly';

export interface ExerciseTemplate {
  id: string;
  name: string;
  category: 'warmup' | 'strength' | 'accessory' | 'core' | 'skill' | 'mobility';
  movementPattern: 'pull' | 'push' | 'legs' | 'core' | 'mobility' | 'mixed';
  isSkill: boolean;
  progressionTag?: string;
  targetType: TargetType;
  defaultSets: number;
  defaultRepRange?: { min: number; max: number };
  defaultHoldSeconds?: number;
  restSeconds?: number;
  notes?: string;
  substitutions?: string[];
}

export interface WorkoutDay {
  id: string;
  order: number;
  name: string;
  focus: string;
  exerciseIds: string[];
}

export interface Plan {
  id: string;
  name: string;
  days: WorkoutDay[];
  exerciseTemplates: ExerciseTemplate[];
  updatedAt: string;
}

export interface ExerciseSetLog {
  id: string;
  exerciseId: string;
  setIndex: number;
  reps?: number;
  weightKg?: number;
  holdSeconds?: number;
  rpe?: number;
  completed: boolean;
  skipped?: boolean;
  note?: string;
}

export interface WorkoutSession {
  id: string;
  workoutDayId: string;
  date: string;
  startedAt: string;
  completedAt?: string;
  setLogs: ExerciseSetLog[];
  exerciseNotes: Record<string, string>;
  workoutNote?: string;
  completed: boolean;
}

export interface SkillLog {
  id: string;
  skill: 'Muscle-up' | 'L-sit' | 'Front lever' | 'Handstand' | 'Planche';
  level: string;
  metricValue?: number;
  metricUnit?: 'seconds' | 'reps';
  note?: string;
  date: string;
}

export interface BodyMetricLog {
  id: string;
  date: string;
  weightKg?: number;
  waistCm?: number;
  sleepHours?: number;
  energyLevel?: 1 | 2 | 3 | 4 | 5;
  note?: string;
}

export interface AppSettings {
  id: 'app-settings';
  /** Which day of the 3-day rotation aligns with “week start” in settings (legacy / calendar hints). */
  defaultWorkoutStartDay: 1 | 2 | 3;
  /** Which program day (1–3) you are viewing and logging on the Today screen. */
  activeWorkoutDayOrder: 1 | 2 | 3;
  darkMode: boolean;
}

export interface AppDataSnapshot {
  plan: Plan;
  sessions: WorkoutSession[];
  skillLogs: SkillLog[];
  metrics: BodyMetricLog[];
  settings: AppSettings;
  exportedAt: string;
}
