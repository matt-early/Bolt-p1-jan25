import { initializeApp } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { getAuth } from 'firebase-admin/auth';
import { adminDb, adminAuth } from '../config/firebase-admin';

const setupInitialData = async () => {
  try {
    // Initialize collections
    const collections = ['users', 'stores', 'regions', 'metrics', 'authRequests'];
    
    for (const collectionName of collections) {
      const collectionRef = adminDb.collection(collectionName);
      
      if (collectionName === 'regions') {
        await collectionRef.doc('region1').set({
          name: 'Western Region',
          createdAt: new Date().toISOString()
        });
      }
      
      if (collectionName === 'stores') {
        await collectionRef.doc('store1').set({
          name: 'Downtown Store',
          regionId: 'region1',
          rank: 1,
          createdAt: new Date().toISOString()
        });
      }
    }

    // Create admin user
    const adminEmail = 'mattearly@xtra.co.nz';
    let adminUser;
    
    try {
      adminUser = await adminAuth.getUserByEmail(adminEmail);
    } catch {
      adminUser = await adminAuth.createUser({
        email: adminEmail,
        password: 'Test12',
        emailVerified: true
      });
    }

    // Set admin claims
    await adminAuth.setCustomUserClaims(adminUser.uid, { admin: true });

    // Create admin profile
    await adminDb.collection('users').doc(adminUser.uid).set({
      email: adminEmail,
      name: 'Matt Early',
      role: 'admin',
      approved: true,
      createdAt: new Date().toISOString(),
      storeId: 'store1',
      regionId: 'region1'
    });

    console.log('Initial setup completed successfully');
  } catch (error) {
    console.error('Error during setup:', error);
    throw error;
  }
};

setupInitialData().catch(console.error);