import type { AppSettings, Plan, SkillLog } from '../types/models';

const now = new Date().toISOString();

export const seedPlan: Plan = {
  id: 'plan-v1',
  name: 'SkillTrack v1 Base Program',
  updatedAt: now,
  days: [
    { id: 'day-1', order: 1, name: 'Day 1 — Pull + Skill', focus: 'Back strength + front lever prep', exerciseIds: ['warmup', 'ctb-pullup', 'front-lever-tuck', 'weighted-pullup', 'barbell-row', 'lat-pulldown', 'face-pull', 'hammer-curl', 'hanging-leg-raise', 'hollow-hold'] },
    { id: 'day-2', order: 2, name: 'Day 2 — Legs + Core + Mobility', focus: 'Lower body + trunk control + mobility', exerciseIds: ['warmup', 'cossack-squat', 'jefferson-curl', 'back-squat', 'rdl', 'bulgarian-split-squat', 'calf-raise', 'lsit-prog', 'ab-wheel', 'side-plank', 'mobility-finisher'] },
    { id: 'day-3', order: 3, name: 'Day 3 — Push + Skill', focus: 'Pressing strength + handstand/planche prep', exerciseIds: ['warmup', 'wall-handstand', 'pike-hspu', 'weighted-dips', 'bench-press', 'incline-db-press', 'cable-lateral-raise', 'triceps-pushdown', 'rear-delt', 'parallette-tuck', 'dead-bug'] }
  ],
  exerciseTemplates: [
    { id: 'warmup', name: 'Warm-up', category: 'warmup', movementPattern: 'mixed', isSkill: false, targetType: 'noteOnly', defaultSets: 1, notes: '5-8 min light cardio + dynamic prep.' },
    { id: 'ctb-pullup', name: 'Chest-to-bar pull-ups', category: 'skill', movementPattern: 'pull', isSkill: true, progressionTag: 'Muscle-up', targetType: 'bodyweightReps', defaultSets: 4, defaultRepRange: { min: 4, max: 8 }, restSeconds: 120 },
    { id: 'front-lever-tuck', name: 'Front lever tuck holds', category: 'skill', movementPattern: 'pull', isSkill: true, progressionTag: 'Front lever', targetType: 'holdDuration', defaultSets: 4, defaultHoldSeconds: 12, restSeconds: 90 },
    { id: 'weighted-pullup', name: 'Weighted pull-ups', category: 'strength', movementPattern: 'pull', isSkill: false, targetType: 'weightedReps', defaultSets: 4, defaultRepRange: { min: 4, max: 6 }, restSeconds: 150 },
    { id: 'barbell-row', name: 'Barbell rows', category: 'strength', movementPattern: 'pull', isSkill: false, targetType: 'weightedReps', defaultSets: 4, defaultRepRange: { min: 6, max: 10 }, restSeconds: 120 },
    { id: 'lat-pulldown', name: 'Lat pulldown or high cable row', category: 'accessory', movementPattern: 'pull', isSkill: false, targetType: 'weightedReps', defaultSets: 3, defaultRepRange: { min: 8, max: 12 }, restSeconds: 90 },
    { id: 'face-pull', name: 'Face pulls', category: 'accessory', movementPattern: 'pull', isSkill: false, targetType: 'weightedReps', defaultSets: 3, defaultRepRange: { min: 12, max: 15 }, restSeconds: 60 },
    { id: 'hammer-curl', name: 'Hammer curls', category: 'accessory', movementPattern: 'pull', isSkill: false, targetType: 'weightedReps', defaultSets: 3, defaultRepRange: { min: 10, max: 12 }, restSeconds: 60 },
    { id: 'hanging-leg-raise', name: 'Hanging leg raises', category: 'core', movementPattern: 'core', isSkill: false, targetType: 'bodyweightReps', defaultSets: 3, defaultRepRange: { min: 8, max: 15 }, restSeconds: 60 },
    { id: 'hollow-hold', name: 'Hollow body hold', category: 'core', movementPattern: 'core', isSkill: false, targetType: 'holdDuration', defaultSets: 3, defaultHoldSeconds: 30, restSeconds: 45 },
    { id: 'cossack-squat', name: 'Cossack squats', category: 'mobility', movementPattern: 'legs', isSkill: false, targetType: 'bodyweightReps', defaultSets: 2, defaultRepRange: { min: 6, max: 8 }, restSeconds: 45 },
    { id: 'jefferson-curl', name: 'Jefferson curls (light)', category: 'mobility', movementPattern: 'legs', isSkill: false, targetType: 'weightedReps', defaultSets: 2, defaultRepRange: { min: 8, max: 10 }, restSeconds: 60 },
    { id: 'back-squat', name: 'Back squat', category: 'strength', movementPattern: 'legs', isSkill: false, targetType: 'weightedReps', defaultSets: 4, defaultRepRange: { min: 5, max: 8 }, restSeconds: 150 },
    { id: 'rdl', name: 'Romanian deadlift', category: 'strength', movementPattern: 'legs', isSkill: false, targetType: 'weightedReps', defaultSets: 3, defaultRepRange: { min: 6, max: 10 }, restSeconds: 120 },
    { id: 'bulgarian-split-squat', name: 'Bulgarian split squat', category: 'strength', movementPattern: 'legs', isSkill: false, targetType: 'weightedReps', defaultSets: 3, defaultRepRange: { min: 8, max: 10 }, restSeconds: 90 },
    { id: 'calf-raise', name: 'Standing calf raises', category: 'accessory', movementPattern: 'legs', isSkill: false, targetType: 'weightedReps', defaultSets: 3, defaultRepRange: { min: 10, max: 15 }, restSeconds: 60 },
    { id: 'lsit-prog', name: 'L-sit progression', category: 'skill', movementPattern: 'core', isSkill: true, progressionTag: 'L-sit', targetType: 'holdDuration', defaultSets: 4, defaultHoldSeconds: 12, restSeconds: 60 },
    { id: 'ab-wheel', name: 'Ab wheel or rollout', category: 'core', movementPattern: 'core', isSkill: false, targetType: 'bodyweightReps', defaultSets: 3, defaultRepRange: { min: 6, max: 12 }, restSeconds: 60 },
    { id: 'side-plank', name: 'Side plank', category: 'core', movementPattern: 'core', isSkill: false, targetType: 'holdDuration', defaultSets: 3, defaultHoldSeconds: 30, restSeconds: 45 },
    { id: 'mobility-finisher', name: 'Mobility finisher', category: 'mobility', movementPattern: 'mobility', isSkill: false, targetType: 'noteOnly', defaultSets: 1, notes: 'Hips, T-spine, shoulders, and breathing downregulation.' },
    { id: 'wall-handstand', name: 'Wall handstand hold', category: 'skill', movementPattern: 'push', isSkill: true, progressionTag: 'Handstand', targetType: 'holdDuration', defaultSets: 4, defaultHoldSeconds: 20, restSeconds: 60 },
    { id: 'pike-hspu', name: 'Pike HSPU eccentrics or elevated pike push-ups', category: 'skill', movementPattern: 'push', isSkill: true, progressionTag: 'Handstand', targetType: 'bodyweightReps', defaultSets: 4, defaultRepRange: { min: 4, max: 8 }, restSeconds: 90 },
    { id: 'weighted-dips', name: 'Weighted dips', category: 'strength', movementPattern: 'push', isSkill: false, targetType: 'weightedReps', defaultSets: 4, defaultRepRange: { min: 5, max: 8 }, restSeconds: 120 },
    { id: 'bench-press', name: 'Bench press', category: 'strength', movementPattern: 'push', isSkill: false, targetType: 'weightedReps', defaultSets: 4, defaultRepRange: { min: 4, max: 8 }, restSeconds: 150 },
    { id: 'incline-db-press', name: 'Incline dumbbell press', category: 'accessory', movementPattern: 'push', isSkill: false, targetType: 'weightedReps', defaultSets: 3, defaultRepRange: { min: 8, max: 12 }, restSeconds: 90 },
    { id: 'cable-lateral-raise', name: 'Cable lateral raise', category: 'accessory', movementPattern: 'push', isSkill: false, targetType: 'weightedReps', defaultSets: 3, defaultRepRange: { min: 12, max: 15 }, restSeconds: 60 },
    { id: 'triceps-pushdown', name: 'Triceps pushdown', category: 'accessory', movementPattern: 'push', isSkill: false, targetType: 'weightedReps', defaultSets: 3, defaultRepRange: { min: 10, max: 15 }, restSeconds: 60 },
    { id: 'rear-delt', name: 'External rotation / rear delt work', category: 'accessory', movementPattern: 'push', isSkill: false, targetType: 'weightedReps', defaultSets: 3, defaultRepRange: { min: 12, max: 20 }, restSeconds: 60 },
    { id: 'parallette-tuck', name: 'Parallette knee tucks or support hold', category: 'skill', movementPattern: 'core', isSkill: true, progressionTag: 'Planche', targetType: 'holdDuration', defaultSets: 3, defaultHoldSeconds: 15, restSeconds: 60 },
    { id: 'dead-bug', name: 'Dead bug or hollow rock', category: 'core', movementPattern: 'core', isSkill: false, targetType: 'bodyweightReps', defaultSets: 3, defaultRepRange: { min: 8, max: 12 }, restSeconds: 45 }
  ]
};

export const seedSkillLogs: SkillLog[] = [
  { id: 'skill-1', skill: 'Muscle-up', level: 'Chest-to-bar', note: 'Build explosive pull and transition drills.', date: now },
  { id: 'skill-2', skill: 'L-sit', level: 'Tuck', metricValue: 12, metricUnit: 'seconds', date: now },
  { id: 'skill-3', skill: 'Front lever', level: 'Tuck', metricValue: 10, metricUnit: 'seconds', date: now },
  { id: 'skill-4', skill: 'Handstand', level: 'Wall hold', metricValue: 20, metricUnit: 'seconds', date: now },
  { id: 'skill-5', skill: 'Planche', level: 'Frog stand', metricValue: 8, metricUnit: 'seconds', date: now }
];

export const defaultSettings: AppSettings = {
  id: 'app-settings',
  defaultWorkoutStartDay: 1,
  activeWorkoutDayOrder: 1,
  darkMode: false
};

export const skillLadders: Record<string, string[]> = {
  'Muscle-up': ['Chest-to-bar', 'Explosive pull-up', 'Transition drills', 'Band-assisted muscle-up', 'Full muscle-up'],
  'L-sit': ['Tuck', 'One-leg', 'Full'],
  'Front lever': ['Tuck', 'Advanced tuck', 'One-leg'],
  Handstand: ['Wall hold', 'Chest-to-wall', 'Shoulder taps', 'Freestanding attempts'],
  Planche: ['Frog stand', 'Tuck planche lean progression']
};
