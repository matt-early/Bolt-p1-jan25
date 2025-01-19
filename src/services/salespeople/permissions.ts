import { getAuth } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { getDb } from '../firebase/db';
import { logOperation } from '../firebase/logging';

export const verifyAdminPermissions = async (): Promise<boolean> => {
  try {
    const auth = getAuth();
    const user = auth.currentUser;
    
    if (!user) {
      logOperation('verifyAdminPermissions', 'error', 'No authenticated user');
      return false;
    }

    // Check custom claims
    const tokenResult = await user.getIdTokenResult(true);
    if (tokenResult.claims.admin === true) {
      return true;
    }

    // Check Firestore role
    const db = getDb();
    const userDoc = await getDoc(doc(db, 'users', user.uid));
    return userDoc.data()?.role === 'admin';
  } catch (error) {
    logOperation('verifyAdminPermissions', 'error', error);
    return false;
  }
};