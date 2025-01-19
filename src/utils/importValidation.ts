import { logOperation } from '../services/firebase/logging';

interface ValidationError {
  row: number;
  message: string;
}

export const validateExcelData = (data: any[]): ValidationError[] => {
  const errors: ValidationError[] = [];
  
  // Expected column headers
  const expectedHeaders = [
    'Date', 'Branch Number', 'Staff Code',
    'Cellnet Quantity', 'Cellnet Sales', 'Cellnet Margin',
    'Likewize Acc Quantity', 'Likewize Acc Sales', 'Likewize Acc Margin',
    'Pacificomm Quantity', 'Pacificomm Sales', 'Pacificomm Margin',
    'Studiotech Quantity', 'Studiotech Sales', 'Studiotech Margin',
    'Likewize Device Quantity'
  ];

  // Validate headers
  const headers = data[0];
  if (!headers || headers.length !== expectedHeaders.length) {
    errors.push({
      row: 1,
      message: `Invalid number of columns. Expected ${expectedHeaders.length} columns.`
    });
    return errors;
  }

  // Validate data rows
  for (let i = 1; i < data.length; i++) {
    const row = data[i];
    const rowNum = i + 1;

    // Skip empty rows
    if (!row || row.every((cell: any) => !cell)) continue;

    // Check date
    if (!row[0] || isNaN(new Date(row[0]).getTime())) {
      errors.push({
        row: rowNum,
        message: 'Invalid date format'
      });
    }

    // Check branch number
    if (!row[1] || typeof row[1].toString() !== 'string') {
      errors.push({
        row: rowNum,
        message: 'Invalid branch number'
      });
    }

    // Check staff code
    if (!row[2] || typeof row[2].toString() !== 'string') {
      errors.push({
        row: rowNum,
        message: 'Invalid staff code'
      });
    }

    // Check numeric values
    for (let j = 3; j < row.length; j++) {
      if (isNaN(Number(row[j]))) {
        errors.push({
          row: rowNum,
          message: `Invalid numeric value in column ${expectedHeaders[j]}`
        });
      }
    }
  }

  logOperation('validateExcelData', errors.length ? 'error' : 'success', { errorCount: errors.length });
  return errors;
};