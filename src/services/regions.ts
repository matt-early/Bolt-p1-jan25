import { doc, addDoc, updateDoc, deleteDoc, getDocs, serverTimestamp, query, orderBy } from 'firebase/firestore';
import { getCollection, logOperation } from './firebase';
import { Region } from '../types';

export const fetchRegions = async (): Promise<Region[]> => {
  try {
    const regionsRef = getCollection('REGIONS');
    const q = query(regionsRef, orderBy('name'));
    
    const querySnapshot = await getDocs(q);
    
    const regions = querySnapshot.docs.map(doc => ({
      id: doc.id,
      name: String(doc.data().name || '').trim(),
      createdAt: doc.data().createdAt?.toDate()?.toISOString() || new Date().toISOString()
    })) as Region[];

    logOperation('fetchRegions', 'success');
    return regions.filter(r => r.name); // Only return regions with names
  } catch (error) {
    // Handle permission denied gracefully
    if (error?.code === 'permission-denied') {
      logOperation('fetchRegions', 'warning', 'Permission denied accessing regions');
      return [];
    }
    logOperation('fetchRegions', 'error', error);
    return []; // Return empty array on error
  }
};

export const createRegion = async (data: Omit<Region, 'id'>): Promise<string> => {
  try {
    const regionsRef = getCollection('REGIONS');
    const docRef = await addDoc(regionsRef, {
      ...data,
      createdAt: serverTimestamp()
    });
    
    logOperation('createRegion', 'success');
    return docRef.id;
  } catch (error) {
    logOperation('createRegion', 'error', error);
    throw error;
  }
};

export const updateRegion = async (id: string, data: Partial<Region>): Promise<void> => {
  try {
    const regionRef = doc(getCollection('REGIONS'), id);
    await updateDoc(regionRef, {
      ...data,
      updatedAt: serverTimestamp()
    });
    
    logOperation('updateRegion', 'success');
  } catch (error) {
    logOperation('updateRegion', 'error', error);
    throw error;
  }
};

export const deleteRegion = async (id: string): Promise<void> => {
  try {
    const regionRef = doc(getCollection('REGIONS'), id);
    await deleteDoc(regionRef);
    
    logOperation('deleteRegion', 'success');
  } catch (error) {
    logOperation('deleteRegion', 'error', error);
    throw error;
  }
};