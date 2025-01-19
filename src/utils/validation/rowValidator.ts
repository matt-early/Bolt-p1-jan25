import { ValidationError } from './types';
import { COLUMN_DEFINITIONS } from './columnDefinitions';

export const validateRow = (row: any[], rowNum: number): ValidationError[] => {
  const errors: ValidationError[] = [];

  // Skip empty rows
  if (!row || row.every(cell => cell === undefined || cell === null || cell === '')) {
    return errors;
  }

  // Validate each cell according to column definition
  COLUMN_DEFINITIONS.forEach((colDef, index) => {
    const value = row[index];
    
    // Check required fields
    if (colDef.required && (value === undefined || value === null || value === '')) {
      errors.push({
        row: rowNum,
        column: colDef.name,
        message: `${colDef.name} is required`
      });
      return;
    }

    // Validate value if present
    if (value !== undefined && value !== null && value !== '') {
      if (colDef.validate && !colDef.validate(value)) {
        let message = `Invalid ${colDef.name}`;
        if (colDef.format) {
          message += `. Expected format: ${colDef.format}`;
        }
        errors.push({
          row: rowNum,
          column: colDef.name,
          message,
          value
        });
      }
    }
  });

  return errors;
};