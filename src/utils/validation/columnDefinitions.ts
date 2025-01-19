import { ColumnDefinition } from './types';
import { isValidDate, isValidNumber, isValidBranchNumber, isValidStaffCode } from './validators';

export const COLUMN_DEFINITIONS: ColumnDefinition[] = [
  {
    name: 'Date',
    type: 'date',
    required: true,
    validate: isValidDate,
    format: 'YYYY-MM-DD'
  },
  {
    name: 'Branch Number',
    type: 'string',
    required: true,
    validate: isValidBranchNumber
  },
  {
    name: 'Staff Code',
    type: 'string',
    required: true,
    validate: isValidStaffCode
  },
  {
    name: 'Cellnet Quantity',
    type: 'number',
    required: false,
    validate: (value) => isValidNumber(value, true) // true for integers only
  },
  {
    name: 'Cellnet Sales',
    type: 'number',
    required: false,
    validate: isValidNumber
  },
  {
    name: 'Cellnet Margin',
    type: 'number',
    required: false,
    validate: isValidNumber
  },
  {
    name: 'Likewize Acc Quantity',
    type: 'number',
    required: false,
    validate: (value) => isValidNumber(value, true)
  },
  {
    name: 'Likewize Acc Sales',
    type: 'number',
    required: false,
    validate: isValidNumber
  },
  {
    name: 'Likewize Acc Margin',
    type: 'number',
    required: false,
    validate: isValidNumber
  },
  {
    name: 'Pacificomm Quantity',
    type: 'number',
    required: false,
    validate: (value) => isValidNumber(value, true)
  },
  {
    name: 'Pacificomm Sales',
    type: 'number',
    required: false,
    validate: isValidNumber
  },
  {
    name: 'Pacificomm Margin',
    type: 'number',
    required: false,
    validate: isValidNumber
  },
  {
    name: 'Studiotech Quantity',
    type: 'number',
    required: false,
    validate: (value) => isValidNumber(value, true)
  },
  {
    name: 'Studiotech Sales',
    type: 'number',
    required: false,
    validate: isValidNumber
  },
  {
    name: 'Studiotech Margin',
    type: 'number',
    required: false,
    validate: isValidNumber
  },
  {
    name: 'Likewize Device Quantity',
    type: 'number',
    required: false,
    validate: (value) => isValidNumber(value, true)
  }
];

export const EXPECTED_HEADERS = COLUMN_DEFINITIONS.map(col => col.name);