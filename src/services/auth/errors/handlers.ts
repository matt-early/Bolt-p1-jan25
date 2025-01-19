import { FirebaseError } from 'firebase/app';
import { logOperation } from '../../firebase/logging';

export const AUTH_ERROR_MESSAGES = {
  'auth/invalid-credential': 'Invalid email or password',
  'auth/user-disabled': 'This account has been disabled',
  'auth/user-not-found': 'No account exists with this email',
  'auth/wrong-password': 'Incorrect password',
  'auth/email-already-in-use': 'An account already exists with this email',
  'auth/invalid-email': 'Invalid email format',
  'auth/operation-not-allowed': 'Operation not allowed',
  'auth/weak-password': 'Password is too weak',
  'auth/requires-recent-login': 'Please sign in again to continue',
  'auth/unauthorized': 'You do not have permission to perform this action',
  'auth/session-expired': 'Your session has expired. Please sign in again',
  'default': 'An error occurred during authentication'
} as const;

export const handleAuthError = (error: unknown) => {
  if (error instanceof FirebaseError) {
    const message = AUTH_ERROR_MESSAGES[error.code as keyof typeof AUTH_ERROR_MESSAGES] || 
                   AUTH_ERROR_MESSAGES.default;
    
    logOperation('handleAuthError', 'error', { code: error.code, message });
    return { code: error.code, message };
  }

  const message = error instanceof Error ? error.message : AUTH_ERROR_MESSAGES.default;
  logOperation('handleAuthError', 'error', { message });
  return { code: 'unknown', message };
};