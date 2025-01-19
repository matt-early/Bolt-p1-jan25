import { type Firestore } from 'firebase/firestore';
import { type Auth } from 'firebase/auth';
import { logOperation } from './logging';
import { FirebaseError } from 'firebase/app';

let dbInstance: Firestore | null = null;
let authInstance: Auth | null = null;

export const getDb = (): Firestore => {
  if (!dbInstance) {
    throw new FirebaseError(
      'not-initialized',
      'Firestore not initialized. Call initializeFirebaseServices() first.'
    );
  }
  return dbInstance;
};

export const setDb = (db: Firestore): void => {
  dbInstance = db;
  logOperation('setDb', 'success');
};

export const getAuth = (): Auth => {
  if (!authInstance) {
    throw new FirebaseError(
      'not-initialized',
      'Auth not initialized. Call initializeFirebaseServices() first.'
    );
  }
  return authInstance;
};

export const setAuth = (auth: Auth): void => {
  authInstance = auth;
  logOperation('setAuth', 'success');
};