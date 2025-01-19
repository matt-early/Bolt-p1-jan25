import { User } from 'firebase/auth';
import { logOperation } from '../../firebase/logging';
import { retryAuthOperation } from '../retry';
import { getNetworkStatus } from '../../firebase/network';
import { AUTH_ERROR_MESSAGES } from '../errors';
import { clearSessionState } from './state';

const SESSION_TIMEOUT = 55 * 60 * 1000; // 55 minutes

export const handleTokenError = async (user: User, error: unknown): Promise<boolean> => {
  logOperation('handleTokenError', 'error', error);
  
  // Force token refresh on specific errors
  if (error instanceof Error && 
      (error.message.includes('token') || error.message.includes('claims'))) {
    try {
      const token = await user.getIdToken(true);
      if (!token) {
        throw new Error('Token refresh failed');
      }
      // Update session storage after successful refresh
      const now = Date.now();
      sessionStorage.setItem('lastTokenRefresh', now.toString());
      sessionStorage.setItem('tokenExpiration', (now + SESSION_TIMEOUT).toString());
      return true; // Successfully refreshed token
    } catch (refreshError) {
      logOperation('handleTokenError.refresh', 'error', refreshError);
      clearSessionState(); // Only clear session if refresh fails
    }
  }
  
  return false;
};

export const parseTimestamp = (value: any): Date | null => {
  try {
    if (!value) return null;
    
    // Handle different timestamp formats
    if (value instanceof Date) {
      return value;
    }
    
    if (typeof value === 'object' && value.seconds) {
      return new Date(value.seconds * 1000);
    }
    
    if (typeof value === 'string') {
      const date = new Date(value);
      return isNaN(date.getTime()) ? null : date;
    }
    
    return null;
  } catch (error) {
    logOperation('parseTimestamp', 'error', {
      message: 'Failed to parse timestamp',
      value,
      error
    });
    return null;
  }
};

export const refreshToken = async (user: User): Promise<any> => {
  const { isOnline } = getNetworkStatus();
  if (!isOnline) {
    logOperation('refreshToken', 'error', {
      message: 'Network offline',
      userId: user.uid
    });
    throw new Error(AUTH_ERROR_MESSAGES['auth/network-request-failed']);
  }

  const token = await retryAuthOperation(
    () => user.getIdToken(true),
    {
      operation: 'refreshToken',
      maxAttempts: 3,
      baseDelay: 1000
    }
  );

  if (!token) {
    logOperation('refreshToken', 'error', {
      message: 'Token refresh failed',
      userId: user.uid
    });
    throw new Error('Failed to refresh token');
  }

  // Get token result after refresh
  const result = await user.getIdTokenResult();
  return { token, result };
};

export const validateTokenAge = (timestamp: Date): boolean => {
  const SESSION_TIMEOUT = 60 * 60 * 1000; // 1 hour
  const tokenAge = Date.now() - timestamp.getTime();
  const isValid = tokenAge <= SESSION_TIMEOUT;
  
  if (!isValid) {
    logOperation('validateTokenAge', 'info', {
      message: 'Token age validation failed',
      tokenAge,
      timeout: SESSION_TIMEOUT
    });
  }
  
  return isValid;
};

export const handleSessionError = (error: unknown, operation: string): void => {
  const errorDetails = {
    message: error instanceof Error ? error.message : 'Unknown session error',
    code: error instanceof Error ? (error as any).code : undefined,
    stack: error instanceof Error ? error.stack : undefined,
    timestamp: new Date().toISOString(),
    networkStatus: getNetworkStatus()
  };

  logOperation(operation, 'error', errorDetails);
};