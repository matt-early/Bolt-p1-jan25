import { ValidationError } from '../../types/validation';
import { EXPECTED_HEADERS } from '../validation/headers';
import { logOperation } from '../../services/firebase/logging';

const validateDataTypes = (value: any, type: 'number' | 'date' | 'string'): boolean => {
  // Handle empty values
  if (value === undefined || value === null || value === '') {
    return type === 'number'; // Only allow empty values for numbers (will be converted to 0)
  }

  switch (type) {
    case 'number':
      const num = Number(value);
      return !isNaN(num) && num >= 0 && isFinite(num);
    case 'date':
      const date = new Date(value);
      return date instanceof Date && !isNaN(date.getTime());
    case 'string':
      return typeof value === 'string' || typeof value === 'number';
    default:
      return false;
  }
};

const validateColumnTypes = (row: any[], rowIndex: number): ValidationError[] => {
  const errors: ValidationError[] = [];
  
  // Skip completely empty rows
  if (!row || row.every(cell => cell === undefined || cell === null || cell === '')) {
    return errors;
  }

  // Define column types and requirements
  const columnTypes = [
    { index: 0, type: 'date', name: 'Date', required: true },
    { index: 1, type: 'string', name: 'Branch Number', required: true },
    { index: 2, type: 'string', name: 'Staff Code', required: true },
    // Quantities (must be whole numbers)
    { index: 3, type: 'number', name: 'Cellnet Quantity', required: false },
    { index: 6, type: 'number', name: 'Likewize Acc Quantity', required: false },
    { index: 9, type: 'number', name: 'Pacificomm Quantity', required: false },
    { index: 12, type: 'number', name: 'Studiotech Quantity', required: false },
    { index: 15, type: 'number', name: 'Likewize Device Quantity', required: false },
    // Sales and margins (can have decimals)
    { index: 4, type: 'number', name: 'Cellnet Sales', required: false },
    { index: 5, type: 'number', name: 'Cellnet Margin', required: false },
    { index: 7, type: 'number', name: 'Likewize Acc Sales', required: false },
    { index: 8, type: 'number', name: 'Likewize Acc Margin', required: false },
    { index: 10, type: 'number', name: 'Pacificomm Sales', required: false },
    { index: 11, type: 'number', name: 'Pacificomm Margin', required: false },
    { index: 13, type: 'number', name: 'Studiotech Sales', required: false },
    { index: 14, type: 'number', name: 'Studiotech Margin', required: false }
  ];

  columnTypes.forEach(({ index, type, name, required }) => {
    const value = row[index];
    
    // Check required fields
    if (required && (value === undefined || value === null || value === '')) {
      errors.push({
        row: rowIndex,
        message: `${name} is required`
      });
      return;
    }

    // Validate data type if value is present
    if (value !== undefined && value !== null && value !== '' && !validateDataTypes(value, type)) {
      errors.push({
        row: rowIndex,
        message: `Invalid ${name}: expected ${type}`
      });
    }
  });

  return errors;
};

export const validateRow = (row: any[], rowIndex: number): ValidationError[] => {
  const errors: ValidationError[] = [];

  // Skip completely empty rows
  if (!row || row.every(cell => cell === undefined || cell === null || cell === '')) {
    return errors;
  }

  // Check if row has any data
  const hasData = row.some(cell => cell !== undefined && cell !== null && cell !== '');
  if (!hasData) {
    return errors;
  }

  // Validate data types for each column
  errors.push(...validateColumnTypes(row, rowIndex));

  return errors;
};

export const validateExcelStructure = (data: any[]): ValidationError[] => {
  const errors: ValidationError[] = [];

  // Check if file is empty
  if (!data || data.length < 2) {
    errors.push({
      row: 0,
      message: 'File is empty or missing data rows'
    });
    return errors;
  }

  // Validate headers
  const headers = data[0];
  if (!headers || headers.length !== EXPECTED_HEADERS.length) {
    errors.push({
      row: 1,
      message: `Invalid number of columns. Expected ${EXPECTED_HEADERS.length} columns.`
    });
    return errors;
  }

  // Validate header names
  headers.forEach((header: string, index: number) => {
    if (header !== EXPECTED_HEADERS[index]) {
      errors.push({
        row: 1,
        message: `Invalid header in column ${index + 1}. Expected "${EXPECTED_HEADERS[index]}", got "${header}"`
      });
    }
  });

  return errors;
};

export const validateExcelData = (data: any[]): ValidationError[] => {
  try {
    let errors: ValidationError[] = [];

    // Validate structure first
    const structureErrors = validateExcelStructure(data);
    if (structureErrors.length > 0) {
      return structureErrors;
    }

    // Validate each data row
    for (let i = 1; i < data.length; i++) {
      // Skip completely empty rows
      if (!data[i] || data[i].every(cell => cell === undefined || cell === null || cell === '')) {
        continue;
      }

      const rowErrors = validateRow(data[i], i + 1);
      errors = [...errors, ...rowErrors];
    }

    logOperation('validateExcelData', errors.length ? 'error' : 'success', { errorCount: errors.length });
    return errors;
  } catch (error) {
    logOperation('validateExcelData', 'error', error);
    throw error;
  }
};