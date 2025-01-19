import { doc, getDoc, updateDoc, Timestamp } from 'firebase/firestore';
import { getDb } from '../../firebase/db';
import { logOperation } from '../../firebase/logging';
import { UserRole } from '../../../types/auth';

export const updateLastLogin = async (userId: string, role: UserRole): Promise<string | null> => {
  try {
    const db = getDb();
    if (!db) throw new Error('Firestore not initialized');

    // Update user document
    const userRef = doc(db, 'users', userId);
    const userDoc = await getDoc(userRef);
    
    try {
      const now = new Date();
      const timestamp = Timestamp.fromDate(now);

      if (userDoc.exists()) {
        await updateDoc(userRef, {
          lastLoginAt: timestamp,
          updatedAt: timestamp
        });
      }

      logOperation('updateLastLogin', 'success', { 
        userId, 
        role,
        timestamp: now.toISOString()
      });
      
      return now.toISOString();
    } catch (error) {
      // Handle permission denied errors gracefully
      if (error.code === 'permission-denied') {
        logOperation('updateLastLogin', 'info', 'Permission denied - skipping update');
        return null;
      }
      
      logOperation('updateLastLogin', 'error', {
        error,
        userId,
        role
      });
      return null;
    }
  } catch (error) {
    logOperation('updateLastLogin', 'error', { 
      error,
      userId,
      role 
    });
    return null;
  }
};