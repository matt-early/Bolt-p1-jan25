export interface ValidationError {
  row: number;
  column?: string;
  message: string;
  value?: any;
}

export interface ValidationResult {
  isValid: boolean;
  error?: string;
}

export interface ColumnValidationResult {
  isValid: boolean;
  errors: ValidationError[];
}

export interface ColumnDefinition {
  name: string;
  type: 'date' | 'string' | 'number';
  required: boolean;
  validate: (value: any) => ValidationResult;
  format?: string;
}