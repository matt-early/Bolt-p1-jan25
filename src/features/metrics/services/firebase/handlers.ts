import { getDocs } from 'firebase/firestore';
import { MetricData } from '../../types';
import { handleFirebaseError, isIndexError } from './error-handler';
import { 
  createRegionMetricsQuery, 
  createStoreMetricsQuery, 
  createStaffMetricsQuery 
} from './queries';

const executeMetricsQuery = async (
  queryPromise: Promise<any>,
  filterFn?: (metrics: MetricData[]) => MetricData[]
): Promise<MetricData[]> => {
  try {
    const query = await queryPromise;
    const snapshot = await getDocs(query);
    
    let metrics = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as MetricData[];
    
    if (filterFn) {
      metrics = filterFn(metrics);
    }
    
    return metrics;
  } catch (error) {
    const errorDetails = handleFirebaseError(error);
    
    if (isIndexError(errorDetails)) {
      throw new Error('Database indexes are being created. Please try again in a few minutes.');
    }
    
    throw new Error(errorDetails.message);
  }
};

export const fetchMetricsByRegion = async (regionId: string): Promise<MetricData[]> => {
  return executeMetricsQuery(createRegionMetricsQuery(regionId));
};

export const fetchMetricsByStore = async (branchNumber: string): Promise<MetricData[]> => {
  return executeMetricsQuery(createStoreMetricsQuery(branchNumber));
};

export const fetchMetricsByStaff = async (
  staffCode: string,
  branchNumbers: string[]
): Promise<MetricData[]> => {
  if (!staffCode || !branchNumbers.length) {
    return [];
  }

  return executeMetricsQuery(
    createStaffMetricsQuery(staffCode),
    metrics => metrics.filter(m => branchNumbers.includes(m.branchNumber))
  );
};