import { getFirestore, enableIndexedDbPersistence, clearIndexedDbPersistence } from 'firebase/firestore';
import { app } from '../../../../config/firebase';
import { logOperation } from './logging';
import { clearAllCaches } from '../../utils/cache';

let initialized = false;

export const reinitializeFirestore = async () => {
  try {
    logOperation('reinitializeFirestore', 'start');
    
    const db = getFirestore(app);
    
    // Clear all caches first
    await clearAllCaches();
    
    // Clear Firestore persistence
    try {
      await clearIndexedDbPersistence(db);
      logOperation('reinitializeFirestore', 'cleared-persistence');
    } catch (err: any) {
      // Ignore "persistence already in use" errors
      if (err.code !== 'failed-precondition') {
        throw err;
      }
    }
    
    // Re-enable persistence
    try {
      await enableIndexedDbPersistence(db);
      logOperation('reinitializeFirestore', 'enabled-persistence');
    } catch (err: any) {
      if (err.code === 'failed-precondition') {
        logOperation('reinitializeFirestore', 'warning', 
          'Multiple tabs open, persistence can only be enabled in one tab at a time.');
      } else if (err.code === 'unimplemented') {
        logOperation('reinitializeFirestore', 'warning',
          'The current browser does not support offline persistence');
      }
    }

    initialized = true;
    logOperation('reinitializeFirestore', 'success');
    return db;
  } catch (error) {
    logOperation('reinitializeFirestore', 'error', error);
    throw error;
  }
};

export const initializeFirestore = async () => {
  if (initialized) return;
  return reinitializeFirestore();
};