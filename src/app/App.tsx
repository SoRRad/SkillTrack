import { Navigate, Route, Routes } from 'react-router-dom';
import { DashboardPage } from '../features/dashboard/DashboardPage';
import { TodayPage } from '../features/today/TodayPage';
import { ProgramPage } from '../features/program/ProgramPage';
import { LogbookPage } from '../features/logbook/LogbookPage';
import { SkillsPage } from '../features/skills/SkillsPage';
import { MetricsPage } from '../features/metrics/MetricsPage';
import { SettingsPage } from '../features/settings/SettingsPage';
import { useAppState } from '../store/AppContext';

export function App() {
  const { loading } = useAppState();

  if (loading) {
    return <div className="page-shell"><div className="card">Loading SkillTrack...</div></div>;
  }

  return (
    <Routes>
      <Route path="/" element={<DashboardPage />} />
      <Route path="/today" element={<TodayPage />} />
      <Route path="/program" element={<ProgramPage />} />
      <Route path="/logbook" element={<LogbookPage />} />
      <Route path="/skills" element={<SkillsPage />} />
      <Route path="/metrics" element={<MetricsPage />} />
      <Route path="/settings" element={<SettingsPage />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
