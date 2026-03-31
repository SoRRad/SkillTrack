import { Navigate, Route, Routes } from 'react-router-dom';
import { DashboardPage } from '../features/dashboard/DashboardPage';
import { TodayPage } from '../features/today/TodayPage';
import { ProgramPage } from '../features/program/ProgramPage';
import { LogbookPage } from '../features/logbook/LogbookPage';
import { SkillsPage } from '../features/skills/SkillsPage';
import { MetricsPage } from '../features/metrics/MetricsPage';
import { SettingsPage } from '../features/settings/SettingsPage';
import { useAppState } from '../store/AppContext';
import { UsersPage } from '../features/users/UsersPage';
import { OnboardingPage } from '../features/users/OnboardingPage';
import { ActiveWorkoutPage } from '../features/today/ActiveWorkoutPage';
import { CalendarPage } from '../features/calendar/CalendarPage';
import { SummaryPage } from '../features/summary/SummaryPage';

export function App() {
  const { loading, activeUserId, activeSettings, activeSessions } = useAppState();
  const homePath =
    !activeUserId || activeSettings?.openOnUsersScreen
      ? '/users'
      : activeSettings?.onboardingComplete
        ? activeSessions.some((session) => session.status === 'inProgress')
          ? '/workout'
          : '/dashboard'
        : '/onboarding';

  if (loading) {
    return <div className="page-shell"><div className="card">Loading SkillTrack...</div></div>;
  }

  return (
    <Routes>
      <Route path="/users" element={<UsersPage />} />
      <Route path="/onboarding" element={activeUserId ? <OnboardingPage /> : <Navigate to="/users" replace />} />
      <Route path="/workout" element={activeUserId ? <ActiveWorkoutPage /> : <Navigate to="/users" replace />} />
      <Route path="/calendar" element={activeUserId ? <CalendarPage /> : <Navigate to="/users" replace />} />
      <Route path="/" element={<Navigate to={homePath} replace />} />
      <Route
        path="/dashboard"
        element={
          activeUserId
            ? activeSettings?.onboardingComplete
              ? <DashboardPage />
              : <Navigate to="/onboarding" replace />
            : <Navigate to="/users" replace />
        }
      />
      <Route path="/today" element={activeUserId ? <TodayPage /> : <Navigate to="/users" replace />} />
      <Route path="/summary" element={activeUserId ? <SummaryPage /> : <Navigate to="/users" replace />} />
      <Route path="/program" element={activeUserId ? <ProgramPage /> : <Navigate to="/users" replace />} />
      <Route path="/logbook" element={activeUserId ? <LogbookPage /> : <Navigate to="/users" replace />} />
      <Route path="/skills" element={activeUserId ? <SkillsPage /> : <Navigate to="/users" replace />} />
      <Route path="/metrics" element={activeUserId ? <MetricsPage /> : <Navigate to="/users" replace />} />
      <Route path="/settings" element={activeUserId ? <SettingsPage /> : <Navigate to="/users" replace />} />
      <Route path="*" element={<Navigate to="/users" replace />} />
    </Routes>
  );
}
