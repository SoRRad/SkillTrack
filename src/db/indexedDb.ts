/*
legacy content intentionally retained in comments during the multi-user upgrade.
*/

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
import {
  defaultOnboarding,
  defaultSettings,
  defaultUserId,
  exampleOnboarding,
  exampleUser,
  seedCheckIns,
  seedMetrics,
  seedPlan,
  seedSkillLogs
} from '../data/seed';
import { generatePlanForUser } from '../lib/coach/planGenerator';
import { mergeAppSettings } from '../lib/settings';

const DB_NAME = 'skilltrack-db';
const DB_VERSION = 3;
const APP_META_ID = 'app-meta';

const stores = {
  users: 'users',
  onboardings: 'onboardings',
  coachProfiles: 'coachProfiles',
  plans: 'plan',
  sessions: 'sessions',
  skillLogs: 'skillLogs',
  metrics: 'metrics',
  checkIns: 'checkIns',
  achievements: 'achievements',
  journalEntries: 'journalEntries',
  settings: 'settings',
  appMeta: 'appMeta'
} as const;

type StoreName = (typeof stores)[keyof typeof stores];

function openDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    request.onerror = () => reject(request.error);
    request.onupgradeneeded = () => {
      const db = request.result;
      Object.values(stores).forEach((name) => {
        if (!db.objectStoreNames.contains(name)) {
          db.createObjectStore(name, { keyPath: 'id' });
        }
      });
    };
    request.onsuccess = () => resolve(request.result);
  });
}

function tx<T>(storeName: StoreName, mode: IDBTransactionMode, fn: (store: IDBObjectStore) => IDBRequest<T>): Promise<T> {
  return openDb().then(
    (db) =>
      new Promise((resolve, reject) => {
        const transaction = db.transaction(storeName, mode);
        const store = transaction.objectStore(storeName);
        const request = fn(store);
        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
      })
  );
}

async function getAll<T>(storeName: StoreName): Promise<T[]> {
  return ((await tx(storeName, 'readonly', (store) => store.getAll())) as T[]) ?? [];
}

async function getOne<T>(storeName: StoreName, id: string): Promise<T | undefined> {
  return (await tx(storeName, 'readonly', (store) => store.get(id))) as T | undefined;
}

async function put<T>(storeName: StoreName, value: T): Promise<void> {
  await tx(storeName, 'readwrite', (store) => store.put(value));
}

async function clearAllStores(): Promise<void> {
  const db = await openDb();
  await new Promise<void>((resolve, reject) => {
    const transaction = db.transaction(Object.values(stores), 'readwrite');
    transaction.onerror = () => reject(transaction.error);
    transaction.oncomplete = () => resolve();
    Object.values(stores).forEach((name) => {
      transaction.objectStore(name).clear();
    });
  });
}

function coerceLegacySessions(records: any[], userId: string, planId: string): WorkoutSession[] {
  return records.map((session) => ({
    id: session.id ?? crypto.randomUUID(),
    userId: session.userId ?? userId,
    planId,
    workoutDayId: session.workoutDayId ?? `${userId}-day-1`,
    date: session.date ?? new Date().toISOString().slice(0, 10),
    startedAt: session.startedAt ?? new Date().toISOString(),
    updatedAt: session.completedAt ?? session.startedAt ?? new Date().toISOString(),
    completedAt: session.completed ? session.completedAt ?? session.startedAt ?? new Date().toISOString() : undefined,
    status: session.completed ? 'completed' : 'inProgress',
    currentTaskIndex: 0,
    tasks: Array.isArray(session.tasks)
      ? session.tasks
      : [
          {
            id: `${session.id ?? crypto.randomUUID()}-legacy`,
            exerciseId: session.setLogs?.[0]?.exerciseId ?? 'legacy-session',
            order: 0,
            status: session.completed ? 'completed' : 'pending',
            setLogs: session.setLogs ?? [],
            taskNote: session.workoutNote
          }
        ],
    workoutNote: session.workoutNote
  }));
}

function coerceUserProfile(): UserProfile {
  return {
    ...exampleUser,
    name: 'Imported User',
    mainGoal: 'Imported legacy training data',
    planType: seedPlan.planType
  };
}

async function migrateLegacyDataIfNeeded(): Promise<void> {
  const existingUsers = await getAll<UserProfile>(stores.users).catch(() => []);
  const appMeta = await getOne<ActiveUserState>(stores.appMeta, APP_META_ID).catch(() => undefined);
  if (existingUsers.length && appMeta?.schemaVersion === DB_VERSION) return;

  const legacyPlans = await getAll<any>(stores.plans).catch(() => []);
  const legacySessions = await getAll<any>(stores.sessions).catch(() => []);
  const legacySkillLogs = await getAll<any>(stores.skillLogs).catch(() => []);
  const legacyMetrics = await getAll<any>(stores.metrics).catch(() => []);
  const legacySettings = await getAll<any>(stores.settings).catch(() => []);
  const legacyCheckIns = await getAll<any>(stores.checkIns).catch(() => []);

  const hasLegacyData = legacyPlans.length || legacySessions.length || legacySkillLogs.length || legacyMetrics.length;
  const baseUser = hasLegacyData ? coerceUserProfile() : exampleUser;
  const onboarding = hasLegacyData ? { ...exampleOnboarding, userId: defaultUserId, id: `onboarding-${defaultUserId}` } : exampleOnboarding;
  const generated = generatePlanForUser(baseUser, onboarding);

  if (!existingUsers.length) {
    await put(stores.users, baseUser);
  }

  await put(stores.onboardings, onboarding);
  await put(stores.coachProfiles, generated.coachProfile);
  await put(stores.plans, legacyPlans[0]?.userId ? legacyPlans[0] : { ...(legacyPlans[0] ?? generated.plan), userId: defaultUserId, id: `plan-${defaultUserId}` });

  const nextSettings = mergeAppSettings({
    ...(legacySettings.find((item) => item?.userId === defaultUserId || item?.id === 'app-settings') ?? {}),
    ...defaultSettings(defaultUserId),
    onboardingComplete: true
  });
  await put(stores.settings, nextSettings);

  const sessions = coerceLegacySessions(legacySessions, defaultUserId, `plan-${defaultUserId}`);
  if (sessions.length) {
    for (const session of sessions) await put(stores.sessions, session);
  }

  const skillLogs = legacySkillLogs.length
    ? legacySkillLogs.map((log: any) => ({ ...log, userId: log.userId ?? defaultUserId }))
    : seedSkillLogs;
  for (const log of skillLogs) await put(stores.skillLogs, log as SkillLog);

  const metrics = legacyMetrics.length
    ? legacyMetrics.map((metric: any) => ({ ...metric, userId: metric.userId ?? defaultUserId }))
    : seedMetrics;
  for (const metric of metrics) await put(stores.metrics, metric as BodyMetricLog);

  const checkIns = legacyCheckIns.length
    ? legacyCheckIns.map((checkIn: any) => ({ ...checkIn, userId: checkIn.userId ?? defaultUserId }))
    : seedCheckIns;
  for (const checkIn of checkIns) await put(stores.checkIns, checkIn as CheckInLog);

  await put(stores.appMeta, { id: APP_META_ID, schemaVersion: DB_VERSION, activeUserId: null } satisfies ActiveUserState);
}

async function ensurePerUserDefaults(): Promise<void> {
  const users = (await getAll<UserProfile>(stores.users)).filter((user) => !user.archived);
  const onboardings = await getAll<UserOnboarding>(stores.onboardings);
  const coachProfiles = await getAll<UserCoachProfile>(stores.coachProfiles);
  const plans = await getAll<TrainingPlan>(stores.plans);
  const settings = await getAll<AppSettings>(stores.settings);

  for (const user of users) {
    let onboarding = onboardings.find((item) => item.userId === user.id);
    if (!onboarding) {
      onboarding = user.id === defaultUserId ? exampleOnboarding : defaultOnboarding(user.id);
      await put(stores.onboardings, onboarding);
    }

    if (!plans.some((item) => item.userId === user.id) || !coachProfiles.some((item) => item.userId === user.id)) {
      const generated = generatePlanForUser(user, onboarding);
      await put(stores.plans, generated.plan);
      await put(stores.coachProfiles, generated.coachProfile);
    }

    if (!settings.some((item) => item.userId === user.id)) {
      await put(stores.settings, user.id === defaultUserId ? mergeAppSettings({ ...defaultSettings(user.id), onboardingComplete: true }) : defaultSettings(user.id));
    }
  }

  const appMeta = await getOne<ActiveUserState>(stores.appMeta, APP_META_ID);
  if (!appMeta) {
    await put(stores.appMeta, { id: APP_META_ID, schemaVersion: DB_VERSION, activeUserId: null } satisfies ActiveUserState);
  } else if (appMeta.schemaVersion !== DB_VERSION) {
    await put(stores.appMeta, { ...appMeta, schemaVersion: DB_VERSION });
  }
}

export async function initializeSeedIfNeeded(): Promise<void> {
  await migrateLegacyDataIfNeeded();
  await ensurePerUserDefaults();
}

export async function getSnapshot(): Promise<AppDataSnapshot> {
  const users = await getAll<UserProfile>(stores.users);
  const appMeta = await getOne<ActiveUserState>(stores.appMeta, APP_META_ID);

  return {
    users,
    activeUserId: appMeta?.activeUserId ?? null,
    onboardings: await getAll<UserOnboarding>(stores.onboardings),
    coachProfiles: await getAll<UserCoachProfile>(stores.coachProfiles),
    plans: await getAll<TrainingPlan>(stores.plans),
    sessions: await getAll<WorkoutSession>(stores.sessions),
    skillLogs: await getAll<SkillLog>(stores.skillLogs),
    metrics: await getAll<BodyMetricLog>(stores.metrics),
    checkIns: await getAll<CheckInLog>(stores.checkIns),
    achievements: await getAll<Achievement>(stores.achievements),
    journalEntries: await getAll<JournalEntry>(stores.journalEntries),
    settings: await getAll<AppSettings>(stores.settings),
    exportedAt: new Date().toISOString()
  };
}

export async function replaceAllData(snapshot: AppDataSnapshot): Promise<void> {
  await clearAllStores();
  for (const user of snapshot.users) await put(stores.users, user);
  for (const onboarding of snapshot.onboardings) await put(stores.onboardings, onboarding);
  for (const coachProfile of snapshot.coachProfiles) await put(stores.coachProfiles, coachProfile);
  for (const plan of snapshot.plans) await put(stores.plans, plan);
  for (const session of snapshot.sessions) await put(stores.sessions, session);
  for (const skillLog of snapshot.skillLogs) await put(stores.skillLogs, skillLog);
  for (const metric of snapshot.metrics) await put(stores.metrics, metric);
  for (const checkIn of snapshot.checkIns) await put(stores.checkIns, checkIn);
  for (const achievement of snapshot.achievements) await put(stores.achievements, achievement);
  for (const journalEntry of snapshot.journalEntries) await put(stores.journalEntries, journalEntry);
  for (const setting of snapshot.settings) await put(stores.settings, mergeAppSettings(setting));
  await put(stores.appMeta, { id: APP_META_ID, schemaVersion: DB_VERSION, activeUserId: snapshot.activeUserId } satisfies ActiveUserState);
}

export async function saveUserProfile(user: UserProfile): Promise<void> {
  await put(stores.users, user);
}

export async function saveOnboarding(onboarding: UserOnboarding): Promise<void> {
  await put(stores.onboardings, onboarding);
}

export async function saveCoachProfile(profile: UserCoachProfile): Promise<void> {
  await put(stores.coachProfiles, profile);
}

export async function savePlan(plan: TrainingPlan): Promise<void> {
  await put(stores.plans, plan);
}

export async function saveSession(session: WorkoutSession): Promise<void> {
  await put(stores.sessions, session);
}

export async function saveSkillLog(log: SkillLog): Promise<void> {
  await put(stores.skillLogs, log);
}

export async function saveMetricLog(log: BodyMetricLog): Promise<void> {
  await put(stores.metrics, log);
}

export async function saveCheckIn(log: CheckInLog): Promise<void> {
  await put(stores.checkIns, log);
}

export async function saveAchievement(achievement: Achievement): Promise<void> {
  await put(stores.achievements, achievement);
}

export async function saveJournalEntry(entry: JournalEntry): Promise<void> {
  await put(stores.journalEntries, entry);
}

export async function saveSettings(settings: AppSettings): Promise<void> {
  await put(stores.settings, mergeAppSettings(settings));
}

export async function setActiveUserId(userId: string | null): Promise<void> {
  await put(stores.appMeta, { id: APP_META_ID, schemaVersion: DB_VERSION, activeUserId: userId } satisfies ActiveUserState);
}

export async function resetAllData(): Promise<void> {
  await clearAllStores();
  await initializeSeedIfNeeded();
}
