import { FirebaseError } from 'firebase/app';
import { logOperation } from '../firebase/logging';

export interface AuthErrorDetails {
  code: string;
  message: string;
  originalError?: unknown;
}

const AUTH_ERROR_MESSAGES: Record<string, string> = {
  'auth/user-not-found': 'No account found with this email address',
  'auth/wrong-password': 'Invalid password',
  'auth/invalid-credential': 'Invalid email or password',
  'auth/user-disabled': 'This account has been disabled',
  'auth/too-many-requests': 'Too many failed attempts. Please try again later',
  'auth/network-request-failed': 'Network error. Please check your connection',
  'auth/requires-recent-login': 'Please sign in again to continue',
  'auth/invalid-email': 'Invalid email address format',
  'default': 'An error occurred during authentication'
};

export const handleAuthError = (error: unknown): AuthErrorDetails => {
  if (error instanceof FirebaseError) {
    const message = AUTH_ERROR_MESSAGES[error.code] || AUTH_ERROR_MESSAGES.default;
    return {
      code: error.code,
      message,
      originalError: error
    };
  }

  if (error instanceof Error) {
    return {
      code: 'auth/unknown',
      message: error.message,
      originalError: error
    };
  }

  return {
    code: 'auth/unknown',
    message: AUTH_ERROR_MESSAGES.default,
    originalError: error
  };
};