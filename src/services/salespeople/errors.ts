export const TEAM_MEMBER_ERROR_MESSAGES = {
  UNAUTHORIZED: 'User is not authorized to perform this action',
  NOT_AUTHENTICATED: 'User must be authenticated',
  INVALID_DATA: 'Invalid team member data',
  NETWORK_ERROR: 'Network error occurred',
  DUPLICATE_EMAIL: 'Email already exists',
  DUPLICATE_STAFF_CODE: 'Staff code already exists',
  COLLECTION_ERROR: 'Failed to access salespeople collection',
  CREATE_ERROR: 'Failed to create team member',
  UPDATE_ERROR: 'Failed to update team member',
  DELETE_ERROR: 'Failed to delete team member'
} as const;