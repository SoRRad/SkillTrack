/*
import { Navigate, Route, Routes } from 'react-router-dom';
import { DashboardPage } from '../features/dashboard/DashboardPage';
import { TodayPage } from '../features/today/TodayPage';
import { ProgramPage } from '../features/program/ProgramPage';
import { LogbookPage } from '../features/logbook/LogbookPage';
import { SkillsPage } from '../features/skills/SkillsPage';
import { MetricsPage } from '../features/metrics/MetricsPage';
import { SettingsPage } from '../features/settings/SettingsPage';
import { useAppState } from '../store/AppContext';
<<<<<<< ours
import { UsersPage } from '../features/users/UsersPage';

export function App() {
  const { loading, activeUserId } = useAppState();
=======

export function App() {
  const { loading } = useAppState();
>>>>>>> theirs

  if (loading) {
    return <div className="page-shell"><div className="card">Loading SkillTrack...</div></div>;
  }

  return (
    <Routes>
<<<<<<< ours
      <Route path="/users" element={<UsersPage />} />
      <Route path="/" element={activeUserId ? <DashboardPage /> : <UsersPage />} />
      <Route path="/today" element={activeUserId ? <TodayPage /> : <Navigate to="/users" replace />} />
      <Route path="/program" element={<ProgramPage />} />
      <Route path="/logbook" element={activeUserId ? <LogbookPage /> : <Navigate to="/users" replace />} />
      <Route path="/skills" element={activeUserId ? <SkillsPage /> : <Navigate to="/users" replace />} />
      <Route path="/metrics" element={activeUserId ? <MetricsPage /> : <Navigate to="/users" replace />} />
      <Route path="/settings" element={activeUserId ? <SettingsPage /> : <Navigate to="/users" replace />} />
=======
      <Route path="/" element={<DashboardPage />} />
      <Route path="/today" element={<TodayPage />} />
      <Route path="/program" element={<ProgramPage />} />
      <Route path="/logbook" element={<LogbookPage />} />
      <Route path="/skills" element={<SkillsPage />} />
      <Route path="/metrics" element={<MetricsPage />} />
      <Route path="/settings" element={<SettingsPage />} />
>>>>>>> theirs
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
*/

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

export function App() {
  const { loading, activeUserId, activeSettings } = useAppState();

  if (loading) {
    return <div className="page-shell"><div className="card">Loading SkillTrack...</div></div>;
  }

  return (
    <Routes>
      <Route path="/users" element={<UsersPage />} />
      <Route path="/onboarding" element={activeUserId ? <OnboardingPage /> : <Navigate to="/users" replace />} />
      <Route path="/workout" element={activeUserId ? <ActiveWorkoutPage /> : <Navigate to="/users" replace />} />
      <Route path="/calendar" element={activeUserId ? <CalendarPage /> : <Navigate to="/users" replace />} />
      <Route path="/" element={<Navigate to={activeUserId ? '/dashboard' : '/users'} replace />} />
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
      <Route path="/program" element={activeUserId ? <ProgramPage /> : <Navigate to="/users" replace />} />
      <Route path="/logbook" element={activeUserId ? <LogbookPage /> : <Navigate to="/users" replace />} />
      <Route path="/skills" element={activeUserId ? <SkillsPage /> : <Navigate to="/users" replace />} />
      <Route path="/metrics" element={activeUserId ? <MetricsPage /> : <Navigate to="/users" replace />} />
      <Route path="/settings" element={activeUserId ? <SettingsPage /> : <Navigate to="/users" replace />} />
      <Route path="*" element={<Navigate to={activeUserId ? '/dashboard' : '/users'} replace />} />
    </Routes>
  );
}
