import { 
  MAX_BRANCH_NUMBER_LENGTH, 
  MAX_STAFF_CODE_LENGTH, 
  VALID_CODE_PATTERN,
  ERROR_MESSAGES 
} from './constants';
import { ValidationResult } from './types';

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