type WarmupBlock = {
  title: string;
  detail: string;
};

function pullWarmup(): WarmupBlock[] {
  return [
    { title: 'Raise temperature', detail: '3-5 minutes easy bike, rower, or brisk walk until you feel warm.' },
    { title: 'Open shoulders', detail: 'Band pull-aparts, shoulder circles, and hanging scap shrugs for 8-12 smooth reps.' },
    { title: 'Activate pull pattern', detail: 'Scap pull-ups or light rows for 2 short sets before the first main pull.' },
    { title: 'Ramp into work', detail: 'Take 2-3 lighter build-up sets for the first strength movement before working sets.' }
  ];
}

function pushWarmup(): WarmupBlock[] {
  return [
    { title: 'Raise temperature', detail: '3-5 minutes of light cyclical movement plus easy arm swings.' },
    { title: 'Prepare shoulders', detail: 'External rotations, wall slides, and scap push-ups for controlled shoulder positioning.' },
    { title: 'Prime pressing', detail: 'Use an easy push-up variation or empty-bar presses for crisp setup and range.' },
    { title: 'Ramp into work', detail: 'Take 2-3 lighter sets before the first heavy press or dip pattern.' }
  ];
}

function lowerWarmup(): WarmupBlock[] {
  return [
    { title: 'Raise temperature', detail: '4-5 minutes incline walk, bike, or march in place until the hips feel loose.' },
    { title: 'Open ankles and hips', detail: 'Ankle rocks, deep squat pries, and adductor shifts for 6-10 reps each side.' },
    { title: 'Prime squat and hinge', detail: 'Bodyweight squats, glute bridges, and a light hinge pattern before loading.' },
    { title: 'Ramp into work', detail: 'Take 2-4 gradually heavier build-up sets before the first squat or hinge lift.' }
  ];
}

function mixedWarmup(): WarmupBlock[] {
  return [
    { title: 'Raise temperature', detail: '3-5 minutes light cardio until breathing is elevated but still easy.' },
    { title: 'Move through full ranges', detail: 'Use dynamic mobility for shoulders, hips, and t-spine based on the session focus.' },
    { title: 'Activate the first pattern', detail: 'Choose one short activation drill that matches the first main movement.' },
    { title: 'Ramp into work', detail: 'Take a couple of easy rehearsal sets before the first challenging exercise.' }
  ];
}

export function getWarmupBlocks(focus: string): WarmupBlock[] {
  const lower = focus.toLowerCase();
  if (lower.includes('pull')) return pullWarmup();
  if (lower.includes('push')) return pushWarmup();
  if (lower.includes('lower') || lower.includes('leg')) return lowerWarmup();
  return mixedWarmup();
}

export function getWarmupSummary(focus: string): string {
  const lower = focus.toLowerCase();
  if (lower.includes('pull')) return 'Prepare scapular control, shoulder position, and explosive pulling before the main work.';
  if (lower.includes('push')) return 'Prepare shoulder stacking, pressing range, and cuff activation before loaded pressing.';
  if (lower.includes('lower') || lower.includes('leg')) return 'Prepare ankles, hips, trunk bracing, and squat or hinge patterns before the main lift.';
  return 'Raise temperature, move through key ranges, and rehearse the first movement pattern before working sets.';
}
