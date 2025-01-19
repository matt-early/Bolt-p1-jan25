import { https } from "firebase-functions/v2";
import * as admin from "firebase-admin";
import type { UserClaims } from "../types/auth";

interface SetClaimsData {
  uid: string;
  claims: UserClaims;
}

interface SetClaimsResponse {
  success: boolean;
}

// Function to set custom claims
export const setCustomClaims = https.onCall<SetClaimsData, SetClaimsResponse>(async (request): Promise<SetClaimsResponse> => {
  const { data, auth } = request;

  // Verify caller is authenticated and admin
  if (!auth) {
    throw new https.HttpsError('unauthenticated', 'User must be authenticated');
  }

  try {
    const caller = await admin.auth().getUser(auth.uid);
    const callerClaims = caller.customClaims || {};
  
    if (!callerClaims.admin) {
      throw new https.HttpsError('permission-denied', 'Caller must be an admin');
    }

    // Validate input
    if (!data.uid || !data.claims || !data.claims.role) {
      throw new https.HttpsError('invalid-argument', 'Missing required fields');
    }

    await admin.auth().setCustomUserClaims(data.uid, {
      ...data.claims,
      timestamp: Date.now() // Force token refresh
    });

    return { success: true };
  } catch (error) {
    console.error('Error setting custom claims:', error);
    throw new https.HttpsError('internal', 'Failed to set custom claims');
  }
});