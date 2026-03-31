import { LEGACY_STORES, STORES, openDb, type StoreName } from './schema';

function existingManagedStoreNames(db: IDBDatabase): string[] {
  return [...Object.values(STORES), ...Object.values(LEGACY_STORES)].filter((storeName) => db.objectStoreNames.contains(storeName));
}

export async function runStoreRequest<T>(
  storeName: StoreName,
  mode: IDBTransactionMode,
  handler: (store: IDBObjectStore) => IDBRequest<T>
): Promise<T> {
  const db = await openDb();
  return new Promise<T>((resolve, reject) => {
    const transaction = db.transaction(storeName, mode);
    const store = transaction.objectStore(storeName);
    const request = handler(store);
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

export async function getAllRecords<T>(storeName: StoreName): Promise<T[]> {
  return ((await runStoreRequest(storeName, 'readonly', (store) => store.getAll())) as T[]) ?? [];
}

export async function getRecord<T>(storeName: StoreName, id: string): Promise<T | undefined> {
  return (await runStoreRequest(storeName, 'readonly', (store) => store.get(id))) as T | undefined;
}

export async function putRecord<T>(storeName: StoreName, value: T): Promise<void> {
  await runStoreRequest(storeName, 'readwrite', (store) => store.put(value));
}

export async function clearManagedStores(): Promise<void> {
  const db = await openDb();
  const storeNames = existingManagedStoreNames(db);

  if (!storeNames.length) {
    return;
  }

  await new Promise<void>((resolve, reject) => {
    const transaction = db.transaction(storeNames, 'readwrite');
    transaction.onerror = () => reject(transaction.error);
    transaction.oncomplete = () => resolve();
    storeNames.forEach((storeName) => {
      transaction.objectStore(storeName).clear();
    });
  });
}
