import type {
  ActiveUserState,
  AppSettings,
  BodyMetricLog,
  CheckInLog,
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
import { getAllRecords, getRecord, putRecord } from './client';
import { APP_META_ID, DB_VERSION, STORES } from './schema';

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

function coerceLegacyUserProfile(): UserProfile {
  return {
    ...exampleUser,
    mainGoal: exampleUser.mainGoal,
    planType: seedPlan.planType
  };
}

async function migrateLegacyDataIfNeeded(): Promise<void> {
  const existingUsers = await getAllRecords<UserProfile>(STORES.users).catch(() => []);
  const appMeta = await getRecord<ActiveUserState>(STORES.appMeta, APP_META_ID).catch(() => undefined);

  if (existingUsers.length && appMeta?.schemaVersion === DB_VERSION) {
    return;
  }

  const legacyPlans = await getAllRecords<any>(STORES.plans).catch(() => []);
  const legacySessions = await getAllRecords<any>(STORES.sessions).catch(() => []);
  const legacySkillLogs = await getAllRecords<any>(STORES.skillLogs).catch(() => []);
  const legacyMetrics = await getAllRecords<any>(STORES.metrics).catch(() => []);
  const legacySettings = await getAllRecords<any>(STORES.settings).catch(() => []);
  const legacyCheckIns = await getAllRecords<any>(STORES.checkIns).catch(() => []);

  const hasLegacyData = legacyPlans.length || legacySessions.length || legacySkillLogs.length || legacyMetrics.length;
  const baseUser = hasLegacyData ? coerceLegacyUserProfile() : exampleUser;
  const onboarding = hasLegacyData
    ? {
        ...exampleOnboarding,
        userId: defaultUserId,
        id: `onboarding-${defaultUserId}`
      }
    : exampleOnboarding;
  const generated = generatePlanForUser(baseUser, onboarding);

  if (!existingUsers.length) {
    await putRecord(STORES.users, baseUser);
  }

  await putRecord(STORES.onboardings, onboarding);
  await putRecord(STORES.coachProfiles, generated.coachProfile);
  await putRecord(
    STORES.plans,
    legacyPlans[0]?.userId
      ? legacyPlans[0]
      : {
          ...(legacyPlans[0] ?? generated.plan),
          userId: defaultUserId,
          id: `plan-${defaultUserId}`
        }
  );

  const nextSettings = mergeAppSettings({
    ...(legacySettings.find((item) => item?.userId === defaultUserId || item?.id === 'app-settings') ?? {}),
    ...defaultSettings(defaultUserId),
    onboardingComplete: true
  });
  await putRecord(STORES.settings, nextSettings);

  const sessions = coerceLegacySessions(legacySessions, defaultUserId, `plan-${defaultUserId}`);
  for (const session of sessions) {
    await putRecord(STORES.sessions, session);
  }

  const skillLogs = legacySkillLogs.length
    ? legacySkillLogs.map((log: any) => ({ ...log, userId: log.userId ?? defaultUserId }))
    : seedSkillLogs;
  for (const log of skillLogs) {
    await putRecord(STORES.skillLogs, log as SkillLog);
  }

  const metrics = legacyMetrics.length
    ? legacyMetrics.map((metric: any) => ({ ...metric, userId: metric.userId ?? defaultUserId }))
    : seedMetrics;
  for (const metric of metrics) {
    await putRecord(STORES.metrics, metric as BodyMetricLog);
  }

  const checkIns = legacyCheckIns.length
    ? legacyCheckIns.map((checkIn: any) => ({ ...checkIn, userId: checkIn.userId ?? defaultUserId }))
    : seedCheckIns;
  for (const checkIn of checkIns) {
    await putRecord(STORES.checkIns, checkIn as CheckInLog);
  }

  await putRecord(STORES.appMeta, {
    id: APP_META_ID,
    schemaVersion: DB_VERSION,
    activeUserId: appMeta?.activeUserId ?? null
  } satisfies ActiveUserState);
}

async function ensurePerUserDefaults(): Promise<void> {
  const users = (await getAllRecords<UserProfile>(STORES.users)).filter((user) => !user.archived);
  const onboardings = await getAllRecords<UserOnboarding>(STORES.onboardings);
  const coachProfiles = await getAllRecords<UserCoachProfile>(STORES.coachProfiles);
  const plans = await getAllRecords<TrainingPlan>(STORES.plans);
  const settings = await getAllRecords<AppSettings>(STORES.settings);

  for (const user of users) {
    if (user.id === defaultUserId && (user.name === 'Imported User' || user.mainGoal === 'Imported legacy training data')) {
      await putRecord(STORES.users, {
        ...user,
        name: exampleUser.name,
        age: exampleUser.age,
        sex: exampleUser.sex,
        heightCm: exampleUser.heightCm,
        mainGoal: exampleUser.mainGoal,
        currentPhase: exampleUser.currentPhase,
        planType: exampleUser.planType
      });
    }

    let onboarding = onboardings.find((item) => item.userId === user.id);
    if (!onboarding) {
      onboarding = user.id === defaultUserId ? exampleOnboarding : defaultOnboarding(user.id);
      await putRecord(STORES.onboardings, onboarding);
    }

    if (!plans.some((item) => item.userId === user.id) || !coachProfiles.some((item) => item.userId === user.id)) {
      const generated = generatePlanForUser(user, onboarding);
      await putRecord(STORES.plans, generated.plan);
      await putRecord(STORES.coachProfiles, generated.coachProfile);
    }

    if (!settings.some((item) => item.userId === user.id)) {
      await putRecord(
        STORES.settings,
        user.id === defaultUserId
          ? mergeAppSettings({ ...defaultSettings(user.id), onboardingComplete: true })
          : defaultSettings(user.id)
      );
    }
  }

  const appMeta = await getRecord<ActiveUserState>(STORES.appMeta, APP_META_ID);
  if (!appMeta) {
    await putRecord(STORES.appMeta, {
      id: APP_META_ID,
      schemaVersion: DB_VERSION,
      activeUserId: null
    } satisfies ActiveUserState);
    return;
  }

  if (appMeta.schemaVersion !== DB_VERSION) {
    await putRecord(STORES.appMeta, { ...appMeta, schemaVersion: DB_VERSION });
  }
}

export async function initializeSeedIfNeeded(): Promise<void> {
  await migrateLegacyDataIfNeeded();
  await ensurePerUserDefaults();
}
