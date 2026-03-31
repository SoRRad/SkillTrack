import { Link } from 'react-router-dom';
import { Layout } from '../../components/Layout';
import { StatCard } from '../../components/StatCard';
import { useWorkoutPlan } from '../../hooks/useWorkoutPlan';
import { getTrainingStreak } from '../../lib/history';
import { useAppState } from '../../store/AppContext';

export function DashboardPage() {
  const { activeDay, nextDay, plan } = useWorkoutPlan();
  const {
    activeMetrics,
    activeSessions,
    activeSkillLogs,
    activeSuggestions,
    activeCoachProfile,
    achievements,
    activeOnboarding
  } = useAppState();

  if (!plan || !activeDay) {
    return null;
  }

  const recentMetrics = activeMetrics
    .filter((metric) => metric.weightKg != null || metric.waistCm != null)
    .sort((left, right) => right.date.localeCompare(left.date))
    .slice(0, 3);
  const recentAchievements = achievements.filter((achievement) => achievement.userId === plan.userId).slice(-3).reverse();
  const streak = getTrainingStreak(activeSessions);
  const todaySession = activeSessions.find((session) => session.status === 'inProgress');
  const completedThisWeek = activeSessions.filter(
    (session) => session.status === 'completed' && new Date(`${session.date}T12:00:00`).getTime() >= Date.now() - 7 * 86400000
  ).length;
  const focusSkills = activeCoachProfile?.goalProfile.skillPriorities.slice(0, 3) ?? [];
  const latestMetric = recentMetrics[0];

  return (
    <Layout title="User Dashboard" subtitle="Resume the right checkpoint, review priorities, and see what the local coach wants next.">
      <div className="grid grid-cols-2 gap-3">
        <StatCard
          label="Current checkpoint"
          value={todaySession ? `${todaySession.currentTaskIndex + 1}/${todaySession.tasks.length}` : activeDay.name}
          hint={todaySession ? 'Resume from the saved workout step' : activeDay.focus}
        />
        <StatCard label="Next day" value={nextDay?.name ?? activeDay.name} hint={nextDay?.focus ?? activeDay.focus} />
        <StatCard label="Current phase" value={plan.phase} hint={activeCoachProfile?.planType} />
        <StatCard label="Consistency" value={`${completedThisWeek}/${plan.weeklyTargetDays}`} hint={`${streak} day${streak === 1 ? '' : 's'} streak`} />
      </div>

      <Link
        to={todaySession ? '/workout' : '/today'}
        className="card block border-brand-200 bg-gradient-to-br from-brand-500/15 to-cyan-500/10 text-center text-base font-bold text-brand-900 dark:border-brand-900/40 dark:text-brand-100"
      >
        {todaySession ? 'Resume guided workout' : 'Open today and start guided workout'}
      </Link>

      <section className="card space-y-3">
        <div className="flex items-center justify-between gap-3">
          <h2 className="font-semibold">Current priorities</h2>
          <span className="metric-chip">{plan.weeklyTargetDays} day target</span>
        </div>
        <p className="text-sm text-slate-600 dark:text-slate-300">
          {activeCoachProfile?.coachingNotes[0] ?? 'Follow the current program and build consistency first.'}
        </p>
        {focusSkills.length ? (
          <div className="flex flex-wrap gap-2">
            {focusSkills.map((skill) => (
              <span key={skill} className="metric-chip">
                {skill}
              </span>
            ))}
          </div>
        ) : null}
        {activeOnboarding?.nutrition.goal ? (
          <p className="text-sm text-slate-600 dark:text-slate-300">Nutrition phase: {activeOnboarding.nutrition.goal}</p>
        ) : null}
      </section>

      <section className="card space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="font-semibold">Coach suggestions</h2>
          <span className="metric-chip">{activeSuggestions.length} live cues</span>
        </div>
        {activeSuggestions.length ? (
          activeSuggestions.map((suggestion) => (
            <p key={suggestion} className="rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-900/40">
              {suggestion}
            </p>
          ))
        ) : (
          <p className="text-sm text-slate-500">No extra suggestions right now. Stay consistent with the current plan.</p>
        )}
      </section>

      <section className="card space-y-3">
        <h2 className="font-semibold">Skill progression</h2>
        {activeSkillLogs.length ? (
          activeSkillLogs
            .slice()
            .sort((left, right) => right.date.localeCompare(left.date))
            .slice(0, 4)
            .map((log) => (
              <p key={log.id} className="text-sm">
                <span className="font-medium">{log.skill}:</span> {log.level}
                {log.metricValue != null ? ` (${log.metricValue} ${log.metricUnit ?? ''})` : ''}
              </p>
            ))
        ) : (
          <p className="text-sm text-slate-500">No skill logs yet.</p>
        )}
      </section>

      <section className="card space-y-3">
        <div className="flex items-center justify-between gap-3">
          <h2 className="font-semibold">Recent body metrics</h2>
          <span className="metric-chip">{latestMetric?.weightKg != null ? `${latestMetric.weightKg} kg` : 'No weight log'}</span>
        </div>
        {recentMetrics.length ? (
          recentMetrics.map((metric) => (
            <p key={metric.id} className="text-sm">
              {metric.date}: {metric.weightKg != null ? `${metric.weightKg} kg` : 'No weight'}
              {metric.waistCm != null ? ` | waist ${metric.waistCm} cm` : ''}
            </p>
          ))
        ) : (
          <p className="text-sm text-slate-500">No recent metrics yet.</p>
        )}
      </section>

      <section className="card space-y-3">
        <h2 className="font-semibold">Milestones</h2>
        {recentAchievements.length ? (
          recentAchievements.map((achievement) => (
            <p key={achievement.id} className="text-sm">
              <span className="font-medium">{achievement.title}</span>: {achievement.description}
            </p>
          ))
        ) : (
          <p className="text-sm text-slate-500">Milestones unlock as you log sessions and skills.</p>
        )}
      </section>

      <Link to="/summary" className="card block text-center text-sm font-semibold text-slate-700 dark:text-slate-200">
        Open overall summary for metrics, recent workouts, and progress history
      </Link>
    </Layout>
  );
}
