import { initializeApp, cert, type ServiceAccount } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore } from 'firebase-admin/firestore';
import { logOperation } from '../services/firebase/logging';

// Initialize Firebase Admin SDK
const initializeAdminSDK = () => {
  try {
    // Validate required environment variables
    const requiredVars = [
      'FIREBASE_PRIVATE_KEY',
      'FIREBASE_CLIENT_EMAIL',
      'FIREBASE_CLIENT_ID',
      'VITE_FIREBASE_PROJECT_ID'
    ];

    const missing = requiredVars.filter(key => !process.env[key]);
    if (missing.length > 0) {
      throw new Error(`Missing required environment variables: ${missing.join(', ')}`);
    }

    // Create service account object
    const serviceAccount: ServiceAccount = {
      projectId: process.env.VITE_FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n')
    };

    // Initialize admin app
    const app = initializeApp({
      credential: cert(serviceAccount)
    });

    const auth = getAuth(app);
    const db = getFirestore(app);

    logOperation('initializeAdminSDK', 'success');
    return { app, auth, db };
  } catch (error) {
    logOperation('initializeAdminSDK', 'error', error);
    throw error;
  }
};

export const { app, auth, db } = initializeAdminSDK();