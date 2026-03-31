import type { AppDataSnapshot } from '../types/models';
import { normalizeBackupSnapshot } from './backupSnapshot';

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

  let parsed: unknown;
  try {
    parsed = JSON.parse(text);
  } catch {
    throw new Error('Backup file is not valid JSON.');
  }

  return normalizeBackupSnapshot(parsed);
}
