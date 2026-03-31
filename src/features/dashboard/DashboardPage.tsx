/*
<<<<<<< ours
import { Link } from 'react-router-dom';
=======
>>>>>>> theirs
import { Layout } from '../../components/Layout';
import { StatCard } from '../../components/StatCard';
import { useAppState } from '../../store/AppContext';
import { useWorkoutPlan } from '../../hooks/useWorkoutPlan';
import { humanDate } from '../../lib/date';
<<<<<<< ours
import { getTrainingStreak } from '../../lib/history';

export function DashboardPage() {
  const { activeDay, nextDay, plan } = useWorkoutPlan();
  const { activeMetrics: metrics, activeSessions: sessions, activeSkillLogs: skillLogs } = useAppState();
  if (!plan) return null;
  if (!activeDay || !nextDay) return null;

  const recentWeight = metrics.filter((m) => m.weightKg).slice(-3).reverse();
  const completedSessions = sessions.filter((s) => s.completed);
  const streak = getTrainingStreak(sessions);

  return (
    <Layout title="Dashboard" subtitle="Your training snapshot">
      <div className="grid grid-cols-2 gap-3">
        <StatCard label="Active session" value={activeDay.name} hint={activeDay.focus} />
        <StatCard label="Next in rotation" value={nextDay.name} hint={nextDay.focus} />
        <StatCard label="Weekly structure" value={`${plan.days.length} days`} hint="Pull → Legs → Push" />
        <StatCard label="Training streak" value={`${streak} day${streak === 1 ? '' : 's'}`} hint="Consecutive days with a logged workout" />
        <StatCard label="Sessions logged" value={`${completedSessions.length}`} hint="All completed workouts in your logbook" />
      </div>

      <Link
        to="/today"
        className="card block bg-gradient-to-br from-brand-500/15 via-brand-600/10 to-teal-500/10 py-5 text-center text-base font-bold text-brand-900 shadow-md ring-2 ring-brand-500/20 transition active:scale-[0.99] dark:from-brand-500/20 dark:via-brand-600/15 dark:to-teal-900/20 dark:text-brand-100 dark:ring-brand-400/25"
      >
        Open Today → log this session in order
      </Link>

      <section className="card space-y-3">
        <h2 className="font-semibold">Skill focus</h2>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          Muscle-up, L-sit, front lever, handstand, planche — log levels on the Skills tab.
        </p>
        {(['Muscle-up', 'L-sit', 'Front lever', 'Handstand', 'Planche'] as const).map((skill) => {
          const logs = skillLogs.filter((log) => log.skill === skill).sort((a, b) => b.date.localeCompare(a.date));
          const latest = logs[0];
          return (
            <p key={skill} className="text-sm">
              <span className="font-medium">{skill}:</span> {latest?.level ?? 'Not logged'}
              {latest?.metricValue != null && (
                <span className="text-slate-500">
                  {' '}
                  ({latest.metricValue} {latest.metricUnit})
                </span>
              )}
=======

export function DashboardPage() {
  const { today, next, plan } = useWorkoutPlan();
  const { metrics, sessions, skillLogs } = useAppState();

  const recentWeight = metrics.filter((m) => m.weightKg).slice(-3).reverse();
  const completedRecent = sessions.filter((s) => s.completed).slice(-5).length;

  return (
    <Layout title="Dashboard">
      <div className="grid grid-cols-2 gap-3">
        <StatCard label="Today's workout" value={today.name} hint={today.focus} />
        <StatCard label="Next workout" value={next.name} hint={next.focus} />
        <StatCard label="Weekly structure" value={`${plan.days.length} days`} hint="Pull / Legs / Push" />
        <StatCard label="Recent completion" value={`${completedRecent}/5`} hint="Last five workouts" />
      </div>

      <section className="card space-y-2">
        <h2 className="font-semibold">Skill goals</h2>
        {['Muscle-up', 'L-sit', 'Front lever', 'Handstand', 'Planche'].map((skill) => {
          const latest = skillLogs.filter((log) => log.skill === skill).slice(-1)[0];
          return (
            <p key={skill} className="text-sm">
              <span className="font-medium">{skill}:</span> {latest?.level ?? 'Not logged'}
>>>>>>> theirs
            </p>
          );
        })}
      </section>

      <section className="card space-y-2">
        <h2 className="font-semibold">Recent body weight</h2>
        {recentWeight.length ? (
          recentWeight.map((entry) => (
            <p key={entry.id} className="text-sm">
              {humanDate(entry.date)} — {entry.weightKg} kg
            </p>
          ))
        ) : (
<<<<<<< ours
          <p className="text-sm text-slate-500">No body weight logs yet. Add one under Metrics.</p>
=======
          <p className="text-sm text-slate-500">No body weight logs yet.</p>
>>>>>>> theirs
        )}
      </section>
    </Layout>
  );
}
*/

import { Link } from 'react-router-dom';
import { Layout } from '../../components/Layout';
import { StatCard } from '../../components/StatCard';
import { useAppState } from '../../store/AppContext';
import { useWorkoutPlan } from '../../hooks/useWorkoutPlan';
import { getTrainingStreak } from '../../lib/history';

export function DashboardPage() {
  const { activeDay, nextDay, plan } = useWorkoutPlan();
  const { activeMetrics, activeSessions, activeSkillLogs, activeSuggestions, activeCoachProfile, achievements } = useAppState();
  if (!plan || !activeDay) return null;

  const recentMetrics = activeMetrics.filter((metric) => metric.weightKg != null || metric.waistCm != null).sort((a, b) => b.date.localeCompare(a.date)).slice(0, 3);
  const recentAchievements = achievements.filter((achievement) => achievement.userId === plan.userId).slice(-3).reverse();
  const streak = getTrainingStreak(activeSessions);
  const todaySession = activeSessions.find((session) => session.status === 'inProgress');

  return (
    <Layout title="Dashboard" subtitle="Personalized local coaching, summaries, and next actions.">
      <div className="grid grid-cols-2 gap-3">
        <StatCard label="Today's workout" value={activeDay.name} hint={activeDay.focus} />
        <StatCard label="Next workout" value={nextDay?.name ?? activeDay.name} hint={nextDay?.focus ?? activeDay.focus} />
        <StatCard label="Current phase" value={plan.phase} hint={activeCoachProfile?.planType} />
        <StatCard label="Consistency" value={`${streak} day${streak === 1 ? '' : 's'}`} hint="Training streak" />
      </div>

      <Link to={todaySession ? '/workout' : '/today'} className="card block border-brand-200 bg-gradient-to-br from-brand-500/15 to-cyan-500/10 text-center text-base font-bold text-brand-900 dark:border-brand-900/40 dark:text-brand-100">
        {todaySession ? 'Resume guided workout' : 'Open today and start guided workout'}
      </Link>

      <section className="card space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="font-semibold">Coach suggestions</h2>
          <span className="metric-chip">{activeSuggestions.length} live cues</span>
        </div>
        {activeSuggestions.map((suggestion) => (
          <p key={suggestion} className="rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-900/40">
            {suggestion}
          </p>
        ))}
      </section>

      <section className="card space-y-3">
        <h2 className="font-semibold">Skill progression</h2>
        {activeSkillLogs.slice().sort((a, b) => b.date.localeCompare(a.date)).slice(0, 4).map((log) => (
          <p key={log.id} className="text-sm">
            <span className="font-medium">{log.skill}:</span> {log.level}
            {log.metricValue != null ? ` (${log.metricValue} ${log.metricUnit ?? ''})` : ''}
          </p>
        ))}
      </section>

      <section className="card space-y-3">
        <h2 className="font-semibold">Recent body metrics</h2>
        {recentMetrics.length ? recentMetrics.map((metric) => (
          <p key={metric.id} className="text-sm">
            {metric.date}: {metric.weightKg != null ? `${metric.weightKg} kg` : 'No weight'} {metric.waistCm != null ? `| waist ${metric.waistCm} cm` : ''}
          </p>
        )) : <p className="text-sm text-slate-500">No recent metrics yet.</p>}
      </section>

      <section className="card space-y-3">
        <h2 className="font-semibold">Milestones</h2>
        {recentAchievements.length ? recentAchievements.map((achievement) => (
          <p key={achievement.id} className="text-sm">
            <span className="font-medium">{achievement.title}</span>: {achievement.description}
          </p>
        )) : <p className="text-sm text-slate-500">Milestones unlock as you log sessions and skills.</p>}
      </section>
    </Layout>
  );
}
