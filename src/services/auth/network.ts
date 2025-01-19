import { FirebaseError } from 'firebase/app';
import { logOperation } from '../firebase/logging';
import { NetworkStatus, getNetworkStatus } from '../firebase/network';

export const AUTH_NETWORK_ERRORS = {
  OFFLINE: 'No network connection. Please check your internet and try again.',
  TOKEN_REFRESH: 'Unable to refresh authentication. Please sign in again.',
  TIMEOUT: 'Request timed out. Please check your connection and try again.',
  UNKNOWN: 'An unexpected error occurred. Please try again.'
} as const;

export const isAuthNetworkError = (error: unknown): boolean => {
  if (error instanceof FirebaseError) {
    return error.code === 'auth/network-request-failed' ||
           error.code === 'auth/timeout';
  }
  return false;
};

export const handleAuthNetworkError = (error: unknown): string => {
  const { isOnline } = getNetworkStatus();

  if (!isOnline) {
    return AUTH_NETWORK_ERRORS.OFFLINE;
  }

  if (error instanceof FirebaseError) {
    switch (error.code) {
      case 'auth/network-request-failed':
        return AUTH_NETWORK_ERRORS.TOKEN_REFRESH;
      case 'auth/timeout':
        return AUTH_NETWORK_ERRORS.TIMEOUT;
      default:
        return error.message;
    }
  }

  return AUTH_NETWORK_ERRORS.UNKNOWN;
};