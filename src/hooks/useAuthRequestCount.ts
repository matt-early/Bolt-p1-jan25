import { useState, useEffect } from 'react';
import { onSnapshot, query, collection, where } from 'firebase/firestore';
import { getDb } from '../services/firebase/db';
import { logOperation } from '../services/firebase/logging';
import { useAuth } from '../contexts/AuthContext';

export const useAuthRequestCount = () => {
  const [count, setCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { userProfile } = useAuth();

  useEffect(() => {
    // Only fetch count for admin users 
    if (userProfile?.role !== 'admin') {
      setLoading(false);
      setCount(0);
      return;
    }

    const db = getDb();
    const requestsRef = collection(db, 'authRequests');
    const pendingRequestsQuery = query(
      requestsRef,
      where('status', '==', 'pending')
    );

    const unsubscribe = onSnapshot(
      pendingRequestsQuery,
      (snapshot) => {
        setCount(snapshot.size);
        setLoading(false);
        setError(null);
      },
      (err) => {
        // Ignore permission errors for non-admin users
        if (err.code === 'permission-denied') {
          logOperation('useAuthRequestCount', 'info', 'Permission denied - non-admin user');
          setCount(0);
        } else {
          logOperation('useAuthRequestCount', 'error', err);
          setError('Failed to load request count');
        }
        setLoading(false);
      });

    return () => unsubscribe();
  }, [userProfile?.role]);

  return { count, loading, error };
};