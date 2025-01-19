import React from 'react';
import { ValidationError } from '../../../../utils/validation/types';

interface ValidationErrorsProps {
  errors: ValidationError[];
}

export const ValidationErrors: React.FC<ValidationErrorsProps> = ({ errors }) => {
  if (errors.length === 0) return null;

  return (
    <div className="mt-4">
      <h4 className="text-sm font-medium text-red-700 mb-2">Validation Errors:</h4>
      <div className="max-h-40 overflow-y-auto bg-red-50 rounded-md p-3">
        {errors.map((error, index) => (
          <div key={index} className="text-sm text-red-700 mb-1">
            Row {error.row}: {error.message}
          </div>
        ))}
      </div>
    </div>
  );
};