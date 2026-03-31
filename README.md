# SkillTrack

SkillTrack is a mobile-first, local-first workout tracker for structured calisthenics skill work, gym strength, and multi-user training on one device. It runs entirely in the browser, stores data in IndexedDB, uses no backend, and stays compatible with GitHub Pages.

## What it does

- Supports multiple local user profiles on one device
- Uses per-user onboarding to generate a deterministic rule-based plan
- Keeps separate per-user plans, sessions, check-ins, metrics, skills, achievements, journal entries, and settings
- Guides workouts one exercise at a time with autosave and resume
- Exports backups for all users or just the active user

## Multi-user flow

1. Open the app on the Profiles screen.
2. Select an existing user or create a new one.
3. New users complete onboarding before entering the dashboard.
4. Switching users swaps the active plan, workout history, metrics, and settings immediately.
5. In-progress workouts remain tied to the correct user and resume from that user's saved checkpoint.

## Onboarding and local coaching

- The onboarding flow is step-based and mobile-first.
- It captures profile, availability, experience, goals, skill priorities, and health context.
- Submission regenerates the user's coach profile and plan locally.
- Personalization is deterministic and rule-based. No paid APIs or external AI services are used.
- Planning is built from goal scoring, split selection, exercise pool selection, set/rep tuning, and safety adjustments.

## Guided workout flow

- Start from Today to create or resume the current workout.
- Active workouts show one task per screen.
- Each task includes targets, notes, previous performance, and image support with a local fallback illustration.
- Inputs autosave locally during the session.
- Reloading or leaving mid-workout preserves the in-progress session and reopens the saved checkpoint.
- Finishing a workout closes the session cleanly and rolls the saved day order forward.

## Local-first storage

- All app data lives in IndexedDB in the browser.
- There is no cloud sync, backend, or authentication provider.
- Data is browser-specific until you export and import it elsewhere.
- Clearing browser site data removes local records unless you export first.
- Older single-user local data is migrated into the current multi-user model when possible.

## Backups and reset

- Use `Settings -> Export all users` for a full-device backup.
- Use `Settings -> Export active user only` for a single-profile backup.
- Use `Settings -> Import backup` to replace the current local snapshot with a validated backup file.
- Use `Settings -> Reset local data` to clear local data and recreate the seeded example profile.

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

## Quality checks

```bash
npm run lint
npm run build
```

## Build and deploy

- The Vite base path is configured for `/SkillTrack/`.
- `BrowserRouter` is also configured with the `/SkillTrack` basename.
- GitHub Actions builds and publishes the app for GitHub Pages.
- Expected production URL: `https://sorrad.github.io/SkillTrack`

## Architecture notes

- `src/types/models.ts`: multi-user domain model
- `src/db/*`: IndexedDB schema, bootstrap, migration, and persistence helpers
- `src/lib/coach/*`: rule-based plan generation and recommendations
- `src/lib/workoutSession.ts`: guided workout session creation and state transitions
- `src/store/*`: app state orchestration, selectors, and snapshot helpers
- `src/features/*`: profile management, onboarding, dashboard, today flow, history, metrics, skills, calendar, and settings
