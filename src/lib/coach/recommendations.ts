import type { BodyMetricLog, CheckInLog, SkillLog, TrainingPlan, UserCoachProfile, WorkoutSession } from '../../types/models';

export function getReadinessSuggestion(readiness?: CheckInLog['readiness']): string {
  if (!readiness) return 'Proceed as planned.';
  const score = readiness.energy + readiness.motivation + readiness.sleepQuality - readiness.soreness;
  if (score <= 7) return 'Recovery looks low today. Reduce accessory volume or keep the session technique-focused.';
  if (score <= 11) return 'Proceed, but cap the final working sets if bar speed slows down.';
  return 'Proceed as planned. Readiness looks solid.';
}

export function buildCoachSuggestions(params: {
  coachProfile?: UserCoachProfile;
  plan?: TrainingPlan;
  sessions: WorkoutSession[];
  checkIns: CheckInLog[];
  skillLogs: SkillLog[];
  metrics: BodyMetricLog[];
}): string[] {
  const suggestions = [...(params.coachProfile?.recommendationMemory ?? [])];
  const thisWeek = params.checkIns.filter((item) => {
    const diff = Date.now() - new Date(`${item.date}T12:00:00`).getTime();
    return diff <= 7 * 86400000;
  });

  const missed = thisWeek.filter((item) => item.planned && !item.completed).length;
  if (missed >= 2) suggestions.unshift(`You have missed ${missed} planned sessions this week.`);

  const frontLever = params.skillLogs.filter((item) => item.skill === 'Front lever').sort((a, b) => b.date.localeCompare(a.date));
  if (frontLever.length >= 3) {
    const recent = frontLever.slice(0, 3);
    const improved = recent.every((item, index, arr) => index === 0 || (item.metricValue ?? 0) >= (arr[index - 1].metricValue ?? 0));
    if (improved) suggestions.unshift('Your front lever holds improved across the last three logs.');
  }

  const latestMetric = params.metrics.filter((item) => item.weightKg != null).sort((a, b) => b.date.localeCompare(a.date))[0];
  if (latestMetric?.weightKg != null) suggestions.push(`Current logged body weight: ${latestMetric.weightKg} kg.`);

  const inProgress = params.sessions.find((item) => item.status === 'inProgress');
  if (inProgress) suggestions.unshift('You have an in-progress workout ready to resume.');

  if (params.plan) suggestions.push(`Current phase: ${params.plan.phase}. ${params.plan.planType}.`);
  return suggestions.slice(0, 6);
}
