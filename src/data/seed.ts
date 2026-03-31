import type { AppSettings, BodyMetricLog, CheckInLog, SkillLog, UserOnboarding, UserProfile } from '../types/models';
import { generatePlanForUser } from '../lib/coach/planGenerator';

const now = new Date().toISOString();

export const defaultUserId = 'user-default';

export const defaultOnboarding = (userId: string): UserOnboarding => ({
  id: `onboarding-${userId}`,
  userId,
  basicProfile: {},
  trainingAvailability: {
    daysPerWeek: 3,
    preferredWorkoutDays: ['Mon', 'Wed', 'Fri'],
    sessionLengthMinutes: 60,
    access: 'full-gym',
    availableEquipment: ['Pull-up bar', 'Barbell', 'Dumbbells', 'Cable station', 'Parallettes'],
    missingEquipment: []
  },
  experience: {
    level: 'intermediate',
    recentTrainingConsistency: 'moderate'
  },
  goals: {
    muscleGain: 5,
    fatLoss: 3,
    strength: 7,
    calisthenicsSkill: 8,
    mobility: 6,
    athleticPerformance: 4,
    endurance: 2,
    rehab: 2
  },
  skillGoals: {
    'Muscle-up': 10,
    'L-sit': 9,
    'Front lever': 9,
    Handstand: 8
  },
  health: {
    movementsToAvoid: []
  },
  nutrition: {},
  lifestyle: {}
});

export const exampleUser: UserProfile = {
  id: defaultUserId,
  name: 'Soroush',
  createdAt: now,
  age: 30,
  sex: 'male',
  heightCm: 160,
  mainGoal: 'Muscle-up + leanness + calisthenics strength',
  currentPhase: 'skill-emphasis',
  planType: 'Skill-first 3 day split'
};

export const exampleOnboarding: UserOnboarding = {
  ...defaultOnboarding(defaultUserId),
  completedAt: now,
  basicProfile: {
    age: 30,
    sex: 'male',
    heightCm: 160,
    weightKg: 64,
    activityLevel: 'moderate'
  },
  trainingAvailability: {
    daysPerWeek: 3,
    preferredWorkoutDays: ['Mon', 'Wed', 'Fri'],
    sessionLengthMinutes: 75,
    access: 'full-gym',
    availableEquipment: ['Pull-up bar', 'Barbell', 'Dumbbells', 'Cable station', 'Parallettes', 'Rings'],
    missingEquipment: []
  },
  experience: {
    level: 'intermediate',
    recentTrainingConsistency: 'moderate',
    maxPullUps: 12,
    maxChinUps: 13,
    maxDips: 18,
    squatWorkingWeightKg: 90,
    benchWorkingWeightKg: 65,
    deadliftWorkingWeightKg: 110,
    handstandLevel: 'Wall hold',
    lSitLevel: 'Tuck 15s',
    frontLeverLevel: 'Tuck',
    muscleUpLevel: 'Explosive pull-up',
    plancheLevel: 'Lean'
  },
  goals: {
    muscleGain: 7,
    fatLoss: 6,
    strength: 7,
    calisthenicsSkill: 10,
    mobility: 8,
    athleticPerformance: 5,
    endurance: 3,
    rehab: 4
  },
  skillGoals: {
    'Muscle-up': 10,
    'L-sit': 9,
    'Front lever': 9,
    Handstand: 8,
    'Weighted pull-up': 6
  },
  health: {
    injuryHistory: 'Some shoulder irritation with deep dips and high overhead volume.',
    shoulderIssues: true,
    kneeIssues: false,
    backIssues: false,
    surgeryHistory: '',
    movementsToAvoid: ['deep dip'],
    currentLimitations: 'Avoid aggressive weekly dip progression.',
    wristTolerance: 3,
    overheadTolerance: 3
  },
  nutrition: {
    goal: 'recomp',
    mealFrequency: 3,
    dietStyle: 'omnivore',
    trackCalories: false,
    trackProtein: true,
    supplements: 'Creatine, whey, vitamin D'
  },
  lifestyle: {
    sleepQuality: 3,
    dailySteps: 7000,
    stressLevel: 3
  }
};

const generated = generatePlanForUser(exampleUser, exampleOnboarding);

export const seedPlan = generated.plan;
export const seedCoachProfile = generated.coachProfile;

export const seedSkillLogs: SkillLog[] = [
  { id: 'skill-1', userId: defaultUserId, skill: 'Muscle-up', level: 'Explosive pull-up', note: 'Transition confidence is the main limiter.', date: now },
  { id: 'skill-2', userId: defaultUserId, skill: 'L-sit', level: 'Tuck hold', metricValue: 15, metricUnit: 'seconds', date: now },
  { id: 'skill-3', userId: defaultUserId, skill: 'Front lever', level: 'Tuck hold', metricValue: 10, metricUnit: 'seconds', date: now },
  { id: 'skill-4', userId: defaultUserId, skill: 'Handstand', level: 'Wall hold', metricValue: 25, metricUnit: 'seconds', date: now }
];

export const seedMetrics: BodyMetricLog[] = [
  { id: 'metric-1', userId: defaultUserId, date: new Date(Date.now() - 2 * 86400000).toISOString().slice(0, 10), weightKg: 64.2, waistCm: 78, sleepHours: 7, energyLevel: 3 },
  { id: 'metric-2', userId: defaultUserId, date: new Date(Date.now() - 86400000).toISOString().slice(0, 10), weightKg: 64, waistCm: 77.5, sleepHours: 7.25, energyLevel: 4 }
];

export const seedCheckIns: CheckInLog[] = [];

export const defaultSettings = (userId: string): AppSettings => ({
  id: `settings-${userId}`,
  userId,
  defaultWorkoutStartDay: 1,
  activeWorkoutDayOrder: 1,
  darkMode: false,
  onboardingComplete: false,
  openOnUsersScreen: false
});

export const skillLadders: Record<string, string[]> = {
  'Muscle-up': ['Scap pulls', 'Chest-to-bar', 'Explosive pull-up', 'Transition drill', 'Band-assisted muscle-up', 'Strict muscle-up'],
  'L-sit': ['Tuck', 'Single-leg', 'Full L-sit', 'Longer hold'],
  'Front lever': ['Tuck', 'Advanced tuck', 'One-leg', 'Straddle'],
  Handstand: ['Wall hold', 'Chest-to-wall', 'Toe pulls', 'Freestanding attempts'],
  Planche: ['Planche lean', 'Tuck planche', 'Advanced tuck'],
  'Pull-up': ['Band-assisted', 'Strict reps', 'High pull-up'],
  'Chin-up': ['Band-assisted', 'Strict reps', 'Weighted'],
  Dip: ['Support hold', 'Bodyweight reps', 'Weighted'],
  'Weighted pull-up': ['Bodyweight volume', '+5 kg', '+10 kg'],
  'Weighted dip': ['Bodyweight volume', '+5 kg', '+10 kg']
};
