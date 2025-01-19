/**
 * Utility function to create a delay promise
 */
export const delay = (ms: number): Promise<void> => {
  return new Promise(resolve => setTimeout(resolve, ms));
};

/**
 * Retry an operation with exponential backoff
 */
export const retry = async <T>(
  operation: () => Promise<T>,
  maxAttempts = 3,
  baseDelay = 1000
): Promise<T> => {
  let lastError: Error;
  
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      return await operation();
    } catch (error) {
      lastError = error as Error;
      if (attempt === maxAttempts) break;
      await delay(baseDelay * Math.pow(2, attempt - 1));
    }
  }
  
  throw lastError;
};