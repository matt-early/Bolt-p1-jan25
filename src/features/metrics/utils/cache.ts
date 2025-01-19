import { logOperation } from '../services/firebase/logging';

interface CacheEntry<T> {
  data: T;
  timestamp: number;
}

export const clearAllCaches = () => {
  try {
    // Clear localStorage
    localStorage.clear();
    
    // Clear sessionStorage
    sessionStorage.clear();
    
    // Clear IndexedDB
    window.indexedDB.databases().then(databases => {
      databases.forEach(db => {
        window.indexedDB.deleteDatabase(db.name!);
      });
    });

    logOperation('clearAllCaches', 'success');
  } catch (error) {
    logOperation('clearAllCaches', 'error', error);
  }
};

export const createCache = <T>(maxSize: number, ttl: number) => {
  const cache = new Map<string, CacheEntry<T>>();

  const get = (key: string): T | null => {
    const entry = cache.get(key);
    if (!entry) return null;

    const now = Date.now();
    if (now - entry.timestamp > ttl) {
      cache.delete(key);
      return null;
    }

    return entry.data;
  };

  const set = (key: string, data: T): void => {
    if (cache.size >= maxSize) {
      // Remove oldest entry
      const oldestKey = cache.keys().next().value;
      cache.delete(oldestKey);
    }

    cache.set(key, {
      data,
      timestamp: Date.now()
    });
  };

  const clear = (): void => {
    cache.clear();
  };

  return { get, set, clear };
};