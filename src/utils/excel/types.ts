import { ValidationError } from '../validation/types';

export interface ExcelProcessingResult {
  success: boolean;
  data?: any[];
  error?: string;
}

export interface ExcelValidationResult {
  isValid: boolean;
  errors: ValidationError[];
}

export interface ProcessingOptions {
  skipRows?: number;
  maxRows?: number;
  validateData?: boolean;
}