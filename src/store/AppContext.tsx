import { createContext, useContext, useEffect, useMemo, useState } from 'react';
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
import { buildCoachSuggestions } from '../lib/coach/recommendations';

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

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [loading, setLoading] = useState(true);
  const [snapshot, setSnapshot] = useState<AppDataSnapshot>({
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
  });

  const refresh = async () => {
    setLoading(true);
    await initializeSeedIfNeeded();
    const next = await getSnapshot();
    const groupedAchievements = next.users.flatMap((user) =>
      deriveAchievements(user.id, {
        sessions: next.sessions.filter((session) => session.userId === user.id),
        skillLogs: next.skillLogs.filter((log) => log.userId === user.id),
        checkIns: next.checkIns.filter((checkIn) => checkIn.userId === user.id)
      })
    );
    for (const achievement of groupedAchievements) {
      await saveAchievement(achievement);
    }
    const finalSnapshot = await getSnapshot();
    setSnapshot(finalSnapshot);
    setLoading(false);
  };

  useEffect(() => {
    void refresh();
  }, []);

  const activeUser = useMemo(
    () => snapshot.users.find((user) => user.id === snapshot.activeUserId && !user.archived) ?? null,
    [snapshot.activeUserId, snapshot.users]
  );
  const activeOnboarding = useMemo(
    () => snapshot.onboardings.find((item) => item.userId === snapshot.activeUserId) ?? null,
    [snapshot.activeUserId, snapshot.onboardings]
  );
  const activeCoachProfile = useMemo(
    () => snapshot.coachProfiles.find((item) => item.userId === snapshot.activeUserId) ?? null,
    [snapshot.activeUserId, snapshot.coachProfiles]
  );
  const activePlan = useMemo(
    () => snapshot.plans.find((plan) => plan.userId === snapshot.activeUserId) ?? null,
    [snapshot.activeUserId, snapshot.plans]
  );
  const activeSessions = useMemo(
    () => snapshot.sessions.filter((session) => session.userId === snapshot.activeUserId),
    [snapshot.activeUserId, snapshot.sessions]
  );
  const activeSkillLogs = useMemo(
    () => snapshot.skillLogs.filter((log) => log.userId === snapshot.activeUserId),
    [snapshot.activeUserId, snapshot.skillLogs]
  );
  const activeMetrics = useMemo(
    () => snapshot.metrics.filter((metric) => metric.userId === snapshot.activeUserId),
    [snapshot.activeUserId, snapshot.metrics]
  );
  const activeCheckIns = useMemo(
    () => snapshot.checkIns.filter((checkIn) => checkIn.userId === snapshot.activeUserId),
    [snapshot.activeUserId, snapshot.checkIns]
  );
  const activeSettings = useMemo(
    () => snapshot.settings.find((setting) => setting.userId === snapshot.activeUserId) ?? null,
    [snapshot.activeUserId, snapshot.settings]
  );
  const activeJournalEntries = useMemo(
    () => snapshot.journalEntries.filter((entry) => entry.userId === snapshot.activeUserId).sort((a, b) => b.date.localeCompare(a.date)),
    [snapshot.activeUserId, snapshot.journalEntries]
  );
  const activeSuggestions = useMemo(
    () =>
      buildCoachSuggestions({
        coachProfile: activeCoachProfile ?? undefined,
        plan: activePlan ?? undefined,
        sessions: activeSessions,
        checkIns: activeCheckIns,
        skillLogs: activeSkillLogs,
        metrics: activeMetrics
      }),
    [activeCoachProfile, activePlan, activeSessions, activeCheckIns, activeSkillLogs, activeMetrics]
  );

  useEffect(() => {
    document.documentElement.classList.toggle('dark', Boolean(activeSettings?.darkMode));
  }, [activeSettings?.darkMode]);

  const value = useMemo<AppState>(
    () => ({
      loading,
      refresh,
      users: snapshot.users,
      activeUserId: snapshot.activeUserId,
      activeUser,
      activeOnboarding,
      activeCoachProfile,
      activePlan,
      activeSessions,
      activeSkillLogs,
      activeMetrics,
      activeCheckIns,
      activeSettings,
      activeJournalEntries,
      activeSuggestions,
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
      selectUser: async (userId) => {
        await setActiveUserId(userId);
        await refresh();
      },
      createUser: async (name) => {
        const now = new Date().toISOString();
        const user: UserProfile = {
          id: crypto.randomUUID(),
          name: name.trim() || 'New user',
          createdAt: now,
          mainGoal: 'Build consistency',
          currentPhase: 'foundation',
          planType: 'Needs onboarding'
        };
        await saveUserProfile(user);
        await saveOnboarding(defaultOnboarding(user.id));
        await saveSettings(defaultSettings(user.id));
        await setActiveUserId(user.id);
        await refresh();
        return user;
      },
      updateUser: async (user) => {
        await saveUserProfile(user);
        await refresh();
      },
      archiveUser: async (userId) => {
        const user = snapshot.users.find((item) => item.id === userId);
        if (!user) return;
        await saveUserProfile({ ...user, archived: true });
        if (snapshot.activeUserId === userId) {
          await setActiveUserId(null);
        }
        await refresh();
      },
      saveOnboardingForActive: async (onboarding) => {
        if (!activeUser) return;
        const updatedUser: UserProfile = {
          ...activeUser,
          age: onboarding.basicProfile.age,
          sex: onboarding.basicProfile.sex,
          heightCm: onboarding.basicProfile.heightCm,
          mainGoal: onboarding.skillGoals['Muscle-up'] ? 'Muscle-up + personalized strength' : 'Personalized training',
          currentPhase: activeUser.currentPhase,
          planType: activeUser.planType
        };
        const generated = generatePlanForUser(updatedUser, onboarding);
        await saveUserProfile({ ...updatedUser, currentPhase: generated.coachProfile.currentPhase, planType: generated.coachProfile.planType });
        await saveOnboarding({ ...onboarding, userId: activeUser.id, completedAt: new Date().toISOString() });
        await saveCoachProfile(generated.coachProfile);
        await savePlan(generated.plan);
        if (activeSettings) {
          await saveSettings({ ...activeSettings, onboardingComplete: true });
        }
        await refresh();
      },
      regeneratePlanForActive: async () => {
        if (!activeUser || !activeOnboarding) return;
        const generated = generatePlanForUser(activeUser, activeOnboarding);
        await saveCoachProfile(generated.coachProfile);
        await savePlan(generated.plan);
        await refresh();
      },
      saveSessionForActive: async (session) => {
        if (!activeUser) return;
        await saveSession({ ...session, userId: activeUser.id });
        await refresh();
      },
      saveSkillLogForActive: async (log) => {
        if (!activeUser) return;
        await saveSkillLog({ ...log, userId: activeUser.id });
        await refresh();
      },
      saveMetricLogForActive: async (log) => {
        if (!activeUser) return;
        await saveMetricLog({ ...log, userId: activeUser.id });
        await refresh();
      },
      saveCheckInForActive: async (checkIn) => {
        if (!activeUser) return;
        await saveCheckIn({ ...checkIn, userId: activeUser.id });
        await refresh();
      },
      saveJournalEntryForActive: async (entry) => {
        if (!activeUser) return;
        await saveJournalEntry({ ...entry, userId: activeUser.id });
        await refresh();
      },
      updateActiveSettings: async (patch) => {
        if (!activeSettings || !activeUser) return;
        await saveSettings({ ...activeSettings, ...patch, userId: activeUser.id });
        await refresh();
      },
      importSnapshot: async (nextSnapshot) => {
        await replaceAllData(nextSnapshot);
        await refresh();
      },
      resetData: async () => {
        await resetAllData();
        await refresh();
      }
    }),
    [
      loading,
      snapshot,
      activeUser,
      activeOnboarding,
      activeCoachProfile,
      activePlan,
      activeSessions,
      activeSkillLogs,
      activeMetrics,
      activeCheckIns,
      activeSettings,
      activeJournalEntries,
      activeSuggestions
    ]
  );

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useAppState(): AppState {
  const context = useContext(AppContext);
  if (!context) throw new Error('useAppState must be used in AppProvider');
  return context;
}
