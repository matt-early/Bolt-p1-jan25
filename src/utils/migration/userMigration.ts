import { collection, getDocs, writeBatch, doc, getDoc } from 'firebase/firestore';
import { getDb } from '../../services/firebase/db';
import { logOperation } from '../../services/firebase/logging';
import { validateUserProfile } from './validation';
import { MigrationResult, MigrationOptions, MigrationError } from './types';
import { ROLE_MAPPING } from '../../types/auth';
import { initializeMigrationServices } from './initFirebase';

const DEFAULT_BATCH_SIZE = 500;

export const migrateUsers = async (options: MigrationOptions = {}): Promise<MigrationResult> => {
  const { dryRun = false, batchSize = DEFAULT_BATCH_SIZE } = options;
  
  // Initialize Firebase first
  await initializeMigrationServices();
  
  const result: MigrationResult = {
    success: true,
    migratedCount: 0,
    errors: []
  };

  try {
    const db = getDb();
    const batch = writeBatch(db);
    let batchCount = 0;

    // Get all salespeople
    const salesRef = collection(db, 'salespeople');
    const snapshot = await getDocs(salesRef);
    
    logOperation('migrateUsers', 'start', { 
      totalRecords: snapshot.size,
      dryRun 
    });

    for (const salespersonDoc of snapshot.docs) {
      try {
        const data = salespersonDoc.data();
        
        // Validate data
        if (!validateUserProfile(data)) {
          throw new Error('Invalid user profile data');
        }

        // Check if user already exists
        const userRef = doc(db, 'users', salespersonDoc.id);
        const existingUser = await getDoc(userRef);
        
        if (!existingUser.exists()) {
          // Map role
          const role = ROLE_MAPPING[data.role as keyof typeof ROLE_MAPPING] || 'team_member';
          
          // Prepare user document
          const userProfile = {
            email: data.email.toLowerCase().trim(),
            name: data.name.trim(),
            role,
            staffCode: data.staffCode?.trim(),
            storeIds: data.storeIds || [],
            primaryStoreId: data.primaryStoreId,
            approved: true,
            createdAt: data.createdAt || new Date().toISOString()
          };

          if (!dryRun) {
            batch.set(userRef, userProfile);
            batchCount++;
          }

          result.migratedCount++;
        }

        // Commit batch if size limit reached
        if (!dryRun && batchCount >= batchSize) {
          await batch.commit();
          batchCount = 0;
        }
      } catch (error) {
        result.errors.push({
          userId: salespersonDoc.id,
          error: error instanceof Error ? error.message : 'Unknown error'
        });
      }
    }

    // Commit any remaining changes
    if (!dryRun && batchCount > 0) {
      await batch.commit();
    }

    logOperation('migrateUsers', 'success', {
      migratedCount: result.migratedCount,
      errorCount: result.errors.length,
      dryRun
    });

    return result;
  } catch (error) {
    logOperation('migrateUsers', 'error', error);
    result.success = false;
    throw error;
  }
};