import { getAuth } from 'firebase-admin/auth';
import { UserRole } from '../../../types/auth';
import { logOperation } from '../../firebase/logging';
import { verifyUserRole } from '../admin/roles';

export const authorizeRole = async (uid: string, allowedRoles: UserRole[]) => {
  try {
    // Check each allowed role
    for (const role of allowedRoles) {
      const hasRole = await verifyUserRole(uid, role);
      if (hasRole) return true;
    }
    return false;
  } catch (error) {
    logOperation('authorizeRole', 'error', error);
    return false;
  }
};

export const requireRole = (requiredRole: UserRole) => {
  return async (uid: string) => {
    try {
      const hasRole = await verifyUserRole(uid, requiredRole);
      if (!hasRole) {
        throw new Error(`Requires ${requiredRole} role`);
      }
      return true;
    } catch (error) {
      logOperation('requireRole', 'error', error);
      throw error;
    }
  };
};