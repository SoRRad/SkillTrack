export const DB_NAME = 'skilltrack-db';
export const DB_VERSION = 4;
export const APP_META_ID = 'app-meta';

export const STORES = {
  users: 'users',
  onboardings: 'onboardings',
  coachProfiles: 'coachProfiles',
  plans: 'plans',
  sessions: 'sessions',
  skillLogs: 'skillLogs',
  metrics: 'metrics',
  checkIns: 'checkIns',
  achievements: 'achievements',
  journalEntries: 'journalEntries',
  settings: 'settings',
  appMeta: 'appMeta'
} as const;

export const LEGACY_STORES = {
  plans: 'plan'
} as const;

export type StoreName = (typeof STORES)[keyof typeof STORES];

function ensureStore(db: IDBDatabase, storeName: string): void {
  if (!db.objectStoreNames.contains(storeName)) {
    db.createObjectStore(storeName, { keyPath: 'id' });
  }
}

function migrateLegacyPlanStore(db: IDBDatabase, transaction: IDBTransaction): void {
  if (!db.objectStoreNames.contains(LEGACY_STORES.plans) || !db.objectStoreNames.contains(STORES.plans)) {
    return;
  }

  const legacyStore = transaction.objectStore(LEGACY_STORES.plans);
  const nextStore = transaction.objectStore(STORES.plans);
  const cursorRequest = legacyStore.openCursor();
  cursorRequest.onsuccess = () => {
    const cursor = cursorRequest.result;
    if (!cursor) {
      return;
    }

    nextStore.put(cursor.value);
    cursor.continue();
  };
}

export function openDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onerror = () => reject(request.error);
    request.onupgradeneeded = () => {
      const db = request.result;
      const transaction = request.transaction;

      Object.values(STORES).forEach((storeName) => ensureStore(db, storeName));

      if (transaction) {
        migrateLegacyPlanStore(db, transaction);
      }
    };
    request.onsuccess = () => resolve(request.result);
  });
}
