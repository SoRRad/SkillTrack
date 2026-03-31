import type { ReactElement } from 'react';
import type { ExerciseVisualId } from '../../data/exerciseVisuals';

const stroke = 'stroke-current';
const fillNone = 'fill-none';
const baseStroke = `${stroke} ${fillNone} stroke-[2.25] [stroke-linecap:round] [stroke-linejoin:round]`;

function SvgFrame({ children }: { children: React.ReactNode }) {
  return (
    <svg viewBox="0 0 200 120" className="h-24 w-full max-w-[220px] text-white drop-shadow-sm" aria-hidden>
      {children}
    </svg>
  );
}

function ArtWarmup() {
  return (
    <SvgFrame>
      <path className={baseStroke} d="M30 88 Q55 40 100 48 T170 42" opacity={0.9} />
      <circle className={baseStroke} cx="100" cy="48" r="14" />
      <path className={baseStroke} d="M86 62 L70 90 M114 62 L130 90" opacity={0.85} />
    </SvgFrame>
  );
}

function ArtPullBar() {
  return (
    <SvgFrame>
      <line className={baseStroke} x1="40" y1="28" x2="160" y2="28" />
      <path className={baseStroke} d="M100 28 L100 42" />
      <circle className={baseStroke} cx="100" cy="58" r="16" />
      <path className={baseStroke} d="M84 74 L84 96 M116 74 L116 96" />
    </SvgFrame>
  );
}

function ArtLever() {
  return (
    <SvgFrame>
      <line className={baseStroke} x1="50" y1="32" x2="150" y2="32" />
      <path className={baseStroke} d="M100 32 L92 52 L78 70 M100 32 L108 52 L122 70" />
      <ellipse className={baseStroke} cx="100" cy="78" rx="22" ry="8" opacity={0.9} />
    </SvgFrame>
  );
}

function ArtRowMachine() {
  return (
    <SvgFrame>
      <rect className={baseStroke} x="125" y="36" width="38" height="52" rx="4" opacity={0.95} />
      <path className={baseStroke} d="M45 64 H95 Q105 64 112 56 L118 44" />
      <path className={baseStroke} d="M70 64 L70 92 M90 56 L90 92" />
    </SvgFrame>
  );
}

function ArtFacePull() {
  return (
    <SvgFrame>
      <path className={baseStroke} d="M45 36 Q100 24 155 36" />
      <path className={baseStroke} d="M70 78 L100 52 L130 78" />
      <circle className={baseStroke} cx="100" cy="52" r="12" />
    </SvgFrame>
  );
}

function ArtCurl() {
  return (
    <SvgFrame>
      <path className={baseStroke} d="M55 92 L55 70 Q55 48 75 42" />
      <path className={baseStroke} d="M145 92 L145 70 Q145 48 125 42" />
      <rect className={baseStroke} x="72" y="34" width="56" height="14" rx="7" />
    </SvgFrame>
  );
}

function ArtHangingCore() {
  return (
    <SvgFrame>
      <line className={baseStroke} x1="55" y1="30" x2="145" y2="30" />
      <path className={baseStroke} d="M100 30 L100 46" />
      <path className={baseStroke} d="M88 46 Q100 76 112 46" />
      <path className={baseStroke} d="M88 62 L72 88 M112 62 L128 88" />
    </SvgFrame>
  );
}

function ArtHollow() {
  return (
    <SvgFrame>
      <path
        className={baseStroke}
        d="M48 72 Q100 40 152 72 Q100 92 48 72"
        opacity={0.95}
      />
      <circle className={baseStroke} cx="100" cy="58" r="10" />
    </SvgFrame>
  );
}

function ArtMobility() {
  return (
    <SvgFrame>
      <path className={baseStroke} d="M40 88 Q75 32 100 56 T160 36" />
      <circle className={baseStroke} cx="100" cy="56" r="14" />
    </SvgFrame>
  );
}

function ArtHinge() {
  return (
    <SvgFrame>
      <path className={baseStroke} d="M60 36 L140 36" />
      <path className={baseStroke} d="M100 36 L100 52 Q100 78 80 92" />
      <path className={baseStroke} d="M100 52 L120 78 L138 92" />
    </SvgFrame>
  );
}

function ArtSquat() {
  return (
    <SvgFrame>
      <path className={baseStroke} d="M100 30 L100 50" />
      <rect className={baseStroke} x="78" y="50" width="44" height="20" rx="6" />
      <path className={baseStroke} d="M78 88 L78 102 M122 88 L122 102" />
      <path className={baseStroke} d="M70 58 L58 74 M130 58 L142 74" />
    </SvgFrame>
  );
}

function ArtRdl() {
  return (
    <SvgFrame>
      <path className={baseStroke} d="M52 40 H148" />
      <path className={baseStroke} d="M100 40 L100 58 Q100 82 118 94" />
      <path className={baseStroke} d="M100 58 L82 76 L66 92" />
    </SvgFrame>
  );
}

function ArtSplitSquat() {
  return (
    <SvgFrame>
      <path className={baseStroke} d="M100 34 L100 54" />
      <path className={baseStroke} d="M80 94 L100 54 L124 94" />
      <path className={baseStroke} d="M68 68 L56 88 M132 68 L144 88" />
    </SvgFrame>
  );
}

function ArtCalf() {
  return (
    <SvgFrame>
      <path className={baseStroke} d="M88 34 L88 78 M112 34 L112 78" />
      <path className={baseStroke} d="M76 78 L100 88 L124 78" />
      <path className={baseStroke} d="M88 34 L76 44 M112 34 L124 44" />
    </SvgFrame>
  );
}

function ArtLsit() {
  return (
    <SvgFrame>
      <line className={baseStroke} x1="48" y1="64" x2="152" y2="64" />
      <rect className={baseStroke} x="72" y="48" width="56" height="16" rx="4" />
      <path className={baseStroke} d="M72 64 L62 88 M128 64 L138 88" />
    </SvgFrame>
  );
}

function ArtRollout() {
  return (
    <SvgFrame>
      <circle className={baseStroke} cx="100" cy="84" r="14" />
      <path className={baseStroke} d="M100 70 L100 38" />
      <path className={baseStroke} d="M84 44 H116" />
    </SvgFrame>
  );
}

function ArtSidePlank() {
  return (
    <SvgFrame>
      <path className={baseStroke} d="M60 88 L120 40" />
      <path className={baseStroke} d="M120 40 L140 88" />
      <path className={baseStroke} d="M60 88 L48 96" />
    </SvgFrame>
  );
}

function ArtHandstand() {
  return (
    <SvgFrame>
      <path className={baseStroke} d="M100 26 L100 58" />
      <path className={baseStroke} d="M100 58 L84 86 M100 58 L116 86" />
      <path className={baseStroke} d="M84 24 L100 26 L116 24" />
    </SvgFrame>
  );
}

function ArtPikePress() {
  return (
    <SvgFrame>
      <path className={baseStroke} d="M100 70 L100 42" />
      <path className={baseStroke} d="M70 88 L100 42 L130 88" />
      <path className={baseStroke} d="M84 28 L116 28" />
    </SvgFrame>
  );
}

function ArtDip() {
  return (
    <SvgFrame>
      <path className={baseStroke} d="M62 32 H138" />
      <path className={baseStroke} d="M78 32 L78 46 M122 32 L122 46" />
      <path className={baseStroke} d="M100 46 L100 72" />
      <path className={baseStroke} d="M84 72 L100 90 L116 72" />
    </SvgFrame>
  );
}

function ArtBench() {
  return (
    <SvgFrame>
      <line className={baseStroke} x1="40" y1="72" x2="160" y2="72" />
      <path className={baseStroke} d="M100 40 L100 58" />
      <path className={baseStroke} d="M82 58 H118" />
      <path className={baseStroke} d="M76 58 L76 74 M124 58 L124 74" />
    </SvgFrame>
  );
}

function ArtDbPress() {
  return (
    <SvgFrame>
      <path className={baseStroke} d="M100 44 L100 62" />
      <path className={baseStroke} d="M72 50 L60 58 M128 50 L140 58" />
      <rect className={baseStroke} x="78" y="62" width="44" height="18" rx="6" />
    </SvgFrame>
  );
}

function ArtCable() {
  return (
    <SvgFrame>
      <path className={baseStroke} d="M100 30 L100 48" />
      <path className={baseStroke} d="M100 48 Q118 62 130 76" />
      <circle className={baseStroke} cx="100" cy="40" r="10" />
    </SvgFrame>
  );
}

function ArtPushdown() {
  return (
    <SvgFrame>
      <path className={baseStroke} d="M100 30 L100 58" />
      <path className={baseStroke} d="M82 58 H118" />
      <path className={baseStroke} d="M100 58 L100 88" />
    </SvgFrame>
  );
}

function ArtRearDelt() {
  return (
    <SvgFrame>
      <path className={baseStroke} d="M100 36 L72 58 M100 36 L128 58" />
      <path className={baseStroke} d="M72 58 L100 80 L128 58" />
    </SvgFrame>
  );
}

function ArtPlanche() {
  return (
    <SvgFrame>
      <line className={baseStroke} x1="55" y1="88" x2="145" y2="88" />
      <path className={baseStroke} d="M78 88 L100 52 L122 88" />
      <path className={baseStroke} d="M100 52 L100 36" />
    </SvgFrame>
  );
}

function ArtDeadBug() {
  return (
    <SvgFrame>
      <circle className={baseStroke} cx="100" cy="54" r="14" />
      <path className={baseStroke} d="M86 48 L68 36 M114 48 L132 36" />
      <path className={baseStroke} d="M88 66 L72 84 M112 66 L128 84" />
    </SvgFrame>
  );
}

function ArtDefault() {
  return (
    <SvgFrame>
      <circle className={baseStroke} cx="100" cy="52" r="22" />
      <path className={baseStroke} d="M78 82 H122" />
    </SvgFrame>
  );
}

const ART_BY_ID: Record<ExerciseVisualId, () => ReactElement> = {
  warmup: ArtWarmup,
  pullBar: ArtPullBar,
  lever: ArtLever,
  rowMachine: ArtRowMachine,
  facePull: ArtFacePull,
  curl: ArtCurl,
  hangingCore: ArtHangingCore,
  hollow: ArtHollow,
  mobility: ArtMobility,
  hinge: ArtHinge,
  squat: ArtSquat,
  rdl: ArtRdl,
  splitSquat: ArtSplitSquat,
  calf: ArtCalf,
  lsit: ArtLsit,
  rollout: ArtRollout,
  sidePlank: ArtSidePlank,
  handstand: ArtHandstand,
  pikePress: ArtPikePress,
  dip: ArtDip,
  bench: ArtBench,
  dbPress: ArtDbPress,
  cable: ArtCable,
  pushdown: ArtPushdown,
  rearDelt: ArtRearDelt,
  planche: ArtPlanche,
  deadBug: ArtDeadBug,
  default: ArtDefault
};

export function ExerciseArtwork({
  visualId,
  meshClass,
  caption
}: {
  visualId: ExerciseVisualId;
  /** Tailwind `from-â€¦ via-â€¦ to-â€¦` fragment for gradient mesh */
  meshClass: string;
  caption: string;
}) {
  const Art = ART_BY_ID[visualId] ?? ArtDefault;
  return (
    <div className={`relative overflow-hidden rounded-2xl bg-gradient-to-br shadow-inner-glow ring-1 ring-black/10 dark:ring-white/15 ${meshClass}`}>
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(255,255,255,0.35),transparent_55%)] dark:bg-[radial-gradient(circle_at_30%_20%,rgba(255,255,255,0.12),transparent_50%)]" />
      <div className="relative flex flex-col items-center gap-1 px-3 py-3 sm:px-4 sm:py-4">
        <div className="animate-float-soft drop-shadow-md">
          <Art />
        </div>
        <p className="max-w-[220px] text-center text-[10px] font-semibold uppercase tracking-[0.18em] text-white/95 shadow-sm">{caption}</p>
      </div>
    </div>
  );
}
