import { getFunctions, httpsCallable } from 'firebase/functions';
import { getAuth } from 'firebase/auth';
import { logOperation } from '../../firebase/logging';
import { retry } from '../../firebase/retry';

// Initialize admin operations and return functions
export const initializeAdminSDK = () => {
  try {
    const auth = getAuth();
    const functions = getFunctions();
    
    // Initialize admin functions
    const setCustomClaims = httpsCallable(functions, 'setCustomClaims');
    const verifyAdmin = httpsCallable(functions, 'verifyAdmin');
    const createUser = httpsCallable(functions, 'createUser');

    return {
      setCustomClaims,
      verifyAdmin,
      createUser,
      auth
    };
  } catch (error) {
    logOperation('initializeAdminSDK', 'error', error);
    throw error;
  }
};

// Verify admin token
export const verifyAdminToken = async () => {
  try {
    const auth = getAuth();
    const currentUser = auth.currentUser;
    
    if (!currentUser) {
      throw new Error('Not authenticated');
    }

    // Force token refresh
    await retry(
      () => currentUser.getIdToken(true),
      {
        maxAttempts: 3,
        initialDelay: 1000,
        operation: 'getIdToken'
      }
    );

    const tokenResult = await currentUser.getIdTokenResult();
    return tokenResult.claims?.admin === true;
  } catch (error) {
    logOperation('verifyAdminToken', 'error', error);
    return false;
  }
};

// For backward compatibility
export const initializeAdminOperations = initializeAdminSDK;