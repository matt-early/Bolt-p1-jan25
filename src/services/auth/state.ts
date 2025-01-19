import { User } from 'firebase/auth';
import { logOperation } from '../firebase/logging';
import { getNetworkStatus } from '../firebase/network';

interface AuthState {
  initialized: boolean;
  authenticated: boolean;
  user: User | null;
  lastRefresh: number | null;
}

let authState: AuthState = {
  initialized: false,
  authenticated: false,
  user: null,
  lastRefresh: null
};

export const getAuthState = () => ({ ...authState });

export const setAuthState = (updates: Partial<AuthState>) => {
  authState = { ...authState, ...updates };
  logOperation('setAuthState', 'update', { 
    initialized: authState.initialized,
    authenticated: authState.authenticated,
    hasUser: !!authState.user
  });
};

export const clearAuthState = () => {
  try {
    // Clear all auth-related storage
    sessionStorage.removeItem('isAuthenticated');
    sessionStorage.clear();
    localStorage.clear();

    // Clear auth cookies
    document.cookie.split(';').forEach(cookie => {
      document.cookie = cookie
        .replace(/^ +/, '')
        .replace(/=.*/, '=;expires=' + new Date().toUTCString() + ';path=/');
    });

    // Reset auth state
    authState = {
      initialized: true,
      authenticated: false,
      user: null,
      lastRefresh: null
    };

    logOperation('clearAuthState', 'success');
  } catch (error) {
    logOperation('clearAuthState', 'error', error);
  }
};

export const refreshAuthState = async (user: User | null): Promise<void> => {
  try {
    const { isOnline } = getNetworkStatus();
    
    if (!isOnline) {
      logOperation('refreshAuthState', 'error', 'No network connection');
      return;
    }

    if (!user) {
      clearAuthState();
      return;
    }

    // Force token refresh
    await user.getIdToken(true);
    
    setAuthState({
      authenticated: true,
      user,
      lastRefresh: Date.now()
    });

    logOperation('refreshAuthState', 'success');
  } catch (error) {
    logOperation('refreshAuthState', 'error', error);
    clearAuthState();
  }
};