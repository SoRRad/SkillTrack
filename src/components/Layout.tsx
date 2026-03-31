import { NavLink } from 'react-router-dom';

const navItems: { to: string; label: string; short: string }[] = [
  { to: '/', label: 'Home', short: 'Home' },
  { to: '/today', label: 'Today', short: 'Today' },
  { to: '/program', label: 'Program', short: 'Plan' },
  { to: '/logbook', label: 'Logbook', short: 'Logs' },
  { to: '/skills', label: 'Skills', short: 'Skills' },
  { to: '/metrics', label: 'Metrics', short: 'Body' },
  { to: '/settings', label: 'Settings', short: 'More' }
];

export function Layout({
  children,
  title,
  subtitle
}: {
  children: React.ReactNode;
  title: string;
  subtitle?: string;
}) {
  return (
    <div className="page-shell">
      <header className="mb-4">
        <p className="text-xs font-medium uppercase tracking-wider text-slate-500 dark:text-slate-400">SkillTrack</p>
        <h1 className="text-2xl font-bold tracking-tight">{title}</h1>
        {subtitle && <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{subtitle}</p>}
      </header>
      <main className="space-y-4">{children}</main>
      <nav
        className="fixed bottom-0 left-0 right-0 z-20 border-t border-slate-200 bg-white/95 backdrop-blur dark:border-slate-800 dark:bg-slate-900/95"
        aria-label="Main"
      >
        <div className="mx-auto flex max-w-xl gap-0.5 overflow-x-auto px-2 py-2 pb-[max(0.5rem,env(safe-area-inset-bottom))]">
          {navItems.map(({ to, label, short }) => (
            <NavLink
              key={to}
              to={to}
              end={to === '/'}
              className={({ isActive }) =>
                `shrink-0 rounded-lg px-2.5 py-2 text-center text-[11px] font-medium sm:text-xs ${
                  isActive ? 'bg-brand-500 text-white shadow-sm' : 'text-slate-600 dark:text-slate-300'
                }`
              }
              title={label}
            >
              <span className="sm:hidden">{short}</span>
              <span className="hidden sm:inline">{label}</span>
            </NavLink>
          ))}
        </div>
      </nav>
    </div>
  );
}
