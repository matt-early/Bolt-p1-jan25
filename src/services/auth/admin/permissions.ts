import { getAuth } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { getDb } from '../../firebase/db';
import { getNetworkStatus, waitForNetwork } from '../../firebase/network';
import { logOperation } from '../../firebase/logging';
import { retry } from '../../firebase/retry';
import { AUTH_SETTINGS } from '../../../config/auth-settings';
import { FirebaseError } from 'firebase/app';
import { getFunctions, httpsCallable } from 'firebase/functions';

const NETWORK_TIMEOUT = 30000; // 30 seconds
const MAX_RETRIES = 3;
const RETRY_DELAY = 1000;

const verifyAndRefreshAdminClaims = async (userId: string): Promise<boolean> => {
  try {
    const functions = getFunctions();
    const verifyAdmin = httpsCallable(functions, 'verifyAdmin');
    
    // Retry verification with exponential backoff
    let attempts = 0;
    while (attempts < MAX_RETRIES) {
      try {
        const result = await verifyAdmin();
        const isAdmin = (result.data as any)?.isAdmin || false;
        
        if (isAdmin) {
          // Force token refresh after successful verification
          const auth = getAuth();
          if (auth.currentUser) {
            await auth.currentUser.getIdToken(true);
          }
          return true;
        }
        break;
      } catch (error) {
        attempts++;
        if (attempts === MAX_RETRIES) throw error;
        await new Promise(resolve => setTimeout(resolve, RETRY_DELAY * Math.pow(2, attempts)));
      }
    }
    
    return false;
  } catch (error) {
    logOperation('verifyAndRefreshAdminClaims', 'error', error);
    return false;
  }
};

export const verifyAdminPermissions = async (): Promise<boolean> => {
  try {
    const auth = getAuth();
    const { isOnline } = getNetworkStatus();
    const currentUser = auth.currentUser;
    
    if (!currentUser) {
      logOperation('verifyAdminPermissions', 'error', 'No authenticated user');
      return false;
    }

    // Force token refresh first
    await retry(
      () => currentUser.getIdToken(true),
      {
        maxAttempts: 3,
        initialDelay: 1000,
        operation: 'verifyAdminPermissions.refreshToken'
      }
    );

    if (!isOnline) {
      logOperation('verifyAdminPermissions', 'waiting-for-network');
      const hasNetwork = await waitForNetwork(NETWORK_TIMEOUT);
      if (!hasNetwork) {
        throw new Error('No network connection available');
      }
    }

    // Check if user is default admin first
    if (currentUser.email === AUTH_SETTINGS.DEFAULT_ADMIN.EMAIL) {
      logOperation('verifyAdminPermissions', 'success', { 
        reason: 'default admin',
        email: currentUser.email 
      });
      return true;
    }

    // Try to verify and refresh admin claims
    try {
      const functions = getFunctions();
      const verifyAdmin = httpsCallable(functions, 'verifyAdmin');
      const result = await verifyAdmin();
      const { isAdmin } = result.data as { isAdmin: boolean };
      
      if (isAdmin) {
        logOperation('verifyAdminPermissions', 'success', { reason: 'verified claims' });
        return true;
      }
    } catch (error) {
      logOperation('verifyAdminPermissions', 'error', { 
        message: 'Failed to verify admin claims',
        error 
      });
    }

    // Check Firestore as fallback
    try {
      const db = getDb();
      const userRef = doc(db, 'users', currentUser.uid);
      const userDoc = await getDoc(userRef);

      if (userDoc.exists()) {
        const userData = userDoc.data();
        if (userData?.role === 'admin' || userData?.admin === true) {
          logOperation('verifyAdminPermissions', 'success', { reason: 'firestore role' });
          return true;
        }
      }

      logOperation('verifyAdminPermissions', 'error', {
        message: 'User is not authorized as admin',
        uid: currentUser.uid,
        email: currentUser.email
      });
      return false;

    } catch (error) {
      if (error instanceof FirebaseError && error.code === 'permission-denied') {
        logOperation('verifyAdminPermissions', 'warning', 'Permission denied during admin verification');
        return false;
      }
      throw error;
    }
  } catch (error) {
    logOperation('verifyAdminPermissions', 'error', error);
    return false;
  }
};