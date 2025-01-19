import { useState, useCallback } from 'react';
import { FirebaseErrorDetails, handleFirebaseError } from '../services/firebase';

export const useErrorHandling = () => {
  const [error, setError] = useState<FirebaseErrorDetails | null>(null);

  const handleError = useCallback((err: unknown) => {
    const errorDetails = handleFirebaseError(err);
    setError(errorDetails);
    return errorDetails;
  }, []);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    error,
    handleError,
    clearError
  };
};