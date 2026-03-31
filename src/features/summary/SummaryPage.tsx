import { Layout } from '../../components/Layout';
import { StatCard } from '../../components/StatCard';
import { useAppState } from '../../store/AppContext';
import { getTrainingStreak } from '../../lib/history';

function completedInLastDays(dates: string[], days: number) {
  const cutoff = Date.now() - days * 86400000;
  return dates.filter((date) => new Date(`${date}T12:00:00`).getTime() >= cutoff).length;
}

export function SummaryPage() {
  const { activePlan, activeSessions, activeMetrics, activeSkillLogs, activeCheckIns, achievements, activeJournalEntries } = useAppState();

  if (!activePlan) return null;

  const completedSessions = activeSessions.filter((session) => session.status === 'completed');
  const completedDates = completedSessions.map((session) => session.date);
  const weeklyCompleted = completedInLastDays(completedDates, 7);
  const monthlyCompleted = completedInLastDays(completedDates, 30);
  const weeklyTarget = activePlan.weeklyTargetDays || 1;
  const weeklyPercent = Math.min(100, Math.round((weeklyCompleted / weeklyTarget) * 100));
  const streak = getTrainingStreak(activeSessions);
  const latestMetric = activeMetrics.filter((metric) => metric.weightKg != null || metric.waistCm != null).sort((a, b) => b.date.localeCompare(a.date))[0];
  const latestSkills = activeSkillLogs.slice().sort((a, b) => b.date.localeCompare(a.date)).slice(0, 5);
  const recentSessions = completedSessions.slice().sort((a, b) => b.date.localeCompare(a.date)).slice(0, 4);
  const recentAchievements = achievements.filter((achievement) => achievement.userId === activePlan.userId).slice(-4).reverse();
  const recentCheckIns = activeCheckIns.slice().sort((a, b) => b.date.localeCompare(a.date)).slice(0, 7);

  return (
    <Layout title="Overall Summary" subtitle="Progress, metrics, recent training history, and trends for the active user.">
      <div className="grid grid-cols-2 gap-3">
        <StatCard label="Weekly progress" value={`${weeklyCompleted}/${weeklyTarget}`} hint={`${weeklyPercent}% of target`} />
        <StatCard label="Current streak" value={`${streak} day${streak === 1 ? '' : 's'}`} hint="Completed workout streak" />
        <StatCard label="This month" value={`${monthlyCompleted} workouts`} hint="Completed sessions in the last 30 days" />
        <StatCard label="Current weight" value={latestMetric?.weightKg != null ? `${latestMetric.weightKg} kg` : 'No log'} hint={latestMetric?.waistCm != null ? `Waist ${latestMetric.waistCm} cm` : 'Add a body metric'} />
      </div>

      <section className="card space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="font-semibold">Weekly completion</h2>
          <span className="metric-chip">{weeklyPercent}%</span>
        </div>
        <div className="h-3 rounded-full bg-slate-200 dark:bg-slate-800">
          <div className="h-full rounded-full bg-brand-500" style={{ width: `${weeklyPercent}%` }} />
        </div>
        <p className="text-sm text-slate-600 dark:text-slate-300">
          {weeklyCompleted >= weeklyTarget ? 'You are on pace or ahead for the current weekly target.' : `You need ${Math.max(0, weeklyTarget - weeklyCompleted)} more session${weeklyTarget - weeklyCompleted === 1 ? '' : 's'} to hit the weekly target.`}
        </p>
      </section>

      <section className="card space-y-3">
        <h2 className="font-semibold">Recent workouts</h2>
        {recentSessions.length ? recentSessions.map((session) => {
          const day = activePlan.days.find((item) => item.id === session.workoutDayId);
          const completedTasks = session.tasks.filter((task) => task.status === 'completed').length;
          return (
            <div key={session.id} className="rounded-2xl border border-slate-200 p-3 text-sm dark:border-slate-700">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="font-semibold">{session.date}</p>
                  <p className="text-slate-500">{day?.name ?? 'Workout'} | {completedTasks}/{session.tasks.length} tasks completed</p>
                </div>
                <span className="metric-chip">{session.status}</span>
              </div>
            </div>
          );
        }) : <p className="text-sm text-slate-500">Finish a workout to start building your summary.</p>}
      </section>

      <section className="card space-y-3">
        <h2 className="font-semibold">Metrics snapshot</h2>
        {activeMetrics.length ? activeMetrics.slice().sort((a, b) => b.date.localeCompare(a.date)).slice(0, 5).map((metric) => (
          <p key={metric.id} className="text-sm">
            {metric.date}: {metric.weightKg != null ? `${metric.weightKg} kg` : 'No weight'}{metric.waistCm != null ? ` | waist ${metric.waistCm} cm` : ''}{metric.sleepHours != null ? ` | sleep ${metric.sleepHours} h` : ''}{metric.energyLevel != null ? ` | energy ${metric.energyLevel}/5` : ''}
          </p>
        )) : <p className="text-sm text-slate-500">No body metrics logged yet.</p>}
      </section>

      <section className="card space-y-3">
        <h2 className="font-semibold">Skill trend</h2>
        {latestSkills.length ? latestSkills.map((log) => (
          <p key={log.id} className="text-sm">
            <span className="font-medium">{log.skill}:</span> {log.level}{log.metricValue != null ? ` (${log.metricValue} ${log.metricUnit ?? ''})` : ''} on {log.date}
          </p>
        )) : <p className="text-sm text-slate-500">No skill entries yet.</p>}
      </section>

      <section className="card space-y-3">
        <h2 className="font-semibold">Readiness and consistency</h2>
        {recentCheckIns.length ? recentCheckIns.map((checkIn) => (
          <p key={checkIn.id} className="text-sm">
            {checkIn.date}: {checkIn.completed ? 'Completed planned session' : checkIn.checkedIn ? 'Checked in' : 'No check-in'}
            {checkIn.readinessSuggestion ? ` | ${checkIn.readinessSuggestion}` : ''}
          </p>
        )) : <p className="text-sm text-slate-500">No recent check-ins yet.</p>}
      </section>

      <section className="card space-y-3">
        <h2 className="font-semibold">Milestones and notes</h2>
        {recentAchievements.length ? recentAchievements.map((achievement) => (
          <p key={achievement.id} className="text-sm">
            <span className="font-medium">{achievement.title}</span>: {achievement.description}
          </p>
        )) : <p className="text-sm text-slate-500">Milestones will appear as your training history grows.</p>}
        {activeJournalEntries.slice(0, 3).map((entry) => (
          <p key={entry.id} className="text-sm text-slate-600 dark:text-slate-300">
            {entry.date}: {entry.content}
          </p>
        ))}
      </section>
    </Layout>
  );
}
