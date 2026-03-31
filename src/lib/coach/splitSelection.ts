import type { GoalKey, UserGoalProfile, UserOnboarding } from '../../types/models';

type SplitTemplate = {
  label: string;
  focuses: string[];
};

const splitMatrix: Record<number, SplitTemplate> = {
  2: { label: 'Full body alternating', focuses: ['Full Body A', 'Full Body B'] },
  3: { label: 'Pull / Legs / Push', focuses: ['Pull + Skill', 'Legs + Core', 'Push + Skill'] },
  4: { label: 'Upper / Lower / Skill / Full', focuses: ['Upper Strength', 'Lower Strength', 'Skill + Core', 'Full Body Pump'] },
  5: { label: 'Skill / Pull / Legs / Push / Mixed', focuses: ['Skill Priority', 'Pull Strength', 'Leg Strength', 'Push Strength', 'Conditioning + Mobility'] }
};

function hasGoal(goalProfile: UserGoalProfile, goal: GoalKey): boolean {
  return goalProfile.primaryGoal === goal || goalProfile.secondaryGoals.includes(goal);
}

export function selectSplit(onboarding: UserOnboarding, goalProfile: UserGoalProfile): SplitTemplate {
  const requestedDays = Math.max(2, Math.min(5, onboarding.trainingAvailability.daysPerWeek || 3));
  const base = splitMatrix[requestedDays] ?? splitMatrix[3];

  if (goalProfile.skillPriorities.length && requestedDays === 3) {
    return {
      label: 'Skill-first 3 day split',
      focuses: ['Pull Skill', 'Lower + Core', 'Push Skill']
    };
  }

  if (hasGoal(goalProfile, 'mobility') && requestedDays >= 4) {
    return {
      label: 'Mobility-supported split',
      focuses: [...base.focuses.slice(0, requestedDays - 1), 'Mobility + Recovery']
    };
  }

  return base;
}
