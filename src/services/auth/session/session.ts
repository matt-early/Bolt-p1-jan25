import { User } from 'firebase/auth';
import { validateSession } from './validation';
import { refreshSession, setupSessionRefresh } from './refresh';
import { validateNetworkState, waitForNetwork } from './network';
import { setupAuthCleanup, registerCleanup } from './cleanup';
import { logOperation } from '../../firebase/logging';

const INIT_GRACE_PERIOD = 500; // 500ms
const MAX_REFRESH_ATTEMPTS = 3;
const NETWORK_TIMEOUT = 30000; // 30 seconds

export const initializeAuthSession = async (user: User | null) => {
  try {
    if (!user) return false;

    // Wait for network if offline
    if (!navigator.onLine) {
      const hasNetwork = await waitForNetwork(NETWORK_TIMEOUT);
      if (!hasNetwork) {
        logOperation('initializeAuthSession', 'warning', 'No network connection');
        // Check for valid cached session
        const cachedSession = sessionStorage.getItem('isAuthenticated');
        const lastRefresh = sessionStorage.getItem('lastTokenRefresh');
        if (cachedSession && lastRefresh) {
          const age = Date.now() - parseInt(lastRefresh, 10);
          if (age < 55 * 60 * 1000) { // 55 minutes
            return true;
          }
        }
        return false;
      }
    }

    const isValid = await validateSession(user);
    
    if (isValid) {
      // Setup refresh and cleanup
      const cleanup = setupAuthCleanup(user);
      const refreshCleanup = setupSessionRefresh(
        user,
        () => validateSession(user),
        (error) => {
          logOperation('sessionRefresh', 'error', error);
          cleanup();
        }
      );

      // Register cleanup handlers
      registerCleanup(user.uid, refreshCleanup);
      registerCleanup(user.uid, cleanup);
    }

    return isValid;
  } catch (error) {
    logOperation('initializeAuthSession', 'error', error);
    return false;
  }
};