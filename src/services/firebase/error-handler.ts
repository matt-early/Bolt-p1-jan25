import { FirebaseError } from 'firebase/app';
import { logOperation } from './logging';

export interface FirebaseErrorDetails {
  code: string;
  message: string;
  isOffline?: boolean;
  isRetryable?: boolean;
  originalError?: any;
}

const RETRYABLE_ERROR_CODES = [
  'unavailable',
  'resource-exhausted',
  'deadline-exceeded'
];

export const handleFirebaseError = (error: unknown): FirebaseErrorDetails => {
  if (error instanceof FirebaseError) {
    // Handle invalid argument errors
    if (error.code === 'invalid-argument') {
      logOperation('handleFirebaseError', 'warning', 'Invalid query arguments - using default query');
      return {
        code: error.code,
        message: 'Database initialization in progress. Please try again.',
        isRetryable: true,
        originalError: error
      };
    }

    const isRetryable = RETRYABLE_ERROR_CODES.includes(error.code);
    const isOffline = !navigator.onLine || error.code === 'unavailable';

    const details: FirebaseErrorDetails = {
      code: error.code,
      message: getErrorMessage(error),
      isOffline,
      isRetryable,
      originalError: error
    };

    logOperation('handleFirebaseError', 'error', details);
    return details;
  }

  // Handle non-Firebase errors
  const genericError: FirebaseErrorDetails = {
    code: 'unknown',
    message: error instanceof Error ? error.message : 'An unexpected error occurred',
    isOffline: !navigator.onLine,
    isRetryable: false,
    originalError: error
  };

  logOperation('handleFirebaseError', 'error', genericError);
  return genericError;
};

const getErrorMessage = (error: FirebaseError): string => {
  switch (error.code) {
    case 'unavailable':
      return 'Service temporarily unavailable. Please check your connection and try again.';
    case 'permission-denied':
      return 'You do not have permission to perform this action.';
    case 'failed-precondition':
      if (error.message.includes('indexes')) {
        return 'System is preparing to handle this request. Please try again in a few minutes.';
      }
      return 'Operation cannot be completed at this time.';
    case 'resource-exhausted':
      return 'Service is temporarily overloaded. Please try again in a few moments.';
    case 'deadline-exceeded':
      return 'Request took too long to complete. Please try again.';
    default:
      return error.message;
  }
};