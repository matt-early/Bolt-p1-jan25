import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore, enableIndexedDbPersistence } from 'firebase/firestore';
import { logOperation } from './logging';
import { waitForNetwork, getNetworkStatus } from './network';
import { clearCollectionCache } from './collections';
import { initNetworkMonitoring } from './network';
import { getFirebaseConfig } from '../../config/firebase-config';
import { setDb, setAuth } from './db';

const INIT_TIMEOUT = 15000; // 15 second timeout
const MAX_RETRIES = 3;
const RETRY_DELAY = 5000;

// Track initialization state
let initialized = false;
let initializationPromise: Promise<void> | null = null;
let app: ReturnType<typeof initializeApp> | null = null;
let networkCleanup: (() => void) | null = null;

export const getFirebaseApp = async () => {
  if (!app) {
    await initializeFirebaseServices();
  }
  if (!app) {
    throw new Error('Firebase app not initialized');
  }
  return app;
};

const initializeWithTimeout = async () => {
  return Promise.race([
    initializeCore(),
    new Promise((_, reject) => 
      setTimeout(() => reject(new Error('Firebase initialization timed out')), INIT_TIMEOUT)
    )
  ]);
};

const initializeCore = async () => {
  try {
    const { isOnline } = getNetworkStatus();
    
    // Check network connection first
    if (!isOnline) {
      const error = new Error('No network connection available. Please check your internet connection and try again.');
      logOperation('initializeCore', 'error', { type: 'network', message: error.message });
      throw error;
    }

    // Get and validate config
    let config;
    try {
      config = getFirebaseConfig();
    } catch (configError) {
      const error = new Error(
        'Firebase configuration error. Please check your environment variables and ensure they are properly set in .env file.'
      );
      logOperation('initializeCore', 'error', { type: 'config', original: configError });
      throw error;
    }

    // Initialize Firebase
    app = initializeApp(config);
    const auth = getAuth(app);
    const db = getFirestore(app);

    setAuth(auth);
    setDb(db);

    logOperation('initializeCore', 'firebase-initialized');
    
    // Clear cache
    clearCollectionCache();
    
    // Enable offline persistence
    try {
      await enableIndexedDbPersistence(db);
      logOperation('initializeCore', 'persistence-enabled');
    } catch (err: any) {
      if (err.code === 'failed-precondition') {
        logOperation('initializeCore', 'warning', 'Multiple tabs open - persistence enabled in first tab only');
      } else if (err.code === 'unimplemented') {
        logOperation('initializeCore', 'warning', 'Persistence not supported');
      }
    }

    return { auth, db };
  } catch (error) {
    // Handle specific error cases
    const errorMessage = error instanceof Error ? error.message : 'Failed to initialize Firebase';
    const errorDetails = {
      type: (error as any)?.code || 'unknown',
      message: errorMessage,
      original: error
    };

    logOperation('initializeCore', 'error', errorDetails);

    // Enhance error message for user
    let userMessage = errorMessage;
    if (errorMessage.includes('configuration')) {
      userMessage = 'Firebase configuration error. Please check your environment variables in .env file.';
    }

    throw new Error(userMessage);
  }
};

const setupNetworkMonitoring = () => {
  return initNetworkMonitoring(
    // On online - retry initialization if failed
    async () => {
      if (!initialized && !initializationPromise) {
        logOperation('network', 'online', 'Retrying initialization');
        try {
          await initializeFirebaseServices();
        } catch (error) {
          logOperation('network.retry', 'error', error);
        }
      }
    },
    // On offline - log error
    () => {
      logOperation('network', 'offline');
    }
  );
};

// Clean up on module unload
window.addEventListener('unload', () => {
  if (networkCleanup) {
    networkCleanup();
  }
});

export const initializeFirebaseServices = async () => {
  if (initialized) return;
  if (initializationPromise) return initializationPromise;

  let retryCount = 0;

  // Setup network monitoring if not already setup
  if (!networkCleanup) {
    networkCleanup = setupNetworkMonitoring();
  }

  initializationPromise = (async () => {
    try {
      logOperation('initializeFirebaseServices', 'start');

      while (retryCount < MAX_RETRIES) {
        try {
          // Wait for network if offline
          if (!navigator.onLine) {
            await waitForNetwork(INIT_TIMEOUT);
          }

          await initializeWithTimeout();
          initialized = true;
          retryCount = 0;
          logOperation('initializeFirebaseServices', 'success');
          return;
        } catch (error) {
          retryCount++;
          if (retryCount === MAX_RETRIES) throw error;

          logOperation('initializeFirebaseServices', 'retry', {
            attempt: retryCount,
            error: error.message
          });
          
          await new Promise(resolve => setTimeout(resolve, RETRY_DELAY));
        }
      }
    } catch (error) {
      logOperation('initializeFirebaseServices', 'error', error);
      initialized = false;
      throw error;
    } finally {
      initializationPromise = null;
    }
  })();

  return initializationPromise;
};

// Export the app instance
export { app };