<!--
# SkillTrack

SkillTrack is a **mobile-first, local-first workout tracking app** built for structured calisthenics skill progression and gym performance logging. It is designed for personal use with fast logging, progression visibility, and zero backend costs.

## Purpose

SkillTrack helps you:
<<<<<<< ours
- Follow a weekly 3-day training split (Pull, Legs, Push) and step through **Day 1–3** on the Today screen (saved to settings)
- Log workouts with reps, weight, hold time, RPE toggles, per-set completion, and exercise notes
=======
- Follow a weekly 3-day training split (Pull, Legs, Push)
- Log workouts with reps, weight, hold time, and RPE
>>>>>>> theirs
- Track progression on Muscle-up, L-sit, Front lever, Handstand, and Planche
- Monitor body metrics (weight, waist, sleep, energy)
- Export/import local backups safely

## Tech Stack

- Vite
- React
- TypeScript
- Tailwind CSS
- IndexedDB (native browser API)
- React Router
- GitHub Pages deployment via GitHub Actions

## Local Development

```bash
npm install
npm run dev
```

Open `http://localhost:5173/SkillTrack/`.

## Build

```bash
npm run build
npm run preview
```

The Vite base path is configured for GitHub Pages repo deployment at `/SkillTrack/`.

## Deployment (GitHub Pages)

1. Push to `main`
2. GitHub Actions workflow builds and publishes `dist/`
3. Enable Pages in repo settings (Source: GitHub Actions)

Final URL:

`https://sorrad.github.io/SkillTrack`

## Data & Backups

- All app data is stored in IndexedDB in-browser.
- Use **Settings → Export JSON backup** to download data.
<<<<<<< ours
- Use **Settings → Import JSON backup** to restore data. Import **replaces** all local SkillTrack rows (sessions, metrics, etc.) so restores stay consistent with the file.
- Use **Settings → Reset local data** to clear and reseed the app.

## PWA

- `public/manifest.webmanifest` enables a simple installable shell on supported browsers. There is no service worker in v1 (offline cache can be added later).

=======
- Use **Settings → Import JSON backup** to restore data.
- Use **Settings → Reset local data** to clear and reseed the app.

>>>>>>> theirs
## v1 Architecture

- `src/data/seed.ts`: editable seed plan and skill ladder defaults
- `src/types/models.ts`: application domain model types
- `src/db/indexedDb.ts`: persistence and bootstrap logic
- `src/store/AppContext.tsx`: app-wide state orchestration
- `src/features/*`: page-level feature modules
- `src/lib/*`: progression and backup utilities

## Suggested v2 Improvements

- Better charts (line chart + adherence heatmap)
- Timer/rest controls on Today page
- Program editing UX (reorder/add exercise)
- Session templates and deload logic
- PWA install + offline cache strategy
-->

# SkillTrack

SkillTrack is a mobile-first, local-first workout platform built for structured calisthenics skill progression, gym performance logging, and multi-user training on one device. It keeps everything in IndexedDB, uses no backend, and still deploys to GitHub Pages.

## What changed

- Multi-user local profiles with a user selector dashboard on app open
- Per-user onboarding and deterministic local coaching engine
- Personalized per-user plan generation stored as editable data
- Guided one-exercise-per-screen workout sessions with autosave and resume
- Per-user check-ins, dashboard suggestions, milestones, metrics, skills, and calendar history
- Backup/export for all users or the active user only

## Multi-user workflow

1. Open the app on the Users screen.
2. Select an existing user or create a new one.
3. New users complete onboarding before entering the dashboard.
4. Each user keeps separate onboarding answers, plan, sessions, metrics, skills, check-ins, defaults, and settings.
5. Use the Users tab any time to switch the active local profile.

## Onboarding flow

- The onboarding wizard is step-based and mobile-first.
- It captures profile, availability, experience, goals, skill priorities, and health context.
- Submitting onboarding regenerates the user's local coach profile and editable plan.

## Local coaching engine

- No paid APIs or external AI services are used.
- Personalization is rule-based and deterministic.
- Plan generation is split into goal scoring, split selection, exercise pool selection, set/rep tuning, and safety adjustments.
- Dashboard suggestions are derived from local history, check-ins, progress trends, and in-progress sessions.

## Guided workout flow

- Start from Today to create or resume the current workout.
- Active workouts show one task at a time on its own screen.
- Each task includes an exercise image, target, previous performance, default reps/holds, last used weight when available, and notes.
- Moving forward saves the task immediately to IndexedDB.
- Leaving or reloading the app keeps the in-progress session and resumes at the last saved task.

## Default values and history

- Rep and hold inputs start from the target prescription in the plan.
- Weighted movements default to the last weight that specific user used for that specific exercise when history exists.
- Previous exercise performance is shown directly on the active workout screen.

## Tech stack

- Vite
- React
- TypeScript
- Tailwind CSS
- IndexedDB
- React Router
- GitHub Pages via GitHub Actions

## Local development

```bash
npm install
npm run dev
```

Open `http://localhost:5173/SkillTrack/`.

## Build

```bash
npm run lint
npm run build
```

## Backups and storage limits

- All app data is stored in IndexedDB in-browser.
- Use **Settings -> Export all users** for a full device backup.
- Use **Settings -> Export active user only** for a single-profile backup.
- Use **Settings -> Import backup** to replace the local snapshot with a saved file.
- Use **Settings -> Reset local data** to recreate the seeded example user and clear local records.
- Existing single-user data is migrated into a default imported user when possible instead of being silently dropped.
- Local-first limitation: data does not sync across browsers or devices unless you export and import it yourself.

## Architecture

- `src/types/models.ts`: multi-user domain model
- `src/db/indexedDb.ts`: versioned IndexedDB schema, seed bootstrap, and migration logic
- `src/lib/coach/*`: local planning engine modules
- `src/lib/workoutSession.ts`: guided workout session builder with defaults
- `src/store/AppContext.tsx`: app-wide state orchestration and per-user slices
- `src/features/users/*`: selector dashboard and onboarding flow
- `src/features/today/*`: readiness, check-in, and guided workout flow
- `src/features/*`: dashboards, history, skills, metrics, calendar, and settings
