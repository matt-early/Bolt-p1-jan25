// Add to the existing imports
import { setupAdminUser } from './setupAdmin';

// Modify the initializeDemoData function to include admin setup
export const initializeDemoData = async () => {
  try {
    // Create users and their profiles
    for (const user of demoUsers) {
      try {
        // Create Firebase Auth user
        const userCredential = await createUserWithEmailAndPassword(
          auth,
          user.email,
          user.password
        );

        if (user.email === 'mattearly@xtra.co.nz') {
          await setupAdminUser(userCredential.user.uid);
        } else {
          // Create regular user profile
          const userProfileRef = doc(db, 'users', userCredential.user.uid);
          await setDoc(userProfileRef, {
            email: user.email,
            name: user.name,
            role: user.role,
            storeId: user.storeId,
            regionId: user.regionId,
            approved: true,
            createdAt: Timestamp.now()
          });
        }

        if (user.role === 'salesperson') {
          const metricsRef = collection(db, 'team_members');
          const today = new Date(2023, 11, 9); // December 9, 2023
        }

        // Rest of the function remains the same...
      } catch (error) {
        console.error(`Error creating user ${user.email}:`, error);
      }
    }

    console.log('Demo data initialized successfully');
  } catch (error) {
    console.error('Error initializing demo data:', error);
    throw error;
  }
};