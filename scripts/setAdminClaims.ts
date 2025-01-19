import { initializeApp, cert, type ServiceAccount } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore } from 'firebase-admin/firestore';
import * as dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Validate required environment variables
const requiredEnvVars = [
  'VITE_ADMIN_EMAIL',
  'FIREBASE_PRIVATE_KEY',
  'FIREBASE_CLIENT_EMAIL',
  'FIREBASE_CLIENT_ID'
];

for (const envVar of requiredEnvVars) {
  if (!process.env[envVar]) {
    console.error(`Missing required environment variable: ${envVar}`);
    process.exit(1);
  }
}

// Your service account credentials from Firebase Console
const serviceAccount = {
  "type": "service_account",
  "project_id": "twodegrees-retail",
  "private_key": process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
  "client_email": process.env.FIREBASE_CLIENT_EMAIL,
  "client_id": process.env.FIREBASE_CLIENT_ID
};

const app = initializeApp({
  credential: cert(serviceAccount as ServiceAccount)
});

const auth = getAuth(app);
const db = getFirestore(app);

const setAdminClaims = async () => {
  try {
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
      role: 'admin'
    });
    console.log('Set admin claims for user:', user.uid);

    // Update user profile in Firestore
    await db.collection('users').doc(user.uid).set({
      email: userEmail,
      name: 'Matt Early',
      role: 'admin',
      approved: true,
      createdAt: new Date().toISOString()
    }, { merge: true });
    
    console.log('Successfully set up admin user');
    console.log('Please sign out and sign back in for the changes to take effect');
  } catch (error) {
    console.error('Error setting admin claims:', error);
    process.exit(1);
  }
};

setAdminClaims()
  .then(() => process.exit(0))
  .catch(() => process.exit(1));