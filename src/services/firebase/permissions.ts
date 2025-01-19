import { collection, getDocs } from 'firebase/firestore';
import { getDb } from './db';
import { logOperation } from './logging';
import { AUTH_SETTINGS } from '../../config/auth-settings';

export const validatePermissions = async (userId?: string) => {
  try {
    const db = getDb();
    
    // For default admin, skip validation
    if (userId && userId === AUTH_SETTINGS.DEFAULT_ADMIN.EMAIL) {
      return true;
    }
    
    // Test read access on users collection
    const usersRef = collection(db, 'users');
    await getDocs(usersRef);
    
    logOperation('validatePermissions', 'success');
    return true;
  } catch (error: any) {
    if (error.code === 'permission-denied') {
      logOperation('validatePermissions', 'warning', {
        message: 'Limited permissions detected',
        userId
      });
      return false;
    }
    
    logOperation('validatePermissions', 'error', error);
    return false;
  }
};