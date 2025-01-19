import { logOperation } from './logging';
import { handleFirebaseError } from './error-handler';
import { waitForNetwork } from './network';

export interface RetryOptions {
  maxAttempts?: number;
  initialDelay?: number;
  maxDelay?: number;
  operation: string;
  waitForNetwork?: boolean;
}

const DEFAULT_OPTIONS: Required<Omit<RetryOptions, 'operation'>> = {
  maxAttempts: 3,
  initialDelay: 1000,
  maxDelay: 10000,
  waitForNetwork: true
};

export const retry = async <T>(
  operation: () => Promise<T>,
  options: RetryOptions
): Promise<T> => {
  const { maxAttempts, initialDelay, maxDelay } = { ...DEFAULT_OPTIONS, ...options };
  let attempt = 1;
  let delay = initialDelay;

  while (attempt <= maxAttempts) {
    try {
      // Wait for network if needed
      if (options.waitForNetwork && !navigator.onLine) {
        logOperation(options.operation, 'waiting-for-network');
        const hasNetwork = await waitForNetwork();
        if (!hasNetwork) {
          throw new Error('No network connection available');
        }
      }

      return await operation();
    } catch (error) {
      const errorDetails = handleFirebaseError(error);
      
      // Don't retry network errors if we're already waiting for network
      if ((!errorDetails.isRetryable && !errorDetails.isOffline) || attempt === maxAttempts) {
        throw error;
      }

      logOperation(options.operation, 'retry', {
        attempt,
        maxAttempts,
        delay,
        error: errorDetails
      });

      // Wait before retrying
      await new Promise(resolve => setTimeout(resolve, delay));
      
      // Exponential backoff with full jitter
      const cap = Math.min(maxDelay, initialDelay * Math.pow(2, attempt));
      delay = Math.floor(Math.random() * cap);
      
      attempt++;
    }
  }

  throw new Error(`Max retry attempts (${maxAttempts}) exceeded`);
};