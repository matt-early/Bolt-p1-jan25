import { doc, updateDoc, deleteDoc } from 'firebase/firestore';
import { getAuth, sendPasswordResetEmail, deleteUser as deleteAuthUser } from 'firebase/auth';
import { getDb } from '../firebase/db';
import { getCollection } from '../firebase/collections';
import { logOperation } from '../firebase/logging';
import { UserProfile } from '../../types/auth';
import { initializeAdminSDK } from '../auth/admin/init';
import { setUserRole } from '../auth/admin/roles';

export const resetUserPassword = async (email: string): Promise<void> => {
  try {
    const auth = getAuth();
    await sendPasswordResetEmail(auth, email);
    logOperation('resetUserPassword', 'success');
  } catch (error) {
    logOperation('resetUserPassword', 'error', error);
    throw new Error('Failed to send password reset email');
  }
};

export const disableUser = async (userId: string): Promise<void> => {
  try {
    const { auth } = initializeAdminSDK();
    const currentUser = auth.currentUser;
    if (!currentUser) {
      throw new Error('Not authenticated');
    }

    const db = getDb();
    const userRef = doc(db, 'users', userId);
    const timestamp = new Date().toISOString();

    await updateDoc(userRef, {
      disabled: true,
      disabledAt: timestamp,
      disabledBy: currentUser.uid
    });

    logOperation('disableUser', 'success');
  } catch (error) {
    logOperation('disableUser', 'error', error);
    throw new Error('Failed to disable user');
  }
};

export const enableUser = async (userId: string): Promise<void> => {
  try {
    const { auth } = initializeAdminSDK();
    const currentUser = auth.currentUser;
    if (!currentUser) {
      throw new Error('Not authenticated');
    }

    const db = getDb();
    const userRef = doc(db, 'users', userId);
    const timestamp = new Date().toISOString();

    await updateDoc(userRef, {
      disabled: false,
      enabledAt: timestamp,
      enabledBy: currentUser.uid,
      disabledAt: null,
      disabledBy: null
    });

    logOperation('enableUser', 'success');
  } catch (error) {
    logOperation('enableUser', 'error', error);
    throw new Error('Failed to enable user');
  }
};

export const deleteUser = async (userId: string): Promise<void> => {
  try {
    const { auth } = initializeAdminSDK();
    const currentUser = auth.currentUser;
    if (!currentUser) {
      throw new Error('Not authenticated');
    }

    const db = getDb();
    const userRef = doc(db, 'users', userId);
    await deleteDoc(userRef);

    logOperation('deleteUser', 'success');
  } catch (error) {
    logOperation('deleteUser', 'error', error);
    throw new Error('Failed to delete user');
  }
};