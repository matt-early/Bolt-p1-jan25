import { AUTH_SETTINGS as BASE_AUTH_SETTINGS } from '../../config/auth-settings';
import { logOperation } from '../firebase/logging';

// Validate settings are properly locked
const validateSettings = () => {
  try {
    // Attempt to modify settings (should throw error)
    const settings = BASE_AUTH_SETTINGS as any;
    settings.ROLES.ADMIN = 'test';
  } catch (error) {
    if (error instanceof TypeError && error.message.includes('read only')) {
      // Expected behavior - settings are locked
      return;
    }
    logOperation('validateSettings', 'error', 'Auth settings are not properly locked');
  }
};

// Validate on import
validateSettings();

// Export settings getter
export const getAuthSettings = () => {
  return BASE_AUTH_SETTINGS;
};