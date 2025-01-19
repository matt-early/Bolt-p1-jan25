import { logOperation } from './logging';

interface RetryOptions {
  maxAttempts?: number;
  delayMs?: number;
  operation: string;
}

export const retryOperation = async <T>(
  operation: () => Promise<T>,
  options: RetryOptions
): Promise<T> => {
  const maxAttempts = options.maxAttempts || 3;
  const delayMs = options.delayMs || 1000;
  let lastError: Error;

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      return await operation();
    } catch (error) {
      lastError = error as Error;
      
      logOperation(options.operation, 'retry', {
        attempt,
        maxAttempts,
        error: lastError.message
      });

      if (attempt === maxAttempts) break;
      
      // Exponential backoff
      await new Promise(resolve => setTimeout(resolve, delayMs * attempt));
    }
  }

  throw lastError;
};