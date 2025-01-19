import { SalesMetrics } from '../../types';
import { logOperation } from '../firebase/logging';

export const filterMetricsByRegion = (
  metrics: SalesMetrics[],
  regionId: string
): SalesMetrics[] => {
  try {
    if (regionId === 'all') {
      return metrics;
    }

    const filteredMetrics = metrics.filter(metric => 
      metric.regionId === regionId
    );

    logOperation('filterMetricsByRegion', 'success', {
      total: metrics.length,
      filtered: filteredMetrics.length,
      regionId
    });

    return filteredMetrics;
  } catch (error) {
    logOperation('filterMetricsByRegion', 'error', error);
    return [];
  }
};