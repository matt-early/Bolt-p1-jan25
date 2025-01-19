import {
  collection,
  query,
  orderBy,
  getDocs,
  doc,
  updateDoc,
  deleteDoc,
  where
} from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { getFunctions, httpsCallable, connectFunctionsEmulator } from 'firebase/functions';
import { logOperation } from './firebase/logging';
import type { UserProfile, UserRole } from '../types/auth'; 
import { getCollection } from './firebase/collections';
import { initializeAdminOperations } from './auth/admin/init';
import { AUTH_SETTINGS } from '../config/auth-settings';

export const findUserByEmail = async (email: string): Promise<UserProfile | null> => {
  try {
    const usersRef = getCollection('USERS');
    const q = query(usersRef, where('email', '==', email.toLowerCase()));
    const snapshot = await getDocs(q);
    
    if (snapshot.empty) {
      return null;
    }

    const userData = snapshot.docs[0];
    return {
      id: userData.id,
      ...userData.data()
    } as UserProfile;
  } catch (error) {
    logOperation('findUserByEmail', 'error', error);
    return null;
  }
};

export const fetchUsers = async (): Promise<UserProfile[]> => {
  try {
    const usersRef = getCollection('USERS');
    const q = query(usersRef, orderBy('name'));
    const querySnapshot = await getDocs(q);
    
    const users = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data() as UserProfile,
      lastLoginAt: doc.data().lastLoginAt || null
    })) as UserProfile[];

    logOperation('fetchUsers', 'success', { count: users.length });
    return users;
  } catch (error) {
    logOperation('fetchUsers', 'error', error);
    throw error; // Propagate error for admin operations
  }
};

export const updateUserRole = async (
  userId: string, 
  role: UserRole,
  regionId?: string
): Promise<void> => {
  try {
    const userRef = doc(getCollection('USERS'), userId);
    const updateData: { role: UserRole; regionId?: string | null } = { role };
    
    // Add or remove regionId based on role
    if (role === AUTH_SETTINGS.ROLES.REGIONAL) {
      if (!regionId) {
        throw new Error('Region ID is required for regional managers');
      }
      updateData.regionId = regionId;
    } else {
      // Remove regionId if role is not regional manager
      updateData.regionId = null;
    }
    
    await updateDoc(userRef, updateData);
  } catch (error) {
    logOperation('updateUserRole', 'error', error);
    throw error;
  }
};

export const deleteUser = async (userId: string): Promise<void> => {
  try {
    const userRef = doc(getCollection('USERS'), userId);
    await deleteDoc(userRef);
    logOperation('deleteUser', 'success');
  } catch (error) {
    logOperation('deleteUser', 'error', error);
    throw error;
  }
};

export const createUser = async (data: {
  email: string;
  password: string;
  name: string;
  role: UserRole;
  staffCode?: string;
  regionId?: string;
}): Promise<UserProfile> => {
  try {
    const auth = getAuth(); 
    const idToken = await auth.currentUser?.getIdToken(true);
    const functions = getFunctions();

    if (!idToken) {
      throw new Error('Not authenticated');
    }
    
    // Call Cloud Function
    const createUserFn = httpsCallable(functions, 'createUser');
    const response = await createUserFn({
      email: data.email.toLowerCase().trim(),
      password: data.password,
      name: data.name.trim(),
      role: data.role,
      staffCode: data.staffCode?.trim(),
      regionId: data.regionId
    }); 

    const { uid } = response.data as { uid: string };

    if (!uid) {
      throw new Error('No user ID returned');
    }

    const profile: UserProfile = {
      id: uid,
      email: data.email.toLowerCase().trim(),
      name: data.name.trim(),
      role: data.role,
      staffCode: data.staffCode?.trim(),
      regionId: data.regionId,
      approved: true,
      createdAt: new Date().toISOString()
    };

    logOperation('createUser', 'success');
    return profile;
  } catch (error: any) {
    logOperation('createUser', 'error', error);
    if (error?.code === 'functions/already-exists') {
      throw new Error('Email already exists');
    } else if (error?.code === 'functions/unauthenticated') {
      throw new Error('You must be logged in to perform this action');
    } else if (error?.code === 'functions/permission-denied') {
      throw new Error('You do not have permission to create users');
    }
    throw new Error(error?.message || 'Failed to create user. Please try again.');
  }
};