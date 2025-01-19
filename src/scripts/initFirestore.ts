import { Firestore } from 'firebase/firestore';

export const initializeFirestore = async (db: Firestore) => {
  try {
    console.log('Firebase initialized successfully');
  } catch (error) {
    console.error('Error during Firestore initialization:', error);
    throw error;
  }
};