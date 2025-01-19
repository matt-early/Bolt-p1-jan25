import { FirebaseOptions } from 'firebase/app';
import { logOperation } from './logging';

const REQUIRED_CONFIG_KEYS = [
  'apiKey',
  'authDomain', 
  'projectId'
] as const;

export const validateFirebaseConfig = (config: Partial<FirebaseOptions>): config is FirebaseOptions => {
  try {
    const missingKeys = REQUIRED_CONFIG_KEYS.filter(key => !config[key]);
    
    if (missingKeys.length > 0) {
      throw new Error(
        `Missing required Firebase configuration:\n${missingKeys.join('\n')}`
      );
    }

    return true;
  } catch (error) {
    logOperation('validateFirebaseConfig', 'error', error);
    return false;
  }
};