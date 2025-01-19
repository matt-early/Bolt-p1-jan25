import { collection, getDocs, query, where, DocumentData } from 'firebase/firestore';
import { db } from '../config/firebase';

export const testFirestoreConnection = async () => {
  try {
    const testCollection = collection(db, 'test');
    const testQuery = query(testCollection, where('message', '==', 'Test connection'));
    const querySnapshot = await getDocs(testQuery);
    
    console.log('Firestore connection test:', querySnapshot.empty ? 'No test documents' : 'Connected');
    return true;
  } catch (error) {
    console.error('Firestore connection test failed:', error);
    return false;
  }
};

export const logFirestoreOperation = (operation: string, data?: any) => {
  console.log(`Firestore ${operation}:`, data || '');
};