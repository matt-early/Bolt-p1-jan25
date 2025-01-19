import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore, enableIndexedDbPersistence } from 'firebase/firestore';
import { logOperation } from '../services/firebase/logging';
import { getFirebaseConfig } from './firebase-config';

// Validate required Firebase config
const validateConfig = (config: ReturnType<typeof getFirebaseConfig>) => {
  const required = ['apiKey', 'authDomain', 'projectId'];
  const missing = required.filter(key => !config[key as keyof typeof config]);
  
  if (missing.length > 0) {
    throw new Error(`Missing required Firebase configuration: ${missing.join(', ')}`);
  }
};

let app: ReturnType<typeof initializeApp>;
let auth: ReturnType<typeof getAuth>;
let db: ReturnType<typeof getFirestore>;
let initialized = false;

export const initializeFirebase = async () => {
  if (initialized) return { app, auth, db };

  try {
    logOperation('initializeFirebase', 'start');

    const config = getFirebaseConfig();
    
    // Validate config before initialization
    validateConfig(config);

    app = initializeApp(config);
    auth = getAuth(app);
    db = getFirestore(app);

    // Enable offline persistence
    try {
      await enableIndexedDbPersistence(db);
      logOperation('initializeFirebase', 'persistence-enabled');
    } catch (err: any) {
      if (err.code === 'failed-precondition') {
        logOperation('initializeFirebase', 'warning', 
          'Multiple tabs open, persistence enabled in first tab only');
      } else if (err.code === 'unimplemented') {
        logOperation('initializeFirebase', 'warning',
          'Browser does not support persistence');
      }
    }

    initialized = true;
    logOperation('initializeFirebase', 'success');
    return { app, auth, db };
  } catch (error) {
    logOperation('initializeFirebase', 'error', error);
    throw error;
  }
};

const getFirebaseApp = () => {
  if (!initialized) {
    throw new Error('Firebase not initialized. Call initializeFirebase() first.');
  }
  return app;
};

const getFirebaseAuth = () => {
  if (!initialized) {
    throw new Error('Firebase not initialized. Call initializeFirebase() first.');
  }
  return auth;
};

const getFirebaseDb = () => {
  if (!initialized) {
    throw new Error('Firebase not initialized. Call initializeFirebase() first.');
  }
  return db;
};

// Export initialized instances and getters
export { 
  app, 
  auth, 
  db,
  getFirebaseApp,
  getFirebaseAuth,
  getFirebaseDb
};