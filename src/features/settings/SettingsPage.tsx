import { useRef } from 'react';
import { Layout } from '../../components/Layout';
import { buildBackupSnapshot } from '../../lib/backupSnapshot';
import { downloadJson, parseBackupFile } from '../../lib/exportImport';
import { useAppState } from '../../store/AppContext';

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

  if (!activeSettings) {
    return null;
  }

  const snapshot = {
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
  };

  return (
    <Layout title="Settings" subtitle="Display, backups, and local-first storage controls.">
      <section className="card space-y-3">
        <label className="flex items-center justify-between">
          <span>Dark mode</span>
          <input type="checkbox" checked={activeSettings.darkMode} onChange={(event) => void updateActiveSettings({ darkMode: event.target.checked })} />
        </label>
      </section>

      <section className="card space-y-3">
        <h2 className="font-semibold">Backup and restore</h2>
        <button type="button" className="btn w-full" onClick={() => downloadJson(buildBackupSnapshot(snapshot))}>
          Export all users
        </button>
        <button type="button" className="btn-secondary w-full" onClick={() => downloadJson(buildBackupSnapshot(snapshot, activeUserId))}>
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
            } catch (error) {
              window.alert(error instanceof Error ? error.message : 'Could not parse that backup file.');
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
        <p className="text-xs text-slate-500">
          Storage is local to this browser. Clearing browser site data will remove records unless you export first.
        </p>
      </section>
    </Layout>
  );
}
