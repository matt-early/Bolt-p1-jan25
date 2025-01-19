import { FirebaseConfig } from '../../config/types';
import { logOperation } from '../../services/firebase/logging';

interface ValidationResult {
  isValid: boolean;
  errors: string[];
}

export const validateFirebaseConfig = (config: Partial<FirebaseConfig>): ValidationResult => {
  const errors: string[] = [];
  
  // Required fields
  const requiredFields = [
    'apiKey',
    'authDomain',
    'projectId',
    'storageBucket',
    'messagingSenderId',
    'appId'
  ] as const;

  // Check for missing fields
  requiredFields.forEach(field => {
    if (!config[field]) {
      errors.push(`Missing required field: ${field}`);
    }
  });

  // Validate field formats
  if (config.apiKey && !/^AIza[0-9A-Za-z-_]{35}$/.test(config.apiKey)) {
    errors.push('Invalid API key format');
  }

  if (config.projectId && !/^[a-z0-9-]+$/.test(config.projectId)) {
    errors.push('Invalid project ID format');
  }

  if (config.authDomain && !config.authDomain.endsWith('.firebaseapp.com')) {
    errors.push('Invalid auth domain format');
  }

  if (config.storageBucket && !config.storageBucket.endsWith('.appspot.com')) {
    errors.push('Invalid storage bucket format');
  }

  if (config.messagingSenderId && !/^\d+$/.test(config.messagingSenderId)) {
    errors.push('Invalid messaging sender ID format');
  }

  if (config.appId && !/^\d:[\d\w-]+:web:[\d\w-]+$/.test(config.appId)) {
    errors.push('Invalid app ID format');
  }

  return {
    isValid: errors.length === 0,
    errors
  };
};