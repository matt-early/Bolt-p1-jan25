import { FirebaseError } from 'firebase/app';
import { logOperation } from './logging';

export interface FirebaseErrorDetails {
  code: string;
  message: string;
  indexUrl?: string;
  operation: string;
}

export const handleFirebaseError = (error: unknown, operation: string): FirebaseErrorDetails => {
  if (error instanceof FirebaseError) {
    const indexMatch = error.message.match(/https:\/\/console\.firebase\.google\.com[^\s]*/);
    const indexUrl = indexMatch ? indexMatch[0] : undefined;

    const errorDetails: FirebaseErrorDetails = {
      code: error.code,
      message: error.message,
      indexUrl,
      operation
    };

    switch (error.code) {
      case 'failed-precondition':
        if (indexUrl) {
          errorDetails.message = 'Database indexes are being created. Please wait a few minutes and try again.';
        }
        break;

      case 'unavailable':
        errorDetails.message = 'Service temporarily unavailable. Please try again later.';
        break;

      case 'permission-denied':
        errorDetails.message = 'You do not have permission to perform this action.';
        break;
    }

    logOperation(operation, 'error', errorDetails);
    return errorDetails;
  }

  const genericError: FirebaseErrorDetails = {
    code: 'unknown',
    message: error instanceof Error ? error.message : 'An unexpected error occurred',
    operation
  };

  logOperation(operation, 'error', genericError);
  return genericError;
};

export const isIndexError = (error: FirebaseErrorDetails): boolean => {
  return error.code === 'failed-precondition' && !!error.indexUrl;
};