import { ValidationError } from '../../types/validation';
import { EXPECTED_HEADERS } from './headers';

const isValidNumber = (value: any): boolean => {
  // Handle empty values
  if (value === undefined || value === null || value === '') {
    return true; // Allow empty values, they'll be converted to 0 later
  }

  // Convert to number and validate
  const num = Number(value);
  
  // Check if it's a valid non-negative number
  if (isNaN(num) || num < 0 || !isFinite(num)) {
    return false;
  }

  // For sales and margin values, allow up to 2 decimal places
  if (typeof value === 'number') {
    const decimalPlaces = (value.toString().split('.')[1] || '').length;
    if (decimalPlaces > 2) {
      return false;
    }
  }

  return true;
};

const isValidDate = (value: any): boolean => {
  if (!value) return false;
  const date = new Date(value);
  return date instanceof Date && !isNaN(date.getTime());
};

const isValidBranchNumber = (value: any): boolean => {
  if (!value) return false;
  const strValue = value.toString().trim();
  return strValue.length > 0 && strValue.length <= 10;
};

const isValidStaffCode = (value: any): boolean => {
  if (!value) return false;
  const strValue = value.toString().trim();
  return strValue.length > 0 && strValue.length <= 20;
};

export const validateRow = (row: any[], rowNum: number): ValidationError[] => {
  const errors: ValidationError[] = [];

  // Skip empty rows
  if (!row || row.every((cell: any) => !cell)) {
    return errors;
  }

  // Check date (column 0)
  if (!isValidDate(row[0])) {
    errors.push({
      row: rowNum,
      message: 'Invalid date format. Expected format: YYYY-MM-DD'
    });
  }

  // Check branch number (column 1)
  if (!isValidBranchNumber(row[1])) {
    errors.push({
      row: rowNum,
      message: 'Branch number is required and must be 1-10 characters'
    });
  }

  // Check staff code (column 2)
  if (!isValidStaffCode(row[2])) {
    errors.push({
      row: rowNum,
      message: 'Staff code is required and must be 1-20 characters'
    });
  }

  // Check numeric values (columns 3-15)
  for (let j = 3; j < row.length; j++) {
    const value = row[j];
    const columnName = EXPECTED_HEADERS[j];
    
    if (!isValidNumber(value)) {
      errors.push({
        row: rowNum,
        message: `Invalid ${columnName}: must be a non-negative number with up to 2 decimal places`
      });
    }
  }

  return errors;
};