/*
import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Layout } from '../../components/Layout';
import { useAppState } from '../../store/AppContext';
import { isoDate } from '../../lib/date';
import { getTrainingStreak } from '../../lib/history';

function clamp(n: number, min: number, max: number) {
  return Math.max(min, Math.min(max, n));
}

export function UsersPage() {
  const { users, setActiveUser, sessions, metrics, checkIns, activeUserId } = useAppState();
  const navigate = useNavigate();
  const [query, setQuery] = useState('');

  const today = isoDate();

  const filteredUsers = useMemo(() => {
    const q = query.trim().toLowerCase();
    const base = users.filter((u) => !u.archived);
    if (!q) return base;
    return base.filter((u) => u.name.toLowerCase().includes(q) || u.primaryGoalLabel.toLowerCase().includes(q));
  }, [users, query]);

  return (
    <Layout title="Users" subtitle="Local-first profiles on this device">
      <section className="card space-y-3">
        <div className="flex items-center justify-between gap-3">
          <div className="flex-1">
            <label className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
              Search
            </label>
            <input
              className="input mt-1"
              placeholder="Type a name or goal…"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </div>
          <div className="flex flex-col items-end gap-2">
            <button
              type="button"
              className="btn-secondary"
              onClick={async () => {
                const name = window.prompt('New user name?') ?? '';
                if (!name.trim()) return;
                // create via DB helper
                const { createUserWithSeed } = await import('../../db/indexedDb');
                await createUserWithSeed({ name });
                navigate('/');
              }}
            >
              + New user
            </button>
          </div>
        </div>
      </section>

      <div className="space-y-3">
        {filteredUsers.map((u) => {
          const userSessions = sessions.filter((s) => s.userId === u.id);
          const userMetrics = metrics.filter((m) => m.userId === u.id);
          const userCheckIns = checkIns.filter((c) => c.userId === u.id);
          const todayCheckIn = userCheckIns.find((c) => c.date === today);
          const latestWorkout = userSessions
            .slice()
            .sort((a, b) => b.date.localeCompare(a.date))[0]?.date;
          const latestWeight = userMetrics
            .slice()
            .filter((m) => m.weightKg != null)
            .sort((a, b) => a.date.localeCompare(b.date))[userMetrics.length - 1]?.weightKg;

          const completedSessions = userSessions.filter((s) => s.completed);
          const weeklyCompletion = (() => {
            const cutoff = new Date();
            cutoff.setDate(cutoff.getDate() - 7);
            const cutoffKey = cutoff.toISOString().slice(0, 10);
            return completedSessions.filter((s) => s.date >= cutoffKey).length;
          })();

          const streak = getTrainingStreak(completedSessions);
          const score = clamp(weeklyCompletion / 3, 0, 1);

          const isActive = activeUserId === u.id;

          return (
            <article key={u.id} className="card space-y-3">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-xs font-bold uppercase tracking-[0.2em] text-brand-700/90 dark:text-brand-400">
                    {u.primaryGoalLabel}
                  </p>
                  <h3 className="mt-1 text-xl font-bold tracking-tight">{u.name}</h3>
                </div>
                <div className="shrink-0 text-right">
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                    Today
                  </p>
                  <p className="mt-1 text-sm font-bold">
                    {todayCheckIn?.checkedIn ? 'Checked in' : 'Not checked in'}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div className="rounded-xl border border-slate-200 bg-slate-50 p-3 dark:border-slate-700 dark:bg-slate-900/40">
                  <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400">
                    Last workout
                  </p>
                  <p className="mt-1 text-sm font-bold">{latestWorkout ?? '—'}</p>
                </div>
                <div className="rounded-xl border border-slate-200 bg-slate-50 p-3 dark:border-slate-700 dark:bg-slate-900/40">
                  <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400">
                    Streak
                  </p>
                  <p className="mt-1 text-sm font-bold">{streak}d</p>
                </div>
                <div className="rounded-xl border border-slate-200 bg-slate-50 p-3 dark:border-slate-700 dark:bg-slate-900/40">
                  <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400">
                    Weight
                  </p>
                  <p className="mt-1 text-sm font-bold">{latestWeight != null ? `${latestWeight} kg` : '—'}</p>
                </div>
              </div>

              <div className="flex items-center justify-between gap-3">
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <p className="text-xs font-semibold text-slate-600 dark:text-slate-300">Weekly completion</p>
                    <p className="text-xs font-semibold text-slate-600 dark:text-slate-300">
                      {weeklyCompletion} workouts
                    </p>
                  </div>
                  <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-slate-200 dark:bg-slate-800">
                    <div className="h-full bg-brand-500" style={{ width: `${Math.round(score * 100)}%` }} />
                  </div>
                </div>
                <button
                  type="button"
                  className={`btn ${isActive ? 'bg-brand-500' : ''}`}
                  onClick={async () => {
                    await setActiveUser(u.id);
                    navigate('/');
                  }}
                >
                  {isActive ? 'Active' : 'Select'}
                </button>
              </div>
            </article>
          );
        })}

        {!filteredUsers.length && (
          <p className="text-center text-sm text-slate-500 dark:text-slate-400">No users yet. Create one.</p>
        )}
      </div>
    </Layout>
  );
}
*/

import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Layout } from '../../components/Layout';
import { useAppState } from '../../store/AppContext';
import { isoDate } from '../../lib/date';
import { getTrainingStreak } from '../../lib/history';

export function UsersPage() {
  const { users, sessions, metrics, checkIns, activeUserId, selectUser, createUser, updateUser, archiveUser } = useAppState();
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const today = isoDate();

  const filteredUsers = useMemo(() => {
    const search = query.trim().toLowerCase();
    return users
      .filter((user) => !user.archived)
      .filter((user) => !search || user.name.toLowerCase().includes(search) || user.mainGoal.toLowerCase().includes(search) || user.planType.toLowerCase().includes(search));
  }, [query, users]);

  return (
    <Layout title="Users" subtitle="Choose the active local profile on this device.">
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
        const lastWorkout = userSessions.filter((session) => session.status === 'completed').sort((a, b) => b.date.localeCompare(a.date))[0];
        const lastWeight = userMetrics.filter((metric) => metric.weightKg != null).sort((a, b) => b.date.localeCompare(a.date))[0];
        const todayCheckIn = userCheckIns.find((checkIn) => checkIn.date === today);
        const completedWeek = userSessions.filter((session) => session.status === 'completed' && new Date(`${session.date}T12:00:00`).getTime() >= Date.now() - 7 * 86400000).length;
        const streak = getTrainingStreak(userSessions);

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

            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-3 dark:border-slate-700 dark:bg-slate-900/40">
              <div className="flex items-center justify-between text-sm">
                <span>Weekly completion</span>
                <span>{completedWeek} sessions</span>
              </div>
              <div className="mt-2 h-2 rounded-full bg-slate-200 dark:bg-slate-800">
                <div className="h-full rounded-full bg-brand-500" style={{ width: `${Math.min(100, (completedWeek / 3) * 100)}%` }} />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                className="btn"
                onClick={async () => {
                  await selectUser(user.id);
                  navigate('/dashboard');
                }}
              >
                Select user
              </button>
              <button
                type="button"
                className="btn-secondary"
                onClick={async () => {
                  const nextName = window.prompt('Edit user name', user.name);
                  if (!nextName) return;
                  await updateUser({ ...user, name: nextName });
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
    </Layout>
  );
}

