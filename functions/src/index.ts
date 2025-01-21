import { initializeApp } from 'firebase-admin/app';
import { verifyAdmin } from "./auth/verification";
import { createUser } from "./auth/admin";

// Initialize Firebase Admin
initializeApp();

// Export Cloud Functions
export {
  verifyAdmin,
  createUser
};