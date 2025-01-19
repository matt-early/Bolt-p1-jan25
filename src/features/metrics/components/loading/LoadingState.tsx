import React from 'react';
import { Loader2 } from 'lucide-react';

interface LoadingStateProps {
  message?: string;
}

export const LoadingState: React.FC<LoadingStateProps> = ({ 
  message = 'Loading data...' 
}) => (
  <div className="flex flex-col items-center justify-center p-8">
    <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
    <p className="mt-4 text-sm text-gray-600">{message}</p>
  </div>
);