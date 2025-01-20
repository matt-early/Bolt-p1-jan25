import { getAuth } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { getDb } from '../../firebase/db';
import { getNetworkStatus, waitForNetwork } from '../../firebase/network';
import { logOperation } from '../../firebase/logging';
import { retry } from '../../firebase/retry';
import { AUTH_SETTINGS } from '../../../config/auth-settings';
import { FirebaseError } from 'firebase/app';

const NETWORK_TIMEOUT = 30000; // 30 seconds

export const verifyAdminPermissions = async (): Promise<boolean> => {
  try {
    const auth = getAuth();
    if (!auth) {
      throw new Error('Auth not initialized');
    }
    
    const currentUser = auth.currentUser;
    const { isOnline } = getNetworkStatus();
    
    if (!isOnline) {
      logOperation('verifyAdminPermissions', 'waiting-for-network');
      const hasNetwork = await waitForNetwork(NETWORK_TIMEOUT);
      if (!hasNetwork) {
        throw new Error('No network connection available');
      }
    }

    if (!currentUser) {
      logOperation('verifyAdminPermissions', 'error', 'No authenticated user');
      return false;
    }

    // Check if user is default admin first
    if (currentUser.email === AUTH_SETTINGS.DEFAULT_ADMIN.EMAIL) {
      logOperation('verifyAdminPermissions', 'success', { 
        reason: 'default admin',
        email: currentUser.email 
      });
      return true;
    }
    // Force token refresh and get latest claims
    await retry(
      () => currentUser.getIdToken(true),
      {
        maxAttempts: 3,
        initialDelay: 1000,
        operation: 'verifyAdminPermissions.refreshToken'
      }
    );

    const tokenResult = await retry(
      () => currentUser.getIdTokenResult(),
      {
        maxAttempts: 3,
        initialDelay: 1000,
        operation: 'verifyAdminPermissions.getIdToken'
      }
    );

    // Check admin claim
    if (tokenResult.claims?.admin === true) {
      logOperation('verifyAdminPermissions', 'success', { reason: 'admin claim' });
      return true;
    }

    // Check Firestore role as fallback
    const db = await getDb();
    const userRef = doc(db, 'users', currentUser.uid);
    const userDoc = await retry(
      () => getDoc(userRef),
      {
        maxAttempts: 3,
        initialDelay: 1000,
        operation: 'verifyAdminPermissions.getDoc'
      }
    );
    
    if (!userDoc.exists()) {
      logOperation('verifyAdminPermissions', 'error', { 
        message: 'User document not found',
        uid: currentUser.uid 
      });
      return false;
    }

    const isAdmin = userDoc.data()?.role === 'admin';
    
    // If admin in Firestore but not in claims, force token refresh
    if (isAdmin && !tokenResult.claims?.admin) {
      await retry(
        () => currentUser.getIdToken(true),
        {
          maxAttempts: 3,
          initialDelay: 1000,
          operation: 'verifyAdminPermissions.forceRefresh'
        }
      );
    }

    logOperation('verifyAdminPermissions', isAdmin ? 'success' : 'error', { 
      reason: isAdmin ? 'admin role' : 'not admin',
      role: userDoc.data()?.role,
      uid: currentUser.uid
    });
  
    return isAdmin;
  } catch (error: any) {
    if (error instanceof FirebaseError && error.code === 'permission-denied') {
      logOperation('verifyAdminPermissions', 'warning', 'Permission denied checking admin status');
      return false;
    }

    logOperation('verifyAdminPermissions', 'error', error);
    return false;
  }
};