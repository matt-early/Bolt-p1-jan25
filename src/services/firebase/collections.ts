import { collection, CollectionReference } from 'firebase/firestore';
import { getDb } from './db';
import { logOperation } from './logging';
import { FirebaseError, FirebaseApp } from 'firebase/app';
import { getFirebaseApp } from './init';

export const COLLECTION_NAMES = {
  USERS: 'users',
  SALESPEOPLE: 'salespeople',
  STORES: 'stores',
  REGIONS: 'regions',
  METRICS: 'metrics',
  IMPORT_HISTORY: 'importHistory',
  AUTH_REQUESTS: 'authRequests'
} as const;

export type CollectionName = keyof typeof COLLECTION_NAMES;

let collectionCache: Partial<Record<CollectionName, CollectionReference>> = {};

export const getCollection = (name: CollectionName, forceRefresh = false): CollectionReference => {
  try {
    if (!COLLECTION_NAMES[name]) {
      const error = `Invalid collection name: ${name}`;
      logOperation('getCollection', 'error', error);
      throw new Error(error);
    }

    // Return cached collection if available and not forcing refresh
    if (!forceRefresh && collectionCache[name]) {
      return collectionCache[name]!;
    }

    const db = getDb();
    if (!db) {
      const error = 'Firestore not initialized. Call initializeFirebaseServices() first.';
      logOperation('getCollection', 'error', error);
      throw new Error(error);
    }

    // Create and cache collection reference
    const collectionRef = collection(db, COLLECTION_NAMES[name]);
    collectionCache[name] = collectionRef;
    return collectionRef;
  } catch (error) {
    logOperation('getCollection', 'error', { collection: name, error });
    throw error;
  }
};

export const clearCollectionCache = () => {
  collectionCache = {};
  logOperation('clearCollectionCache', 'success');
};