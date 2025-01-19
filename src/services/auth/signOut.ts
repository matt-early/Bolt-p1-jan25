import { getAuth, signOut as firebaseSignOut } from 'firebase/auth';
import { logOperation } from '../firebase/logging';
import { clearAllCaches } from '../../utils/cache';
import { clearAuthState } from './state';

export const signOut = async () => {
  try {
    const auth = getAuth();
    
    // Clear auth state first
    clearAuthState();

    // Clear all caches
    await clearAllCaches();
    
    // Clear all auth state
    clearAuthState();
    
    // Sign out from Firebase
    await firebaseSignOut(auth);
    
    // Navigate to login without a full page reload
    window.location.href = '/login';
    
    logOperation('signOut', 'success');
  } catch (error) {
    logOperation('signOut', 'error', error);
    // Still redirect on error
    window.location.replace('/login');
    throw error;
  }
};