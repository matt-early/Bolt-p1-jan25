export * from './currency';
export * from './percentage';
export * from './number';

import { MetricDefinition } from '../../types';
import { formatCurrency } from './currency';
import { formatPercentage } from './percentage';
import { formatNumber } from './number';

export const formatMetricValue = (value: number, definition: MetricDefinition): string => {
  switch (definition.format) {
    case 'currency':
      return formatCurrency(value);
    case 'percentage':
      return formatPercentage(value);
    case 'number':
      return formatNumber(value);
    default:
      return value.toString();
  }
};