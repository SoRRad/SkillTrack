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
} from '../../types/models';
import { buildCoachSuggestions } from '../../lib/coach/recommendations';

export type ActiveAppSelection = {
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
};

export function selectActiveAppState(snapshot: AppDataSnapshot): ActiveAppSelection {
  const activeUserId = snapshot.activeUserId;
  const activeUser = snapshot.users.find((user) => user.id === activeUserId && !user.archived) ?? null;
  const activeOnboarding = snapshot.onboardings.find((item) => item.userId === activeUserId) ?? null;
  const activeCoachProfile = snapshot.coachProfiles.find((item) => item.userId === activeUserId) ?? null;
  const activePlan = snapshot.plans.find((plan) => plan.userId === activeUserId) ?? null;
  const activeSessions = snapshot.sessions.filter((session) => session.userId === activeUserId);
  const activeSkillLogs = snapshot.skillLogs.filter((log) => log.userId === activeUserId);
  const activeMetrics = snapshot.metrics.filter((metric) => metric.userId === activeUserId);
  const activeCheckIns = snapshot.checkIns.filter((checkIn) => checkIn.userId === activeUserId);
  const activeSettings = snapshot.settings.find((setting) => setting.userId === activeUserId) ?? null;
  const activeJournalEntries = snapshot.journalEntries
    .filter((entry) => entry.userId === activeUserId)
    .sort((left, right) => right.date.localeCompare(left.date));
  const activeSuggestions = buildCoachSuggestions({
    coachProfile: activeCoachProfile ?? undefined,
    plan: activePlan ?? undefined,
    sessions: activeSessions,
    checkIns: activeCheckIns,
    skillLogs: activeSkillLogs,
    metrics: activeMetrics
  });

  return {
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
  };
}
