import { logOperation } from '../services/firebase/logging';

export const clearAllCaches = async () => {
  try {
    // Clear memory cache
    window.sessionStorage.clear();
    window.localStorage.clear();

    // Clear localStorage
    try {
      localStorage.clear();
    } catch (e) {
      console.warn('Failed to clear localStorage:', e);
    }
    
    // Clear sessionStorage
    try {
      sessionStorage.clear();
    } catch (e) {
      console.warn('Failed to clear sessionStorage:', e);
    }
    
    // Clear IndexedDB
    try {
      const databases = await window.indexedDB.databases();
      await Promise.all(
        databases.map(db => 
          new Promise<void>((resolve, reject) => {
            const request = window.indexedDB.deleteDatabase(db.name!);
            request.onsuccess = () => resolve();
            request.onerror = () => reject(request.error);
          })
        )
      );
    } catch (e) {
      console.warn('Failed to clear IndexedDB:', e);
    }

    logOperation('clearAllCaches', 'success');
  } catch (error) {
    logOperation('clearAllCaches', 'error', error);
    // Don't throw error to allow sign out to continue
  }
};