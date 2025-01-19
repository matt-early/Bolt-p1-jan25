import { 
  collection, 
  query, 
  where, 
  orderBy,
  QueryConstraint,
  Query,
  DocumentData 
} from 'firebase/firestore';
import { getDb } from '../firebase/db';
import { logOperation } from '../firebase/logging';
import { handleFirebaseError } from '../firebase/error-handler';

const METRICS_COLLECTION = 'metrics';

interface StoreQueryOptions {
  branchNumbers: string[];
}

const createBaseQuery = async () => {
  try {
    const db = await getDb();
    const collectionRef = collection(db, METRICS_COLLECTION);
    logOperation('createBaseQuery', 'success');
    return collectionRef;
  } catch (error) {
    const errorDetails = handleFirebaseError(error, 'createBaseQuery');
    throw new Error(errorDetails.message);
  }
};

export const createStoreMetricsQuery = async (options: StoreQueryOptions): Promise<Query<DocumentData>> => {
  try {
    const collectionRef = await createBaseQuery();
    const constraints: QueryConstraint[] = [];

    if (options.branchNumbers.length === 1) {
      // Single store query
      constraints.push(where('branchNumber', '==', options.branchNumbers[0]));
    } else if (options.branchNumbers.length > 1) {
      // Multiple stores query
      constraints.push(where('branchNumber', 'in', options.branchNumbers));
    }

    // Always order by date descending
    constraints.push(orderBy('date', 'desc'));

    logOperation('createStoreMetricsQuery', 'success', { 
      storeCount: options.branchNumbers.length 
    });

    return query(collectionRef, ...constraints);
  } catch (error) {
    logOperation('createStoreMetricsQuery', 'error', error);
    throw error;
  }
};

export const createRegionMetricsQuery = async (regionId: string | null): Promise<Query<DocumentData>> => {
  try {
    const collectionRef = await createBaseQuery();
    const constraints: QueryConstraint[] = [
      orderBy('date', 'desc')
    ];
    
    // Only add regionId filter if provided and not 'all'
    if (regionId && regionId !== 'all') {
      constraints.push(where('regionId', '==', regionId));
      // When filtering by region, we need to use the composite index
      constraints.push(orderBy('regionId', 'asc'));
    }
    
    logOperation('createRegionMetricsQuery', 'success', { regionId });
    const queryRef = query(collectionRef, ...constraints);
    return queryRef;
  } catch (error) {
    logOperation('createRegionMetricsQuery', 'error', error);
    throw error;
  }
};