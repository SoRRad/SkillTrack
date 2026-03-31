import type { ExerciseCategory, ExerciseTemplate, ExperienceLevel, GoalKey, UserGoalProfile } from '../../types/models';

function pickSets(category: ExerciseCategory, level: ExperienceLevel): number {
  if (category === 'warmup' || category === 'mobility') return 1;
  if (level === 'beginner') return category === 'accessory' ? 2 : 3;
  if (level === 'advanced') return category === 'skill' ? 5 : 4;
  return category === 'accessory' ? 3 : 4;
}

function topGoal(goalProfile: UserGoalProfile): GoalKey {
  return goalProfile.primaryGoal;
}

export function tuneExerciseTemplate(template: ExerciseTemplate, params: { level: ExperienceLevel; goalProfile: UserGoalProfile }): ExerciseTemplate {
  const { level, goalProfile } = params;
  const sets = pickSets(template.category, level);

  if (template.targetType === 'holdDuration') {
    const base = template.defaultHoldSeconds ?? 10;
    return {
      ...template,
      defaultSets: sets,
      defaultHoldSeconds: topGoal(goalProfile) === 'calisthenicsSkill' ? base + 5 : base
    };
  }

  if (template.targetType === 'weightedReps' || template.targetType === 'bodyweightReps') {
    const base = template.defaultRepRange ?? { min: 6, max: 10 };
    if (topGoal(goalProfile) === 'strength') {
      return { ...template, defaultSets: sets, defaultRepRange: { min: Math.max(3, base.min - 2), max: Math.max(5, base.max - 2) } };
    }
    if (topGoal(goalProfile) === 'muscleGain') {
      return { ...template, defaultSets: sets, defaultRepRange: { min: base.min + 2, max: base.max + 2 } };
    }
    return { ...template, defaultSets: sets, defaultRepRange: base };
  }

  return { ...template, defaultSets: sets };
}
