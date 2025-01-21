import { logOperation } from '../firebase/logging';
import { FirebaseError } from 'firebase/app';

export const AUTH_ERROR_MESSAGES = {
  'auth/user-not-found': 'No account exists with this email address. Please check your email or register for a new account.',
  'auth/wrong-password': 'Incorrect password. Please try again or use the "Forgot Password" link below.',
  'auth/missing-credentials': 'Email and password are required',
  'auth/service-unavailable': 'Authentication service is temporarily unavailable. Please try again.',
  'auth/invalid-login-credentials': 'Invalid login credentials. Please check your email and password.',
  'auth/email-already-in-use': 'An account already exists with this email address',
  'auth/invalid-credential': 'Invalid login credentials. Please check your email and password.',
  'auth/invalid-email': 'Invalid email address format',
  'auth/weak-password': 'Password should be at least 6 characters',
  'auth/network-request-failed': 'Network error. Please check your connection and try again.',
  'auth/too-many-requests': 'Too many failed login attempts. For security reasons, please wait a few minutes before trying again.',
  'auth/user-disabled': 'This account has been disabled. Please contact your administrator.',
  'auth/operation-not-allowed': 'Sign-in is currently disabled',
  'auth/popup-closed-by-user': 'Sign-in window was closed',
  'auth/cancelled-popup-request': 'Sign-in operation cancelled',
  'auth/popup-blocked': 'Sign-in popup was blocked by the browser',
  'default': 'An error occurred during sign in. Please try again.'
} as const;

export interface AuthError {
  code: string;
  message: string;
  originalError?: string;
  timestamp?: string;
}

export const handleAuthError = (error: unknown): AuthError => {
  if (error instanceof FirebaseError) {
    return getAuthErrorMessage(error.code, error.message);
  }
  
  return {
    code: 'unknown',
    message: error instanceof Error ? error.message : 'An unexpected error occurred',
    timestamp: new Date().toISOString()
  };
};

export const getAuthErrorMessage = (code: string, originalError?: string): AuthError => {
  const message = AUTH_ERROR_MESSAGES[code as keyof typeof AUTH_ERROR_MESSAGES] || AUTH_ERROR_MESSAGES.default;
  
  const error: AuthError = {
    code,
    message,
    originalError,
    timestamp: new Date().toISOString()
  };

  logOperation('getAuthErrorMessage', 'info', error);
  return error;
};