import { getAuth, getDb } from '../firebase/db';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { getIdTokenResult, User, getIdToken } from 'firebase/auth';
import { logOperation } from '../firebase/logging';
import { AUTH_SETTINGS } from '../../config/auth-settings';
import type { UserProfile } from '../../types/auth';
import { getAuthSettings } from './settings';
import { initializeAdminUser } from './admin';
import { getCollection } from '../firebase/collections';

const AUTH_SETTINGS = getAuthSettings();

import { updateLastLogin } from './session/tracking';

const verifyAdminClaims = async (user: User): Promise<boolean> => {
  try {
    const tokenResult = await getIdTokenResult(user, true); // Force token refresh
    const hasAdminClaim = tokenResult.claims?.admin === true;
    if (!hasAdminClaim) {
      logOperation('verifyAdminClaims', 'warning', 'No admin claims found');
      return false;
    }
    return true;
  } catch (error) {
    logOperation('verifyAdminClaims', 'error', error);
    return false;
  }
};

const createAdminProfile = async (userId: string, email: string): Promise<UserProfile> => {
  const adminProfile: UserProfile = {
    id: userId,
    email: email,
    name: AUTH_SETTINGS.DEFAULT_ADMIN.NAME,
    role: AUTH_SETTINGS.DEFAULT_ADMIN.ROLE,
    staffCode: 'ADMIN',
    approved: true,
    createdAt: new Date().toISOString(),
    lastLoginAt: new Date().toISOString()
  };

  // Create/update admin profile in Firestore
  const userRef = doc(getCollection('USERS'), userId);
  await setDoc(userRef, adminProfile, { merge: true });
  
  logOperation('createAdminProfile', 'success', { userId });
  return adminProfile;
};

export const loadUserProfile = async (userId: string): Promise<UserProfile | null> => {
  try {
    // Validate inputs
    if (!userId) {
      logOperation('loadUserProfile', 'error', 'No user ID provided');
      return null;
    }

    const auth = getAuth();
    const currentUser = auth.currentUser;
    if (!currentUser) {
      logOperation('loadUserProfile', 'error', 'User not authenticated');
      return null;
    }

    // Check if user is default admin
    if (currentUser.email === AUTH_SETTINGS.DEFAULT_ADMIN.EMAIL) {
      return createAdminProfile(userId, currentUser.email);
    }

    // Load regular user profile
    const userRef = doc(getCollection('USERS'), userId);
    const userDoc = await getDoc(userRef);
    
    if (!userDoc.exists()) {
      // Check if this is an admin user that needs profile creation
      const tokenResult = await currentUser.getIdTokenResult(true);
      if (tokenResult.claims?.admin) {
        return createAdminProfile(userId, currentUser.email);
      } else {
        logOperation('loadUserProfile', 'warning', { message: 'User profile not found', userId });
      }
      return null;
    }

    const data = userDoc.data();
    
    // Update last login time
    const lastLoginUpdate = sessionStorage.getItem(`lastLoginUpdate_${userId}`);
    const now = new Date().toISOString();
    
    // Only update login time if more than 5 minutes have passed
    if (!lastLoginUpdate || new Date(now).getTime() - new Date(lastLoginUpdate).getTime() > 5 * 60 * 1000) {
      try {
        const timestamp = await updateLastLogin(userId, data.role || 'team_member');
        sessionStorage.setItem(`lastLoginUpdate_${userId}`, now);
        data.lastLoginAt = timestamp;
      } catch (error) {
        logOperation('loadUserProfile', 'warning', {
          message: 'Failed to update last login time',
          error
        });
        // Use current timestamp as fallback
        data.lastLoginAt = new Date().toISOString();
      }
    }

    const profile: UserProfile = {
      id: userId,
      ...data,
      email: currentUser.email || data.email,
      lastLoginAt: data.lastLoginAt || null
    };

    return profile;
  } catch (error) {
    if (error instanceof Error && error.code === 'permission-denied') {
      logOperation('loadUserProfile', 'error', { message: 'Permission denied accessing user profile', userId });
    } else {
      logOperation('loadUserProfile', 'error', { error, userId });
    }
    return null;
  }
};