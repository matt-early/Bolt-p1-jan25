import { User } from 'firebase/auth';
import { validateSession } from './validation';
import { refreshSession, setupSessionRefresh } from './refresh';
import { validateNetworkState } from './network';
import { setupAuthCleanup, registerCleanup } from './cleanup';
import { logOperation } from '../../firebase/logging';
import { retry } from '../../firebase/retry';

const INIT_GRACE_PERIOD = 500; // 500ms
const MAX_REFRESH_ATTEMPTS = 3;
const NETWORK_TIMEOUT = 30000; // 30 seconds

export const initializeAuthSession = async (user: User | null) => {
  try {
    if (!user) return false;

    // Force token refresh to ensure claims are up to date
    try {
      await retry(
        () => user.getIdToken(true),
        {
          maxAttempts: 3,
          initialDelay: 1000,
          operation: 'initializeAuthSession.refreshToken'
        }
      );
    } catch (error) {
      logOperation('initializeAuthSession', 'error', 'Failed to refresh token');
      return false;
    }

    const isValid = await validateSession(user);
    
    if (isValid) {
      // Setup refresh and cleanup
      const cleanup = setupAuthCleanup(user);
      const refreshCleanup = setupSessionRefresh(
        user,
        async () => {
          try {
            await user.getIdToken(true); // Force token refresh
            return validateSession(user);
          } catch (error) {
            logOperation('sessionRefresh', 'error', error);
            return false;
          }
        },
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