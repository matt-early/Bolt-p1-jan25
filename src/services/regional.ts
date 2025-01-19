import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../config/firebase';
import { Store, SalesMetrics } from '../types';
import { logOperation } from './firebase/logging';

export const fetchRegionalStores = async (regionId: string): Promise<Store[]> => {
  try {
    const storesRef = collection(db, 'stores');
    const q = query(storesRef, where('regionId', '==', regionId));
    const snapshot = await getDocs(q);
    
    const stores = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as Store[];

    logOperation('fetchRegionalStores', 'success');
    return stores;
  } catch (error) {
    logOperation('fetchRegionalStores', 'error', error);
    throw error;
  }
};

export const fetchRegionalMetrics = async (
  regionId: string,
  startDate: Date,
  endDate: Date
): Promise<SalesMetrics[]> => {
  try {
    const metricsRef = collection(db, 'metrics');
    const q = query(
      metricsRef,
      where('regionId', '==', regionId),
      where('date', '>=', startDate),
      where('date', '<=', endDate)
    );
    
    const snapshot = await getDocs(q);
    const metrics = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      date: doc.data().date.toDate().toISOString()
    })) as SalesMetrics[];

    logOperation('fetchRegionalMetrics', 'success');
    return metrics;
  } catch (error) {
    logOperation('fetchRegionalMetrics', 'error', error);
    throw error;
  }
};