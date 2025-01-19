import { https } from "firebase-functions/v2";
import * as admin from "firebase-admin";
import type { UserRole } from "../types/auth";

interface VerifyAdminResponse {
  isAdmin: boolean;
  role: UserRole;
}

interface EmptyRequest {}

// Function to verify admin status
export const verifyAdmin = https.onCall<EmptyRequest, VerifyAdminResponse>(async (request): Promise<VerifyAdminResponse> => {
  // Verify caller is authenticated
  if (!request.auth) {
    throw new https.HttpsError('unauthenticated', 'User must be authenticated');
  }

  try {
    const user = await admin.auth().getUser(request.auth.uid);
    const claims = user.customClaims || {};

    return {
      isAdmin: Boolean(claims.admin),
      role: (claims.role as UserRole) || 'team_member'
    };
  } catch (error) {
    console.error('Error verifying admin status:', error);
    throw new https.HttpsError('internal', 'Failed to verify admin status');
  }
});