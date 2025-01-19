import { getDocs, query, where } from 'firebase/firestore';
import { FirebaseError } from 'firebase/app'; 
import { getCollection } from '../../firebase/collections';
import { logOperation } from '../../firebase/logging';

export interface UserRecordsCheck {
  users: boolean;
  sales: boolean;
  uid?: string;
}

export const checkUserRecords = async (email: string): Promise<UserRecordsCheck> => {
  try {
    const normalizedEmail = email.toLowerCase().trim();
    const usersRef = getCollection('USERS');
    const salesRef = getCollection('SALESPEOPLE');
    
    logOperation('checkUserRecords', 'checking', { email: normalizedEmail });

    // Check collections in parallel
    let userDocs, salesDocs;
    try {
      [userDocs, salesDocs] = await Promise.all([
        getDocs(query(usersRef, where('email', '==', normalizedEmail))),
        getDocs(query(salesRef, where('email', '==', normalizedEmail)))
      ]);
    } catch (error) {
      // Handle permission errors gracefully
      if (error instanceof FirebaseError && error.code === 'permission-denied') {
        logOperation('checkUserRecords', 'warning', 'Permission denied checking records');
        return { users: false, sales: false };
      }
      throw error;
    }

    // Get UID from existing record if available
    let uid;
    if (!userDocs.empty) {
      const userDoc = userDocs.docs[0];
      uid = userDoc.id;
      logOperation('checkUserRecords', 'found-user', { uid });
    } else if (!salesDocs.empty) {
      const salesDoc = salesDocs.docs[0];
      uid = salesDoc.id;
      logOperation('checkUserRecords', 'found-sales', { uid });
    }
    
    const result = {
      users: !userDocs.empty,
      sales: !salesDocs.empty,
      uid
    };

    logOperation('checkUserRecords', 'success', result);
    return result;
  } catch (error) {
    logOperation('checkUserRecords', 'error', error);
    return { users: false, sales: false }; // Return safe default on error
  }
};