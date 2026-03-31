export function StatCard({ label, value, hint }: { label: string; value: string; hint?: string }) {
  return (
    <article className="card group">
      <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400">{label}</p>
      <p className="mt-2 text-lg font-bold leading-snug tracking-tight text-slate-900 dark:text-white sm:text-xl">{value}</p>
      {hint && <p className="mt-2 text-xs leading-relaxed text-slate-600 dark:text-slate-400">{hint}</p>}
    </article>
  );
}
