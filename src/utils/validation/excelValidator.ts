import { ValidationError } from './types';
import { validateHeaders } from './headerValidator';
import { validateRow } from './rowValidator';
import { logOperation } from '../../services/firebase/logging';

export const validateExcelData = (data: any[]) => {
  try {
    let errors: ValidationError[] = [];

    // Basic data validation
    if (!data || !Array.isArray(data) || data.length < 2) {
      return {
        isValid: false,
        errors: [{
          row: 0,
          message: 'Invalid or empty Excel file'
        }]
      };
    }

    // Validate headers
    const headerErrors = validateHeaders(data[0]);
    if (headerErrors.length > 0) {
      return {
        isValid: false,
        errors: headerErrors
      };
    }

    // Validate each data row
    for (let i = 1; i < data.length; i++) {
      // Skip completely empty rows
      if (!data[i] || data[i].every((cell: any) => !cell)) {
        continue;
      }
      
      const rowErrors = validateRow(data[i], i + 1);
      errors = [...errors, ...rowErrors];
    }

    const result = {
      isValid: errors.length === 0,
      errors
    };

    logOperation('validateExcelData', 
      result.isValid ? 'success' : 'error',
      { errorCount: errors.length }
    );

    return result;
  } catch (error) {
    logOperation('validateExcelData', 'error', error);
    return {
      isValid: false,
      errors: [{
        row: 0,
        message: 'Failed to validate Excel data: ' + (error as Error).message
      }]
    };
  }
};