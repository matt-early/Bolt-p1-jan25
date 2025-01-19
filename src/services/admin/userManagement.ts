import { collection, getDocs, doc, updateDoc, query, orderBy } from 'firebase/firestore';
import { getDb } from '../firebase/db';
import { UserProfile, UserRole } from '../../types/auth';
import { logOperation } from '../firebase/logging';
import { verifyAdminPermissions } from '../salespeople/permissions';
import { initializeAdminSDK } from '../auth/admin/init';
import { setUserRole } from '../auth/admin/roles';

export const fetchUsers = async (): Promise<UserProfile[]> => {
  try {
    const db = getDb();
    const usersRef = collection(db, 'users');
    const q = query(usersRef, orderBy('name'));
    const snapshot = await getDocs(q);

    const users = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      lastLoginAt: doc.data().lastLoginAt || null
    })) as UserProfile[];

    logOperation('fetchUsers', 'success', { count: users.length });
    return users;
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to fetch users';
    logOperation('fetchUsers', 'error', { error: message });
    throw new Error(message);
  }
};

export const updateUserRole = async (
  userId: string, 
  role: UserRole,
  regionId?: string
): Promise<void> => {
  try {
    // Verify admin permissions
    const hasPermission = await verifyAdminPermissions();
    if (!hasPermission) {
      throw new Error('Only administrators can update user roles');
    }

    // Initialize admin SDK
    const { adminAuth } = initializeAdminSDK();

    // Update custom claims
    await setUserRole(userId, role);

    const db = getDb();
    const userRef = doc(db, 'users', userId);
    
    const updateData: { role: UserRole; regionId?: string | null } = { role };
    
    // Add or remove regionId based on role
    if (role === 'regional') {
      if (!regionId) {
        throw new Error('Region ID is required for regional managers');
      }
      updateData.regionId = regionId;
    } else {
      updateData.regionId = null;
    }

    await updateDoc(userRef, updateData);
    logOperation('updateUserRole', 'success');
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to update user role';
    logOperation('updateUserRole', 'error', { error: message });
    throw new Error(message);
  }
};