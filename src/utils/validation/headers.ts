import { ValidationError } from '../../types/validation';

export const EXPECTED_HEADERS = [
  'Date', 'Branch Number', 'Staff Code',
  'Cellnet Quantity', 'Cellnet Sales', 'Cellnet Margin',
  'Likewize Acc Quantity', 'Likewize Acc Sales', 'Likewize Acc Margin',
  'Pacificomm Quantity', 'Pacificomm Sales', 'Pacificomm Margin',
  'Studiotech Quantity', 'Studiotech Sales', 'Studiotech Margin',
  'Likewize Device Quantity'
];

export const validateHeaders = (headers: any[]): ValidationError[] => {
  const errors: ValidationError[] = [];

  if (!headers || headers.length !== EXPECTED_HEADERS.length) {
    errors.push({
      row: 1,
      message: `Invalid number of columns. Expected ${EXPECTED_HEADERS.length} columns.`
    });
  }

  return errors;
};