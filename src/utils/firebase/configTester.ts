import { initializeApp } from 'firebase/app';
import { getAuth, signInWithEmailAndPassword } from 'firebase/auth';
import { getFirestore, collection, getDocs, query, limit } from 'firebase/firestore';
import { FirebaseConfig } from '../../config/types';
import { logOperation } from '../firebase/logging';

interface TestResult {
  success: boolean;
  error?: string;
  details?: Record<string, any>;
}

export const testFirebaseConfig = async (config: FirebaseConfig): Promise<TestResult> => {
  try {
    // Initialize test app with config
    const app = initializeApp(config, 'configTest');
    const auth = getAuth(app);
    const db = getFirestore(app);

    // Test Firestore connection
    try {
      const testRef = collection(db, 'users');
      await getDocs(query(testRef, limit(1)));
      logOperation('testFirebaseConfig', 'success', 'Firestore connection successful');
    } catch (error: any) {
      if (error.code === 'permission-denied') {
        // This is actually good - means Firestore is working but rules are in place
        logOperation('testFirebaseConfig', 'success', 'Firestore security rules active');
      } else {
        throw error;
      }
    }

    // Clean up test app
    await app.delete();

    return {
      success: true,
      details: {
        projectId: config.projectId,
        authDomain: config.authDomain
      }
    };
  } catch (error) {
    logOperation('testFirebaseConfig', 'error', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to test Firebase configuration'
    };
  }
};