import { getAuth } from 'firebase/auth';
import { logOperation } from '../../firebase/logging';
import { clearAuthState } from '../state';

const SESSION_DURATION = 60 * 60 * 1000; // 1 hour
const REFRESH_THRESHOLD = 5 * 60 * 1000; // 5 minutes

export const refreshSession = async () => {
  try {
    const auth = getAuth();
    const user = auth.currentUser;
    if (!user) {
      clearAuthState();
      throw new Error('No authenticated user');
    }

    // Force token refresh
    await user.getIdToken(true);
    logOperation('refreshSession', 'success');
  } catch (error) {
    logOperation('refreshSession', 'error', error);
    throw error;
  }
};

export const validateSessionAge = (authTime: number): boolean => {
  const sessionAge = Date.now() - authTime * 1000;
  return sessionAge < SESSION_DURATION;
};

export const setupSessionRefresh = (callback: () => void) => {
  // Refresh session 5 minutes before expiry
  const refreshInterval = SESSION_DURATION - REFRESH_THRESHOLD;
  
  const intervalId = setInterval(() => {
    refreshSession()
      .then(callback)
      .catch(() => {
        // Clear auth state and redirect to login on refresh failure
        clearAuthState();
        window.location.href = '/login';
      });
  }, refreshInterval);

  return () => clearInterval(intervalId);
};