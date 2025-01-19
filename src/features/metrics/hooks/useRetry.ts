import { useState, useCallback } from 'react';

interface RetryOptions {
  maxAttempts?: number;
  delayMs?: number;
}

export const useRetry = (options: RetryOptions = {}) => {
  const { maxAttempts = 3, delayMs = 1000 } = options;
  const [attempts, setAttempts] = useState(0);

  const retry = useCallback(async (operation: () => Promise<void>) => {
    if (attempts >= maxAttempts) {
      throw new Error('Maximum retry attempts reached');
    }

    try {
      await operation();
      setAttempts(0); // Reset on success
    } catch (error) {
      setAttempts(prev => prev + 1);
      if (attempts + 1 < maxAttempts) {
        await new Promise(resolve => setTimeout(resolve, delayMs * (attempts + 1)));
        await retry(operation);
      } else {
        throw error;
      }
    }
  }, [attempts, maxAttempts, delayMs]);

  const resetAttempts = useCallback(() => {
    setAttempts(0);
  }, []);

  return {
    attempts,
    retry,
    resetAttempts,
    canRetry: attempts < maxAttempts
  };
};