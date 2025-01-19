import { collection, getDocs, doc, setDoc, getDoc } from 'firebase/firestore';
import { getDb } from '../firebase/db';
import { getCollection } from '../firebase/collections';
import { logOperation } from '../firebase/logging';
import { migrateRoles } from '../../utils/migration/roleMigration';
import { UserProfile } from '../../types/auth';

export const migrateSalespeopleToUsers = async (): Promise<void> => {
  try {
    const db = getDb();
    const salesRef = getCollection('SALESPEOPLE');
    if (!salesRef) {
      throw new Error('Failed to get salespeople collection');
    }

    // Get all salespeople
    const snapshot = await getDocs(salesRef);
    const salespeople = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));

    // Process each salesperson
    for (const person of salespeople) {
      try {
        // Check if user already exists
        const userDoc = await getDoc(doc(db, 'users', person.id));
        
        if (!userDoc.exists()) {
          // Create user profile
          await setDoc(doc(db, 'users', person.id), {
            email: person.email,
            name: person.name,
            role: person.role === 'salesperson' ? 'team_member' : person.role,
            staffCode: person.staffCode,
            storeIds: person.storeIds || [],
            primaryStoreId: person.primaryStoreId,
            approved: true,
            createdAt: person.createdAt || new Date().toISOString()
          });

          logOperation('migrateSalespeopleToUsers', 'success', {
            message: 'Created user profile',
            id: person.id
          });
        }
      } catch (error) {
        logOperation('migrateSalespeopleToUsers', 'error', {
          message: 'Failed to migrate user',
          id: person.id,
          error
        });
      }
    }
    
    // Migrate roles after user creation
    await migrateRoles();
  } catch (error) {
    logOperation('migrateSalespeopleToUsers', 'error', error);
    throw error;
  }
};