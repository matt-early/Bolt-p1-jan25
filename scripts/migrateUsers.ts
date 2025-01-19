import { migrateUsers } from '../src/utils/migration/userMigration';
import { logOperation } from '../src/services/firebase/logging';
import * as dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const runMigration = async () => {
  try {
    console.log('Starting migration process...');
    
    // First do a dry run
    console.log('\nStarting dry run...');
    const dryRunResult = await migrateUsers({ dryRun: true });
    
    console.log('\nDry run results:');
    console.log(`Users to migrate: ${dryRunResult.migratedCount}`);
    console.log(`Errors: ${dryRunResult.errors.length}`);

    if (dryRunResult.errors.length > 0) {
      console.log('\nErrors found:');
      dryRunResult.errors.forEach(error => {
        console.log(`- User ${error.userId}: ${error.error}`);
      });
    }

    // Prompt for confirmation
    const proceed = await promptConfirmation();
    if (!proceed) {
      console.log('Migration cancelled');
      process.exit(0);
    }

    // Perform actual migration
    console.log('\nStarting migration...');
    const result = await migrateUsers();
    
    console.log('\nMigration complete:');
    console.log(`Migrated users: ${result.migratedCount}`);
    console.log(`Errors: ${result.errors.length}`);

    if (result.errors.length > 0) {
      console.log('\nErrors encountered:');
      result.errors.forEach(error => {
        console.log(`- User ${error.userId}: ${error.error}`);
      });
    }

    process.exit(0);
  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  }
};

const promptConfirmation = async (): Promise<boolean> => {
  return new Promise(resolve => {
    process.stdout.write('\nProceed with migration? (y/N): ');
    process.stdin.once('data', data => {
      const input = data.toString().trim().toLowerCase();
      resolve(input === 'y' || input === 'yes');
    });
  });
};

runMigration();