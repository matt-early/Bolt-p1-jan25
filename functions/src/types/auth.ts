export type UserRole = 'team_member' | 'regional' | 'admin';

export interface UserClaims {
  role: UserRole;
  admin?: boolean;
  timestamp: number;
  [key: string]: any;
}

export interface SetClaimsData {
  uid: string;
  claims: UserClaims;
}

export interface SetClaimsResponse {
  success: boolean;
}

export interface VerifyAdminResponse {
  isAdmin: boolean;
  role: UserRole;
}

export interface EmptyRequest {}