// Firebase error types
export interface FirebaseErrorDetails {
  code: string;
  message: string;
  isOffline?: boolean;
  isRetryable?: boolean;
  originalError?: any;
}

// Retry options
export interface RetryOptions {
  maxAttempts?: number;
  delayMs?: number;
  operation: string;
}