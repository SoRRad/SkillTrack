import type { AppSettings } from '../types/models';

export function mergeAppSettings(stored: AppSettings | undefined | null): AppSettings {
  const start = stored?.defaultWorkoutStartDay ?? 1;
  return {
    id: 'app-settings',
    defaultWorkoutStartDay: start,
    activeWorkoutDayOrder: stored?.activeWorkoutDayOrder ?? start,
    darkMode: stored?.darkMode ?? false
  };
}
