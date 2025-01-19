import { getDocs } from 'firebase/firestore';
import { SalesMetrics } from '../../types';
import { logOperation } from '../firebase/logging';
import { retryOperation } from '../firebase/retry';
import { handleMetricsError } from './error-handler';
import { transformMetricsDoc } from './transformer';
import { createRegionMetricsQuery, createStoreMetricsQuery } from './queries';
import { filterMetricsByRegion } from './filters';

export const fetchMetricsByStore = async (branchNumbers: string[]): Promise<SalesMetrics[]> => {
  try {
    if (!branchNumbers.length) {
      logOperation('fetchMetricsByStore', 'skip', 'No branch numbers provided');
      return [];
    }

    logOperation('fetchMetricsByStore', 'start', { branchNumbers });

    const query = await createStoreMetricsQuery({ branchNumbers });
    const { metrics, indexError } = await executeMetricsQuery(
      'fetchMetricsByStore',
      Promise.resolve(query)
    );

    if (indexError) {
      throw new Error(
        'Database indexes are being created. Please wait a few minutes and try again.'
      );
    }

    logOperation('fetchMetricsByStore', 'success', {
      count: metrics.length,
      branchNumbers
    });

    return metrics;
  } catch (error) {
    logOperation('fetchMetricsByStore', 'error', error);
    throw error;
  }
};
const executeMetricsQuery = async (
  operation: string,
  queryPromise: Promise<Query<DocumentData>>
): Promise<{ metrics: SalesMetrics[]; indexError?: boolean }> => {
  return retryOperation(async () => {
    try {
      const query = await queryPromise;
      const snapshot = await getDocs(query);
      
      // Transform and validate docs
      const metrics = snapshot.docs
        .map(transformMetricsDoc)
        .filter(metric => metric !== null) as SalesMetrics[];
      
      logOperation(operation, 'success', { count: metrics.length });
      return { metrics };
    } catch (error) {
      const errorDetails = handleMetricsError(error, operation);
      if (errorDetails.isIndexError) {
        return { metrics: [], indexError: true };
      }
      throw error;
    }
  }, { 
    operation,
    maxAttempts: 3,
    delayMs: 2000,
    shouldRetry: (error) => !error.isIndexError // Don't retry index errors
  });
};

export const fetchMetricsByRegion = async (regionId: string): Promise<SalesMetrics[]> => {
  try {
    logOperation('fetchMetricsByRegion', 'start', { regionId });
    
    const query = await createRegionMetricsQuery(regionId);
    const { metrics, indexError } = await executeMetricsQuery(
      'fetchMetricsByRegion',
      Promise.resolve(query)
    );

    if (indexError) {
      throw new Error(
        'Database indexes are being created. Please wait a few minutes and try again.'
      );
    }
    
    const filteredMetrics = filterMetricsByRegion(metrics, regionId);
    
    logOperation('fetchMetricsByRegion', 'success', {
      total: metrics.length,
      filtered: filteredMetrics.length,
      regionId
    });
    
    return filteredMetrics;
  } catch (error) {
    logOperation('fetchMetricsByRegion', 'error', error);
    throw error; // Let calling code handle the error
  }
};