import type {
  Achievement,
  ActiveUserState,
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
import { normalizeBackupSnapshot } from '../lib/backupSnapshot';
import { mergeAppSettings } from '../lib/settings';
import { initializeSeedIfNeeded } from './bootstrap';
import { clearManagedStores, getAllRecords, getRecord, putRecord } from './client';
import { APP_META_ID, DB_VERSION, STORES } from './schema';

async function persistCollection<T>(storeName: keyof typeof STORES, records: T[]): Promise<void> {
  for (const record of records) {
    await putRecord(STORES[storeName], record);
  }
}

export { initializeSeedIfNeeded } from './bootstrap';

export async function getSnapshot(): Promise<AppDataSnapshot> {
  const [
    users,
    appMeta,
    onboardings,
    coachProfiles,
    plans,
    sessions,
    skillLogs,
    metrics,
    checkIns,
    achievements,
    journalEntries,
    settings
  ] = await Promise.all([
    getAllRecords<UserProfile>(STORES.users),
    getRecord<ActiveUserState>(STORES.appMeta, APP_META_ID),
    getAllRecords<UserOnboarding>(STORES.onboardings),
    getAllRecords<UserCoachProfile>(STORES.coachProfiles),
    getAllRecords<TrainingPlan>(STORES.plans),
    getAllRecords<WorkoutSession>(STORES.sessions),
    getAllRecords<SkillLog>(STORES.skillLogs),
    getAllRecords<BodyMetricLog>(STORES.metrics),
    getAllRecords<CheckInLog>(STORES.checkIns),
    getAllRecords<Achievement>(STORES.achievements),
    getAllRecords<JournalEntry>(STORES.journalEntries),
    getAllRecords<AppSettings>(STORES.settings)
  ]);

  return {
    users,
    activeUserId: appMeta?.activeUserId ?? null,
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
    exportedAt: new Date().toISOString()
  };
}

export async function replaceAllData(snapshot: AppDataSnapshot): Promise<void> {
  const normalized = normalizeBackupSnapshot(snapshot);

  await clearManagedStores();
  await persistCollection('users', normalized.users);
  await persistCollection('onboardings', normalized.onboardings);
  await persistCollection('coachProfiles', normalized.coachProfiles);
  await persistCollection('plans', normalized.plans);
  await persistCollection('sessions', normalized.sessions);
  await persistCollection('skillLogs', normalized.skillLogs);
  await persistCollection('metrics', normalized.metrics);
  await persistCollection('checkIns', normalized.checkIns);
  await persistCollection('achievements', normalized.achievements);
  await persistCollection('journalEntries', normalized.journalEntries);
  await persistCollection('settings', normalized.settings.map((setting) => mergeAppSettings(setting)));
  await putRecord(STORES.appMeta, {
    id: APP_META_ID,
    schemaVersion: DB_VERSION,
    activeUserId: normalized.activeUserId
  } satisfies ActiveUserState);
  await initializeSeedIfNeeded();
}

export async function saveUserProfile(user: UserProfile): Promise<void> {
  await putRecord(STORES.users, user);
}

export async function saveOnboarding(onboarding: UserOnboarding): Promise<void> {
  await putRecord(STORES.onboardings, onboarding);
}

export async function saveCoachProfile(profile: UserCoachProfile): Promise<void> {
  await putRecord(STORES.coachProfiles, profile);
}

export async function savePlan(plan: TrainingPlan): Promise<void> {
  await putRecord(STORES.plans, plan);
}

export async function saveSession(session: WorkoutSession): Promise<void> {
  await putRecord(STORES.sessions, session);
}

export async function saveSkillLog(log: SkillLog): Promise<void> {
  await putRecord(STORES.skillLogs, log);
}

export async function saveMetricLog(log: BodyMetricLog): Promise<void> {
  await putRecord(STORES.metrics, log);
}

export async function saveCheckIn(log: CheckInLog): Promise<void> {
  await putRecord(STORES.checkIns, log);
}

export async function saveAchievement(achievement: Achievement): Promise<void> {
  await putRecord(STORES.achievements, achievement);
}

export async function saveJournalEntry(entry: JournalEntry): Promise<void> {
  await putRecord(STORES.journalEntries, entry);
}

export async function saveSettings(settings: AppSettings): Promise<void> {
  await putRecord(STORES.settings, mergeAppSettings(settings));
}

export async function setActiveUserId(userId: string | null): Promise<void> {
  await putRecord(STORES.appMeta, {
    id: APP_META_ID,
    schemaVersion: DB_VERSION,
    activeUserId: userId
  } satisfies ActiveUserState);
}

export async function resetAllData(): Promise<void> {
  await clearManagedStores();
  await initializeSeedIfNeeded();
}
