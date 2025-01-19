import { AUTH_SETTINGS } from '../../../config/auth-settings';

export const ROLE_COLORS = {
  [AUTH_SETTINGS.ROLES.ADMIN]: 'bg-red-100 text-red-800',
  [AUTH_SETTINGS.ROLES.REGIONAL]: 'bg-blue-100 text-blue-800',
  [AUTH_SETTINGS.ROLES.TEAM_MEMBER]: 'bg-green-100 text-green-800'
} as const;

export const TEMP_PASSWORD_LENGTH = 8;
export const TEMP_PASSWORD_CHARS = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';

export const generateTempPassword = () => {
  let password = '';
  for (let i = 0; i < TEMP_PASSWORD_LENGTH; i++) {
    password += TEMP_PASSWORD_CHARS.charAt(Math.floor(Math.random() * TEMP_PASSWORD_CHARS.length));
  }
  return password;
};