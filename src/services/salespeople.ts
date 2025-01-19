import { 
  collection,
  doc,
  addDoc, 
  updateDoc,
  deleteDoc,
  getDocs,
  serverTimestamp,
  query, 
  orderBy,
  limit
} from 'firebase/firestore';
import { getCollection, COLLECTION_NAMES } from './firebase';
import { UserProfile } from '../types/auth';
import { logOperation } from './firebase/logging';
import { Store } from '../types';
import { getAuth } from 'firebase/auth';
import { verifyAdminPermissions } from './salespeople/permissions';
import { validateTeamMemberData } from './salespeople/validation';
import { TEAM_MEMBER_ERROR_MESSAGES } from './salespeople/errors';

export const fetchSalespeople = async (): Promise<UserProfile[]> => {
  try {
    const auth = getAuth();
    if (!auth.currentUser) {
      logOperation('fetchSalespeople', 'error', 'User not authenticated');
      return [];
    }

    const salesRef = getCollection('SALESPEOPLE');
    if (!salesRef) {
      logOperation('fetchSalespeople', 'error', 'Failed to get salespeople collection');
      return [];
    }

    const q = query(salesRef, limit(100));
    const querySnapshot = await getDocs(q);
    
    const storesRef = getCollection('STORES');
    if (!storesRef) {
      logOperation('fetchSalespeople', 'error', 'Failed to get stores collection');
      return [];
    }

    const storesQuery = query(storesRef, limit(100));
    const storesSnapshot = await getDocs(storesQuery);
    
    // Create a map of store IDs to branch numbers for efficient lookup
    const storeBranchMap = new Map(
      storesSnapshot.docs.map(doc => [
        doc.id, 
        (doc.data() as Store).branchNumber
      ])
    );
    
    const salespeople = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as UserProfile[];

    // Sort by primary store's branch number (numerically), then by name
    const sortedSalespeople = salespeople.sort((a, b) => {
      const branchA = storeBranchMap.get(a.primaryStoreId) || '';
      const branchB = storeBranchMap.get(b.primaryStoreId) || '';
      
      // Compare branch numbers numerically
      const branchCompare = branchA.localeCompare(branchB, undefined, { numeric: true });
      
      // If branch numbers are different, use that order
      if (branchCompare !== 0) {
        return branchCompare;
      }
      
      // If same branch, sort by name
      return a.name.localeCompare(b.name);
    });

    logOperation('fetchSalespeople', 'success');
    return sortedSalespeople;
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to fetch team members';
    logOperation('fetchSalespeople', 'error', { error: message });
    return []; // Return empty array instead of throwing to prevent UI crashes
  }
};

export const createSalesperson = async (data: Omit<UserProfile, 'id'>): Promise<string> => {
  try {
    // Verify admin permissions
    const hasPermission = await verifyAdminPermissions();
    if (!hasPermission) {
      throw new Error(TEAM_MEMBER_ERROR_MESSAGES.UNAUTHORIZED);
    }

    // Validate input data
    const validation = validateTeamMemberData(data);
    if (!validation.isValid) {
      throw new Error(`${TEAM_MEMBER_ERROR_MESSAGES.INVALID_DATA}: ${validation.errors.join(', ')}`);
    }

    const salesRef = getCollection('SALESPEOPLE');
    if (!salesRef) {
      throw new Error(TEAM_MEMBER_ERROR_MESSAGES.COLLECTION_ERROR);
    }

    // Ensure clean data structure
    const docData = {
      name: data.name.trim(),
      email: data.email.trim().toLowerCase(),
      staffCode: data.staffCode.trim(),
      storeIds: data.storeIds || [],
      primaryStoreId: data.primaryStoreId,
      role: 'salesperson',
      approved: true,
      createdAt: serverTimestamp(),
      createdBy: getAuth().currentUser?.uid
    };
    
    const docRef = await addDoc(salesRef, docData);
    logOperation('createSalesperson', 'success');
    return docRef.id;
  } catch (error) {
    const message = error instanceof Error ? error.message : TEAM_MEMBER_ERROR_MESSAGES.CREATE_ERROR;
    logOperation('createSalesperson', 'error', { error: message });
    throw new Error(message);
  }
};

export const updateSalesperson = async (id: string, data: Partial<UserProfile>): Promise<void> => {
  try {
    const salesRef = doc(getCollection('SALESPEOPLE'), id);
    // Clean and validate update data
    const updateData = {
      ...(data.name && { name: data.name.trim() }),
      ...(data.email && { email: data.email.trim().toLowerCase() }),
      ...(data.staffCode && { staffCode: data.staffCode.trim() }),
      ...(Array.isArray(data.storeIds) && { storeIds: data.storeIds }),
      ...(data.primaryStoreId && { primaryStoreId: data.primaryStoreId }),
      updatedAt: serverTimestamp()
    };
    
    await updateDoc(salesRef, updateData);
    logOperation('updateSalesperson', 'success');
  } catch (error) {
    logOperation('updateSalesperson', 'error', error);
    throw error;
  }
};

export const deleteSalesperson = async (id: string): Promise<void> => {
  try {
    const salesRef = doc(getCollection('SALESPEOPLE'), id);
    await deleteDoc(salesRef);
    logOperation('deleteSalesperson', 'success');
  } catch (error) {
    logOperation('deleteSalesperson', 'error', error);
    throw error;
  }
};