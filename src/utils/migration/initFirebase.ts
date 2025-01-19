import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { cert, initializeApp as initializeAdminApp } from 'firebase-admin/app';
import { getAuth as getAdminAuth } from 'firebase-admin/auth';
import { setAuth, setDb } from '../../services/firebase/db';
import { logOperation } from '../../services/firebase/logging';

let initialized = false;
let adminInitialized = false;

export const initializeMigrationServices = async () => {
  if (initialized) return;

  try {
    // Initialize Admin SDK first
    if (!adminInitialized) {
      const adminApp = initializeAdminApp({
        credential: cert({
          projectId: process.env.VITE_FIREBASE_PROJECT_ID,
          clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
          privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n')
        })
      });
      adminInitialized = true;
    }
    // Get config from environment
    const firebaseConfig = {
      apiKey: process.env.VITE_FIREBASE_API_KEY,
      authDomain: process.env.VITE_FIREBASE_AUTH_DOMAIN,
      projectId: process.env.VITE_FIREBASE_PROJECT_ID,
      storageBucket: process.env.VITE_FIREBASE_STORAGE_BUCKET,
      messagingSenderId: process.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
      appId: process.env.VITE_FIREBASE_APP_ID
    };

    // Initialize Firebase
    const app = initializeApp(firebaseConfig);
    const auth = getAuth(app);
    const db = getFirestore(app);

    // Set instances in db service
    setAuth(auth);
    setDb(db);

    initialized = true;
    logOperation('initializeMigrationServices', 'success');

    return { app, auth, db };
  } catch (error) {
    logOperation('initializeMigrationServices', 'error', error);
    throw error;
  }
};