import type { AppDataSnapshot } from '../types/models';
import { mergeAppSettings } from './settings';

export function downloadJson(snapshot: AppDataSnapshot): void {
  const blob = new Blob([JSON.stringify(snapshot, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = `skilltrack-backup-${snapshot.exportedAt.slice(0, 10)}.json`;
  anchor.click();
  URL.revokeObjectURL(url);
}

export async function parseBackupFile(file: File): Promise<AppDataSnapshot> {
  const text = await file.text();
  const parsed = JSON.parse(text) as AppDataSnapshot;
  if (!parsed.users || !Array.isArray(parsed.users) || !Array.isArray(parsed.plans) || !Array.isArray(parsed.settings) || !Array.isArray(parsed.sessions)) {
    throw new Error('Invalid backup format');
  }

  return {
    ...parsed,
    activeUserId: parsed.activeUserId ?? null,
    onboardings: Array.isArray(parsed.onboardings) ? parsed.onboardings : [],
    coachProfiles: Array.isArray(parsed.coachProfiles) ? parsed.coachProfiles : [],
    plans: Array.isArray(parsed.plans) ? parsed.plans : [],
    sessions: Array.isArray(parsed.sessions) ? parsed.sessions : [],
    skillLogs: Array.isArray(parsed.skillLogs) ? parsed.skillLogs : [],
    metrics: Array.isArray(parsed.metrics) ? parsed.metrics : [],
    checkIns: Array.isArray(parsed.checkIns) ? parsed.checkIns : [],
    achievements: Array.isArray(parsed.achievements) ? parsed.achievements : [],
    journalEntries: Array.isArray(parsed.journalEntries) ? parsed.journalEntries : [],
    settings: Array.isArray(parsed.settings) ? parsed.settings.map((s) => mergeAppSettings(s)) : [],
    exportedAt: parsed.exportedAt ?? new Date().toISOString()
  };
}
