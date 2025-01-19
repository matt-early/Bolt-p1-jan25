import { collection, query, where, orderBy } from 'firebase/firestore';
import { db } from '../../config/firebase';
import { SalesMetrics } from '../../types';
import { logOperation } from '../firebase/logging';
import { executeQuery } from './utils';

export const fetchMetricsByStore = async (branchNumbers: string[]): Promise<SalesMetrics[]> => {
  try {
    const metricsRef = collection(db, 'metrics');
    let metricsQuery;

    if (!branchNumbers.length) {
      // If no branch numbers specified, get all metrics
      metricsQuery = query(
        metricsRef,
        orderBy('date', 'desc')
      );
    } else {
      // Query metrics for specific branch numbers
      metricsQuery = query(
        metricsRef,
        where('branchNumber', 'in', branchNumbers),
        orderBy('date', 'desc')
      );
    }

    const metrics = await executeQuery(metricsQuery);
    logOperation('fetchMetricsByStore', 'success', { count: metrics.length });
    return metrics;
  } catch (error) {
    logOperation('fetchMetricsByStore', 'error', error);
    throw error;
  }
};