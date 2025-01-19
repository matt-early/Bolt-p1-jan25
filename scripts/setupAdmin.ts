import { initializeApp, cert } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore } from 'firebase-admin/firestore';
import dotenv from 'dotenv';
import { getServiceAccount } from '../src/services/auth/admin/serviceAccount';

// Load environment variables
dotenv.config();

const setupAdmin = async () => {
  try {
    // Get service account credentials
    const serviceAccount = getServiceAccount();

    // Initialize Firebase Admin
    const app = initializeApp({
      credential: cert(serviceAccount)
    });

    const auth = getAuth(app);
    const db = getFirestore(app);

    const userEmail = process.env.VITE_ADMIN_EMAIL;
    if (!userEmail) {
      throw new Error('VITE_ADMIN_EMAIL environment variable is required');
    }
    
    console.log('Setting up admin user:', userEmail);

    // Get or create user
    let user;
    try {
      user = await auth.getUserByEmail(userEmail);
      console.log('Found existing user:', user.uid);
    } catch (error) {
      if (error.code !== 'auth/user-not-found') {
        throw error;
      }

      // Create user if doesn't exist
      user = await auth.createUser({
        email: userEmail,
        password: 'Test12',
        emailVerified: true
      });
      console.log('Created new user:', user.uid);
    }
    
    // Set custom claims
    await auth.setCustomUserClaims(user.uid, {
      admin: true,
      role: 'admin',
      timestamp: Date.now()
    });
    console.log('Set admin claims for user:', user.uid);

    // Update user profile in Firestore
    await db.collection('users').doc(user.uid).set({
      email: userEmail,
      name: 'Matt Early',
      role: 'admin',
      approved: true,
      createdAt: new Date().toISOString(),
      lastLoginAt: null
    }, { merge: true });
    
    console.log('Successfully set up admin user');
    console.log('Please sign out and sign back in for the changes to take effect');
  } catch (error) {
    console.error('Error setting admin claims:', error);
    throw error;
  }
};

setupAdmin()
  .then(() => process.exit(0))
  .catch(() => process.exit(1));