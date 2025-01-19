import { SalesMetrics } from '../../types';
import { logOperation } from '../../services/firebase/logging';

export const validateMetricsData = (metrics: SalesMetrics[]): boolean => {
  try {
    if (!Array.isArray(metrics)) {
      logOperation('validateMetricsData', 'error', 'Metrics is not an array');
      return false;
    }

    // Check if metrics have required fields
    const isValid = metrics.every(metric => {
      const hasRequiredFields = 
        metric.supplierId !== undefined &&
        metric.quantity !== undefined &&
        metric.date !== undefined;

      const hasValidTypes =
        typeof metric.supplierId === 'number' &&
        typeof metric.quantity === 'number' &&
        typeof metric.date === 'string';

      return hasRequiredFields && hasValidTypes;
    });

    logOperation('validateMetricsData', 'success', {
      count: metrics.length,
      isValid
    });

    return isValid;
  } catch (error) {
    logOperation('validateMetricsData', 'error', error);
    return false;
  }
};