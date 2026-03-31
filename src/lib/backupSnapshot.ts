import type {
  Achievement,
  AppDataSnapshot,
  AppSettings,
  BodyMetricLog,
  CheckInLog,
  JournalEntry,
  SkillLog,
  TrainingPlan,
  UserCoachProfile,
  UserOnboarding,
  UserProfile,
  WorkoutSession
} from '../types/models';
import { mergeAppSettings } from './settings';

type BackupObject = Record<string, unknown>;

function isObject(value: unknown): value is BackupObject {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function ensureArray(value: unknown, label: string): BackupObject[] {
  if (!Array.isArray(value)) {
    throw new Error(`Backup is missing a valid "${label}" array.`);
  }

  const invalidEntry = value.find((item) => !isObject(item));
  if (invalidEntry) {
    throw new Error(`Backup "${label}" entries must be objects.`);
  }

  return value;
}

function ensureOptionalArray(value: unknown, label: string): BackupObject[] {
  if (value == null) {
    return [];
  }

  return ensureArray(value, label);
}

function ensureString(value: unknown, label: string): string {
  if (typeof value !== 'string' || !value.trim()) {
    throw new Error(`Backup is missing a valid ${label}.`);
  }

  return value;
}

function dedupeById<T extends { id: string }>(items: T[]): T[] {
  const map = new Map<string, T>();
  items.forEach((item) => map.set(item.id, item));
  return [...map.values()];
}

function assertUserRecords(users: UserProfile[]): void {
  users.forEach((user) => {
    ensureString(user.id, 'user id');
    ensureString(user.name, 'user name');
  });
}

function assertUserScopedRecords(records: Array<{ id: string; userId: string }>, label: string, userIds: Set<string>): void {
  records.forEach((record) => {
    ensureString(record.id, `${label} id`);
    if (!userIds.has(record.userId)) {
      throw new Error(`Backup ${label} record "${record.id}" references an unknown user.`);
    }
  });
}

function assertPlanRecords(plans: TrainingPlan[], userIds: Set<string>): void {
  assertUserScopedRecords(plans, 'plan', userIds);
  plans.forEach((plan) => {
    if (!Array.isArray(plan.days) || !Array.isArray(plan.exerciseTemplates)) {
      throw new Error(`Backup plan "${plan.id}" is missing days or exercise templates.`);
    }
  });
}

function assertSessionRecords(sessions: WorkoutSession[], userIds: Set<string>, planIds: Set<string>): void {
  assertUserScopedRecords(sessions, 'session', userIds);
  sessions.forEach((session) => {
    if (!planIds.has(session.planId)) {
      throw new Error(`Backup session "${session.id}" references an unknown plan.`);
    }
    if (!Array.isArray(session.tasks)) {
      throw new Error(`Backup session "${session.id}" is missing tasks.`);
    }
  });
}

export function createEmptySnapshot(): AppDataSnapshot {
  return {
    users: [],
    activeUserId: null,
    onboardings: [],
    coachProfiles: [],
    plans: [],
    sessions: [],
    skillLogs: [],
    metrics: [],
    checkIns: [],
    achievements: [],
    journalEntries: [],
    settings: [],
    exportedAt: new Date().toISOString()
  };
}

export function normalizeBackupSnapshot(source: unknown): AppDataSnapshot {
  if (!isObject(source)) {
    throw new Error('Backup must contain a JSON object.');
  }

  const users = dedupeById(ensureArray(source.users, 'users') as unknown as UserProfile[]);
  assertUserRecords(users);

  const settings = dedupeById(
    (ensureArray(source.settings, 'settings') as unknown as AppSettings[]).map((setting) => mergeAppSettings(setting))
  );
  const plans = dedupeById(ensureArray(source.plans, 'plans') as unknown as TrainingPlan[]);
  const sessions = dedupeById(ensureArray(source.sessions, 'sessions') as unknown as WorkoutSession[]);
  const onboardings = dedupeById(ensureOptionalArray(source.onboardings, 'onboardings') as unknown as UserOnboarding[]);
  const coachProfiles = dedupeById(ensureOptionalArray(source.coachProfiles, 'coachProfiles') as unknown as UserCoachProfile[]);
  const skillLogs = dedupeById(ensureOptionalArray(source.skillLogs, 'skillLogs') as unknown as SkillLog[]);
  const metrics = dedupeById(ensureOptionalArray(source.metrics, 'metrics') as unknown as BodyMetricLog[]);
  const checkIns = dedupeById(ensureOptionalArray(source.checkIns, 'checkIns') as unknown as CheckInLog[]);
  const achievements = dedupeById(ensureOptionalArray(source.achievements, 'achievements') as unknown as Achievement[]);
  const journalEntries = dedupeById(ensureOptionalArray(source.journalEntries, 'journalEntries') as unknown as JournalEntry[]);

  const userIds = new Set(users.map((user) => user.id));
  const planIds = new Set(plans.map((plan) => plan.id));

  assertUserScopedRecords(onboardings, 'onboarding', userIds);
  assertUserScopedRecords(coachProfiles, 'coach profile', userIds);
  assertUserScopedRecords(skillLogs, 'skill log', userIds);
  assertUserScopedRecords(metrics, 'metric', userIds);
  assertUserScopedRecords(checkIns, 'check-in', userIds);
  assertUserScopedRecords(achievements, 'achievement', userIds);
  assertUserScopedRecords(journalEntries, 'journal entry', userIds);
  assertUserScopedRecords(settings, 'settings', userIds);
  assertPlanRecords(plans, userIds);
  assertSessionRecords(sessions, userIds, planIds);

  let activeUserId: string | null = null;
  if (source.activeUserId != null) {
    activeUserId = ensureString(source.activeUserId, 'active user id');
    if (!userIds.has(activeUserId)) {
      throw new Error('Backup active user does not exist in the imported users list.');
    }
  }

  return {
    users,
    activeUserId,
    onboardings,
    coachProfiles,
    plans,
    sessions,
    skillLogs,
    metrics,
    checkIns,
    achievements,
    journalEntries,
    settings,
    exportedAt: typeof source.exportedAt === 'string' ? source.exportedAt : new Date().toISOString()
  };
}

export function buildBackupSnapshot(snapshot: AppDataSnapshot, userId?: string | null): AppDataSnapshot {
  if (!userId) {
    return {
      ...snapshot,
      exportedAt: new Date().toISOString()
    };
  }

  const hasUser = snapshot.users.some((user) => user.id === userId);
  if (!hasUser) {
    throw new Error('The selected user could not be found for export.');
  }

  return {
    users: snapshot.users.filter((user) => user.id === userId),
    activeUserId: snapshot.activeUserId === userId ? userId : null,
    onboardings: snapshot.onboardings.filter((item) => item.userId === userId),
    coachProfiles: snapshot.coachProfiles.filter((item) => item.userId === userId),
    plans: snapshot.plans.filter((item) => item.userId === userId),
    sessions: snapshot.sessions.filter((item) => item.userId === userId),
    skillLogs: snapshot.skillLogs.filter((item) => item.userId === userId),
    metrics: snapshot.metrics.filter((item) => item.userId === userId),
    checkIns: snapshot.checkIns.filter((item) => item.userId === userId),
    achievements: snapshot.achievements.filter((item) => item.userId === userId),
    journalEntries: snapshot.journalEntries.filter((item) => item.userId === userId),
    settings: snapshot.settings.filter((item) => item.userId === userId),
    exportedAt: new Date().toISOString()
  };
}
