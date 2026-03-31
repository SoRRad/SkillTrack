/*
import { useRef } from 'react';
import { Layout } from '../../components/Layout';
import { useAppState } from '../../store/AppContext';
import { downloadJson, parseBackupFile } from '../../lib/exportImport';

export function SettingsPage() {
  const fileRef = useRef<HTMLInputElement>(null);
<<<<<<< ours
  const { activeSettings, updateActiveSettings, importSnapshot, resetData, users, activeUserId, plans, sessions, skillLogs, metrics, checkIns, settings } = useAppState();
  if (!activeSettings) return null;

  return (
    <Layout title="Settings" subtitle="Display, rotation, and data">
      <section className="card space-y-3">
        <h2 className="font-semibold">Display</h2>
        <label className="flex items-center justify-between gap-4">
          <span className="text-sm">Dark mode</span>
          <input
            type="checkbox"
            className="h-5 w-5 rounded border-slate-300 accent-brand-500"
            checked={activeSettings.darkMode}
            onChange={(e) => updateActiveSettings({ darkMode: e.target.checked })}
          />
        </label>
      </section>

      <section className="card space-y-3">
        <h2 className="font-semibold">Program rotation</h2>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Default day preference is used when merging older backups. Your active training day is chosen on the Today page (Day 1–3 buttons and prev/next).
        </p>
        <label className="text-xs font-medium text-slate-500">
          Preferred start day (legacy / merge)
          <select
            className="input mt-1"
            value={activeSettings.defaultWorkoutStartDay}
            onChange={(e) => updateActiveSettings({ defaultWorkoutStartDay: Number(e.target.value) as 1 | 2 | 3 })}
          >
            <option value={1}>Day 1 — Pull + Skill</option>
            <option value={2}>Day 2 — Legs + Core + Mobility</option>
            <option value={3}>Day 3 — Push + Skill</option>
          </select>
        </label>
        <p className="text-xs text-slate-500">
          Current active day: <span className="font-medium text-slate-800 dark:text-slate-100">Day {activeSettings.activeWorkoutDayOrder}</span> (change on Today)
        </p>
      </section>

      <section className="card space-y-3">
        <h2 className="font-semibold">Data backup</h2>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Export includes your plan, logs, skills, metrics, and settings. Import replaces all local SkillTrack data on this device (with a confirmation prompt recommended before
          importing on a second device).
        </p>
        <button
          type="button"
          className="btn w-full"
          onClick={() =>
            downloadJson({
              users,
              activeUserId,
              plans,
              sessions,
              skillLogs,
              metrics,
              checkIns,
              settings,
              exportedAt: new Date().toISOString()
            })
          }
        >
          Export JSON backup
        </button>
        <input
          ref={fileRef}
          type="file"
          accept="application/json"
          className="hidden"
          onChange={async (e) => {
            const file = e.target.files?.[0];
            if (!file) return;
            try {
              const parsed = await parseBackupFile(file);
              const ok = window.confirm('Import will replace all SkillTrack data on this device. Continue?');
              if (ok) await importSnapshot(parsed);
            } catch {
              window.alert('Could not read that file. Use a SkillTrack JSON export.');
            }
            e.target.value = '';
          }}
        />
        <button type="button" className="btn-secondary w-full" onClick={() => fileRef.current?.click()}>
          Import JSON backup
        </button>
        <button
          type="button"
          className="btn-secondary w-full"
          onClick={() => {
            const confirmed = window.confirm('Reset all local data and re-seed the default program? This cannot be undone.');
            if (confirmed) void resetData();
          }}
        >
=======
  const { settings, updateSettings, importSnapshot, resetData, plan, sessions, skillLogs, metrics } = useAppState();

  return (
    <Layout title="Settings">
      <section className="card space-y-2">
        <h2 className="font-semibold">Display</h2>
        <label className="flex items-center justify-between">
          <span>Dark mode</span>
          <input type="checkbox" checked={settings.darkMode} onChange={(e) => updateSettings({ darkMode: e.target.checked })} />
        </label>
      </section>

      <section className="card space-y-2">
        <h2 className="font-semibold">Program defaults</h2>
        <select className="input" value={settings.defaultWorkoutStartDay} onChange={(e) => updateSettings({ defaultWorkoutStartDay: Number(e.target.value) as 1 | 2 | 3 })}>
          <option value={1}>Start on Day 1 (Pull)</option>
          <option value={2}>Start on Day 2 (Legs)</option>
          <option value={3}>Start on Day 3 (Push)</option>
        </select>
      </section>

      <section className="card space-y-2">
        <h2 className="font-semibold">Data backup</h2>
        <button className="btn" onClick={() => downloadJson({ plan, sessions, skillLogs, metrics, settings, exportedAt: new Date().toISOString() })}>
          Export JSON backup
        </button>
        <input ref={fileRef} type="file" accept="application/json" className="hidden" onChange={async (e) => {
          const file = e.target.files?.[0];
          if (!file) return;
          const parsed = await parseBackupFile(file);
          await importSnapshot(parsed);
        }} />
        <button className="btn-secondary" onClick={() => fileRef.current?.click()}>
          Import JSON backup
        </button>
        <button className="btn-secondary" onClick={() => {
          const confirmed = window.confirm('Reset all local data? This cannot be undone.');
          if (confirmed) void resetData();
        }}>
>>>>>>> theirs
          Reset local data
        </button>
      </section>
    </Layout>
  );
}
*/

import { useRef } from 'react';
import { Layout } from '../../components/Layout';
import { useAppState } from '../../store/AppContext';
import { downloadJson, parseBackupFile } from '../../lib/exportImport';

export function SettingsPage() {
  const fileRef = useRef<HTMLInputElement>(null);
  const {
    activeSettings,
    updateActiveSettings,
    importSnapshot,
    resetData,
    users,
    activeUserId,
    onboardings,
    coachProfiles,
    plans,
    sessions,
    skillLogs,
    metrics,
    checkIns,
    settings,
    achievements,
    journalEntries
  } = useAppState();
  if (!activeSettings) return null;

  return (
    <Layout title="Settings" subtitle="Display, backups, and local-first storage controls.">
      <section className="card space-y-3">
        <label className="flex items-center justify-between">
          <span>Dark mode</span>
          <input type="checkbox" checked={activeSettings.darkMode} onChange={(event) => updateActiveSettings({ darkMode: event.target.checked })} />
        </label>
      </section>

      <section className="card space-y-3">
        <button
          type="button"
          className="btn w-full"
          onClick={() =>
            downloadJson({
              users,
              activeUserId,
              onboardings,
              coachProfiles,
              plans,
              sessions,
              skillLogs,
              metrics,
              checkIns,
              achievements,
              journalEntries,
              settings,
              exportedAt: new Date().toISOString()
            })
          }
        >
          Export all users
        </button>
        <button
          type="button"
          className="btn-secondary w-full"
          onClick={() =>
            downloadJson({
              users: users.filter((user) => user.id === activeUserId),
              activeUserId,
              onboardings: onboardings.filter((item) => item.userId === activeUserId),
              coachProfiles: coachProfiles.filter((item) => item.userId === activeUserId),
              plans: plans.filter((plan) => plan.userId === activeUserId),
              sessions: sessions.filter((session) => session.userId === activeUserId),
              skillLogs: skillLogs.filter((log) => log.userId === activeUserId),
              metrics: metrics.filter((metric) => metric.userId === activeUserId),
              checkIns: checkIns.filter((checkIn) => checkIn.userId === activeUserId),
              achievements: achievements.filter((achievement) => achievement.userId === activeUserId),
              journalEntries: journalEntries.filter((entry) => entry.userId === activeUserId),
              settings: settings.filter((setting) => setting.userId === activeUserId),
              exportedAt: new Date().toISOString()
            })
          }
        >
          Export active user only
        </button>
        <input
          ref={fileRef}
          type="file"
          accept="application/json"
          className="hidden"
          onChange={async (event) => {
            const file = event.target.files?.[0];
            if (!file) return;
            try {
              const parsed = await parseBackupFile(file);
              if (window.confirm('Importing will replace current local data. Continue?')) {
                await importSnapshot(parsed);
              }
            } catch {
              window.alert('Could not parse that backup file.');
            }
            event.target.value = '';
          }}
        />
        <button type="button" className="btn-secondary w-full" onClick={() => fileRef.current?.click()}>
          Import backup
        </button>
        <button
          type="button"
          className="btn-secondary w-full"
          onClick={() => {
            if (window.confirm('Reset all local data and recreate the seeded example user?')) {
              void resetData();
            }
          }}
        >
          Reset local data
        </button>
        <p className="text-xs text-slate-500">Storage is local to this browser. Clearing browser site data will remove records unless you export first.</p>
      </section>
    </Layout>
  );
}
