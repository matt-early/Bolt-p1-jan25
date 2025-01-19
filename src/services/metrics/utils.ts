import { Query, DocumentData, getDocs } from 'firebase/firestore';
import { SalesMetrics } from '../../types';
import { handleFirebaseError } from '../firebase/error-handler';

export const executeQuery = async (q: Query<DocumentData>): Promise<SalesMetrics[]> => {
  try {
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      date: doc.data().date.toDate().toISOString()
    })) as SalesMetrics[];
  } catch (error) {
    handleFirebaseError(error, 'executeQuery');
    throw error;
  }
};