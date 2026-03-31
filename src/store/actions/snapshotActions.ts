import type { AppDataSnapshot, AppSettings, UserOnboarding, UserProfile } from '../../types/models';
import { createEmptySnapshot } from '../../lib/backupSnapshot';

type SnapshotCollectionKey = Exclude<keyof AppDataSnapshot, 'activeUserId' | 'exportedAt'>;
type SnapshotCollectionMap = Pick<AppDataSnapshot, SnapshotCollectionKey>;

export const EMPTY_SNAPSHOT: AppDataSnapshot = createEmptySnapshot();

export function updateSnapshotActiveUser(snapshot: AppDataSnapshot, userId: string | null): AppDataSnapshot {
  return {
    ...snapshot,
    activeUserId: userId
  };
}

export function upsertSnapshotRecord<K extends SnapshotCollectionKey>(
  snapshot: AppDataSnapshot,
  key: K,
  record: SnapshotCollectionMap[K][number]
): AppDataSnapshot {
  const currentCollection = snapshot[key] as SnapshotCollectionMap[K];
  const nextCollection = [...currentCollection];
  const index = nextCollection.findIndex((item) => item.id === record.id);

  if (index === -1) {
    nextCollection.push(record);
  } else {
    nextCollection[index] = record;
  }

  return {
    ...snapshot,
    [key]: nextCollection
  } as AppDataSnapshot;
}

export function upsertSnapshotRecords<K extends SnapshotCollectionKey>(
  snapshot: AppDataSnapshot,
  key: K,
  records: SnapshotCollectionMap[K]
): AppDataSnapshot {
  return records.reduce((nextSnapshot, record) => upsertSnapshotRecord(nextSnapshot, key, record), snapshot);
}

export function archiveUserInSnapshot(snapshot: AppDataSnapshot, userId: string): AppDataSnapshot {
  const nextUsers = snapshot.users.map((user) => (user.id === userId ? { ...user, archived: true } : user));
  return {
    ...snapshot,
    users: nextUsers,
    activeUserId: snapshot.activeUserId === userId ? null : snapshot.activeUserId
  };
}

export function createUserProfile(name: string): UserProfile {
  const now = new Date().toISOString();
  return {
    id: crypto.randomUUID(),
    name: name.trim() || 'New user',
    createdAt: now,
    mainGoal: 'Build consistency',
    currentPhase: 'foundation',
    planType: 'Needs onboarding'
  };
}

export function describeMainGoal(onboarding: UserOnboarding): string {
  const topSkill = Object.entries(onboarding.skillGoals)
    .sort(([, left = 0], [, right = 0]) => right - left)[0]?.[0];

  if (topSkill) {
    return `${topSkill} progress + personalized training`;
  }

  const topGoal = Object.entries(onboarding.goals).sort(([, left], [, right]) => right - left)[0]?.[0];
  const labels: Record<string, string> = {
    muscleGain: 'Muscle gain',
    fatLoss: 'Fat loss',
    strength: 'Strength',
    calisthenicsSkill: 'Calisthenics skill',
    mobility: 'Mobility',
    athleticPerformance: 'Athletic performance',
    endurance: 'Endurance',
    rehab: 'Return to training'
  };

  return topGoal ? `${labels[topGoal] ?? 'Personalized'} focus` : 'Personalized training';
}

export function mergeSettingsPatch(settings: AppSettings, patch: Partial<AppSettings>): AppSettings {
  return {
    ...settings,
    ...patch,
    id: settings.id,
    userId: settings.userId
  };
}
