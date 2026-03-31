/** Visual tokens for animated SVG artwork — one illustration style per exercise id in seed. */
export type ExerciseVisualId =
  | 'warmup'
  | 'pullBar'
  | 'lever'
  | 'rowMachine'
  | 'facePull'
  | 'curl'
  | 'hangingCore'
  | 'hollow'
  | 'mobility'
  | 'hinge'
  | 'squat'
  | 'rdl'
  | 'splitSquat'
  | 'calf'
  | 'lsit'
  | 'rollout'
  | 'sidePlank'
  | 'handstand'
  | 'pikePress'
  | 'dip'
  | 'bench'
  | 'dbPress'
  | 'cable'
  | 'pushdown'
  | 'rearDelt'
  | 'planche'
  | 'deadBug'
  | 'default';

export type ExerciseVisualTheme = {
  /** Tailwind classes for gradient mesh behind SVG */
  mesh: string;
  accent: string;
};

export const EXERCISE_VISUAL_MAP: Record<string, ExerciseVisualId> = {
  warmup: 'warmup',
  'warmup-dynamic': 'warmup',
  'scap-pullup': 'pullBar',
  'ctb-pullup': 'pullBar',
  'explosive-pullup': 'pullBar',
  'banded-transition': 'pullBar',
  'front-lever-tuck': 'lever',
  'weighted-pullup': 'pullBar',
  'ring-row': 'rowMachine',
  'barbell-row': 'rowMachine',
  'chest-supported-row': 'rowMachine',
  'lat-pulldown': 'rowMachine',
  'face-pull': 'facePull',
  'rear-delt-cable': 'rearDelt',
  'hammer-curl': 'curl',
  'hanging-knee-raise': 'hangingCore',
  'hanging-leg-raise': 'hangingCore',
  'hollow-hold': 'hollow',
  'goblet-squat': 'squat',
  'cossack-squat': 'mobility',
  'shoulder-mobility': 'mobility',
  'jefferson-curl': 'hinge',
  'back-squat': 'squat',
  'romanian-deadlift': 'rdl',
  rdl: 'rdl',
  'split-squat': 'splitSquat',
  'bulgarian-split-squat': 'splitSquat',
  'calf-raise': 'calf',
  'lsit-tuck': 'lsit',
  'lsit-prog': 'lsit',
  'ab-wheel': 'rollout',
  'side-plank': 'sidePlank',
  'mobility-finisher': 'mobility',
  'wall-handstand': 'handstand',
  'pike-press': 'pikePress',
  'pike-hspu': 'pikePress',
  'weighted-dip': 'dip',
  'weighted-dips': 'dip',
  'bench-press': 'bench',
  'landmine-press': 'dbPress',
  'push-up-plus': 'pikePress',
  'incline-db-press': 'dbPress',
  'cable-lateral-raise': 'cable',
  'triceps-pushdown': 'pushdown',
  'rear-delt': 'rearDelt',
  'parallette-tuck': 'planche',
  'dead-bug': 'deadBug',
  'zone-2-walk': 'warmup'
};

export const VISUAL_THEMES: Record<ExerciseVisualId, ExerciseVisualTheme> = {
  warmup: { mesh: 'from-amber-400/30 via-orange-400/20 to-rose-400/20', accent: 'text-amber-600 dark:text-amber-400' },
  pullBar: { mesh: 'from-sky-400/35 via-blue-500/25 to-indigo-500/20', accent: 'text-sky-600 dark:text-sky-400' },
  lever: { mesh: 'from-violet-400/35 via-fuchsia-500/20 to-purple-600/20', accent: 'text-violet-600 dark:text-violet-400' },
  rowMachine: { mesh: 'from-cyan-400/30 via-teal-500/25 to-emerald-600/15', accent: 'text-teal-600 dark:text-teal-400' },
  facePull: { mesh: 'from-emerald-400/25 via-teal-400/20 to-cyan-500/20', accent: 'text-emerald-600 dark:text-emerald-400' },
  curl: { mesh: 'from-lime-400/25 via-green-500/20 to-emerald-600/20', accent: 'text-green-600 dark:text-green-400' },
  hangingCore: { mesh: 'from-blue-400/30 via-sky-500/20 to-cyan-500/15', accent: 'text-blue-600 dark:text-blue-400' },
  hollow: { mesh: 'from-indigo-400/30 via-blue-500/20 to-violet-500/15', accent: 'text-indigo-600 dark:text-indigo-400' },
  mobility: { mesh: 'from-teal-300/35 via-cyan-400/25 to-sky-500/20', accent: 'text-cyan-700 dark:text-cyan-400' },
  hinge: { mesh: 'from-amber-500/25 via-yellow-500/15 to-orange-500/20', accent: 'text-amber-700 dark:text-amber-400' },
  squat: { mesh: 'from-orange-400/35 via-red-400/20 to-rose-500/20', accent: 'text-orange-600 dark:text-orange-400' },
  rdl: { mesh: 'from-red-400/25 via-rose-500/20 to-fuchsia-600/15', accent: 'text-rose-600 dark:text-rose-400' },
  splitSquat: { mesh: 'from-rose-400/30 via-pink-500/20 to-fuchsia-500/15', accent: 'text-rose-600 dark:text-rose-400' },
  calf: { mesh: 'from-yellow-400/30 via-amber-500/25 to-orange-500/15', accent: 'text-amber-700 dark:text-amber-400' },
  lsit: { mesh: 'from-fuchsia-400/35 via-purple-500/25 to-indigo-600/15', accent: 'text-fuchsia-600 dark:text-fuchsia-400' },
  rollout: { mesh: 'from-slate-400/30 via-zinc-500/25 to-neutral-600/15', accent: 'text-zinc-600 dark:text-zinc-400' },
  sidePlank: { mesh: 'from-blue-500/25 via-indigo-500/25 to-violet-600/20', accent: 'text-indigo-600 dark:text-indigo-400' },
  handstand: { mesh: 'from-pink-400/35 via-rose-500/25 to-orange-400/20', accent: 'text-pink-600 dark:text-pink-400' },
  pikePress: { mesh: 'from-purple-400/35 via-violet-500/25 to-fuchsia-500/15', accent: 'text-purple-600 dark:text-purple-400' },
  dip: { mesh: 'from-cyan-400/35 via-blue-500/25 to-indigo-600/15', accent: 'text-cyan-700 dark:text-cyan-400' },
  bench: { mesh: 'from-red-400/30 via-orange-500/25 to-amber-500/15', accent: 'text-red-600 dark:text-red-400' },
  dbPress: { mesh: 'from-amber-400/35 via-yellow-500/20 to-lime-500/15', accent: 'text-amber-700 dark:text-amber-400' },
  cable: { mesh: 'from-sky-400/35 via-blue-500/20 to-indigo-500/15', accent: 'text-sky-700 dark:text-sky-400' },
  pushdown: { mesh: 'from-emerald-400/30 via-green-500/20 to-lime-600/15', accent: 'text-emerald-700 dark:text-emerald-400' },
  rearDelt: { mesh: 'from-teal-400/30 via-cyan-500/20 to-sky-600/15', accent: 'text-teal-700 dark:text-teal-400' },
  planche: { mesh: 'from-violet-400/40 via-purple-600/25 to-fuchsia-600/15', accent: 'text-violet-600 dark:text-violet-400' },
  deadBug: { mesh: 'from-blue-400/30 via-indigo-500/20 to-purple-600/15', accent: 'text-blue-700 dark:text-blue-400' },
  default: { mesh: 'from-slate-400/25 via-slate-500/20 to-slate-600/15', accent: 'text-slate-600 dark:text-slate-400' }
};

export function getExerciseVisual(exerciseId: string): ExerciseVisualId {
  return EXERCISE_VISUAL_MAP[exerciseId] ?? 'default';
}

export function getExerciseTheme(exerciseId: string): ExerciseVisualTheme {
  const id = getExerciseVisual(exerciseId);
  return VISUAL_THEMES[id];
}
