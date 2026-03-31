type Props = {
  value: number | undefined;
  onChange: (value: number | undefined) => void;
  step?: number;
  min?: number;
  max?: number;
  disabled?: boolean;
  suffix?: string;
  placeholder?: string;
};

export function NumberStepper({
  value,
  onChange,
  step = 1,
  min = 0,
  max,
  disabled,
  suffix,
  placeholder = '—'
}: Props) {
  const n = typeof value === 'number' && !Number.isNaN(value) ? value : null;
  const display = n === null ? '' : String(n);

  const bump = (delta: number) => {
    const base = n ?? 0;
    let next = Math.round((base + delta) * 1000) / 1000;
    if (next < min) next = min;
    if (max != null && next > max) next = max;
    onChange(next);
  };

  return (
    <div className="flex items-stretch gap-2">
      <button
        type="button"
        disabled={disabled || (n != null && n - step < min)}
        className="tap-target flex h-12 min-w-[48px] shrink-0 items-center justify-center rounded-xl border border-slate-200 bg-white text-lg font-semibold text-slate-800 shadow-sm active:scale-[0.98] disabled:opacity-40 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100"
        aria-label="Decrease"
        onClick={() => bump(-step)}
      >
        −
      </button>
      <div className="relative min-w-0 flex-1">
        <input
          type="number"
          inputMode="decimal"
          disabled={disabled}
          placeholder={placeholder}
          className={`input-touch text-center font-mono text-lg font-semibold tabular-nums ${suffix ? 'pr-10' : ''}`}
          value={display}
          onChange={(e) => {
            const raw = e.target.value;
            if (raw === '') {
              onChange(undefined);
              return;
            }
            const parsed = Number(raw);
            if (Number.isNaN(parsed)) return;
            let next = parsed;
            if (next < min) next = min;
            if (max != null && next > max) next = max;
            onChange(next);
          }}
        />
        {suffix && (
          <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-xs font-medium text-slate-400">{suffix}</span>
        )}
      </div>
      <button
        type="button"
        disabled={disabled || (max != null && n != null && n + step > max)}
        className="tap-target flex h-12 min-w-[48px] shrink-0 items-center justify-center rounded-xl border border-slate-200 bg-white text-lg font-semibold text-slate-800 shadow-sm active:scale-[0.98] disabled:opacity-40 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100"
        aria-label="Increase"
        onClick={() => bump(step)}
      >
        +
      </button>
    </div>
  );
}

export function QuickChips({
  values,
  active,
  onPick,
  disabled
}: {
  values: number[];
  active: number | undefined;
  onPick: (n: number) => void;
  disabled?: boolean;
}) {
  return (
    <div className="flex flex-wrap gap-2">
      {values.map((n) => (
        <button
          key={n}
          type="button"
          disabled={disabled}
          className={`tap-target rounded-full px-3 py-2 text-sm font-semibold ${
            active === n
              ? 'bg-brand-600 text-white shadow-md dark:bg-brand-500'
              : 'border border-slate-200 bg-white text-slate-700 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-200'
          }`}
          onClick={() => onPick(n)}
        >
          {n}
        </button>
      ))}
    </div>
  );
}
