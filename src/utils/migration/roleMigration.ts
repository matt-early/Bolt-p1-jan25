import { collection, getDocs, writeBatch } from 'firebase/firestore';
import { getDb } from '../../services/firebase/db';
import { ROLE_MAPPING } from '../../types/auth';
import { logOperation } from '../../services/firebase/logging';

export const migrateRoles = async (): Promise<void> => {
  try {
    const db = getDb();
    const batch = writeBatch(db);
    let updateCount = 0;

    // Update salespeople collection
    const salespeopleRef = collection(db, 'salespeople');
    const salespeopleSnapshot = await getDocs(salespeopleRef);
    
    salespeopleSnapshot.docs.forEach(doc => {
      const data = doc.data();
      if (data.role === 'salesperson') {
        batch.update(doc.ref, {
          role: 'team_member'
        });
        updateCount++;
      }
    });

    // Commit the batch
    await batch.commit();
    
    logOperation('migrateRoles', 'success', { updatedRecords: updateCount });
  } catch (error) {
    logOperation('migrateRoles', 'error', error);
    throw error;
  }
};