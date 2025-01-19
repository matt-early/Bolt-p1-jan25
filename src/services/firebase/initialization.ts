import { enableIndexedDbPersistence } from 'firebase/firestore';
import { getDb } from './db';
import { logOperation } from './logging';
import { clearAllCaches } from '../../utils/cache';

let initialized = false;

export const initializeFirestore = async () => {
  if (initialized) return;

  try {
    logOperation('initializeFirestore', 'start');
    
    // Clear any stale data
    await clearAllCaches();
    
    const db = getDb();

    // Enable offline persistence
    try {
      await enableIndexedDbPersistence(db);
      logOperation('initializeFirestore', 'persistence-enabled');
      
      // Small delay to ensure persistence is ready
      await new Promise(resolve => setTimeout(resolve, 500));
      
      initialized = true;
    } catch (err: any) {
      if (err.code === 'failed-precondition') {
        logOperation('initializeFirestore', 'warning', 
          'Multiple tabs open, persistence can only be enabled in one tab at a time.');
      } else if (err.code === 'unimplemented') {
        logOperation('initializeFirestore', 'warning',
          'The current browser does not support offline persistence');
      }
      // Still mark as initialized even if persistence fails
      initialized = true;
    }

    logOperation('initializeFirestore', 'success');
    return db;
  } catch (error) {
    logOperation('initializeFirestore', 'error', error);
    throw error;
  }
};