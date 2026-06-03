const DB_NAME = "lucky-impex-cache";
const STORE_NAME = "catalog";
const DB_VERSION = 1;

const isBrowser = () => typeof window !== "undefined" && typeof indexedDB !== "undefined";

const openDatabase = () =>
  new Promise((resolve, reject) => {
    if (!isBrowser()) {
      resolve(null);
      return;
    }

    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = () => {
      const database = request.result;
      if (!database.objectStoreNames.contains(STORE_NAME)) {
        database.createObjectStore(STORE_NAME);
      }
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });

const withStore = async (mode, handler) => {
  const database = await openDatabase();
  if (!database) {
    return null;
  }

  return new Promise((resolve, reject) => {
    const transaction = database.transaction(STORE_NAME, mode);
    const store = transaction.objectStore(STORE_NAME);
    const result = handler(store);

    transaction.oncomplete = () => resolve(result);
    transaction.onerror = () => reject(transaction.error);
    transaction.onabort = () => reject(transaction.error);
  });
};

const isFresh = (entry, maxAgeMs) => {
  if (!entry) return false;
  if (!maxAgeMs) return true;
  return Date.now() - entry.savedAt <= maxAgeMs;
};

export const buildCatalogCacheKey = (...parts) => parts.filter(Boolean).join("::");

export const readCatalogCache = async (key, maxAgeMs = 15 * 60 * 1000) => {
  try {
    const entry = await withStore("readonly", (store) =>
      new Promise((resolve, reject) => {
        const request = store.get(key);
        request.onsuccess = () => resolve(request.result || null);
        request.onerror = () => reject(request.error);
      })
    );

    if (!isFresh(entry, maxAgeMs)) {
      await deleteCatalogCache(key);
      return null;
    }

    return entry?.value ?? null;
  } catch {
    return null;
  }
};

export const writeCatalogCache = async (key, value) => {
  try {
    await withStore("readwrite", (store) =>
      new Promise((resolve, reject) => {
        const request = store.put(
          {
            savedAt: Date.now(),
            value,
          },
          key
        );
        request.onsuccess = () => resolve(true);
        request.onerror = () => reject(request.error);
      })
    );
  } catch {
    // Ignore cache write failures in private browsing or storage-constrained modes.
  }
};

export const deleteCatalogCache = async (key) => {
  try {
    await withStore("readwrite", (store) =>
      new Promise((resolve, reject) => {
        const request = store.delete(key);
        request.onsuccess = () => resolve(true);
        request.onerror = () => reject(request.error);
      })
    );
  } catch {
    // Ignore cache delete failures.
  }
};

