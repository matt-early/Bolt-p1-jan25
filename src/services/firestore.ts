import { 
  collection,
  query,
  where,
  getDocs,
  addDoc,
  Timestamp,
  orderBy,
  limit,
  doc,
  setDoc,
  serverTimestamp
} from 'firebase/firestore';
import { db } from '../config/firebase';
import { SalesMetrics, RankingDetails } from '../types';

// Helper function to handle Firestore errors
const handleFirestoreError = (error: any, operation: string) => {
  console.error(`Firestore ${operation} error:`, error);
  throw error;
};

export const addTestDocument = async () => {
  try {
    const testRef = collection(db, 'test');
    const result = await addDoc(testRef, {
      message: 'Test connection',
      timestamp: serverTimestamp()
    });
    console.log('Test document written with ID:', result.id);
    return result.id;
  } catch (error) {
    handleFirestoreError(error, 'addTestDocument');
  }
};

export const fetchUserMetrics = async (userId: string, startDate: Date, endDate: Date) => {
  try {
    console.log('Fetching metrics for user:', userId);
    const metricsRef = collection(db, 'metrics');
    const q = query(
      metricsRef,
      where('userId', '==', userId),
      where('date', '>=', Timestamp.fromDate(startDate)),
      where('date', '<=', Timestamp.fromDate(endDate)),
      orderBy('date', 'desc')
    );

    const querySnapshot = await getDocs(q);
    console.log('Fetched metrics count:', querySnapshot.size);
    
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      date: doc.data().date.toDate().toISOString()
    })) as SalesMetrics[];
  } catch (error) {
    handleFirestoreError(error, 'fetchUserMetrics');
    return [];
  }
};

export const addMetrics = async (userId: string, metrics: Omit<SalesMetrics, 'date'>) => {
  try {
    console.log('Adding metrics for user:', userId);
    const metricsRef = collection(db, 'metrics');
    const docData = {
      ...metrics,
      userId,
      date: serverTimestamp(),
      createdAt: serverTimestamp()
    };
    
    const docRef = await addDoc(metricsRef, docData);
    console.log('Metrics added with ID:', docRef.id);
    return docRef.id;
  } catch (error) {
    handleFirestoreError(error, 'addMetrics');
  }
};

export const fetchStoreRankings = async (storeId: string) => {
  try {
    console.log('Fetching rankings for store:', storeId);
    const rankingsRef = collection(db, 'storeRankings');
    const q = query(
      rankingsRef,
      where('storeId', '==', storeId),
      orderBy('rank'),
      limit(10)
    );

    const querySnapshot = await getDocs(q);
    console.log('Fetched rankings count:', querySnapshot.size);
    
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as RankingDetails[];
  } catch (error) {
    handleFirestoreError(error, 'fetchStoreRankings');
    return [];
  }
};