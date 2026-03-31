import { NavLink, useLocation } from 'react-router-dom';
import { useAppState } from '../store/AppContext';

const navItems = [
  { to: '/users', label: 'Users' },
  { to: '/dashboard', label: 'Dashboard' },
  { to: '/today', label: 'Today' },
  { to: '/program', label: 'Program' },
  { to: '/workout', label: 'Workout' },
  { to: '/logbook', label: 'Logbook' },
  { to: '/skills', label: 'Skills' },
  { to: '/metrics', label: 'Metrics' },
  { to: '/calendar', label: 'Calendar' },
  { to: '/settings', label: 'Settings' }
];

export function Layout({ children, title, subtitle }: { children: React.ReactNode; title: string; subtitle?: string }) {
  const { activeUser } = useAppState();
  const location = useLocation();

  return (
    <div className="page-shell">
      <header className="mb-5">
        <p className="text-[11px] font-bold uppercase tracking-[0.28em] text-brand-700/90 dark:text-brand-400">SkillTrack</p>
        <div className="mt-2 flex items-start justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">{title}</h1>
            {subtitle ? <p className="mt-2 text-sm leading-relaxed text-slate-600 dark:text-slate-400">{subtitle}</p> : null}
          </div>
          {activeUser ? (
            <div className="rounded-2xl border border-brand-200 bg-brand-50 px-3 py-2 text-right text-xs font-semibold text-brand-900 dark:border-brand-900/40 dark:bg-brand-950/30 dark:text-brand-100">
              <p>Active user</p>
              <p className="mt-1 text-sm">{activeUser.name}</p>
            </div>
          ) : null}
        </div>
      </header>
      <main className="flex flex-col gap-4">{children}</main>
      <nav className="fixed bottom-0 left-0 right-0 z-30 border-t border-slate-200/90 bg-white/90 backdrop-blur-lg dark:border-slate-800 dark:bg-slate-950/90">
        <div className="mx-auto flex max-w-xl gap-1 overflow-x-auto px-2 py-2 pb-[max(0.65rem,env(safe-area-inset-bottom))]">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={`tap-target shrink-0 rounded-xl px-3 py-2 text-xs font-semibold ${
                location.pathname === item.to
                  ? 'bg-brand-600 text-white shadow-md dark:bg-brand-500'
                  : 'text-slate-600 dark:text-slate-300'
              }`}
            >
              {item.label}
            </NavLink>
          ))}
        </div>
      </nav>
    </div>
  );
}
