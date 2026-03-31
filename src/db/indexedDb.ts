import type { AppDataSnapshot, AppSettings, BodyMetricLog, Plan, SkillLog, WorkoutSession } from '../types/models';
import { defaultSettings, seedPlan, seedSkillLogs } from '../data/seed';
import { mergeAppSettings } from '../lib/settings';

const DB_NAME = 'skilltrack-db';
const DB_VERSION = 1;

const stores = {
  plan: 'plan',
  sessions: 'sessions',
  skillLogs: 'skillLogs',
  metrics: 'metrics',
  settings: 'settings'
} as const;

type StoreName = (typeof stores)[keyof typeof stores];

function openDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    request.onerror = () => reject(request.error);
    request.onupgradeneeded = () => {
      const db = request.result;
      Object.values(stores).forEach((name) => {
        if (!db.objectStoreNames.contains(name)) {
          db.createObjectStore(name, { keyPath: 'id' });
        }
      });
    };
    request.onsuccess = () => resolve(request.result);
  });
}

function tx<T>(storeName: StoreName, mode: IDBTransactionMode, fn: (store: IDBObjectStore) => IDBRequest<T>): Promise<T> {
  return openDb().then((db) =>
    new Promise((resolve, reject) => {
      const transaction = db.transaction(storeName, mode);
      const store = transaction.objectStore(storeName);
      const request = fn(store);
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    })
  );
}

async function getAll<T>(storeName: StoreName): Promise<T[]> {
  return tx(storeName, 'readonly', (store) => store.getAll()) as Promise<T[]>;
}

async function put<T>(storeName: StoreName, value: T): Promise<void> {
  await tx(storeName, 'readwrite', (store) => store.put(value));
}

export async function initializeSeedIfNeeded(): Promise<void> {
  const existingPlan = await tx<Plan | undefined>(stores.plan, 'readonly', (store) => store.get(seedPlan.id));
  if (existingPlan) return;

  await put(stores.plan, seedPlan);
  await put(stores.settings, defaultSettings);
  for (const skill of seedSkillLogs) {
    await put(stores.skillLogs, skill);
  }
}

export async function getSnapshot(): Promise<AppDataSnapshot> {
  const plan = (await tx<Plan | undefined>(stores.plan, 'readonly', (store) => store.get(seedPlan.id))) ?? seedPlan;
  const sessions = await getAll<WorkoutSession>(stores.sessions);
  const skillLogs = await getAll<SkillLog>(stores.skillLogs);
  const metrics = await getAll<BodyMetricLog>(stores.metrics);
  const settings =
    (await tx<AppSettings | undefined>(stores.settings, 'readonly', (store) => store.get(defaultSettings.id))) ?? defaultSettings;

  return { plan, sessions, skillLogs, metrics, settings, exportedAt: new Date().toISOString() };
}

export async function saveSnapshot(snapshot: AppDataSnapshot): Promise<void> {
  await put(stores.plan, snapshot.plan);
  await put(stores.settings, snapshot.settings);
  for (const entity of snapshot.sessions) await put(stores.sessions, entity);
  for (const entity of snapshot.skillLogs) await put(stores.skillLogs, entity);
  for (const entity of snapshot.metrics) await put(stores.metrics, entity);
}

export async function saveSession(session: WorkoutSession): Promise<void> {
  await put(stores.sessions, session);
}

export async function saveSkillLog(log: SkillLog): Promise<void> {
  await put(stores.skillLogs, log);
}

export async function saveMetricLog(log: BodyMetricLog): Promise<void> {
  await put(stores.metrics, log);
}

export async function saveSettings(settings: AppSettings): Promise<void> {
  await put(stores.settings, mergeAppSettings(settings));
}

/** Clears all stores and writes a full snapshot (used for import so stale rows are removed). */
export async function replaceAllData(snapshot: AppDataSnapshot): Promise<void> {
  const db = await openDb();
  await new Promise<void>((resolve, reject) => {
    const transaction = db.transaction(Object.values(stores), 'readwrite');
    transaction.oncomplete = () => resolve();
    transaction.onerror = () => reject(transaction.error);
    Object.values(stores).forEach((name) => {
      transaction.objectStore(name).clear();
    });
  });
  await put(stores.plan, snapshot.plan);
  await put(stores.settings, mergeAppSettings(snapshot.settings));
  for (const entity of snapshot.sessions) await put(stores.sessions, entity);
  for (const entity of snapshot.skillLogs) await put(stores.skillLogs, entity);
  for (const entity of snapshot.metrics) await put(stores.metrics, entity);
}

export async function resetAllData(): Promise<void> {
  const db = await openDb();
  await new Promise<void>((resolve, reject) => {
    const transaction = db.transaction(Object.values(stores), 'readwrite');
    transaction.onerror = () => reject(transaction.error);
    transaction.oncomplete = () => resolve();
    Object.values(stores).forEach((name) => {
      transaction.objectStore(name).clear();
    });
  });
  await initializeSeedIfNeeded();
}
