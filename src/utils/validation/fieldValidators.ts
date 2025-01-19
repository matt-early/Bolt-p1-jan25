import { ValidationResult } from './types';
import { parseDateString } from '../dateUtils/parsers';
import { 
  MAX_DECIMAL_PLACES,
  MAX_BRANCH_NUMBER_LENGTH,
  MAX_STAFF_CODE_LENGTH,
  VALID_CODE_PATTERN,
  ERROR_MESSAGES 
} from './constants';

export const validateNumber = (value: any, requireInteger: boolean = false): ValidationResult => {
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

export const validateDate = (value: any): ValidationResult => {
  if (!value) {
    return {
      isValid: false,
      error: ERROR_MESSAGES.REQUIRED_FIELD
    };
  }

  // Parse the date string
  const date = parseDateString(value.toString());
  if (!date) {
    return {
      isValid: false,
      error: ERROR_MESSAGES.INVALID_DATE
    };
  }

  // Check if date is in the future
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

export const validateBranchNumber = (value: any): ValidationResult => {
  if (!value) {
    return {
      isValid: false,
      error: ERROR_MESSAGES.REQUIRED_FIELD
    };
  }

  const strValue = value.toString().trim();
  
  if (strValue.length > MAX_BRANCH_NUMBER_LENGTH) {
    return {
      isValid: false,
      error: ERROR_MESSAGES.INVALID_LENGTH('Branch number', MAX_BRANCH_NUMBER_LENGTH)
    };
  }

  if (!VALID_CODE_PATTERN.test(strValue)) {
    return {
      isValid: false,
      error: ERROR_MESSAGES.INVALID_BRANCH
    };
  }

  return { isValid: true };
};

export const validateStaffCode = (value: any): ValidationResult => {
  if (!value) {
    return {
      isValid: false,
      error: ERROR_MESSAGES.REQUIRED_FIELD
    };
  }

  const strValue = value.toString().trim();
  
  if (strValue.length > MAX_STAFF_CODE_LENGTH) {
    return {
      isValid: false,
      error: ERROR_MESSAGES.INVALID_LENGTH('Staff code', MAX_STAFF_CODE_LENGTH)
    };
  }

  if (!VALID_CODE_PATTERN.test(strValue)) {
    return {
      isValid: false,
      error: ERROR_MESSAGES.INVALID_STAFF_CODE
    };
  }

  return { isValid: true };
};