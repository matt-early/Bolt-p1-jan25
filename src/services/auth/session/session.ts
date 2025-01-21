import { User } from 'firebase/auth';
import { validateSession } from './validation';
import { refreshSession, setupSessionRefresh } from './refresh';
import { validateNetworkState } from './network';
import { waitForNetwork, getNetworkStatus } from '../../firebase/network';
import { setupAuthCleanup, registerCleanup } from './cleanup';
import { logOperation } from '../../firebase/logging';
import { retry } from '../../firebase/retry';
import { clearSessionState } from './state';

// Constants
const INIT_GRACE_PERIOD = 500; // 500ms
const MAX_REFRESH_ATTEMPTS = 3;
const TOKEN_REFRESH_ATTEMPTS = 3;
const TOKEN_REFRESH_DELAY = 1000;
const NETWORK_TIMEOUT = 30000; // 30 seconds

export const initializeAuthSession = async (user: User | null): Promise<boolean> => {
  try {
    if (!user) return false;

    // Check network connectivity first
    const { isOnline } = getNetworkStatus();
    if (!isOnline) {
      const hasNetwork = await waitForNetwork(NETWORK_TIMEOUT);
      if (!hasNetwork) {
        logOperation('initializeAuthSession', 'error', 'No network connection');
        return false;
      }
    }

    // Force token refresh to ensure claims are up to date
    let tokenRefreshed = false;
    try {
      await retry(
        () => user.getIdToken(true),
        {
          maxAttempts: TOKEN_REFRESH_ATTEMPTS,
          initialDelay: TOKEN_REFRESH_DELAY,
          operation: 'initializeAuthSession.refreshToken'
        }
      );
      tokenRefreshed = true;
    } catch (error) {
      logOperation('initializeAuthSession', 'error', 'Failed to refresh token');
      clearSessionState();
      return false;
    }

    const isValid = await validateSession(user);
    if (!isValid) {
      logOperation('initializeAuthSession', 'error', 'Session validation failed');
      clearSessionState();
      return false;
    }
    
    if (isValid) {
      // Store session info
      sessionStorage.setItem('isAuthenticated', 'true');
      sessionStorage.setItem('lastTokenRefresh', Date.now().toString());

      // Setup refresh and cleanup
      const cleanup = setupAuthCleanup(user); 
      const refreshCleanup = setupSessionRefresh(
        user,
        async () => {
          try {
            await retry(
              () => user.getIdToken(true),
              {
                maxAttempts: TOKEN_REFRESH_ATTEMPTS,
                initialDelay: TOKEN_REFRESH_DELAY,
                operation: 'sessionRefresh.refreshToken'
              }
            );
            const valid = await validateSession(user);
            if (valid) {
              sessionStorage.setItem('lastTokenRefresh', Date.now().toString());
            }
            return valid;
          } catch (error) {
            logOperation('sessionRefresh', 'error', error);
            clearSessionState();
            return false;
          }
        },
        (error) => {
          logOperation('sessionRefresh', 'error', error);
          clearSessionState();
          cleanup();
        }
      );

      // Register cleanup handlers
      registerCleanup(user.uid, refreshCleanup);
      registerCleanup(user.uid, cleanup);
      
      logOperation('initializeAuthSession', 'success');
      return true;
    }

    clearSessionState();
    return false;
  } catch (error) {
    logOperation('initializeAuthSession', 'error', error);
    clearSessionState();
    return false;
  }
};