import React from 'react';
import { Clock } from 'lucide-react';
import { ImportProgress as ImportProgressType } from '../../../../types/import';

export const ImportProgress: React.FC<ImportProgressType> = ({
  progress,
  currentStep,
  totalRows,
  processedRows
}) => (
  <div className="mt-4 p-4 bg-blue-50 rounded-lg">
    <div className="flex items-center justify-between mb-2">
      <div className="flex items-center">
        <Clock className="w-4 h-4 text-blue-600 mr-2" />
        <span className="text-sm font-medium text-blue-900">{currentStep}</span>
      </div>
      <span className="text-sm text-blue-600">{Math.round(progress)}%</span>
    </div>
    <div className="w-full bg-blue-200 rounded-full h-2">
      <div 
        className="bg-blue-600 h-2 rounded-full transition-all duration-300"
        style={{ width: `${progress}%` }}
      />
    </div>
    {totalRows > 0 && (
      <div className="mt-2 text-sm text-blue-600">
        Processed {processedRows} of {totalRows} rows
      </div>
    )}
  </div>
);