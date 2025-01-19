import { getDocs } from 'firebase/firestore';
import { Store } from '../../types';
import { createStoreQuery } from './collections';
import { logOperation } from '../firebase/logging';

export const fetchStoresByRegion = async (regionId: string): Promise<Store[]> => {
  try {
    logOperation('fetchStoresByRegion', 'start', { regionId });
    
    const query = await createStoreQuery(regionId);
    const snapshot = await getDocs(query);
    
    const stores = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as Store[];
    
    logOperation('fetchStoresByRegion', 'success', { count: stores.length });
    return stores;
  } catch (error) {
    logOperation('fetchStoresByRegion', 'error', error);
    return []; // Return empty array instead of throwing
  }
};