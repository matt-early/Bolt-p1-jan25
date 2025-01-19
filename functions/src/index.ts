import { initializeApp } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore } from 'firebase-admin/firestore';
import { credential } from 'firebase-admin';
import { setCustomClaims } from "./auth/claims";
import { verifyAdmin } from "./auth/verification";
import { createUser, deleteAuthUser } from "./auth/admin";


// Initialize Firebase Admin SDK with proper error handling
let adminApp;
try {
  adminApp = initializeApp({
    credential: credential.applicationDefault(),
    projectId: process.env.VITE_FIREBASE_PROJECT_ID
  });
  
  // Initialize services
  const auth = getAuth(adminApp);
  const db = getFirestore(adminApp);
  
  console.log('Firebase Admin SDK initialized successfully');
} catch (error) {
  console.error('Error initializing Firebase Admin:', error);
  throw error;
}

export {
  setCustomClaims,
  verifyAdmin,
  createUser,
  deleteAuthUser
};