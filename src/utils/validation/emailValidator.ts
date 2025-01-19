import { ValidationResult } from './types';

const EMAIL_REGEX = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

export const validateEmail = (email: string): ValidationResult => {
  if (!email) {
    return {
      isValid: false,
      error: 'Email is required'
    };
  }

  if (!EMAIL_REGEX.test(email)) {
    return {
      isValid: false,
      error: 'Please enter a valid email address'
    };
  }

  return { isValid: true };
};