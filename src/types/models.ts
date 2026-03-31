export type TargetType = 'weightedReps' | 'bodyweightReps' | 'holdDuration' | 'mobility' | 'noteOnly';
export type ExerciseCategory = 'warmup' | 'strength' | 'accessory' | 'core' | 'skill' | 'mobility' | 'conditioning';
export type MovementPattern = 'pull' | 'push' | 'legs' | 'core' | 'mobility' | 'mixed';
export type SkillName =
  | 'Pull-up'
  | 'Chin-up'
  | 'Dip'
  | 'Muscle-up'
  | 'Handstand'
  | 'L-sit'
  | 'Front lever'
  | 'Planche'
  | 'Pistol squat'
  | 'Weighted pull-up'
  | 'Weighted dip';
export type PhaseType = 'foundation' | 'hypertrophy' | 'skill-emphasis' | 'strength-block' | 'deload' | 'cut' | 'recomp';
export type TrainingAccess = 'home' | 'gym' | 'full-gym';
export type ExperienceLevel = 'beginner' | 'intermediate' | 'advanced';
export type GoalKey =
  | 'muscleGain'
  | 'fatLoss'
  | 'strength'
  | 'calisthenicsSkill'
  | 'mobility'
  | 'athleticPerformance'
  | 'endurance'
  | 'rehab';
export type NutritionGoal = 'cut' | 'recomp' | 'maintain' | 'bulk';
export type CheckInMissedReason = 'busy' | 'tired' | 'sick' | 'traveling' | 'skipped' | 'custom';
export type SessionStatus = 'inProgress' | 'completed' | 'abandoned';

export interface ExerciseTemplate {
  id: string;
  name: string;
  category: ExerciseCategory;
  movementPattern: MovementPattern;
  isSkill: boolean;
  progressionTag?: SkillName;
  targetType: TargetType;
  defaultSets: number;
  defaultRepRange?: { min: number; max: number };
  defaultHoldSeconds?: number;
  defaultWeightKg?: number;
  restSeconds?: number;
  notes?: string;
  coachingCues?: string[];
  substitutions?: string[];
  regressions?: string[];
  progressions?: string[];
  equipment?: string[];
  imageUrl?: string;
}

export interface WorkoutDayTemplate {
  id: string;
  userId: string;
  order: number;
  name: string;
  focus: string;
  durationMinutes: number;
  phase: PhaseType;
  notes?: string[];
  exerciseIds: string[];
}

export interface TrainingPlan {
  id: string;
  userId: string;
  name: string;
  phase: PhaseType;
  planType: string;
  weeklyTargetDays: number;
  generatedAt: string;
  updatedAt: string;
  generatorVersion: string;
  coachNotes: string[];
  days: WorkoutDayTemplate[];
  exerciseTemplates: ExerciseTemplate[];
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

export interface ExerciseTaskProgress {
  id: string;
  exerciseId: string;
  order: number;
  status: 'pending' | 'completed' | 'skipped';
  restSeconds?: number;
  notes?: string;
  coachingCues?: string[];
  previousPerformanceSummary?: string;
  setLogs: ExerciseSetLog[];
  taskNote?: string;
}

export interface WorkoutSession {
  id: string;
  userId: string;
  planId: string;
  workoutDayId: string;
  date: string;
  startedAt: string;
  updatedAt: string;
  completedAt?: string;
  status: SessionStatus;
  currentTaskIndex: number;
  readinessSuggestion?: string;
  readiness?: ReadinessCheck;
  tasks: ExerciseTaskProgress[];
  workoutNote?: string;
}

export interface SkillLog {
  id: string;
  userId: string;
  skill: SkillName;
  level: string;
  metricValue?: number;
  metricUnit?: 'seconds' | 'reps' | 'kg';
  note?: string;
  date: string;
}

export interface BodyMetricLog {
  id: string;
  userId: string;
  date: string;
  weightKg?: number;
  waistCm?: number;
  sleepHours?: number;
  energyLevel?: 1 | 2 | 3 | 4 | 5;
  note?: string;
}

export interface ReadinessCheck {
  energy: 1 | 2 | 3 | 4 | 5;
  soreness: 1 | 2 | 3 | 4 | 5;
  sleepQuality: 1 | 2 | 3 | 4 | 5;
  motivation: 1 | 2 | 3 | 4 | 5;
}

export interface CheckInLog {
  id: string;
  userId: string;
  date: string;
  checkedIn: boolean;
  planned: boolean;
  completed: boolean;
  missedReason?: CheckInMissedReason;
  missedNote?: string;
  readiness?: ReadinessCheck;
  readinessSuggestion?: string;
}

export interface Achievement {
  id: string;
  userId: string;
  code:
    | 'first-workout'
    | 'three-workout-streak'
    | 'front-lever-improving'
    | 'first-month-complete'
    | 'all-planned-this-week'
    | 'handstand-milestone'
    | 'lsit-milestone'
    | 'pullup-pr';
  title: string;
  description: string;
  earnedAt: string;
}

export interface JournalEntry {
  id: string;
  userId: string;
  date: string;
  type: 'daily' | 'workout' | 'weekly';
  title: string;
  content: string;
}

export interface UserGoalProfile {
  primaryGoal: GoalKey;
  secondaryGoals: GoalKey[];
  skillPriorities: SkillName[];
  nutritionGoal?: NutritionGoal;
}

export interface UserOnboarding {
  id: string;
  userId: string;
  completedAt?: string;
  basicProfile: {
    age?: number;
    sex?: 'male' | 'female' | 'other';
    heightCm?: number;
    weightKg?: number;
    estimatedBodyFatPct?: number;
    activityLevel?: 'low' | 'moderate' | 'high';
  };
  trainingAvailability: {
    daysPerWeek: number;
    preferredWorkoutDays: string[];
    sessionLengthMinutes: number;
    access: TrainingAccess;
    availableEquipment: string[];
    missingEquipment: string[];
  };
  experience: {
    level: ExperienceLevel;
    recentTrainingConsistency: 'low' | 'moderate' | 'high';
    maxPullUps?: number;
    maxChinUps?: number;
    maxDips?: number;
    squatWorkingWeightKg?: number;
    benchWorkingWeightKg?: number;
    deadliftWorkingWeightKg?: number;
    handstandLevel?: string;
    lSitLevel?: string;
    frontLeverLevel?: string;
    muscleUpLevel?: string;
    plancheLevel?: string;
  };
  goals: Record<GoalKey, number>;
  skillGoals: Partial<Record<SkillName, number>>;
  health: {
    injuryHistory?: string;
    currentPain?: string;
    shoulderIssues?: boolean;
    kneeIssues?: boolean;
    backIssues?: boolean;
    surgeryHistory?: string;
    movementsToAvoid: string[];
    currentLimitations?: string;
    wristTolerance?: 1 | 2 | 3 | 4 | 5;
    overheadTolerance?: 1 | 2 | 3 | 4 | 5;
  };
  nutrition: {
    goal?: NutritionGoal;
    mealFrequency?: number;
    dietStyle?: string;
    trackCalories?: boolean;
    trackProtein?: boolean;
    supplements?: string;
  };
  lifestyle: {
    sleepQuality?: 1 | 2 | 3 | 4 | 5;
    dailySteps?: number;
    stressLevel?: 1 | 2 | 3 | 4 | 5;
  };
}

export interface UserCoachProfile {
  id: string;
  userId: string;
  mainGoal: string;
  currentPhase: PhaseType;
  planType: string;
  goalProfile: UserGoalProfile;
  coachingNotes: string[];
  recommendationMemory: string[];
  injuryFlags: string[];
  updatedAt: string;
}

export interface UserProfile {
  id: string;
  name: string;
  createdAt: string;
  archived?: boolean;
  age?: number;
  sex?: 'male' | 'female' | 'other';
  heightCm?: number;
  mainGoal: string;
  currentPhase: PhaseType;
  planType: string;
}

export interface AppSettings {
  id: string;
  userId: string;
  darkMode: boolean;
  defaultWorkoutStartDay: number;
  activeWorkoutDayOrder: number;
  onboardingComplete: boolean;
  openOnUsersScreen?: boolean;
}

export interface ActiveUserState {
  id: 'app-meta';
  schemaVersion: number;
  activeUserId: string | null;
}

export interface AppDataSnapshot {
  users: UserProfile[];
  activeUserId: string | null;
  onboardings: UserOnboarding[];
  coachProfiles: UserCoachProfile[];
  plans: TrainingPlan[];
  sessions: WorkoutSession[];
  skillLogs: SkillLog[];
  metrics: BodyMetricLog[];
  checkIns: CheckInLog[];
  achievements: Achievement[];
  journalEntries: JournalEntry[];
  settings: AppSettings[];
  exportedAt: string;
}
