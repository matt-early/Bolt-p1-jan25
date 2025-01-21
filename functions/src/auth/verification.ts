import { https } from "firebase-functions/v2";
import * as admin from "firebase-admin";
import cors from 'cors';
import { logOperation } from "../utils/logging";

const corsHandler = cors({
  origin: true,
  credentials: true,
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
});
interface VerifyAdminResponse {
  isAdmin: boolean;
  role: string;
}

interface EmptyRequest {}

// Function to verify admin status
export const verifyAdmin = https.onCall<EmptyRequest, VerifyAdminResponse>(async (request): Promise<VerifyAdminResponse> => {
  // Handle CORS
  await new Promise((resolve) => corsHandler(request.raw, request.raw.res!, resolve));

  // Handle preflight requests
  if (request.raw.method === 'OPTIONS') {
    request.raw.res!.status(204).send('');
    return;
  }

  // Verify caller is authenticated
  if (!request.auth) {
    throw new https.HttpsError('unauthenticated', 'User must be authenticated');
  }

  try {
    // Get user record with retries
    let user;
    user = await admin.auth().getUser(request.auth.uid);

    const claims = user.customClaims || {};

    // Check if user is default admin
    const userDoc = await admin.firestore().collection('users').doc(request.auth.uid).get();
    const userData = userDoc.data();
    const isDefaultAdmin = userDoc.exists && userData?.email === process.env.VITE_ADMIN_EMAIL;

    if (isDefaultAdmin) {
      // Always set admin claims for default admin
      await admin.auth().setCustomUserClaims(request.auth.uid, {
        admin: true,
        role: 'admin',
        timestamp: Date.now()
      });

      logOperation('verifyAdmin', 'success', { reason: 'default admin' });
      return {
        isAdmin: true,
        role: 'admin'
      };
    }

    // Check existing claims
    if (claims.admin === true) {
      logOperation('verifyAdmin', 'success', { reason: 'existing claims' });
      return {
        isAdmin: true,
        role: claims.role || 'admin'
      };
    }

    // Check Firestore role
    if (userDoc.exists) {
      if (userData?.role === 'admin' || userData?.admin === true) {
        // Update claims to match Firestore
        await admin.auth().setCustomUserClaims(request.auth.uid, {
          admin: true,
          role: 'admin',
          timestamp: Date.now()
        });

        logOperation('verifyAdmin', 'success', { reason: 'firestore role' });
        return {
          isAdmin: true,
          role: 'admin'
        };
      }
    }

    logOperation('verifyAdmin', 'info', { message: 'User is not admin' });
    return {
      isAdmin: false,
      role: claims.role || 'team_member'
    };
  } catch (error) {
    logOperation('verifyAdmin', 'error', error);
    throw new https.HttpsError('internal', 'Failed to verify admin status');
  }
});