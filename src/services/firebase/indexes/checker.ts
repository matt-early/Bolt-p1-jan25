import { collection, query, where, orderBy, getDocs } from 'firebase/firestore';
import { getDb } from '../db';
import { logOperation } from '../logging';
import { FirebaseIndex } from './types';
import { indexCache } from './cache';
import { delay } from '../utils';

export const checkIndex = async (
  index: FirebaseIndex,
  retryCount = 0,
  maxRetries = 2
): Promise<boolean> => {
  const cacheKey = `index-${index.id}`;
  
  // Check cache first
  const cached = indexCache.get(cacheKey);
  if (cached) return true;

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
    if (error.code === 'failed-precondition' && error.message.includes('indexes')) {
      // If we haven't exceeded max retries, wait and try again
      if (retryCount < maxRetries) {
        await delay(1000 * Math.pow(2, retryCount));
        return checkIndex(index, retryCount + 1, maxRetries);
      }
      return false;
    }
    
    // Don't retry permission denied errors
    if (error.code === 'permission-denied') {
      throw error;
    }
    
    logOperation('checkIndex', 'error', { index: index.id, error });
    throw error;
  }
};