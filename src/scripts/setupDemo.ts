import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { initializeFirestore } from './initFirestore';
import { firebaseConfig } from '../config/firebase-config';

const setupDemo = async () => {
  try {
    console.log('Starting Firebase setup...');
    
    // Initialize Firebase
    const app = initializeApp(firebaseConfig);
    const db = getFirestore(app);
    
    await initializeFirestore(db);
    console.log('Firebase setup completed successfully');
  } catch (error) {
    console.error('Firebase setup failed:', error);
    throw error;
  }
};

setupDemo().catch((error) => {
  console.error('Unhandled error during setup:', error);
  process.exit(1);
});