import { ValidationError } from './types';
import { EXPECTED_HEADERS } from './columnDefinitions';

export const validateHeaders = (headers: any[]): ValidationError[] => {
  const errors: ValidationError[] = [];

  if (!headers || !Array.isArray(headers)) {
    errors.push({
      row: 1,
      message: 'Invalid or missing headers'
    });
    return errors;
  }

  if (headers.length !== EXPECTED_HEADERS.length) {
    errors.push({
      row: 1,
      message: `Invalid number of columns. Expected ${EXPECTED_HEADERS.length} columns, got ${headers.length}`
    });
    return errors;
  }

  headers.forEach((header, index) => {
    if (!header || header.trim() !== EXPECTED_HEADERS[index]) {
      errors.push({
        row: 1,
        column: `Column ${index + 1}`,
        message: `Invalid header. Expected "${EXPECTED_HEADERS[index]}", got "${header || ''}"`
      });
    }
  });

  return errors;
};