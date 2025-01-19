import { 
  collection,
  query,
  where,
  getDocs,
  Timestamp,
  orderBy,
  limit,
  Query,
  DocumentData 
} from 'firebase/firestore';
import { getCollection, logOperation } from './firebase';
import { handleFirebaseError } from './firebase/error-handler';
import { SalesMetrics } from '../types';

const executeQuery = async (q: Query<DocumentData>): Promise<SalesMetrics[]> => {
  try {
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => {
      const data = doc.data();
      // Handle both Timestamp and string dates
      const date = data.date instanceof Timestamp 
        ? data.date.toDate().toISOString()
        : new Date(data.date).toISOString();
      
      return {
        id: doc.id,
        ...data,
        date
      };
    }) as SalesMetrics[];
  } catch (error) {
    handleFirebaseError(error, 'executeQuery');
    throw error;
  }
};

export const fetchMetricsByRegion = async (regionId: string): Promise<SalesMetrics[]> => {
  try {
    const metricsRef = getCollection('METRICS');
    const constraints = [orderBy('date', 'desc')];
    
    if (regionId !== 'all') {
      // Get all stores for this region first
      const storesRef = getCollection('STORES');
      const storesQuery = query(storesRef, where('regionId', '==', regionId));
      const storesSnapshot = await getDocs(storesQuery);
      
      // Get branch numbers for all stores in region
      const branchNumbers = storesSnapshot.docs.map(doc => doc.data().branchNumber);
      
      if (branchNumbers.length > 0) {
        constraints.push(where('branchNumber', 'in', branchNumbers));
      }
    }
    
    const metricsQuery = query(metricsRef, ...constraints);
      
    const metrics = await executeQuery(metricsQuery);
    
    logOperation('fetchMetricsByRegion', 'success', { count: metrics.length });
    return metrics;
  } catch (error) {
    logOperation('fetchMetricsByRegion', 'error', error);
    return []; // Return empty array on error for more graceful handling
  }
};

export const fetchMetricsByStore = async (branchNumbers: string[]): Promise<SalesMetrics[]> => {
  try {
    const metricsRef = getCollection('METRICS');
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

export const fetchMetricsByStaff = async (staffCode: string, branchNumbers: string[]): Promise<SalesMetrics[]> => {
  try {
    if (!staffCode || !branchNumbers.length) {
      logOperation('fetchMetricsByStaff', 'skip', 'Missing required parameters');
      return [];
    }

    const metricsRef = getCollection('METRICS');
    let metricsQuery;

    if (branchNumbers.length === 1) {
      metricsQuery = query(
        metricsRef,
        where('staffCode', '==', staffCode),
        where('branchNumber', '==', branchNumbers[0]),
        orderBy('date', 'desc')
      );
    } else {
      // For multiple branches, we need to fetch all staff metrics and filter by branch
      metricsQuery = query(
        metricsRef,
        where('staffCode', '==', staffCode),
        orderBy('date', 'desc')
      );
    }

    const metrics = await executeQuery(metricsQuery);
    
    // Filter by branch numbers if multiple branches
    const filteredMetrics = branchNumbers.length > 1 
      ? metrics.filter(m => branchNumbers.includes(m.branchNumber))
      : metrics;

    logOperation('fetchMetricsByStaff', 'success', { count: filteredMetrics.length });
    return filteredMetrics;
  } catch (error) {
    logOperation('fetchMetricsByStaff', 'error', error);
    throw error;
  }
};