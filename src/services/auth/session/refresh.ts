import { User } from 'firebase/auth';
import { logOperation } from '../../firebase/logging';
import { getNetworkStatus } from '../../firebase/network';
import { handleTokenError } from './handlers';
import { setSessionState } from './state';
import { retry } from '../../firebase/retry';

const SESSION_TIMEOUT = 55 * 60 * 1000; // 55 minutes
const REFRESH_THRESHOLD = 5 * 60 * 1000; // 5 minutes
const TOKEN_REFRESH_ATTEMPTS = 3;
const TOKEN_REFRESH_DELAY = 1000;

export const refreshSession = async (user: User): Promise<void> => {
  try {
    const { isOnline } = getNetworkStatus();
    
    if (!isOnline) {
      throw new Error('No network connection available');
    }

    // Force token refresh
    await retry(
      () => user.getIdToken(true),
      {
        maxAttempts: TOKEN_REFRESH_ATTEMPTS,
        initialDelay: TOKEN_REFRESH_DELAY,
        operation: 'refreshSession.refreshToken'
      }
    );
    
    // Update session state after successful refresh
    const now = Date.now();
    setSessionState({
      authenticated: true,
      user,
      lastRefresh: now
    });
    
    // Update session storage
    sessionStorage.setItem('lastTokenRefresh', now.toString());
    sessionStorage.setItem('tokenExpiration', (now + SESSION_TIMEOUT).toString());

    logOperation('refreshSession', 'success');
  } catch (error) {
    logOperation('refreshSession', 'error', error);
    const handled = await handleTokenError(user, error);
    if (!handled) {
      throw error;
    }
    throw error;
  }
};

export const setupSessionRefresh = (
  user: User,
  onRefresh: () => void,
  onError: (error: Error) => void
) => {
  let timeoutId: NodeJS.Timeout;

  const scheduleNextCheck = async () => {
    try {
      const tokenResult = await user.getIdTokenResult();
      const now = Date.now();
      const issuedAt = tokenResult.issuedAtTime ? new Date(tokenResult.issuedAtTime) : null;
      
      if (!issuedAt) {
        throw new Error('Invalid token issue time');
      }
      
      const tokenAge = now - issuedAt.getTime();
      const timeUntilRefresh = Math.max(0, SESSION_TIMEOUT - REFRESH_THRESHOLD - tokenAge);

      // Schedule next check
      timeoutId = setTimeout(async () => {
        try {
          await refreshSession(user);
          onRefresh();
          scheduleNextCheck(); // Schedule next check after successful refresh
        } catch (error) {
          // Schedule retry
          setTimeout(scheduleNextCheck, REFRESH_RETRY_DELAY);
          onError(error instanceof Error ? error : new Error('Session refresh failed'));
        }
      }, Math.max(0, timeUntilRefresh));
    } catch (error) {
      logOperation('scheduleNextCheck', 'error', error);
      setTimeout(scheduleNextCheck, REFRESH_RETRY_DELAY);
    }
  };

  // Start the refresh cycle
  scheduleNextCheck();

  // Return cleanup function
  return () => {
    if (timeoutId) {
      clearTimeout(timeoutId);
    }
  };
};