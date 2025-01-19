import { collection, getDocs } from 'firebase/firestore';
import { db } from '../config/firebase';
import { logOperation } from './firebase/logging';

const REQUIRED_COLLECTIONS = ['stores', 'salespeople', 'regions', 'metrics'];

export const initializeCollections = async () => {
  try {
    logOperation('initializeCollections', 'start');
    
    // Test connection by attempting to read from each collection
    for (const collectionName of REQUIRED_COLLECTIONS) {
      try {
        const collectionRef = collection(db, collectionName);
        await getDocs(collectionRef);
        logOperation(`collection-check-${collectionName}`, 'success');
      } catch (error) {
        logOperation(`collection-check-${collectionName}`, 'error', error);
        console.error(`Error checking collection ${collectionName}:`, error);
        return false;
      }
    }
    
    logOperation('initializeCollections', 'success');
    return true;
  } catch (error) {
    logOperation('initializeCollections', 'error', error);
    console.error('Error initializing collections:', error);
    return false;
  }
};