import { 
  collection, 
  addDoc, 
  query, 
  orderBy, 
  limit, 
  getDocs,
  serverTimestamp
} from 'firebase/firestore';
import { getCollection } from './firebase/collections';
import { ImportHistoryEntry } from '../types/import';
import { logOperation } from './firebase/logging';

const MAX_HISTORY_ENTRIES = 7;

export const addImportHistory = async (data: Omit<ImportHistoryEntry, 'id' | 'timestamp'>) => {
  try {
    const historyRef = getCollection('IMPORT_HISTORY');
    await addDoc(historyRef, {
      ...data,
      timestamp: serverTimestamp()
    });
    logOperation('addImportHistory', 'success');
  } catch (error) {
    logOperation('addImportHistory', 'error', error);
    throw error;
  }
};

export const getRecentImports = async (): Promise<ImportHistoryEntry[]> => {
  try {
    const historyRef = getCollection('IMPORT_HISTORY');
    const q = query(
      historyRef,
      orderBy('timestamp', 'desc'),
      limit(MAX_HISTORY_ENTRIES)
    );

    const snapshot = await getDocs(q);
    const imports = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      timestamp: doc.data().timestamp?.toDate() || new Date()
    })) as ImportHistoryEntry[];

    logOperation('getRecentImports', 'success', { count: imports.length });
    return imports;
  } catch (error) {
    logOperation('getRecentImports', 'error', error);
    return []; // Return empty array on error
  }
};