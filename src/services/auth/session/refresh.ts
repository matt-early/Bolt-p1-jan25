import { User } from 'firebase/auth';
import { logOperation } from '../../firebase/logging';
import { getNetworkStatus } from '../../firebase/network';
import { handleTokenError, validateTokenAge } from './handlers';
import { setSessionState } from './state';

const SESSION_TIMEOUT = 55 * 60 * 1000; // 55 minutes
const REFRESH_THRESHOLD = 5 * 60 * 1000; // 5 minutes
const REFRESH_RETRY_DELAY = 1000; // 1 second

export const refreshSession = async (user: User): Promise<void> => {
  try {
    const { isOnline } = getNetworkStatus();
    
    if (!isOnline) {
      logOperation('refreshSession', 'warning', 'Offline - skipping refresh');
      return;
    }

    // Get current token result
    const currentToken = await user.getIdTokenResult();
    const tokenAge = currentToken.issuedAtTime ? 
      Date.now() - new Date(currentToken.issuedAtTime).getTime() : 
      Infinity;

    // Only refresh if token is old enough
    if (tokenAge > REFRESH_THRESHOLD) {
      await user.getIdToken(true);
    }
    
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
    sessionStorage.setItem('lastTokenRefresh', now.toString());

    logOperation('refreshSession', 'success');
  } catch (error) {
    logOperation('refreshSession', 'error', error);
    await handleTokenError(user, error);
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