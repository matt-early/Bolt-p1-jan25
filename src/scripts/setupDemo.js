import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "",
  authDomain: "",
  projectId: "",
  storageBucket: "",
  messagingSenderId: "",
  appId: ""
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

import { initializeDemoData } from './initDemoData.js';

const setupDemo = async () => {
  try {
    await initializeDemoData(auth, db);
    console.log('Demo setup completed successfully');
    process.exit(0);
  } catch (error) {
    console.error('Demo setup failed:', error);
    process.exit(1);
  }
};

setupDemo();