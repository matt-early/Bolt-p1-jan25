export * from './sum';
export * from './average';
export * from './count';

import { MetricDefinition } from '../../types';
import { calculateSum } from './sum';
import { calculateAverage } from './average';
import { calculateCount } from './count';

export const aggregateMetricValues = (
  values: number[],
  definition: MetricDefinition
): number => {
  switch (definition.aggregation) {
    case 'sum':
      return calculateSum(values);
    case 'average':
      return calculateAverage(values);
    case 'count':
      return calculateCount(values);
    default:
      return 0;
  }
};