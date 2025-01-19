import { getAuth } from 'firebase/auth';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { getDb } from '../../firebase/db';
import { logOperation } from '../../firebase/logging';
import { AUTH_SETTINGS } from '../../../config/auth-settings';
import { retry } from '../../firebase/retry';
import { UserRole } from '../../../types/auth';

export const setUserRole = async (uid: string, role: UserRole): Promise<void> => {
  try {
    const auth = getAuth();
    const currentUser = auth.currentUser;
    
    if (!currentUser) {
      throw new Error('No authenticated user');
    }

    // Force token refresh
    await retry(
      () => currentUser.getIdToken(true),
      { operation: 'setUserRole.getIdToken' }
    );

    // Update Firestore role
    const db = getDb();
    const userRef = doc(db, 'users', uid);
    await updateDoc(userRef, {
      role,
      updatedAt: new Date().toISOString()
    });

    logOperation('setUserRole', 'success', { uid, role });
  } catch (error) {
    logOperation('setUserRole', 'error', error);
    throw error;
  }
};

export const verifyUserRole = async (uid: string, requiredRole: UserRole): Promise<boolean> => {
  try {
    const auth = getAuth();
    const currentUser = auth.currentUser;
    
    if (!currentUser) {
      logOperation('verifyUserRole', 'error', 'No authenticated user');
      return false;
    }

    // Get fresh token with claims
    const tokenResult = await retry(
      () => currentUser.getIdTokenResult(true),
      { operation: 'verifyUserRole.getIdToken' }
    );

    // Admin has access to everything
    if (tokenResult.claims?.admin === true) {
      logOperation('verifyUserRole', 'success', { reason: 'admin claim' });
      return true;
    }

    // Check specific role
    if (tokenResult.claims?.role === requiredRole) {
      logOperation('verifyUserRole', 'success', { reason: 'matching role' });
      return true;
    }

    // Regional managers can access team member resources
    if (tokenResult.claims?.role === AUTH_SETTINGS.ROLES.REGIONAL && 
        requiredRole === AUTH_SETTINGS.ROLES.TEAM_MEMBER) {
      logOperation('verifyUserRole', 'success', { reason: 'regional access to team member' });
      return true;
    }

    // Check Firestore role as fallback
    const db = getDb();
    const userRef = doc(db, 'users', uid);
    const userDoc = await getDoc(userRef);
    
    if (!userDoc.exists()) {
      logOperation('verifyUserRole', 'error', 'User document not found');
      return false;
    }

    const userRole = userDoc.data()?.role;
    const hasRole = userRole === requiredRole || 
                   (userRole === 'admin') ||
                   (userRole === 'regional' && requiredRole === 'team_member');

    logOperation('verifyUserRole', hasRole ? 'success' : 'error', {
      userRole,
      requiredRole,
      hasRole
    });

    return hasRole;
  } catch (error) {
    logOperation('verifyUserRole', 'error', error);
    return false;
  }
};