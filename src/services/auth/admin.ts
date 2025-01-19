import { doc, getDoc, setDoc } from 'firebase/firestore';
import { getDb } from '../firebase/db';
import { AUTH_SETTINGS } from '../../config/auth-settings';
import { logOperation } from '../firebase/logging';
import { UserProfile, UserRole } from '../../types/auth';
import { getAuth } from 'firebase/auth';
import { getFunctions, httpsCallable } from 'firebase/functions';
import { retry } from '../firebase/retry';
import { getCollection } from '../firebase/collections';

export const initializeAdminUser = async (userId: string, email: string): Promise<UserProfile> => {
  try {
    const db = getDb();
    const userRef = doc(db, 'users', userId);
    
    // Create new admin profile
    const adminProfile: Omit<UserProfile, 'id'> = {
      email,
      name: AUTH_SETTINGS.DEFAULT_ADMIN.NAME,
      role: AUTH_SETTINGS.DEFAULT_ADMIN.ROLE,
      staffCode: 'ADMIN',
      approved: true,
      createdAt: new Date().toISOString(),
      lastLoginAt: new Date().toISOString()
    };

    await setDoc(userRef, adminProfile);
    
    logOperation('initializeAdminUser', 'success');
    return { id: userId, ...adminProfile };
  } catch (error) {
    logOperation('initializeAdminUser', 'error', error);
    throw error;
  }
};

export const someOtherFunction = async () => {
  try {
    const auth = getAuth();
    const currentUser = auth.currentUser;
    
    // Check network connectivity
    if (!navigator.onLine) {
      throw new Error('No network connection. Please check your internet and try again.');
    }

    if (!currentUser) {
      throw new Error('Not authenticated');
    }

    // Retry token refresh with exponential backoff
    const idToken = await retry(
      () => currentUser.getIdToken(true),
      {
        maxAttempts: 3,
        initialDelay: 1000,
        operation: 'getIdToken'
      }
    );
  } catch (error) {
    // Error handling
  }
};