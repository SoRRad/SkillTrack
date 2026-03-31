import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import type {
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
  getSnapshot,
  initializeSeedIfNeeded,
  replaceAllData,
  resetAllData,
  saveAchievement,
  saveCheckIn,
  saveCoachProfile,
  saveJournalEntry,
  saveMetricLog,
  saveOnboarding,
  savePlan,
  saveSession,
  saveSettings,
  saveSkillLog,
  saveUserProfile,
  setActiveUserId
} from '../db/indexedDb';
import { defaultOnboarding, defaultSettings } from '../data/seed';
import { deriveAchievements } from '../lib/coach/achievements';
import { generatePlanForUser } from '../lib/coach/planGenerator';
import {
  EMPTY_SNAPSHOT,
  archiveUserInSnapshot,
  createUserProfile,
  describeMainGoal,
  mergeSettingsPatch,
  updateSnapshotActiveUser,
  upsertSnapshotRecord,
  upsertSnapshotRecords
} from './actions/snapshotActions';
import { selectActiveAppState } from './selectors/appSelectors';

type AppState = {
  loading: boolean;
  refresh: () => Promise<void>;
  users: UserProfile[];
  activeUserId: string | null;
  activeUser: UserProfile | null;
  activeOnboarding: UserOnboarding | null;
  activeCoachProfile: UserCoachProfile | null;
  activePlan: TrainingPlan | null;
  activeSessions: WorkoutSession[];
  activeSkillLogs: SkillLog[];
  activeMetrics: BodyMetricLog[];
  activeCheckIns: CheckInLog[];
  activeSettings: AppSettings | null;
  activeJournalEntries: JournalEntry[];
  activeSuggestions: string[];
  onboardings: AppDataSnapshot['onboardings'];
  coachProfiles: AppDataSnapshot['coachProfiles'];
  plans: AppDataSnapshot['plans'];
  sessions: AppDataSnapshot['sessions'];
  metrics: AppDataSnapshot['metrics'];
  skillLogs: AppDataSnapshot['skillLogs'];
  checkIns: AppDataSnapshot['checkIns'];
  achievements: AppDataSnapshot['achievements'];
  journalEntries: AppDataSnapshot['journalEntries'];
  settings: AppDataSnapshot['settings'];
  selectUser: (userId: string | null) => Promise<void>;
  createUser: (name: string) => Promise<UserProfile>;
  updateUser: (user: UserProfile) => Promise<void>;
  archiveUser: (userId: string) => Promise<void>;
  saveOnboardingForActive: (onboarding: UserOnboarding) => Promise<void>;
  regeneratePlanForActive: () => Promise<void>;
  saveSessionForActive: (session: WorkoutSession) => Promise<void>;
  saveSkillLogForActive: (log: Omit<SkillLog, 'userId'>) => Promise<void>;
  saveMetricLogForActive: (log: Omit<BodyMetricLog, 'userId'>) => Promise<void>;
  saveCheckInForActive: (checkIn: Omit<CheckInLog, 'userId'>) => Promise<void>;
  saveJournalEntryForActive: (entry: Omit<JournalEntry, 'userId'>) => Promise<void>;
  updateActiveSettings: (patch: Partial<AppSettings>) => Promise<void>;
  importSnapshot: (snapshot: AppDataSnapshot) => Promise<void>;
  resetData: () => Promise<void>;
};

const AppContext = createContext<AppState | null>(null);

async function syncDerivedAchievements(snapshot: AppDataSnapshot): Promise<AppDataSnapshot> {
  const existingIds = new Set(snapshot.achievements.map((achievement) => achievement.id));
  const missingAchievements = snapshot.users.flatMap((user) =>
    deriveAchievements(user.id, {
      sessions: snapshot.sessions.filter((session) => session.userId === user.id),
      skillLogs: snapshot.skillLogs.filter((log) => log.userId === user.id),
      checkIns: snapshot.checkIns.filter((checkIn) => checkIn.userId === user.id)
    })
  ).filter((achievement) => !existingIds.has(achievement.id));

  if (!missingAchievements.length) {
    return snapshot;
  }

  await Promise.all(missingAchievements.map((achievement) => saveAchievement(achievement)));
  return upsertSnapshotRecords(snapshot, 'achievements', missingAchievements);
}

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [loading, setLoading] = useState(true);
  const [snapshot, setSnapshot] = useState<AppDataSnapshot>(EMPTY_SNAPSHOT);

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      await initializeSeedIfNeeded();
      const nextSnapshot = await getSnapshot();
      const syncedSnapshot = await syncDerivedAchievements(nextSnapshot);
      setSnapshot(syncedSnapshot);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const activeState = useMemo(() => selectActiveAppState(snapshot), [snapshot]);

  useEffect(() => {
    document.documentElement.classList.toggle('dark', Boolean(activeState.activeSettings?.darkMode));
  }, [activeState.activeSettings?.darkMode]);

  const selectUser = useCallback(async (userId: string | null) => {
    await setActiveUserId(userId);
    setSnapshot((current) => updateSnapshotActiveUser(current, userId));
  }, []);

  const createUser = useCallback(async (name: string) => {
    const user = createUserProfile(name);
    const onboarding = defaultOnboarding(user.id);
    const settings = defaultSettings(user.id);

    await Promise.all([
      saveUserProfile(user),
      saveOnboarding(onboarding),
      saveSettings(settings),
      setActiveUserId(user.id)
    ]);

    setSnapshot((current) => {
      let nextSnapshot = upsertSnapshotRecord(current, 'users', user);
      nextSnapshot = upsertSnapshotRecord(nextSnapshot, 'onboardings', onboarding);
      nextSnapshot = upsertSnapshotRecord(nextSnapshot, 'settings', settings);
      return updateSnapshotActiveUser(nextSnapshot, user.id);
    });

    return user;
  }, []);

  const updateUser = useCallback(async (user: UserProfile) => {
    await saveUserProfile(user);
    setSnapshot((current) => upsertSnapshotRecord(current, 'users', user));
  }, []);

  const archiveUser = useCallback(
    async (userId: string) => {
      const user = snapshot.users.find((item) => item.id === userId);
      if (!user) {
        return;
      }

      await saveUserProfile({ ...user, archived: true });
      if (snapshot.activeUserId === userId) {
        await setActiveUserId(null);
      }

      setSnapshot((current) => archiveUserInSnapshot(current, userId));
    },
    [snapshot.activeUserId, snapshot.users]
  );

  const saveOnboardingForActive = useCallback(
    async (onboarding: UserOnboarding) => {
      if (!activeState.activeUser) {
        return;
      }

      const now = new Date().toISOString();
      const nextOnboarding: UserOnboarding = {
        ...onboarding,
        userId: activeState.activeUser.id,
        completedAt: now
      };
      const updatedUser: UserProfile = {
        ...activeState.activeUser,
        age: nextOnboarding.basicProfile.age,
        sex: nextOnboarding.basicProfile.sex,
        heightCm: nextOnboarding.basicProfile.heightCm,
        mainGoal: describeMainGoal(nextOnboarding)
      };
      const generated = generatePlanForUser(updatedUser, nextOnboarding);
      const nextUser: UserProfile = {
        ...updatedUser,
        currentPhase: generated.coachProfile.currentPhase,
        planType: generated.coachProfile.planType
      };
      const nextSettings = mergeSettingsPatch(
        activeState.activeSettings ?? defaultSettings(activeState.activeUser.id),
        { onboardingComplete: true }
      );

      await Promise.all([
        saveUserProfile(nextUser),
        saveOnboarding(nextOnboarding),
        saveCoachProfile(generated.coachProfile),
        savePlan(generated.plan),
        saveSettings(nextSettings)
      ]);

      setSnapshot((current) => {
        let nextSnapshot = upsertSnapshotRecord(current, 'users', nextUser);
        nextSnapshot = upsertSnapshotRecord(nextSnapshot, 'onboardings', nextOnboarding);
        nextSnapshot = upsertSnapshotRecord(nextSnapshot, 'coachProfiles', generated.coachProfile);
        nextSnapshot = upsertSnapshotRecord(nextSnapshot, 'plans', generated.plan);
        return upsertSnapshotRecord(nextSnapshot, 'settings', nextSettings);
      });
    },
    [activeState.activeSettings, activeState.activeUser]
  );

  const regeneratePlanForActive = useCallback(async () => {
    if (!activeState.activeUser || !activeState.activeOnboarding) {
      return;
    }

    const generated = generatePlanForUser(activeState.activeUser, activeState.activeOnboarding);
    const nextUser: UserProfile = {
      ...activeState.activeUser,
      currentPhase: generated.coachProfile.currentPhase,
      planType: generated.coachProfile.planType
    };

    await Promise.all([
      saveUserProfile(nextUser),
      saveCoachProfile(generated.coachProfile),
      savePlan(generated.plan)
    ]);

    setSnapshot((current) => {
      let nextSnapshot = upsertSnapshotRecord(current, 'users', nextUser);
      nextSnapshot = upsertSnapshotRecord(nextSnapshot, 'coachProfiles', generated.coachProfile);
      return upsertSnapshotRecord(nextSnapshot, 'plans', generated.plan);
    });
  }, [activeState.activeOnboarding, activeState.activeUser]);

  const saveSessionForActive = useCallback(
    async (session: WorkoutSession) => {
      if (!activeState.activeUser) {
        return;
      }

      const nextSession = {
        ...session,
        userId: activeState.activeUser.id
      };
      await saveSession(nextSession);
      setSnapshot((current) => upsertSnapshotRecord(current, 'sessions', nextSession));
    },
    [activeState.activeUser]
  );

  const saveSkillLogForActive = useCallback(
    async (log: Omit<SkillLog, 'userId'>) => {
      if (!activeState.activeUser) {
        return;
      }

      const nextLog = {
        ...log,
        userId: activeState.activeUser.id
      };
      await saveSkillLog(nextLog);
      setSnapshot((current) => upsertSnapshotRecord(current, 'skillLogs', nextLog));
    },
    [activeState.activeUser]
  );

  const saveMetricLogForActive = useCallback(
    async (log: Omit<BodyMetricLog, 'userId'>) => {
      if (!activeState.activeUser) {
        return;
      }

      const nextLog = {
        ...log,
        userId: activeState.activeUser.id
      };
      await saveMetricLog(nextLog);
      setSnapshot((current) => upsertSnapshotRecord(current, 'metrics', nextLog));
    },
    [activeState.activeUser]
  );

  const saveCheckInForActive = useCallback(
    async (checkIn: Omit<CheckInLog, 'userId'>) => {
      if (!activeState.activeUser) {
        return;
      }

      const nextCheckIn = {
        ...checkIn,
        userId: activeState.activeUser.id
      };
      await saveCheckIn(nextCheckIn);
      setSnapshot((current) => upsertSnapshotRecord(current, 'checkIns', nextCheckIn));
    },
    [activeState.activeUser]
  );

  const saveJournalEntryForActive = useCallback(
    async (entry: Omit<JournalEntry, 'userId'>) => {
      if (!activeState.activeUser) {
        return;
      }

      const nextEntry = {
        ...entry,
        userId: activeState.activeUser.id
      };
      await saveJournalEntry(nextEntry);
      setSnapshot((current) => upsertSnapshotRecord(current, 'journalEntries', nextEntry));
    },
    [activeState.activeUser]
  );

  const updateActiveSettings = useCallback(
    async (patch: Partial<AppSettings>) => {
      if (!activeState.activeUser) {
        return;
      }

      const nextSettings = mergeSettingsPatch(
        activeState.activeSettings ?? defaultSettings(activeState.activeUser.id),
        patch
      );
      await saveSettings(nextSettings);
      setSnapshot((current) => upsertSnapshotRecord(current, 'settings', nextSettings));
    },
    [activeState.activeSettings, activeState.activeUser]
  );

  const importSnapshot = useCallback(
    async (nextSnapshot: AppDataSnapshot) => {
      await replaceAllData(nextSnapshot);
      await refresh();
    },
    [refresh]
  );

  const resetData = useCallback(async () => {
    await resetAllData();
    await refresh();
  }, [refresh]);

  const value = useMemo<AppState>(
    () => ({
      loading,
      refresh,
      users: snapshot.users,
      activeUserId: snapshot.activeUserId,
      activeUser: activeState.activeUser,
      activeOnboarding: activeState.activeOnboarding,
      activeCoachProfile: activeState.activeCoachProfile,
      activePlan: activeState.activePlan,
      activeSessions: activeState.activeSessions,
      activeSkillLogs: activeState.activeSkillLogs,
      activeMetrics: activeState.activeMetrics,
      activeCheckIns: activeState.activeCheckIns,
      activeSettings: activeState.activeSettings,
      activeJournalEntries: activeState.activeJournalEntries,
      activeSuggestions: activeState.activeSuggestions,
      onboardings: snapshot.onboardings,
      coachProfiles: snapshot.coachProfiles,
      plans: snapshot.plans,
      sessions: snapshot.sessions,
      metrics: snapshot.metrics,
      skillLogs: snapshot.skillLogs,
      checkIns: snapshot.checkIns,
      achievements: snapshot.achievements,
      journalEntries: snapshot.journalEntries,
      settings: snapshot.settings,
      selectUser,
      createUser,
      updateUser,
      archiveUser,
      saveOnboardingForActive,
      regeneratePlanForActive,
      saveSessionForActive,
      saveSkillLogForActive,
      saveMetricLogForActive,
      saveCheckInForActive,
      saveJournalEntryForActive,
      updateActiveSettings,
      importSnapshot,
      resetData
    }),
    [
      activeState,
      archiveUser,
      createUser,
      importSnapshot,
      loading,
      refresh,
      regeneratePlanForActive,
      resetData,
      saveCheckInForActive,
      saveJournalEntryForActive,
      saveMetricLogForActive,
      saveOnboardingForActive,
      saveSessionForActive,
      saveSkillLogForActive,
      selectUser,
      snapshot,
      updateActiveSettings,
      updateUser
    ]
  );

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useAppState(): AppState {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useAppState must be used in AppProvider');
  }
  return context;
}
