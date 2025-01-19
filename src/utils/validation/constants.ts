export const MAX_DECIMAL_PLACES = 2;
export const MAX_BRANCH_NUMBER_LENGTH = 10;
export const MAX_STAFF_CODE_LENGTH = 20;
export const VALID_CODE_PATTERN = /^[a-zA-Z0-9-]+$/;
export const DATE_FORMAT_PATTERN = /^\d{2}\/\d{2}\/\d{4}$/;

export const ERROR_MESSAGES = {
  INVALID_DATE: 'Invalid date format. Expected dd/mm/yyyy (e.g., 11/12/2024)',
  FUTURE_DATE: 'Date cannot be in the future',
  INVALID_NUMBER: 'Must be a valid number (can be negative)',
  INVALID_INTEGER: 'Must be a whole number (can be negative)',
  INVALID_DECIMALS: `Maximum ${MAX_DECIMAL_PLACES} decimal places allowed`,
  INVALID_BRANCH: 'Branch number must contain only letters, numbers, and hyphens',
  INVALID_STAFF_CODE: 'Staff code must contain only letters, numbers, and hyphens',
  REQUIRED_FIELD: 'This field is required',
  INVALID_LENGTH: (field: string, max: number) => `${field} must be ${max} characters or less`,
  INVALID_DATE_FORMAT: 'Date must be in dd/mm/yyyy format'
} as const;