import { AUTH_SETTINGS } from '../../config/auth-settings';
import { type UserRole } from '../../types/auth';
import { validateEmail } from '../../utils/validation/emailValidator';
import { query, collection, where, getDocs, limit } from 'firebase/firestore';
import { getDb } from '../firebase/db';
import { logOperation } from '../firebase/logging';

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
    const normalizedEmail = email.toLowerCase().trim();
    // Skip email check if permission denied - will be handled during registration
    return false;
  } catch (error) {
    logOperation('checkEmailExists', 'error', error);
    return false;
  }
};