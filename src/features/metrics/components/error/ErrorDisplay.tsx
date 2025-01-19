import React from 'react';
import { AlertCircle } from 'lucide-react';

interface ErrorDisplayProps {
  message: string;
  details?: string;
  retry?: () => void;
}

export const ErrorDisplay: React.FC<ErrorDisplayProps> = ({
  message,
  details,
  retry
}) => (
  <div className="bg-red-50 border-l-4 border-red-400 p-4 rounded-md">
    <div className="flex items-start">
      <AlertCircle className="h-5 w-5 text-red-400 mt-0.5" />
      <div className="ml-3">
        <h3 className="text-sm font-medium text-red-800">{message}</h3>
        {details && (
          <p className="mt-2 text-sm text-red-700">{details}</p>
        )}
        {retry && (
          <button
            onClick={retry}
            className="mt-3 text-sm font-medium text-red-800 hover:text-red-900"
          >
            Try again
          </button>
        )}
      </div>
    </div>
  </div>
);