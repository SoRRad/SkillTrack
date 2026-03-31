import { Link } from 'react-router-dom';
import { Layout } from '../../components/Layout';
import { StatCard } from '../../components/StatCard';
import { useAppState } from '../../store/AppContext';
import { useWorkoutPlan } from '../../hooks/useWorkoutPlan';
import { humanDate } from '../../lib/date';
import { getTrainingStreak } from '../../lib/history';

export function DashboardPage() {
  const { activeDay, nextDay, plan } = useWorkoutPlan();
  const { metrics, sessions, skillLogs } = useAppState();

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
          <p className="text-sm text-slate-500">No body weight logs yet. Add one under Metrics.</p>
        )}
      </section>
    </Layout>
  );
}
