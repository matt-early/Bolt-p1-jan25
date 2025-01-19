import { ERROR_MESSAGES } from './constants';
import { ValidationResult } from './types';

export const validateDate = (value: any): ValidationResult => {
  if (!value) {
    return {
      isValid: false,
      error: ERROR_MESSAGES.INVALID_DATE
    };
  }
  
  const date = new Date(value);
  if (!(date instanceof Date) || isNaN(date.getTime())) {
    return {
      isValid: false,
      error: ERROR_MESSAGES.INVALID_DATE
    };
  }

  const today = new Date();
  today.setHours(23, 59, 59, 999);
  if (date > today) {
    return {
      isValid: false,
      error: ERROR_MESSAGES.FUTURE_DATE
    };
  }

  return { isValid: true };
};