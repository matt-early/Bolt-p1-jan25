import { FirebaseError } from 'firebase/app';
import { logOperation } from '../firebase/logging';

export interface MetricsErrorDetails {
  message: string;
  isIndexError: boolean;
  indexUrl?: string;
}

export const handleMetricsError = (
  error: unknown,
  operation: string
): MetricsErrorDetails => {
  if (error instanceof FirebaseError) {
    switch (error.code) {
      case 'failed-precondition': {
        const indexUrl = error.message.match(/https:\/\/console\.firebase\.google\.com[^\s]*/)?.[0];
        if (indexUrl) {
          logOperation(operation, 'error', {
            code: error.code,
            message: 'Database index not ready',
            indexUrl
          });
          return {
            message: 'Database indexes are being created. Please try again in a few minutes.',
            isIndexError: true,
            indexUrl
          };
        }
        break;
      }
      case 'unavailable':
        logOperation(operation, 'error', {
          code: error.code,
          message: 'Service temporarily unavailable'
        });
        console.error('The service is temporarily unavailable. Please try again in a few moments.');
        return {
          message: 'The service is temporarily unavailable. Please try again in a few moments.',
          isIndexError: false
        };
      default:
        logOperation(operation, 'error', {
          code: error.code,
          message: error.message
        });
    }
  }

  logOperation(operation, 'error', error);
  return {
    message: 'An unexpected error occurred. Please try again.',
    isIndexError: false
  };
};