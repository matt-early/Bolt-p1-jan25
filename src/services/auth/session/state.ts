import { User } from 'firebase/auth';
import { logOperation } from '../../firebase/logging';

interface SessionState {
  initialized: boolean;
  authenticated: boolean;
  user: User | null;
  lastRefresh: number | null;
}

const initialState: SessionState = {
  initialized: false,
  authenticated: false,
  user: null,
  lastRefresh: null
};

let currentState = { ...initialState };

export const getSessionState = (): SessionState => ({ ...currentState });

export const setSessionState = (updates: Partial<SessionState>): void => {
  currentState = { ...currentState, ...updates };
  logOperation('setSessionState', 'update', { 
    initialized: currentState.initialized,
    authenticated: currentState.authenticated,
    hasUser: !!currentState.user,
    userId: currentState.user?.uid
  });
};

export const clearSessionState = (): void => {
  try {
    // Clear session storage
    sessionStorage.removeItem('lastTokenRefresh');
    sessionStorage.removeItem('isAuthenticated');
    sessionStorage.clear();

    // Clear local storage
    localStorage.clear();

    // Clear auth cookies
    document.cookie.split(';').forEach(cookie => {
      document.cookie = cookie
        .replace(/^ +/, '')
        .replace(/=.*/, '=;expires=' + new Date().toUTCString() + ';path=/');
    });

    // Reset session state
    currentState = { ...initialState, initialized: true };

    logOperation('clearSessionState', 'success');
  } catch (error) {
    logOperation('clearSessionState', 'error', {
      message: error instanceof Error ? error.message : 'Failed to clear session state',
      error
    });
  }
};