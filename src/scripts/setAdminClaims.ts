import { initializeApp, cert, ServiceAccount } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore } from 'firebase-admin/firestore';
import { logOperation } from '../services/firebase/logging';

const serviceAccount = process.env.FIREBASE_SERVICE_ACCOUNT 
  ? JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT)
  : null;

if (!serviceAccount) {
  throw new Error('FIREBASE_SERVICE_ACCOUNT environment variable is required');
}

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
    
    // Get or create user
    let user;
    try {
      user = await auth.getUserByEmail(userEmail);
      logOperation('setAdminClaims', 'found-user', { uid: user.uid });
    } catch (error) {
      // Create user if doesn't exist
      user = await auth.createUser({
        email: userEmail,
        password: 'Test12',
        emailVerified: true
      });
      logOperation('setAdminClaims', 'created-user', { uid: user.uid });
    }
    
    // Set custom claims
    await auth.setCustomUserClaims(user.uid, {
      admin: true,
      role: 'admin',
      timestamp: Date.now() // Add timestamp to force token refresh 
    });
    logOperation('setAdminClaims', 'claims-set', { uid: user.uid });

    // Update user profile in Firestore
    await db.collection('users').doc(user.uid).set({
      email: userEmail,
      name: 'Administrator',
      role: 'admin',
      approved: true,
      createdAt: new Date().toISOString(),
      lastLoginAt: null
    }, { merge: true });
    
    console.log('Successfully set admin claims and profile for', userEmail);
    console.log('Please sign out and sign back in for the changes to take effect');
  } catch (error) {
    console.error('Error setting admin claims:', error);
    process.exit(1);
  }
};

setAdminClaims()
  .then(() => process.exit(0))
  .catch(() => process.exit(1));