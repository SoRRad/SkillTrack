import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Layout } from '../../components/Layout';
import { isoDate } from '../../lib/date';
import { getTrainingStreak } from '../../lib/history';
import { useAppState } from '../../store/AppContext';

function completedInLastDays(dates: string[], days: number) {
  const cutoff = Date.now() - days * 86400000;
  return dates.filter((date) => new Date(`${date}T12:00:00`).getTime() >= cutoff).length;
}

export function UsersPage() {
  const { users, sessions, metrics, checkIns, achievements, settings, plans, activeUserId, selectUser, createUser, updateUser, archiveUser } = useAppState();
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const today = isoDate();
  const activeUsers = users.filter((user) => !user.archived);

  const filteredUsers = useMemo(() => {
    const search = query.trim().toLowerCase();
    return activeUsers.filter(
      (user) => !search || user.name.toLowerCase().includes(search) || user.mainGoal.toLowerCase().includes(search) || user.planType.toLowerCase().includes(search)
    );
  }, [activeUsers, query]);

  const weeklyCompletedAllUsers = completedInLastDays(
    sessions.filter((session) => session.status === 'completed').map((session) => session.date),
    7
  );
  const usersWithActiveCheckpoint = new Set(sessions.filter((session) => session.status === 'inProgress').map((session) => session.userId)).size;
  const readyUsers = settings.filter((setting) => setting.onboardingComplete).length;
  const recentAchievements = achievements.slice(-5).reverse();

  return (
    <Layout title="Profiles" subtitle="Choose a user, create a new one, or review how every active profile is progressing on this device.">
      <div className="grid grid-cols-2 gap-3">
        <div className="card">
          <p className="section-title">Active profiles</p>
          <p className="mt-2 text-2xl font-bold">{activeUsers.length}</p>
          <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">{readyUsers} ready with onboarding completed</p>
        </div>
        <div className="card">
          <p className="section-title">Live checkpoints</p>
          <p className="mt-2 text-2xl font-bold">{usersWithActiveCheckpoint}</p>
          <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">Profiles with an in-progress workout to resume</p>
        </div>
        <div className="card">
          <p className="section-title">This week</p>
          <p className="mt-2 text-2xl font-bold">{weeklyCompletedAllUsers}</p>
          <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">Completed sessions across all active users</p>
        </div>
        <div className="card">
          <p className="section-title">Achievements</p>
          <p className="mt-2 text-2xl font-bold">{achievements.length}</p>
          <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">Milestones earned on this browser</p>
        </div>
      </div>

      <section className="card space-y-3">
        <div className="flex items-center justify-between gap-3">
          <h2 className="font-semibold">Recent wins</h2>
          <span className="metric-chip">{recentAchievements.length} recent</span>
        </div>
        {recentAchievements.length ? (
          recentAchievements.map((achievement) => {
            const user = users.find((item) => item.id === achievement.userId);
            return (
              <p key={achievement.id} className="text-sm">
                <span className="font-medium">{user?.name ?? 'User'}:</span> {achievement.title}
              </p>
            );
          })
        ) : (
          <p className="text-sm text-slate-500">Achievements will appear here as users train and log progress.</p>
        )}
      </section>

      <section className="card space-y-3">
        <label className="block">
          <span className="section-title">Search</span>
          <input className="input mt-2" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Name, goal, or plan type" />
        </label>
        <button
          type="button"
          className="btn w-full"
          onClick={async () => {
            const name = window.prompt('New user name?');
            if (!name) return;
            const user = await createUser(name);
            await selectUser(user.id);
            navigate('/onboarding');
          }}
        >
          Create new user
        </button>
      </section>

      {filteredUsers.map((user) => {
        const userSessions = sessions.filter((session) => session.userId === user.id);
        const userMetrics = metrics.filter((metric) => metric.userId === user.id);
        const userCheckIns = checkIns.filter((checkIn) => checkIn.userId === user.id);
        const userAchievements = achievements.filter((achievement) => achievement.userId === user.id);
        const userSettings = settings.find((setting) => setting.userId === user.id);
        const userPlan = plans.find((plan) => plan.userId === user.id);
        const inProgress = userSessions.find((session) => session.status === 'inProgress');
        const checkpointTask = inProgress?.tasks[inProgress.currentTaskIndex];
        const checkpointExercise = checkpointTask ? userPlan?.exerciseTemplates.find((item) => item.id === checkpointTask.exerciseId) : null;
        const lastWorkout = userSessions.filter((session) => session.status === 'completed').sort((left, right) => right.date.localeCompare(left.date))[0];
        const lastWeight = userMetrics.filter((metric) => metric.weightKg != null).sort((left, right) => right.date.localeCompare(left.date))[0];
        const todayCheckIn = userCheckIns.find((checkIn) => checkIn.date === today);
        const completedWeek = completedInLastDays(
          userSessions.filter((session) => session.status === 'completed').map((session) => session.date),
          7
        );
        const streak = getTrainingStreak(userSessions);
        const destination = inProgress ? '/workout' : userSettings?.onboardingComplete ? '/dashboard' : '/onboarding';
        const primaryActionLabel = inProgress ? 'Resume checkpoint' : userSettings?.onboardingComplete ? 'Open dashboard' : 'Continue onboarding';

        return (
          <article key={user.id} className="card space-y-4">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="section-title">{user.planType}</p>
                <h2 className="mt-2 text-xl font-bold">{user.name}</h2>
                <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">{user.mainGoal}</p>
              </div>
              <span className={`metric-chip ${activeUserId === user.id ? 'bg-brand-100 text-brand-900 dark:bg-brand-950/40 dark:text-brand-100' : ''}`}>
                {activeUserId === user.id ? 'Active' : 'Available'}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2 text-sm">
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-3 dark:border-slate-700 dark:bg-slate-900/40">
                <p className="section-title">Check-in</p>
                <p className="mt-2 font-semibold">{todayCheckIn?.checkedIn ? 'Done today' : 'Not yet'}</p>
              </div>
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-3 dark:border-slate-700 dark:bg-slate-900/40">
                <p className="section-title">Last workout</p>
                <p className="mt-2 font-semibold">{lastWorkout?.date ?? 'No sessions yet'}</p>
              </div>
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-3 dark:border-slate-700 dark:bg-slate-900/40">
                <p className="section-title">Streak</p>
                <p className="mt-2 font-semibold">{streak} day{streak === 1 ? '' : 's'}</p>
              </div>
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-3 dark:border-slate-700 dark:bg-slate-900/40">
                <p className="section-title">Weight</p>
                <p className="mt-2 font-semibold">{lastWeight?.weightKg != null ? `${lastWeight.weightKg} kg` : 'No weight log'}</p>
              </div>
            </div>

            <div className="rounded-2xl border border-brand-200 bg-brand-50/70 p-3 text-sm dark:border-brand-900/40 dark:bg-brand-950/20">
              <p className="section-title">Current checkpoint</p>
              <p className="mt-2 font-semibold">
                {inProgress
                  ? `${checkpointExercise?.name ?? 'Workout step'} | ${inProgress.currentTaskIndex + 1}/${inProgress.tasks.length}`
                  : userSettings?.onboardingComplete
                    ? 'Ready to continue from the saved day and progress.'
                    : 'Needs onboarding before a personalized plan is finalized.'}
              </p>
              <p className="mt-1 text-slate-600 dark:text-slate-300">
                {inProgress
                  ? `Resume ${user.name}'s saved session exactly where it left off.`
                  : userSettings?.onboardingComplete
                    ? 'Selecting this user opens the personal dashboard with saved settings and plan state.'
                    : 'Finish onboarding to generate the personalized program for this user.'}
              </p>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-3 dark:border-slate-700 dark:bg-slate-900/40">
              <div className="flex items-center justify-between text-sm">
                <span>Weekly completion</span>
                <span>{completedWeek} sessions</span>
              </div>
              <div className="mt-2 h-2 rounded-full bg-slate-200 dark:bg-slate-800">
                <div className="h-full rounded-full bg-brand-500" style={{ width: `${Math.min(100, (completedWeek / 3) * 100)}%` }} />
              </div>
              <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">{userAchievements.length} achievements earned</p>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                className="btn"
                onClick={async () => {
                  await selectUser(user.id);
                  navigate(destination);
                }}
              >
                {primaryActionLabel}
              </button>
              <button
                type="button"
                className="btn-secondary"
                onClick={async () => {
                  const nextName = window.prompt('Edit user name', user.name);
                  if (!nextName) return;
                  await updateUser({ ...user, name: nextName.trim() || user.name });
                }}
              >
                Edit
              </button>
              <button
                type="button"
                className="btn-secondary"
                onClick={async () => {
                  await selectUser(user.id);
                  navigate('/onboarding');
                }}
              >
                Onboarding
              </button>
              <button
                type="button"
                className="btn-secondary"
                onClick={async () => {
                  if (!window.confirm(`Archive ${user.name}? Existing data will be kept locally.`)) return;
                  await archiveUser(user.id);
                }}
              >
                Archive
              </button>
            </div>
          </article>
        );
      })}

      {!filteredUsers.length ? <p className="text-center text-sm text-slate-500">No profiles match that search yet.</p> : null}
    </Layout>
  );
}
