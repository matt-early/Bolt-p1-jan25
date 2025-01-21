import React from 'react';
import { Loader2 } from 'lucide-react';

interface LoadingStateProps {
  message?: string;
}

export const LoadingState: React.FC<LoadingStateProps> = ({ 
  message = 'Loading...' 
}) => (
  <div className="flex items-center justify-center h-48">
    <div className="flex flex-col items-center space-y-4">
      <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
      <div className="text-gray-600">{message}</div>
    </div>
  </div>
);