import { useRef } from 'react';
import { Layout } from '../../components/Layout';
import { useAppState } from '../../store/AppContext';
import { downloadJson, parseBackupFile } from '../../lib/exportImport';

export function SettingsPage() {
  const fileRef = useRef<HTMLInputElement>(null);
  const { settings, updateSettings, importSnapshot, resetData, plan, sessions, skillLogs, metrics } = useAppState();

  return (
    <Layout title="Settings" subtitle="Display, rotation, and data">
      <section className="card space-y-3">
        <h2 className="font-semibold">Display</h2>
        <label className="flex items-center justify-between gap-4">
          <span className="text-sm">Dark mode</span>
          <input
            type="checkbox"
            className="h-5 w-5 rounded border-slate-300 accent-brand-500"
            checked={settings.darkMode}
            onChange={(e) => updateSettings({ darkMode: e.target.checked })}
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
            value={settings.defaultWorkoutStartDay}
            onChange={(e) => updateSettings({ defaultWorkoutStartDay: Number(e.target.value) as 1 | 2 | 3 })}
          >
            <option value={1}>Day 1 — Pull + Skill</option>
            <option value={2}>Day 2 — Legs + Core + Mobility</option>
            <option value={3}>Day 3 — Push + Skill</option>
          </select>
        </label>
        <p className="text-xs text-slate-500">
          Current active day: <span className="font-medium text-slate-800 dark:text-slate-100">Day {settings.activeWorkoutDayOrder}</span> (change on Today)
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
          onClick={() => downloadJson({ plan, sessions, skillLogs, metrics, settings, exportedAt: new Date().toISOString() })}
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
          Reset local data
        </button>
      </section>
    </Layout>
  );
}
