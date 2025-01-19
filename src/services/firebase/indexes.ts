import { collection, query, where, orderBy, getDocs } from 'firebase/firestore';
import { getDb } from './db';
import { logOperation } from './logging';
import { LRUCache } from 'lru-cache';
import { delay } from './utils';

// Create index status cache
const indexCache = new LRUCache<string, boolean>({
  max: 100,
  ttl: 1000 * 60 * 5 // 5 minutes
});

// Define required indexes
const REQUIRED_INDEXES = [
  {
    id: 'auth-requests-status-date',
    collection: 'authRequests',
    fields: [
      { fieldPath: 'status', mode: 'ASCENDING' },
      { fieldPath: 'requestedAt', mode: 'DESCENDING' }
    ]
  },
  {
    id: 'metrics-region-date',
    collection: 'metrics',
    fields: [
      { fieldPath: 'regionId', mode: 'ASCENDING' },
      { fieldPath: 'date', mode: 'DESCENDING' }
    ]
  }
];

const checkIndex = async (index: typeof REQUIRED_INDEXES[0]): Promise<boolean> => {
  const cacheKey = `index-${index.id}`;
  
  // Check cache first
  if (indexCache.get(cacheKey)) return true;

  try {
    const db = getDb();
    const collectionRef = collection(db, index.collection);
    
    // Build query constraints
    const constraints = index.fields.map(field => {
      if (field.mode === 'ASCENDING') {
        return where(field.fieldPath, '>=', '');
      }
      return orderBy(field.fieldPath, field.mode === 'ASCENDING' ? 'asc' : 'desc');
    });

    // Test query
    const q = query(collectionRef, ...constraints);
    await getDocs(q);
    
    // Cache success
    indexCache.set(cacheKey, true);
    return true;
  } catch (error: any) {
    // Handle permission denied gracefully
    if (error.code === 'permission-denied') {
      logOperation('checkIndex', 'warning', {
        message: 'Permission denied checking index',
        index: index.id
      });
      return false;
    }
    
    // Return false for index not ready
    if (error.code === 'failed-precondition' && error.message.includes('indexes')) {
      return false;
    }
    
    throw error;
  }
};

export const waitForIndexes = async () => {
  // Don't block on index initialization
  // Just check once and return
  try {
    const results = await Promise.allSettled(
      REQUIRED_INDEXES.map(index => checkIndex(index))
    );
    
    // Log results but don't fail
    results.forEach((result, i) => {
      const index = REQUIRED_INDEXES[i];
      if (result.status === 'rejected') {
        logOperation('waitForIndexes', 'warning', {
          index: index.id,
          error: result.reason
        });
      }
    });
  } catch (error) {
    logOperation('waitForIndexes', 'error', error);
  }
  
  // Always resolve - don't block app startup
  return Promise.resolve();
};