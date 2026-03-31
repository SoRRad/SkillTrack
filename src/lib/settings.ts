import type { AppSettings } from '../types/models';

export function mergeAppSettings(stored: AppSettings | undefined | null): AppSettings {
  const defaultUserId = stored?.userId ?? 'user-default';
  const start = Math.max(1, Math.min(7, stored?.defaultWorkoutStartDay ?? 1));
  return {
    id: stored?.id ?? `settings-${defaultUserId}`,
    userId: defaultUserId,
    defaultWorkoutStartDay: start,
    activeWorkoutDayOrder: stored?.activeWorkoutDayOrder ?? start,
    darkMode: stored?.darkMode ?? false,
    onboardingComplete: stored?.onboardingComplete ?? false,
    openOnUsersScreen: stored?.openOnUsersScreen ?? false
  };
}
