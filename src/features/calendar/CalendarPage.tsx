import { Layout } from '../../components/Layout';
import { useAppState } from '../../store/AppContext';

export function CalendarPage() {
  const { activeSessions, activeCheckIns } = useAppState();
  const items = [...new Set([...activeSessions.map((session) => session.date), ...activeCheckIns.map((checkIn) => checkIn.date)])]
    .sort((a, b) => b.localeCompare(a))
    .slice(0, 30);

  return (
    <Layout title="Calendar" subtitle="Recent training and check-in history.">
      <section className="card space-y-3">
        {items.length ? items.map((date) => {
          const session = activeSessions.find((item) => item.date === date);
          const checkIn = activeCheckIns.find((item) => item.date === date);
          return (
            <div key={date} className="flex items-center justify-between rounded-2xl border border-slate-200 p-3 dark:border-slate-700">
              <div>
                <p className="font-semibold">{date}</p>
                <p className="text-sm text-slate-500">{session ? `Workout ${session.status}` : 'No workout'} | {checkIn?.checkedIn ? 'Checked in' : 'No check-in'}</p>
              </div>
              <span className="metric-chip">{checkIn?.completed ? 'Complete' : session?.status ?? 'Rest'}</span>
            </div>
          );
        }) : <p className="text-sm text-slate-500">No history yet.</p>}
      </section>
    </Layout>
  );
}
