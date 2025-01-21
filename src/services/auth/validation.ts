import { AUTH_SETTINGS } from '../../config/auth-settings';
import { type UserRole } from '../../types/auth';
import { validateEmail } from '../../utils/validation/emailValidator';
import { query, collection, where, getDocs, limit } from 'firebase/firestore';
import { getDb } from '../firebase/db';
import { FirebaseError } from 'firebase/app';
import { logOperation } from '../firebase/logging';
import { retry } from '../firebase/retry';

// Validate role is allowed
export const isValidRole = (role: string): role is UserRole => {
  return Object.values(AUTH_SETTINGS.ROLES).includes(role as UserRole);
};

// Validate password meets requirements
export const validatePassword = (password: string): boolean => {
  const { MIN_LENGTH, REQUIRE_UPPERCASE, REQUIRE_LOWERCASE, REQUIRE_NUMBER, REQUIRE_SPECIAL } = AUTH_SETTINGS.PASSWORD;

  if (password.length < MIN_LENGTH) return false;
  if (REQUIRE_UPPERCASE && !/[A-Z]/.test(password)) return false;
  if (REQUIRE_LOWERCASE && !/[a-z]/.test(password)) return false;
  if (REQUIRE_NUMBER && !/\d/.test(password)) return false;
  if (REQUIRE_SPECIAL && !/[!@#$%^&*]/.test(password)) return false;

  return true;
};

// Validate admin user
export const isDefaultAdmin = (email: string): boolean => {
  return email === AUTH_SETTINGS.DEFAULT_ADMIN.EMAIL;
};

export const checkEmailExists = async (email: string): Promise<boolean> => {
  try {
    const db = getDb();
    const normalizedEmail = email.toLowerCase().trim();
    
    // Check users collection
    const usersQuery = query(
      collection(db, 'users'),
      where('email', '==', normalizedEmail),
      limit(1)
    );

    const userDocs = await retry(
      () => getDocs(usersQuery),
      {
        maxAttempts: 3,
        initialDelay: 1000,
        operation: 'checkEmailExists.users'
      }
    );

    if (!userDocs.empty) {
      logOperation('checkEmailExists', 'found', { collection: 'users' });
      return true;
    }

    // Check auth requests collection
    const requestsQuery = query(
      collection(db, 'authRequests'),
      where('email', '==', normalizedEmail),
      where('status', '==', 'pending'),
      limit(1)
    );

    const requestDocs = await retry(
      () => getDocs(requestsQuery),
      {
        maxAttempts: 3,
        initialDelay: 1000,
        operation: 'checkEmailExists.requests'
      }
    );

    if (!requestDocs.empty) {
      logOperation('checkEmailExists', 'found', { collection: 'authRequests' });
      return true;
    }

    logOperation('checkEmailExists', 'not-found');
    return false;
  } catch (error) {
    // Handle permission errors gracefully
    if (error instanceof Error && error.message.includes('permission-denied')) {
      logOperation('checkEmailExists', 'warning', 'Permission denied - skipping check');
      return false;
    }

    logOperation('checkEmailExists', 'error', {
      error: error instanceof Error ? error.message : 'Unknown error',
      email: email
    });
    return false;
  }
};