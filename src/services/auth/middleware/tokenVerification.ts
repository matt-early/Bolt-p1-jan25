import { getAuth } from 'firebase-admin/auth';
import { logOperation } from '../../firebase/logging';

export const verifyIdToken = async (token: string) => {
  try {
    const auth = getAuth();
    const decodedToken = await auth.verifyIdToken(token, true);
    return decodedToken;
  } catch (error) {
    logOperation('verifyIdToken', 'error', error);
    throw error;
  }
};

export const validateSession = async (token: string) => {
  try {
    const decodedToken = await verifyIdToken(token);
    
    // Check token age (max 1 hour)
    const tokenAge = Date.now() - decodedToken.auth_time * 1000;
    if (tokenAge > 60 * 60 * 1000) {
      throw new Error('Token expired');
    }

    return decodedToken;
  } catch (error) {
    logOperation('validateSession', 'error', error);
    throw error;
  }
};