import type { MovementPattern } from '../types/models';

const imagesByExerciseId: Record<string, string> = {
  'front-lever-tuck': 'https://images.unsplash.com/photo-1517837016564-bfc3d6a1cfdd?auto=format&fit=crop&w=1200&q=80',
  'weighted-pullup': 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&w=1200&q=80',
  'weighted-dip': 'https://images.unsplash.com/photo-1518611012118-696072aa579a?auto=format&fit=crop&w=1200&q=80',
  'wall-handstand': 'https://images.unsplash.com/photo-1518611012118-696072aa579a?auto=format&fit=crop&w=1200&q=80',
  'bench-press': 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&w=1200&q=80',
  'back-squat': 'https://images.unsplash.com/photo-1434682881908-b43d0467b798?auto=format&fit=crop&w=1200&q=80',
  'romanian-deadlift': 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?auto=format&fit=crop&w=1200&q=80',
  'lsit-tuck': 'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?auto=format&fit=crop&w=1200&q=80'
};

const imagesByPattern: Record<MovementPattern, string> = {
  pull: 'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?auto=format&fit=crop&w=1200&q=80',
  push: 'https://images.unsplash.com/photo-1518611012118-696072aa579a?auto=format&fit=crop&w=1200&q=80',
  legs: 'https://images.unsplash.com/photo-1434682881908-b43d0467b798?auto=format&fit=crop&w=1200&q=80',
  core: 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?auto=format&fit=crop&w=1200&q=80',
  mobility: 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?auto=format&fit=crop&w=1200&q=80',
  mixed: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?auto=format&fit=crop&w=1200&q=80'
};

export function resolveExerciseImageUrl(exerciseId: string, movementPattern: MovementPattern): string | undefined {
  return imagesByExerciseId[exerciseId] ?? imagesByPattern[movementPattern];
}
