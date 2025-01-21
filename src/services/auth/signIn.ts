import { signInWithEmailAndPassword, type AuthError as FirebaseAuthError } from 'firebase/auth';
import { doc, getDoc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { getAuth } from '../firebase/db';
import { AUTH_SETTINGS } from '../../config/auth-settings';
import { logOperation } from '../firebase/logging';
import { retryAuthOperation } from './retry';
import { handleAuthNetworkError } from './network';
import { getDb } from '../firebase/db';
import { AUTH_ERROR_MESSAGES, AuthError } from './errors';
import { UserProfile, ROLE_MAPPING } from '../../types/auth';
import { loadUserProfile } from './init';
import { FirebaseError } from 'firebase/app';

interface SignInResult {
  user: User;
  profile: UserProfile;
  role: string;
  redirectPath: string;
}

export const signIn = async (email: string, password: string): Promise<SignInResult> => {
  try {
    logOperation('signIn', 'start');
    
    // Wait for Firebase initialization
    const auth = getAuth();
    if (!auth) {
      throw new Error(AUTH_ERROR_MESSAGES['auth/service-unavailable']);
    }

    if (!email || !password) {
      throw new Error(AUTH_ERROR_MESSAGES['auth/missing-credentials']);
    }

    const normalizedEmail = email.toLowerCase().trim();
    
    let userCredential;
    try {
      logOperation('signIn', 'authenticating', { email: normalizedEmail });
      
      userCredential = await signInWithEmailAndPassword(auth, normalizedEmail, password);

      logOperation('signIn', 'authenticated', { uid: userCredential.user.uid });
    } catch (error) {
      if (error instanceof FirebaseError) {
        const message = AUTH_ERROR_MESSAGES[error.code as keyof typeof AUTH_ERROR_MESSAGES] || 
                       AUTH_ERROR_MESSAGES.default;
        logOperation('signIn', 'error', { code: error.code, message });
        throw new Error(message);
      }
      throw error;
    }
    
    // Force token refresh to ensure claims are up to date
    logOperation('signIn', 'refreshing-token');
    await retryAuthOperation(
      () => userCredential.user.getIdTokenResult(true)
    );

    // Load user profile
    logOperation('signIn', 'loading-profile');
    const profile = await loadUserProfile(userCredential.user.uid);
    
    if (!profile) {
      logOperation('signIn', 'error', 'Failed to load user profile');
      throw new Error(AUTH_ERROR_MESSAGES['auth/user-not-found']);
    }

    // Determine redirect path based on role
    const redirectPath = getRedirectPath(profile.role);
    
    // Update last login time
    try {
      const db = getDb();
      const timestamp = new Date().toISOString();
      const userRef = doc(db, 'users', userCredential.user.uid);
      await updateDoc(userRef, {
        lastLoginAt: timestamp,
        role: profile.role
      });
      
      // Update profile with new timestamp
      profile.lastLoginAt = timestamp;
      
      logOperation('signIn', 'success', { lastLoginAt: timestamp });
    } catch (error) {
      // Non-critical error - log but don't fail sign in
      logOperation('signIn', 'warning', 'Failed to update last login time');
    }

    logOperation('signIn', 'complete', { 
      uid: userCredential.user.uid,
      role: profile.role,
      redirectPath
    });
    
    return {
      user: userCredential.user,
      profile,
      role: profile.role,
      redirectPath
    };
  } catch (error: any) {
    logOperation('signIn', 'error', error);
    
    if (error instanceof FirebaseError && error.code === 'auth/network-request-failed') {
      throw new Error(handleAuthNetworkError(error));
    }
    
    const message = error instanceof Error ? error.message : 'Unable to sign in at this time';
    throw new Error(message);
  }
};

const getRedirectPath = (role: string): string => {
  switch (role) {
    case 'admin':
      return '/admin';
    case 'regional':
      return '/regional';
    case 'team_member':
      return '/dashboard';
    default:
      return '/login';
  }
};