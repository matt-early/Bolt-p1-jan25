import { SelectionCriteria } from '../types';

export const validateSelection = (selection: SelectionCriteria): Record<string, string> => {
  const errors: Record<string, string> = {};

  // Validate regions
  if (!selection.regions.length) {
    errors.regions = 'At least one region must be selected';
  }

  // Validate metrics
  if (!selection.metrics.length) {
    errors.metrics = 'At least one metric must be selected';
  }

  // Validate date range
  if (!selection.dateRange) {
    errors.dateRange = 'Date range is required';
  } else if (selection.dateRange.type === 'custom') {
    if (!selection.dateRange.start || !selection.dateRange.end) {
      errors.dateRange = 'Custom date range requires both start and end dates';
    } else if (selection.dateRange.start > selection.dateRange.end) {
      errors.dateRange = 'Start date must be before end date';
    }
  }

  // Validate comparison
  if (selection.comparison) {
    if (selection.comparison.type === 'selection' && !selection.comparison.reference) {
      errors.comparison = 'Comparison selection is required';
    }
  }

  return errors;
};