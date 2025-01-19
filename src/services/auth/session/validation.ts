import { User } from 'firebase/auth';
import { logOperation } from '../../firebase/logging';
import { getNetworkStatus } from '../../firebase/network';
import { clearSessionState, setSessionState, getSessionState } from './state';
import { retry } from '../../firebase/retry';
import { retryAuthOperation } from '../retry';

const SESSION_TIMEOUT = 55 * 60 * 1000; // 55 minutes
const GRACE_PERIOD = 5 * 60 * 1000; // 5 minute grace period
const TOKEN_REFRESH_ATTEMPTS = 3;
const TOKEN_REFRESH_DELAY = 1000;

export const validateTokenResult = async (user: User): Promise<boolean> => {
  try {
    // Try to get a fresh token
    const tokenResult = await retry(
      () => user.getIdTokenResult(true),
      {
        maxAttempts: TOKEN_REFRESH_ATTEMPTS,
        initialDelay: TOKEN_REFRESH_DELAY,
        operation: 'validateTokenResult'
      }
    );
    
    // Check if token needs refresh
    const now = Date.now();
    const issuedAt = tokenResult.issuedAtTime ? new Date(tokenResult.issuedAtTime) : null;
    
    if (!issuedAt) {
      logOperation('validateTokenResult', 'error', 'Invalid token issue time');
      return false;
    }

    const tokenAge = now - issuedAt.getTime();
    if (tokenAge > SESSION_TIMEOUT + GRACE_PERIOD) {
      logOperation('validateTokenResult', 'error', 'Session expired');
      return false;
    }

    // Store token refresh time
    sessionStorage.setItem('lastTokenRefresh', now.toString());
    sessionStorage.setItem('tokenExpiration', (now + SESSION_TIMEOUT).toString());
    
    return true;
  } catch (error) {
    logOperation('validateTokenResult', 'error', error);
    return false;
  }
};

export const validateSession = async (user: User | null): Promise<boolean> => {
  try {
    if (!user) {
      clearSessionState();
      return false;
    }

    const { isOnline } = getNetworkStatus();
    const cachedSession = sessionStorage.getItem('isAuthenticated');
    const cachedRole = sessionStorage.getItem('userRole');
    const lastRefresh = sessionStorage.getItem('lastTokenRefresh');
    
    // If offline, wait for network with timeout
    if (!isOnline) {
      logOperation('validateSession', 'waiting-for-network');
      const hasNetwork = await waitForNetwork(NETWORK_TIMEOUT);
      if (!hasNetwork) {
        // Check if we have a valid cached session
        if (cachedSession && cachedRole && lastRefresh) {
          const refreshTime = parseInt(lastRefresh, 10);
          const age = Date.now() - refreshTime;
          
          // Allow cached session if within timeout
          if (age < SESSION_TIMEOUT) {
            logOperation('validateSession', 'offline', 'Using cached session');
            return true;
          }
        }
        return false;
      }
    }

    // Force token refresh if needed
    try {
      await user.getIdToken(true);
    } catch (error) {
      logOperation('validateSession', 'error', 'Token refresh failed');
      clearSessionState();
      return false;
    }
    // If online but have cached session, validate token
    if (cachedSession && cachedRole) {
      try {
        const isValid = await validateTokenResult(user);
        if (!isValid) {
          clearSessionState();
          return false;
        }
        return true;
      } catch (error) {
        // Token validation failed, but we have a cached session
        logOperation('validateSession', 'warning', 'Token validation failed, using cached session');
        return true;
      }
    }

    const isValid = await validateTokenResult(user);
    if (!isValid) {
      clearSessionState();
      return false;
    }

    setSessionState({
      initialized: true,
      authenticated: true,
      user,
      lastRefresh: Date.now()
    });

    logOperation('validateSession', 'success', { userId: user.uid });
    return true;

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Session validation failed';
    logOperation('validateSession', 'error', { userId: user?.uid, error: errorMessage });
    clearSessionState();
    return false;
  }
};