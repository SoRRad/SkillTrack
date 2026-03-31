import { useEffect, useState } from 'react';
import { getExerciseTheme, getExerciseVisual } from '../data/exerciseVisuals';
import type { ExerciseTemplate } from '../types/models';
import { ExerciseArtwork } from './exerciseArt/ExerciseArtwork';

export function ExerciseMedia({ exercise }: { exercise: ExerciseTemplate }) {
  const [showFallback, setShowFallback] = useState(!exercise.imageUrl);
  const visualId = getExerciseVisual(exercise.id);
  const theme = getExerciseTheme(exercise.id);

  useEffect(() => {
    setShowFallback(!exercise.imageUrl);
  }, [exercise.imageUrl]);

  if (!exercise.imageUrl || showFallback) {
    return <ExerciseArtwork visualId={visualId} meshClass={theme.mesh} caption={exercise.name} />;
  }

  return (
    <div className="overflow-hidden rounded-2xl ring-1 ring-black/5 dark:ring-white/10">
      <img
        src={exercise.imageUrl}
        alt={exercise.name}
        className="h-52 w-full object-cover"
        loading="lazy"
        onError={() => setShowFallback(true)}
      />
    </div>
  );
}
