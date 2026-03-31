import type { GoalKey, PhaseType, SkillName, UserGoalProfile, UserOnboarding } from '../../types/models';

const goalOrder: GoalKey[] = [
  'calisthenicsSkill',
  'strength',
  'muscleGain',
  'fatLoss',
  'mobility',
  'athleticPerformance',
  'endurance',
  'rehab'
];

const skillOrder: SkillName[] = [
  'Muscle-up',
  'L-sit',
  'Front lever',
  'Handstand',
  'Planche',
  'Pull-up',
  'Chin-up',
  'Dip',
  'Pistol squat',
  'Weighted pull-up',
  'Weighted dip'
];

export function buildGoalProfile(onboarding: UserOnboarding): UserGoalProfile {
  const rankedGoals = goalOrder
    .map((goal) => ({ goal, score: onboarding.goals[goal] ?? 0 }))
    .sort((a, b) => b.score - a.score);

  const rankedSkills = skillOrder
    .map((skill) => ({ skill, score: onboarding.skillGoals[skill] ?? 0 }))
    .filter((item) => item.score > 0)
    .sort((a, b) => b.score - a.score)
    .map((item) => item.skill);

  return {
    primaryGoal: rankedGoals[0]?.goal ?? 'strength',
    secondaryGoals: rankedGoals.slice(1, 4).filter((item) => item.score > 0).map((item) => item.goal),
    skillPriorities: rankedSkills.slice(0, 4),
    nutritionGoal: onboarding.nutrition.goal
  };
}

export function inferPhase(goalProfile: UserGoalProfile): PhaseType {
  if (goalProfile.primaryGoal === 'fatLoss') {
    return goalProfile.nutritionGoal === 'recomp' ? 'recomp' : 'cut';
  }
  if (goalProfile.primaryGoal === 'calisthenicsSkill') return 'skill-emphasis';
  if (goalProfile.primaryGoal === 'muscleGain') return 'hypertrophy';
  if (goalProfile.primaryGoal === 'rehab') return 'foundation';
  return 'strength-block';
}
