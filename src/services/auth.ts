import { 
  collection,
  doc,
  getDoc,
  where,
  getDocs,
  setDoc,
  addDoc,
  Timestamp,
  serverTimestamp,
  writeBatch
} from 'firebase/firestore';
import { 
  createUserWithEmailAndPassword, 
  fetchSignInMethodsForEmail,
  getIdTokenResult,
  signInWithEmailAndPassword
} from 'firebase/auth';
import { FirebaseError } from 'firebase/app';
import { getAuth, getDb } from './firebase/db';
import { UserProfile, AuthRequest, UserRole, ROLE_MAPPING } from '../types/auth';
import { logOperation } from './firebase/logging';
import { fetchPendingRequests, updateRequestStatus } from './auth/requests';
import { approveAuthRequest } from './auth/approval';

// Re-export auth functions
export * from './auth/signIn';
export * from './auth/passwordReset';
export { approveAuthRequest };

export const createAuthRequest = async (params: {
  email: string;
  name: string;
  staffCode: string;
  storeIds: string[];
  primaryStoreId: string;
  role: UserRole;
  status: 'pending';
  requestedAt: string;
}): Promise<void> => {
  try {
    const db = getDb();
    const requestsRef = collection(db, 'authRequests');
    await addDoc(requestsRef, {
      ...params,
      requestedAt: Timestamp.now()
    });
    logOperation('createAuthRequest', 'success');
  } catch (error) {
    logOperation('createAuthRequest', 'error', error);
    throw error;
  }
};

export const fetchPendingAuthRequests = async (): Promise<AuthRequest[]> => {
  return fetchPendingRequests();
};

export const rejectAuthRequest = async (
  requestId: string,
  reviewerId: string,
  reason: string
): Promise<void> => {
  try {
    await updateRequestStatus(requestId, 'rejected', reviewerId, reason);
    logOperation('rejectAuthRequest', 'success');
  } catch (error) {
    logOperation('rejectAuthRequest', 'error', error);
    throw error;
  }
};