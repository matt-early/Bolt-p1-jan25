import { UserProfile } from '../../types/auth';
import { logOperation } from '../firebase/logging';

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
}

export const validateTeamMemberData = (data: Partial<UserProfile>): ValidationResult => {
  const errors: string[] = [];

  // Required fields validation
  if (!data.name?.trim()) errors.push('Name is required');
  if (!data.email?.trim()) errors.push('Email is required');
  if (!data.staffCode?.trim()) errors.push('Staff code is required');
  if (!data.primaryStoreId) errors.push('Primary store is required');
  if (!Array.isArray(data.storeIds) || data.storeIds.length === 0) {
    errors.push('At least one store must be selected');
  }

  // Email format validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (data.email && !emailRegex.test(data.email.trim())) {
    errors.push('Invalid email format');
  }

  // Staff code format validation
  const staffCodeRegex = /^[A-Za-z0-9-]+$/;
  if (data.staffCode && !staffCodeRegex.test(data.staffCode.trim())) {
    errors.push('Staff code can only contain letters, numbers, and hyphens');
  }

  // Store validation
  if (data.storeIds && !data.storeIds.includes(data.primaryStoreId || '')) {
    errors.push('Primary store must be included in selected stores');
  }

  return {
    isValid: errors.length === 0,
    errors
  };
};