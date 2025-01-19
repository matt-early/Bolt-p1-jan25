import { collection, getDocs, query, limit } from 'firebase/firestore';
import { getDb } from './db';
import { logOperation } from './logging';
import { waitForNetwork } from './network';
import { COLLECTION_NAMES } from './collections';

interface RetryOptions {
  maxAttempts?: number;
  delayMs?: number;
  timeout?: number;
}

const REQUIRED_COLLECTIONS = [
  COLLECTION_NAMES.USERS,
  COLLECTION_NAMES.STORES,
  COLLECTION_NAMES.REGIONS,
  COLLECTION_NAMES.METRICS,
  COLLECTION_NAMES.IMPORT_HISTORY
];

export const verifyCollections = async (): Promise<boolean> => {
  try {
    const db = getDb();
    
    // Test each required collection
    for (const collectionName of REQUIRED_COLLECTIONS) {
      try {
        const collRef = collection(db, collectionName);
        const q = query(collRef, limit(1));
        await getDocs(q);
        logOperation('verifyCollections', 'success', { collection: collectionName });
      } catch (error: any) {
        if (error.code === 'permission-denied') {
          continue; // Skip permission errors
        }
        throw error;
      }
    }
    
    return true;
  } catch (error) {
    logOperation('verifyCollections', 'error', error);
    return false;
  }
};

export const waitForDatabaseAccess = async (options: RetryOptions = {}): Promise<boolean> => {
  const { maxAttempts = 3, delayMs = 1000, timeout = 15000 } = options;
  let attempts = 0;
  let lastError: any;

  while (attempts < maxAttempts) {
    try {
      // Wait for network if offline
      if (!navigator.onLine) {
        const hasNetwork = await waitForNetwork(timeout);
        if (!hasNetwork) {
          throw new Error('No network connection available');
        }
      }

      const db = getDb();
      const usersRef = collection(db, 'users');
      const q = query(usersRef, limit(1));
      await getDocs(q);
      
      logOperation('waitForDatabaseAccess', 'success');
      return true;
    } catch (error: any) {
      attempts++;
      lastError = error;
      
      if (error.code === 'permission-denied') {
        logOperation('waitForDatabaseAccess', 'warning', 'Limited database access');
        return false;
      }
      
      // Don't retry network errors, wait for online
      if (error.code === 'unavailable' && !navigator.onLine) {
        throw new Error('No network connection available');
      }

      if (attempts < maxAttempts) {
        await new Promise(resolve => setTimeout(resolve, delayMs * attempts));
        continue;
      }
    }
  }
  
  throw lastError;
};