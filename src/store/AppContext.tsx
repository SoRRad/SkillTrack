import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import type { AppDataSnapshot, BodyMetricLog, SkillLog, WorkoutSession } from '../types/models';
import { getSnapshot, initializeSeedIfNeeded, replaceAllData, resetAllData, saveMetricLog, saveSession, saveSettings, saveSkillLog } from '../db/indexedDb';
import { defaultSettings, seedPlan } from '../data/seed';
import { mergeAppSettings } from '../lib/settings';

interface AppState extends Omit<AppDataSnapshot, 'exportedAt'> {
  loading: boolean;
  refresh: () => Promise<void>;
  addSession: (session: WorkoutSession) => Promise<void>;
  addSkillLog: (log: SkillLog) => Promise<void>;
  addMetricLog: (log: BodyMetricLog) => Promise<void>;
  updateSettings: (patch: Partial<AppDataSnapshot['settings']>) => Promise<void>;
  importSnapshot: (snapshot: AppDataSnapshot) => Promise<void>;
  resetData: () => Promise<void>;
}

const AppContext = createContext<AppState | null>(null);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [loading, setLoading] = useState(true);
  const [state, setState] = useState<Omit<AppDataSnapshot, 'exportedAt'>>({
    plan: seedPlan,
    sessions: [],
    skillLogs: [],
    metrics: [],
    settings: mergeAppSettings(defaultSettings)
  });

  const refresh = async () => {
    setLoading(true);
    await initializeSeedIfNeeded();
    const snapshot = await getSnapshot();
    setState({
      plan: snapshot.plan,
      sessions: snapshot.sessions,
      skillLogs: snapshot.skillLogs,
      metrics: snapshot.metrics,
      settings: mergeAppSettings(snapshot.settings)
    });
    setLoading(false);
  };

  useEffect(() => {
    refresh();
  }, []);

  useEffect(() => {
    document.documentElement.classList.toggle('dark', state.settings.darkMode);
  }, [state.settings.darkMode]);

  const value = useMemo<AppState>(
    () => ({
      ...state,
      loading,
      refresh,
      addSession: async (session) => {
        await saveSession(session);
        await refresh();
      },
      addSkillLog: async (log) => {
        await saveSkillLog(log);
        await refresh();
      },
      addMetricLog: async (log) => {
        await saveMetricLog(log);
        await refresh();
      },
      updateSettings: async (patch) => {
        const next = mergeAppSettings({ ...state.settings, ...patch });
        await saveSettings(next);
        await refresh();
      },
      importSnapshot: async (snapshot) => {
        await replaceAllData({ ...snapshot, exportedAt: snapshot.exportedAt ?? new Date().toISOString() });
        await refresh();
      },
      resetData: async () => {
        await resetAllData();
        await refresh();
      }
    }),
    [state, loading]
  );

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useAppState(): AppState {
  const context = useContext(AppContext);
  if (!context) throw new Error('useAppState must be used in AppProvider');
  return context;
}
