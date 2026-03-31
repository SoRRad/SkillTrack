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
  if (!parsed.plan || !parsed.settings || !Array.isArray(parsed.sessions)) {
    throw new Error('Invalid backup format');
  }
  return {
    ...parsed,
    settings: mergeAppSettings(parsed.settings),
    skillLogs: Array.isArray(parsed.skillLogs) ? parsed.skillLogs : [],
    metrics: Array.isArray(parsed.metrics) ? parsed.metrics : [],
    exportedAt: parsed.exportedAt ?? new Date().toISOString()
  };
}
