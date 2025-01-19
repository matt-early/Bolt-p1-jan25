import { Timestamp } from 'firebase/firestore';

// Define all possible role values
export type UserRole = 'team_member' | 'regional' | 'admin';

// Map legacy role values to current ones
export const ROLE_MAPPING = {
  'salesperson': 'team_member',
  'team_member': 'team_member',
  'regional': 'regional',
  'admin': 'admin'
} as const;

export interface UserProfile {
  id: string;
  email: string;
  role: UserRole;
  name: string;
  staffCode?: string;
  storeIds?: string[];
  regionId?: string;
  primaryStoreId?: string;
  regionId?: string;
  approved: boolean;
  createdAt: string;
  lastLoginAt?: string | { seconds: number; nanoseconds: number } | null;
  disabled?: boolean;
  disabledAt?: string;
  disabledBy?: string;
  enabledAt?: string;
  enabledBy?: string;
  resetPasswordRequested?: boolean;
  resetPasswordToken?: string;
  resetPasswordExpires?: string;
}

export interface AuthRequest {
  id: string;
  email: string;
  name: string;
  staffCode: string;
  password: string;
  storeIds: string[];
  primaryStoreId: string;
  role: UserRole;
  status: 'pending' | 'approved' | 'rejected';
  requestedAt: Timestamp;
  reviewedBy?: string;
  reviewedAt?: Timestamp;
  rejectionReason?: string;
}