const memoryCache = new Map();

const isFresh = (entry, maxAgeMs) => {
  if (!entry) return false;
  if (!maxAgeMs) return true;
  return Date.now() - entry.savedAt <= maxAgeMs;
};

export const buildCatalogCacheKey = (...parts) => parts.filter(Boolean).join("::");

export const readCatalogCache = async (key, maxAgeMs = 15 * 60 * 1000) => {
  try {
    const entry = memoryCache.get(key) || null;

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
    memoryCache.set(key, {
      savedAt: Date.now(),
      value,
    });
  } catch {
    // Ignore cache write failures in constrained environments.
  }
};

export const deleteCatalogCache = async (key) => {
  try {
    memoryCache.delete(key);
  } catch {
    // Ignore cache delete failures.
  }
};

export const clearCatalogCache = async () => {
  try {
    memoryCache.clear();
  } catch {
    // Ignore cache clear failures.
  }
};

export const clearPersistedQueryCache = () => {
  // Query persistence has been removed; keep the helper as a safe no-op.
};

