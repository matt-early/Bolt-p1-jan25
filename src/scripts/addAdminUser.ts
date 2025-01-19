// This file intentionally left empty - admin users should be created through Firebase Console

const auth = getAuth(app);
const db = getFirestore(app);

const userEmail = process.env.VITE_ADMIN_EMAIL;
if (!userEmail) {
  throw new Error('VITE_ADMIN_EMAIL environment variable is required');
}
const userPassword = 'Test12';

// Get user by email