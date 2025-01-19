import { SelectionCriteria, MetricResult } from '../../types';
import { calculateChange } from './calculateChange';

export const comparePeriods = (
  current: MetricResult,
  previous: MetricResult
): MetricResult => {
  const change = calculateChange(current.value, previous.value);
  
  return {
    ...current,
    change: change.percentage,
    trend: change.trend
  };
};

export const getComparisonPeriod = (
  selection: SelectionCriteria
): SelectionCriteria => {
  // Implementation for determining comparison period based on selection
  return selection;
};