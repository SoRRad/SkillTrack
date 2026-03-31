import type { TrainingPlan, UserCoachProfile, UserOnboarding, UserProfile, WorkoutDayTemplate } from '../../types/models';
import { buildGoalProfile, inferPhase } from './goalScoring';
import { selectExercises } from './exercisePool';
import { selectSplit } from './splitSelection';

export function generatePlanForUser(user: UserProfile, onboarding: UserOnboarding): { plan: TrainingPlan; coachProfile: UserCoachProfile } {
  const now = new Date().toISOString();
  const goalProfile = buildGoalProfile(onboarding);
  const phase = inferPhase(goalProfile);
  const split = selectSplit(onboarding, goalProfile);
  const days: WorkoutDayTemplate[] = split.focuses.map((focus, index) => ({
    id: `${user.id}-day-${index + 1}`,
    userId: user.id,
    order: index + 1,
    name: `Day ${index + 1}`,
    focus,
    durationMinutes: onboarding.trainingAvailability.sessionLengthMinutes,
    phase,
    notes: [],
    exerciseIds: []
  }));

  const exerciseTemplates = days.flatMap((day) => {
    const selected = selectExercises({ focus: day.focus, onboarding, goalProfile });
    day.exerciseIds = selected.map((exercise) => exercise.id);
    day.notes = [
      goalProfile.skillPriorities.length ? `Open with ${goalProfile.skillPriorities[0]} work while fresh.` : 'Open with the first compound while fresh.',
      onboarding.health.shoulderIssues ? 'Shoulder history flagged: stop short of sharp pain.' : 'Progress only when reps stay crisp.',
      goalProfile.primaryGoal === 'mobility' ? 'Keep transitions calm and use the rest periods to reset positions.' : 'Leave 1-2 reps in reserve on compounds.'
    ];
    return selected;
  });

  const coachNotes = [
    `Primary goal: ${goalProfile.primaryGoal}.`,
    `Plan emphasis: ${split.label}.`,
    onboarding.health.shoulderIssues ? 'Shoulder history detected, so overhead and dip volume is moderated.' : 'No major shoulder limiter flagged.',
    goalProfile.skillPriorities.length ? `Top skills: ${goalProfile.skillPriorities.join(', ')}.` : 'No explicit skill priority selected.'
  ];

  const coachProfile: UserCoachProfile = {
    id: `coach-${user.id}`,
    userId: user.id,
    mainGoal: goalProfile.primaryGoal,
    currentPhase: phase,
    planType: split.label,
    goalProfile,
    coachingNotes: coachNotes,
    recommendationMemory: coachNotes,
    injuryFlags: [
      onboarding.health.shoulderIssues ? 'shoulder' : '',
      onboarding.health.kneeIssues ? 'knee' : '',
      onboarding.health.backIssues ? 'back' : ''
    ].filter(Boolean),
    updatedAt: now
  };

  const plan: TrainingPlan = {
    id: `plan-${user.id}`,
    userId: user.id,
    name: `${user.name}'s Local Plan`,
    phase,
    planType: split.label,
    weeklyTargetDays: onboarding.trainingAvailability.daysPerWeek,
    generatedAt: now,
    updatedAt: now,
    generatorVersion: 'coach-v1',
    coachNotes,
    days,
    exerciseTemplates
  };

  return { plan, coachProfile };
}
