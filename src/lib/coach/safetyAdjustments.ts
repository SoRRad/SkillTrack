import type { ExerciseTemplate, UserOnboarding } from '../../types/models';

export function applySafetyAdjustments(template: ExerciseTemplate, onboarding: UserOnboarding): ExerciseTemplate {
  const shoulderSensitive = onboarding.health.shoulderIssues || (onboarding.health.overheadTolerance ?? 5) <= 2;
  const wristSensitive = (onboarding.health.wristTolerance ?? 5) <= 2;
  const avoid = onboarding.health.movementsToAvoid.join(' ').toLowerCase();

  let next = { ...template };

  if (shoulderSensitive && (template.id.includes('dip') || template.id.includes('handstand'))) {
    next = {
      ...next,
      defaultSets: Math.max(2, next.defaultSets - 1),
      notes: `${next.notes ? `${next.notes} ` : ''}Shoulder history flagged: keep range controlled and stop before pain.`,
      substitutions: [...(next.substitutions ?? []), 'Landmine press', 'Ring support hold', 'Incline push-up']
    };
  }

  if (wristSensitive && (template.id.includes('planche') || template.id.includes('lsit'))) {
    next = {
      ...next,
      notes: `${next.notes ? `${next.notes} ` : ''}Wrist tolerance is low: use neutral handles or parallettes.`,
      substitutions: [...(next.substitutions ?? []), 'Neutral-grip support hold']
    };
  }

  if (avoid && avoid.includes(template.name.toLowerCase().split(' ')[0])) {
    next = {
      ...next,
      notes: `${next.notes ? `${next.notes} ` : ''}Flagged in onboarding as a movement to avoid. Swap if symptoms appear.`
    };
  }

  return next;
}
