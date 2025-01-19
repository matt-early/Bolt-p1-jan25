import { initializeApp, cert } from 'firebase-admin/app';
import type { ServiceAccount } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore } from 'firebase-admin/firestore';
import { LRUCache } from 'lru-cache';

// Create cache for user operations
const userCache = new LRUCache({
  max: 500,
  ttl: 1000 * 60 * 5 // 5 minutes
});

const serviceAccount = {
  "type": "service_account",
  "project_id": "twodegrees-retail",
  "private_key": process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
  "client_email": process.env.FIREBASE_CLIENT_EMAIL,
  "client_id": process.env.FIREBASE_CLIENT_ID
};

async function addAdminUser() {
  try {
    // Initialize Firebase Admin
    const app = initializeApp({
      credential: cert(serviceAccount as ServiceAccount)
    });

    const auth = getAuth(app);
    const db = getFirestore(app);

    // Check cache first
    const userEmail = 'matt.early@2degrees.nz';
    const userPassword = 'Test12';
    const cachedUser = userCache.get(userEmail);

    let user;
    try {
      if (cachedUser) {
        user = cachedUser;
        console.log('Using cached user data');
      } else {
        // Try to get existing user
        user = await auth.getUserByEmail(userEmail);
        userCache.set(userEmail, user);
        console.log('User already exists, updating...');
      }
    } catch (error) {
      // Create new user if doesn't exist
      user = await auth.createUser({
        email: userEmail,
        password: userPassword,
        emailVerified: true
      });
      console.log('Created new user:', user.uid);
    }

    // Set custom claims
    await auth.setCustomUserClaims(user.uid, {
      admin: true,
      role: 'admin'
    });

    // Update user profile in Firestore
    await db.collection('users').doc(user.uid).set({
      email: userEmail,
      name: 'Matt Early',
      role: 'admin',
      approved: true,
      createdAt: new Date().toISOString()
    }, { merge: true });

    console.log('Successfully set up admin user');
    process.exit(0);
  } catch (error) {
    console.error('Error setting up admin user:', error);
    process.exit(1);
  }
}

addAdminUser();