import type { UserRole } from '../types/auth';

// Locked authentication settings - do not modify
export const AUTH_SETTINGS = Object.freeze({
  // Roles and permissions
  ROLES: Object.freeze({
    ADMIN: 'admin' as UserRole,
    REGIONAL: 'regional' as UserRole,
    TEAM_MEMBER: 'team_member' as UserRole
  }),

  // Session settings
  SESSION: Object.freeze({
    TIMEOUT_MINUTES: 60,
    REFRESH_THRESHOLD_MINUTES: 5,
    MAX_FAILED_ATTEMPTS: 5,
    LOCKOUT_DURATION_MINUTES: 15
  }),

  // Password requirements
  PASSWORD: Object.freeze({
    MIN_LENGTH: 8,
    REQUIRE_UPPERCASE: true,
    REQUIRE_LOWERCASE: true,
    REQUIRE_NUMBER: true,
    REQUIRE_SPECIAL: true,
    MAX_AGE_DAYS: 90
  }),

  // Default admin user
  DEFAULT_ADMIN: Object.freeze({
    EMAIL: process.env.VITE_ADMIN_EMAIL || 'admin@example.com',
    NAME: 'Matt Early',
    ROLE: 'admin' as UserRole
  })
});

// Type for settings
export type AuthSettings = typeof AUTH_SETTINGS;