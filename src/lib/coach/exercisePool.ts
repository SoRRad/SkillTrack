import type { ExerciseTemplate, GoalKey, SkillName, TrainingAccess, UserGoalProfile, UserOnboarding } from '../../types/models';
import { resolveExerciseImageUrl } from '../../data/exerciseImages';
import { applySafetyAdjustments } from './safetyAdjustments';
import { tuneExerciseTemplate } from './setRepRecommendations';

type PoolTemplate = Omit<ExerciseTemplate, 'imageUrl'> & { access: TrainingAccess[]; tags?: Array<GoalKey | SkillName | 'shoulder-friendly' | 'home-friendly'> };

const pool: PoolTemplate[] = [
  { id: 'warmup-dynamic', name: 'Dynamic warm-up flow', category: 'warmup', movementPattern: 'mixed', isSkill: false, targetType: 'noteOnly', defaultSets: 1, notes: '3-5 minutes of tissue temperature plus joint prep.', coachingCues: ['Raise temperature first', 'Prime the first movement pattern'], access: ['home', 'gym', 'full-gym'] },
  { id: 'scap-pullup', name: 'Scap pull-up activation', category: 'warmup', movementPattern: 'pull', isSkill: false, targetType: 'bodyweightReps', defaultSets: 2, defaultRepRange: { min: 6, max: 8 }, access: ['home', 'gym', 'full-gym'], tags: ['shoulder-friendly', 'Muscle-up', 'Front lever'] },
  { id: 'explosive-pullup', name: 'Explosive pull-up', category: 'skill', movementPattern: 'pull', isSkill: true, progressionTag: 'Muscle-up', targetType: 'bodyweightReps', defaultSets: 4, defaultRepRange: { min: 3, max: 5 }, restSeconds: 120, coachingCues: ['Chest tall', 'Pull fast'], access: ['home', 'gym', 'full-gym'], tags: ['Muscle-up', 'strength'] },
  { id: 'banded-transition', name: 'Banded muscle-up transition', category: 'skill', movementPattern: 'pull', isSkill: true, progressionTag: 'Muscle-up', targetType: 'bodyweightReps', defaultSets: 4, defaultRepRange: { min: 3, max: 6 }, restSeconds: 90, access: ['home', 'gym', 'full-gym'], tags: ['Muscle-up'] },
  { id: 'front-lever-tuck', name: 'Front lever tuck hold', category: 'skill', movementPattern: 'pull', isSkill: true, progressionTag: 'Front lever', targetType: 'holdDuration', defaultSets: 4, defaultHoldSeconds: 12, restSeconds: 75, access: ['home', 'gym', 'full-gym'], tags: ['Front lever'] },
  { id: 'weighted-pullup', name: 'Weighted pull-up', category: 'strength', movementPattern: 'pull', isSkill: false, progressionTag: 'Weighted pull-up', targetType: 'weightedReps', defaultSets: 4, defaultRepRange: { min: 4, max: 6 }, restSeconds: 150, access: ['gym', 'full-gym'], tags: ['strength'] },
  { id: 'ring-row', name: 'Ring row', category: 'accessory', movementPattern: 'pull', isSkill: false, targetType: 'bodyweightReps', defaultSets: 3, defaultRepRange: { min: 8, max: 12 }, restSeconds: 60, access: ['home', 'gym', 'full-gym'], tags: ['home-friendly'] },
  { id: 'chest-supported-row', name: 'Chest-supported row', category: 'accessory', movementPattern: 'pull', isSkill: false, targetType: 'weightedReps', defaultSets: 3, defaultRepRange: { min: 8, max: 12 }, restSeconds: 75, access: ['gym', 'full-gym'] },
  { id: 'rear-delt-cable', name: 'Rear delt cable fly', category: 'accessory', movementPattern: 'pull', isSkill: false, targetType: 'weightedReps', defaultSets: 3, defaultRepRange: { min: 12, max: 15 }, restSeconds: 45, access: ['gym', 'full-gym'], tags: ['shoulder-friendly'] },
  { id: 'goblet-squat', name: 'Goblet squat', category: 'strength', movementPattern: 'legs', isSkill: false, targetType: 'weightedReps', defaultSets: 4, defaultRepRange: { min: 8, max: 10 }, restSeconds: 90, access: ['home', 'gym', 'full-gym'], tags: ['home-friendly'] },
  { id: 'back-squat', name: 'Back squat', category: 'strength', movementPattern: 'legs', isSkill: false, targetType: 'weightedReps', defaultSets: 4, defaultRepRange: { min: 4, max: 6 }, restSeconds: 150, access: ['gym', 'full-gym'], tags: ['strength'] },
  { id: 'romanian-deadlift', name: 'Romanian deadlift', category: 'strength', movementPattern: 'legs', isSkill: false, targetType: 'weightedReps', defaultSets: 3, defaultRepRange: { min: 6, max: 8 }, restSeconds: 120, access: ['gym', 'full-gym'] },
  { id: 'split-squat', name: 'Rear-foot elevated split squat', category: 'accessory', movementPattern: 'legs', isSkill: false, targetType: 'weightedReps', defaultSets: 3, defaultRepRange: { min: 8, max: 10 }, restSeconds: 75, access: ['home', 'gym', 'full-gym'] },
  { id: 'cossack-squat', name: 'Cossack squat', category: 'mobility', movementPattern: 'legs', isSkill: false, targetType: 'bodyweightReps', defaultSets: 2, defaultRepRange: { min: 6, max: 8 }, restSeconds: 45, access: ['home', 'gym', 'full-gym'], tags: ['mobility'] },
  { id: 'wall-handstand', name: 'Wall handstand hold', category: 'skill', movementPattern: 'push', isSkill: true, progressionTag: 'Handstand', targetType: 'holdDuration', defaultSets: 4, defaultHoldSeconds: 20, restSeconds: 60, access: ['home', 'gym', 'full-gym'], tags: ['Handstand'] },
  { id: 'pike-press', name: 'Elevated pike press', category: 'skill', movementPattern: 'push', isSkill: true, progressionTag: 'Handstand', targetType: 'bodyweightReps', defaultSets: 4, defaultRepRange: { min: 4, max: 8 }, restSeconds: 90, access: ['home', 'gym', 'full-gym'], tags: ['Handstand'] },
  { id: 'weighted-dip', name: 'Weighted dip', category: 'strength', movementPattern: 'push', isSkill: false, progressionTag: 'Weighted dip', targetType: 'weightedReps', defaultSets: 4, defaultRepRange: { min: 5, max: 8 }, restSeconds: 120, access: ['gym', 'full-gym'], tags: ['strength'] },
  { id: 'bench-press', name: 'Bench press', category: 'strength', movementPattern: 'push', isSkill: false, targetType: 'weightedReps', defaultSets: 4, defaultRepRange: { min: 5, max: 8 }, restSeconds: 150, access: ['gym', 'full-gym'], tags: ['strength'] },
  { id: 'landmine-press', name: 'Landmine press', category: 'strength', movementPattern: 'push', isSkill: false, targetType: 'weightedReps', defaultSets: 3, defaultRepRange: { min: 6, max: 10 }, restSeconds: 90, access: ['gym', 'full-gym'], tags: ['shoulder-friendly'] },
  { id: 'push-up-plus', name: 'Push-up plus', category: 'accessory', movementPattern: 'push', isSkill: false, targetType: 'bodyweightReps', defaultSets: 3, defaultRepRange: { min: 10, max: 15 }, restSeconds: 60, access: ['home', 'gym', 'full-gym'], tags: ['shoulder-friendly', 'home-friendly'] },
  { id: 'lsit-tuck', name: 'L-sit tuck hold', category: 'skill', movementPattern: 'core', isSkill: true, progressionTag: 'L-sit', targetType: 'holdDuration', defaultSets: 4, defaultHoldSeconds: 12, restSeconds: 60, access: ['home', 'gym', 'full-gym'], tags: ['L-sit'] },
  { id: 'hanging-knee-raise', name: 'Hanging knee raise', category: 'core', movementPattern: 'core', isSkill: false, targetType: 'bodyweightReps', defaultSets: 3, defaultRepRange: { min: 8, max: 12 }, restSeconds: 60, access: ['home', 'gym', 'full-gym'] },
  { id: 'hollow-hold', name: 'Hollow body hold', category: 'core', movementPattern: 'core', isSkill: false, targetType: 'holdDuration', defaultSets: 3, defaultHoldSeconds: 25, restSeconds: 45, access: ['home', 'gym', 'full-gym'] },
  { id: 'dead-bug', name: 'Dead bug', category: 'core', movementPattern: 'core', isSkill: false, targetType: 'bodyweightReps', defaultSets: 3, defaultRepRange: { min: 8, max: 12 }, restSeconds: 45, access: ['home', 'gym', 'full-gym'] },
  { id: 'shoulder-mobility', name: 'Shoulder mobility circuit', category: 'mobility', movementPattern: 'mobility', isSkill: false, targetType: 'mobility', defaultSets: 1, notes: 'T-spine, cuffs, and scap control.', restSeconds: 30, access: ['home', 'gym', 'full-gym'], tags: ['mobility', 'shoulder-friendly'] },
  { id: 'zone-2-walk', name: 'Zone 2 incline walk', category: 'conditioning', movementPattern: 'mixed', isSkill: false, targetType: 'noteOnly', defaultSets: 1, notes: '10-15 minutes at conversational pace.', access: ['gym', 'full-gym'], tags: ['fatLoss'] }
];

function matchesAccess(template: PoolTemplate, access: TrainingAccess): boolean {
  return template.access.includes(access) || template.access.includes('full-gym');
}

function scoreTemplate(template: PoolTemplate, goalProfile: UserGoalProfile): number {
  let score = 0;
  const tags = template.tags ?? [];
  if (tags.includes(goalProfile.primaryGoal)) score += 6;
  score += goalProfile.secondaryGoals.filter((goal) => tags.includes(goal)).length * 2;
  score += goalProfile.skillPriorities.filter((skill) => tags.includes(skill)).length * 4;
  if (goalProfile.primaryGoal === 'fatLoss' && template.category === 'conditioning') score += 4;
  return score;
}

export function selectExercises(params: { focus: string; onboarding: UserOnboarding; goalProfile: UserGoalProfile }): ExerciseTemplate[] {
  const { focus, onboarding, goalProfile } = params;
  const access = onboarding.trainingAvailability.access;
  const level = onboarding.experience.level;
  const lowerFocus = focus.toLowerCase();

  const focusFilter = (template: PoolTemplate) => {
    if (lowerFocus.includes('pull')) return template.movementPattern === 'pull' || template.movementPattern === 'core';
    if (lowerFocus.includes('push')) return template.movementPattern === 'push' || template.movementPattern === 'core';
    if (lowerFocus.includes('lower') || lowerFocus.includes('leg')) return template.movementPattern === 'legs' || template.movementPattern === 'core';
    if (lowerFocus.includes('mobility')) return template.category === 'mobility' || template.category === 'conditioning' || template.category === 'core';
    if (lowerFocus.includes('skill')) return template.isSkill || template.category === 'core' || template.category === 'warmup';
    return true;
  };

  return pool
    .filter((template) => matchesAccess(template, access) && focusFilter(template))
    .sort((a, b) => scoreTemplate(b, goalProfile) - scoreTemplate(a, goalProfile))
    .slice(0, lowerFocus.includes('mobility') ? 5 : 7)
    .map((template) =>
      applySafetyAdjustments(
        tuneExerciseTemplate(
          {
            ...template,
            imageUrl: resolveExerciseImageUrl(template.id, template.movementPattern),
            substitutions: template.substitutions ?? [],
            regressions: template.regressions ?? [],
            progressions: template.progressions ?? [],
            equipment: template.equipment ?? []
          },
          { level, goalProfile }
        ),
        onboarding
      )
    );
}
