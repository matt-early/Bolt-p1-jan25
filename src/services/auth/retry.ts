import { logOperation } from '../firebase/logging';
import { waitForNetwork } from '../firebase/network';

interface RetryOptions {
  maxAttempts?: number;
  baseDelay?: number;
  timeout?: number;
  operation: string;
}

const DEFAULT_OPTIONS: Required<Omit<RetryOptions, 'operation'>> = {
  maxAttempts: 3,
  baseDelay: 1000,
  timeout: 15000
};

export const retryAuthOperation = async <T>(
  operation: () => Promise<T>,
  options: RetryOptions
): Promise<T> => {
  const { maxAttempts, baseDelay, timeout } = { ...DEFAULT_OPTIONS, ...options };
  let attempt = 1;

  while (attempt <= maxAttempts) {
    try {
      // Wait for network if offline
      if (!navigator.onLine) {
        logOperation(options.operation, 'waiting-for-network');
        const hasNetwork = await waitForNetwork(timeout);
        if (!hasNetwork) {
          throw new Error('No network connection available');
        }
      }

      // Execute operation with timeout
      const result = await Promise.race([
        operation(),
        new Promise<never>((_, reject) => 
          setTimeout(() => reject(new Error('Operation timed out')), timeout)
        )
      ]);

      return result;
    } catch (error) {
      if (attempt === maxAttempts) {
        throw error;
      }

      const delay = baseDelay * Math.pow(2, attempt - 1);
      logOperation(options.operation, 'retry', {
        attempt,
        maxAttempts,
        delay,
        error: error instanceof Error ? error.message : 'Unknown error'
      });

      await new Promise(resolve => setTimeout(resolve, delay));
      attempt++;
    }
  }

  throw new Error('Max retry attempts exceeded');
};