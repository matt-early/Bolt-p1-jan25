import React from 'react';
import { Loader2 } from 'lucide-react';

interface LoadingScreenProps {
  error?: string | null;
  networkError?: string | null;
  retryCount?: number;
  maxRetries?: number;
  isOffline?: boolean;
}

export const LoadingScreen: React.FC<LoadingScreenProps> = ({ 
  error,
  networkError,
  retryCount = 0,
  maxRetries = 3,
  isOffline = false
}) => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-8 bg-gray-50">
      {(error || networkError) ? (
        <div className="bg-red-50 border border-red-200 rounded-lg text-red-600 text-center p-6 max-w-md">
          <p className="text-lg font-medium mb-2">Error</p>
          {networkError ? (
            <p className="text-sm mb-4">
              {networkError}
            </p>
          ) : (
            <p className="text-sm whitespace-pre-wrap">{error || networkError}</p>
          )}
          {retryCount > 0 && retryCount < maxRetries && (
            <p className="text-sm text-gray-600 mt-2">
              Retrying... Attempt {retryCount} of {maxRetries}
            </p>
          )}
          {retryCount >= maxRetries && (
            <p className="text-sm text-red-600 mt-2">
              Maximum retry attempts reached. Please refresh the page to try again.
            </p>
          )}
          {!isOffline && (
            <p className="text-xs text-red-500 mt-4">
              {error ? 'Please check your environment configuration and try again.' : ''}
            </p>
          )}
        </div>
      ) : (
        <div className="flex flex-col items-center">
          <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
          <p className="mt-4 text-sm text-gray-600">
            {isOffline 
              ? 'Waiting for network connection...'
              : retryCount > 0 
                ? `Retrying initialization... (${retryCount}/${maxRetries})` 
                : 'Initializing application...'}
          </p>
        </div>
      )}
    </div>
  );
};