import { collection, doc, addDoc, updateDoc, deleteDoc, getDocs, query, where, serverTimestamp, orderBy, limit } from 'firebase/firestore';
import { getCollection } from './firebase';
import { logOperation } from './firebase/logging';
import { Store } from '../types';

export const fetchStores = async (): Promise<Store[]> => {
  try {
    const storesRef = getCollection('STORES');
    
    // Get stores with region and branch number ordering
    const storesQuery = query(
      storesRef,
      orderBy('regionId'),
      orderBy('branchNumber')
    );

    const storesSnapshot = await getDocs(storesQuery);
    
    let stores = storesSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      regionId: doc.data().regionId || '',
      branchNumber: doc.data().branchNumber || ''
    })) as Store[];

    // Sort stores by branch number
    stores = stores.sort((a, b) => 
      a.branchNumber.localeCompare(b.branchNumber, undefined, { numeric: true })
    );
    logOperation('fetchStores', 'success');
    return stores;
  } catch (error) {
    // Handle permission denied gracefully
    if (error?.code === 'permission-denied') {
      logOperation('fetchStores', 'warning', 'Permission denied accessing stores');
      return [];
    }
    logOperation('fetchStores', 'error', error);
    return []; // Return empty array on error
  }
};

export const fetchStoresByRegion = async (regionId: string): Promise<Store[]> => {
  try {
    const storesRef = getCollection('STORES');
    const regionsRef = getCollection('REGIONS');
    
    const constraints = [orderBy('branchNumber'), limit(100)];
    
    if (regionId !== 'all') {
      constraints.unshift(where('regionId', '==', regionId));
    }
    
    const storesQuery = query(storesRef, ...constraints);
    const regionsQuery = query(regionsRef, orderBy('name'));
    
    // Execute both queries in parallel
    const [storesSnapshot, regionsSnapshot] = await Promise.all([
      getDocs(storesQuery),
      getDocs(regionsQuery)
    ]);
    
    // Build region name map
    const regionMap = new Map(
      regionsSnapshot.docs.map(doc => [
        doc.id,
        doc.data().name
      ])
    );
    
    const stores = storesSnapshot.docs.map(doc => {
      const data = doc.data();
      const regionName = regionMap.get(data.regionId);
      
      return {
        id: doc.id,
        ...data,
        regionName: regionName || 'Unknown Region'
      };
    }) as Store[];

    logOperation('fetchStoresByRegion', 'success', { count: stores.length });
    return stores;
  } catch (error) {
    logOperation('fetchStoresByRegion', 'error', error);
    return []; // Return empty array on error
  }
};

export const createStore = async (data: Omit<Store, 'id'>): Promise<string> => {
  try {
    const storesRef = getCollection('STORES');
    const docRef = await addDoc(storesRef, {
      ...data,
      createdAt: serverTimestamp()
    });
    
    logOperation('createStore', 'success');
    return docRef.id;
  } catch (error) {
    logOperation('createStore', 'error', error);
    throw error;
  }
};

export const updateStore = async (id: string, data: Partial<Store>): Promise<void> => {
  try {
    const storeRef = doc(getCollection('STORES'), id);
    await updateDoc(storeRef, {
      ...data,
      updatedAt: serverTimestamp()
    });
    
    logOperation('updateStore', 'success');
  } catch (error) {
    logOperation('updateStore', 'error', error);
    throw error;
  }
};

export const deleteStore = async (id: string): Promise<void> => {
  try {
    const storeRef = doc(getCollection('STORES'), id);
    await deleteDoc(storeRef);
    
    logOperation('deleteStore', 'success');
  } catch (error) {
    logOperation('deleteStore', 'error', error);
    throw error;
  }
};