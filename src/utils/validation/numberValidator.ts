import { MAX_DECIMAL_PLACES, ERROR_MESSAGES } from './constants';
import { ValidationResult } from './types';

export const validateNumber = (
  value: any,
  requireInteger: boolean = false
): ValidationResult => {
  // Allow empty values
  if (value === undefined || value === null || value === '') {
    return { isValid: true };
  }

  const num = Number(value);
  
  if (isNaN(num) || !isFinite(num)) {
    return {
      isValid: false,
      error: ERROR_MESSAGES.INVALID_NUMBER
    };
  }

  if (requireInteger && !Number.isInteger(num)) {
    return {
      isValid: false,
      error: ERROR_MESSAGES.INVALID_INTEGER
    };
  }

  if (!requireInteger && typeof value === 'number') {
    const decimalPlaces = (Math.abs(value).toString().split('.')[1] || '').length;
    if (decimalPlaces > MAX_DECIMAL_PLACES) {
      return {
        isValid: false,
        error: ERROR_MESSAGES.INVALID_DECIMALS
      };
    }
  }

  return { isValid: true };
};