import type { Achievement, CheckInLog, SkillLog, WorkoutSession } from '../../types/models';
import { getTrainingStreak } from '../history';

export function deriveAchievements(userId: string, params: { sessions: WorkoutSession[]; skillLogs: SkillLog[]; checkIns: CheckInLog[] }): Achievement[] {
  const achievements: Achievement[] = [];
  const completed = params.sessions.filter((session) => session.status === 'completed');

  if (completed.length >= 1) {
    achievements.push({
      id: `${userId}-first-workout`,
      userId,
      code: 'first-workout',
      title: 'First workout completed',
      description: 'Completed the first logged workout in this browser.',
      earnedAt: completed[0].completedAt ?? completed[0].updatedAt
    });
  }

  if (getTrainingStreak(completed) >= 3) {
    achievements.push({
      id: `${userId}-three-streak`,
      userId,
      code: 'three-workout-streak',
      title: 'Three-day streak',
      description: 'Logged workouts on three consecutive days.',
      earnedAt: completed[0]?.completedAt ?? new Date().toISOString()
    });
  }

  const handstand = params.skillLogs.filter((log) => log.skill === 'Handstand' && (log.metricValue ?? 0) >= 30);
  if (handstand.length) {
    achievements.push({
      id: `${userId}-handstand`,
      userId,
      code: 'handstand-milestone',
      title: 'Handstand hold milestone',
      description: 'Logged a handstand hold of at least 30 seconds.',
      earnedAt: handstand[0].date
    });
  }

  const lSit = params.skillLogs.filter((log) => log.skill === 'L-sit' && (log.metricValue ?? 0) >= 20);
  if (lSit.length) {
    achievements.push({
      id: `${userId}-lsit`,
      userId,
      code: 'lsit-milestone',
      title: 'L-sit milestone',
      description: 'Logged an L-sit hold of at least 20 seconds.',
      earnedAt: lSit[0].date
    });
  }

  const fullWeek = params.checkIns.filter((item) => item.planned && item.completed).length >= 3;
  if (fullWeek) {
    achievements.push({
      id: `${userId}-planned-week`,
      userId,
      code: 'all-planned-this-week',
      title: 'Planned week completed',
      description: 'Completed every planned session in a tracked week.',
      earnedAt: new Date().toISOString()
    });
  }

  return achievements;
}
