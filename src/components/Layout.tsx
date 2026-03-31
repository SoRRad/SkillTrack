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
      <header className="mb-5">
        <p className="text-[11px] font-bold uppercase tracking-[0.28em] text-brand-700/90 dark:text-brand-400">SkillTrack</p>
        <h1 className="mt-1 text-3xl font-bold tracking-tight text-slate-900 dark:text-white">{title}</h1>
        {subtitle && <p className="mt-2 text-sm leading-relaxed text-slate-600 dark:text-slate-400">{subtitle}</p>}
      </header>
      <main className="flex flex-col gap-5">{children}</main>
      <nav
        className="fixed bottom-0 left-0 right-0 z-30 border-t border-slate-200/90 bg-white/85 shadow-[0_-8px_30px_-16px_rgba(15,23,42,0.2)] backdrop-blur-lg dark:border-slate-800/90 dark:bg-slate-950/85"
        aria-label="Main"
      >
        <div className="mx-auto flex max-w-xl gap-1 overflow-x-auto px-2 py-2 pb-[max(0.65rem,env(safe-area-inset-bottom))]">
          {navItems.map(({ to, label, short }) => (
            <NavLink
              key={to}
              to={to}
              end={to === '/'}
              className={({ isActive }) =>
                `tap-target shrink-0 rounded-xl px-3 py-2.5 text-center text-[11px] font-semibold leading-tight transition sm:text-xs ${
                  isActive
                    ? 'bg-brand-600 text-white shadow-md ring-2 ring-brand-400/40 dark:bg-brand-500 dark:ring-brand-400/30'
                    : 'text-slate-600 hover:bg-slate-100/80 dark:text-slate-300 dark:hover:bg-slate-800/80'
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
