import { 
  collection, 
  query, 
  where, 
  orderBy,
  QueryConstraint,
  Query,
  DocumentData 
} from 'firebase/firestore';
import { db } from '../../../../config/firebase';
import { handleFirebaseError, isIndexError } from './error-handler';

const METRICS_COLLECTION = 'metrics';

const createBaseQuery = () => {
  return collection(db, METRICS_COLLECTION);
};

const executeQuery = async (
  queryFn: () => Query<DocumentData>
): Promise<Query<DocumentData>> => {
  try {
    return queryFn();
  } catch (error) {
    const errorDetails = handleFirebaseError(error);
    
    if (isIndexError(errorDetails)) {
      throw new Error('Database indexes are being created. Please try again in a few minutes.');
    }
    
    throw new Error(errorDetails.message);
  }
};

export const createRegionMetricsQuery = (regionId: string) => 
  executeQuery(() => {
    const collectionRef = createBaseQuery();
    const constraints: QueryConstraint[] = [orderBy('date', 'desc')];
    
    if (regionId !== 'all') {
      constraints.unshift(where('regionId', '==', regionId));
    }
    
    return query(collectionRef, ...constraints);
  });

export const createStoreMetricsQuery = (branchNumber: string) => 
  executeQuery(() => {
    const collectionRef = createBaseQuery();
    const constraints: QueryConstraint[] = [
      where('branchNumber', '==', branchNumber),
      orderBy('date', 'desc')
    ];
    
    return query(collectionRef, ...constraints);
  });

export const createStaffMetricsQuery = (staffCode: string) => 
  executeQuery(() => {
    const collectionRef = createBaseQuery();
    const constraints: QueryConstraint[] = [
      where('staffCode', '==', staffCode),
      orderBy('date', 'desc')
    ];
    
    return query(collectionRef, ...constraints);
  });