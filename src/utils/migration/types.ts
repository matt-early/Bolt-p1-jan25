import { UserProfile } from '../../types/auth';

export interface MigrationResult {
  success: boolean;
  migratedCount: number;
  errors: MigrationError[];
}

export interface MigrationError {
  userId: string;
  error: string;
}

export interface MigrationOptions {
  dryRun?: boolean;
  batchSize?: number;
}