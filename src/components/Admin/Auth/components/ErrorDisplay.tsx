import React from 'react';
import { AlertCircle } from 'lucide-react';

interface ErrorDisplayProps {
  message: string;
}

export const ErrorDisplay: React.FC<ErrorDisplayProps> = ({ message }) => (
  <div className="p-4 bg-red-50 border-l-4 border-red-400">
    <div className="flex">
      <AlertCircle className="h-5 w-5 text-red-400" />
      <p className="ml-3 text-sm text-red-700">{message}</p>
    </div>
  </div>
);