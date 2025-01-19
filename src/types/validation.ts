export interface ValidationError {
  row: number;
  message: string;
}

export interface ValidationResult {
  isValid: boolean;
  errors: ValidationError[];
}