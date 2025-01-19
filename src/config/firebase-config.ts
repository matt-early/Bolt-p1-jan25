import { FirebaseOptions } from 'firebase/app';
import { logOperation } from '../services/firebase/logging';

// Validate environment variables are properly formatted
const validateEnvVar = (name: string, value?: string): string => {
  if (!value || value === 'undefined' || value === 'null') {
    throw new Error(`Environment variable ${name} is not set`);
  }
  return value;
};

const REQUIRED_CONFIG_FIELDS = [
  'apiKey',
  'authDomain',
  'projectId',
  'storageBucket',
  'messagingSenderId',
  'appId'
] as const;

export const getFirebaseConfig = (): FirebaseOptions => {
  try {
    const config: FirebaseOptions = {
      apiKey: validateEnvVar('VITE_FIREBASE_API_KEY', import.meta.env.VITE_FIREBASE_API_KEY),
      authDomain: validateEnvVar('VITE_FIREBASE_AUTH_DOMAIN', import.meta.env.VITE_FIREBASE_AUTH_DOMAIN),
      projectId: validateEnvVar('VITE_FIREBASE_PROJECT_ID', import.meta.env.VITE_FIREBASE_PROJECT_ID),
      storageBucket: validateEnvVar('VITE_FIREBASE_STORAGE_BUCKET', import.meta.env.VITE_FIREBASE_STORAGE_BUCKET),
      messagingSenderId: validateEnvVar('VITE_FIREBASE_MESSAGING_SENDER_ID', import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID),
      appId: validateEnvVar('VITE_FIREBASE_APP_ID', import.meta.env.VITE_FIREBASE_APP_ID)
    };

    // Check for missing or empty fields
    const missingFields = REQUIRED_CONFIG_FIELDS.filter(field => 
      !config[field as keyof FirebaseOptions] || 
      config[field as keyof FirebaseOptions] === ''
    );

    if (missingFields.length > 0) {
      const error = new Error(
        `Missing required Firebase configuration fields:\n${missingFields.join('\n')}\n` +
        'Please ensure all required environment variables are set in your .env file.'
      ); 
      logOperation('getFirebaseConfig', 'error', { missingFields });
      throw error;
    }

    // Validate API key format
    if (!/^AIza[A-Za-z0-9_-]{35}$/.test(config.apiKey)) {
      throw new Error('Invalid Firebase API key format');
    }

    logOperation('getFirebaseConfig', 'success');
    return config;
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to load Firebase configuration';
    logOperation('getFirebaseConfig', 'error', { message });
    throw error;
  }
};