import { 
  collection,
  doc,
  query,
  where,
  getDocs,
  setDoc,
  serverTimestamp,
  orderBy
} from 'firebase/firestore';
import { getAuth, getDb } from '../firebase/db';
import { logOperation } from '../firebase/logging';
import { AuthRequest } from '../../types/auth';
import { retry } from '../firebase/utils';

export const fetchPendingRequests = async (): Promise<AuthRequest[]> => {
  try {
    const db = getDb();
    const requestsRef = collection(db, 'authRequests');

    // Try composite query first
    try {
      const q = query(
        requestsRef,
        where('status', '==', 'pending'),
        orderBy('requestedAt', 'desc')
      );
      
      const snapshot = await getDocs(q);
      const requests = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as AuthRequest[];

      logOperation('fetchPendingRequests', 'success', { count: requests.length });
      return requests;
    } catch (error: any) {
      // If index error, fall back to client-side filtering
      if (error.code === 'failed-precondition' && error.message?.includes('indexes')) {
        logOperation('fetchPendingRequests', 'warning', 'Falling back to client-side filtering');
        
        // Get all requests and filter client-side
        const snapshot = await getDocs(requestsRef);
        const requests = snapshot.docs
          .map(doc => ({
            id: doc.id,
            ...doc.data()
          }))
          .filter(req => req.status === 'pending')
          .sort((a, b) => b.requestedAt.seconds - a.requestedAt.seconds) as AuthRequest[];

        return requests;
      }
      throw error;
    }
  } catch (error) {
    logOperation('fetchPendingRequests', 'error', error);
    throw error;
  }
};

export const updateRequestStatus = async (
  requestId: string,
  status: 'approved' | 'rejected',
  reviewerId: string,
  reason?: string
): Promise<void> => {
  try {
    const db = getDb();
    const requestRef = doc(db, 'authRequests', requestId);

    await retry(async () => {
      await setDoc(requestRef, {
        status,
        reviewedBy: reviewerId,
        reviewedAt: serverTimestamp(),
        ...(reason && { rejectionReason: reason })
      }, { merge: true });
    });

    logOperation('updateRequestStatus', 'success', { requestId, status });
  } catch (error) {
    logOperation('updateRequestStatus', 'error', error);
    throw error;
  }
};