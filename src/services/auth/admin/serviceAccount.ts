import { ServiceAccount } from 'firebase-admin/app';
import { logOperation } from '../../firebase/logging';

const validateServiceAccount = (serviceAccount: Partial<ServiceAccount>): void => {
  if (!serviceAccount.projectId) {
    throw new Error('Missing project ID in service account');
  }
  if (!serviceAccount.clientEmail) {
    throw new Error('Missing client email in service account');
  }
  if (!serviceAccount.privateKey) {
    throw new Error('Missing private key in service account');
  }
};

export const getServiceAccount = (): ServiceAccount => {
  try {
    // Validate required environment variables
    const requiredVars = [
      'VITE_FIREBASE_PROJECT_ID',
      'FIREBASE_CLIENT_EMAIL',
      'FIREBASE_PRIVATE_KEY'
    ];

    for (const envVar of requiredVars) {
      if (!process.env[envVar]) {
        throw new Error(`Missing required environment variable: ${envVar}`);
      }
    }

    const serviceAccount = {
      type: "service_account",
      projectId: process.env.VITE_FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      // Replace escaped newlines in the private key
      privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n')
    };

    validateServiceAccount(serviceAccount);
    return serviceAccount as ServiceAccount;
  } catch (error) {
    logOperation('getServiceAccount', 'error', error);
    throw error;
  }
};