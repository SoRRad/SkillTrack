# SkillTrack

SkillTrack is a **mobile-first, local-first workout tracking app** built for structured calisthenics skill progression and gym performance logging. It is designed for personal use with fast logging, progression visibility, and zero backend costs.

## Purpose

SkillTrack helps you:
- Follow a weekly 3-day training split (Pull, Legs, Push) and step through **Day 1–3** on the Today screen (saved to settings)
- Log workouts with reps, weight, hold time, RPE toggles, per-set completion, and exercise notes
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
- Use **Settings → Import JSON backup** to restore data. Import **replaces** all local SkillTrack rows (sessions, metrics, etc.) so restores stay consistent with the file.
- Use **Settings → Reset local data** to clear and reseed the app.

## PWA

- `public/manifest.webmanifest` enables a simple installable shell on supported browsers. There is no service worker in v1 (offline cache can be added later).

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
