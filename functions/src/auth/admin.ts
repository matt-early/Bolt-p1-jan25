import { https } from "firebase-functions/v2";
import * as admin from "firebase-admin";
import type { UserRole } from "../types/auth";

interface DeleteUserData {
  uid: string;
}

interface DeleteUserResponse {
  success: boolean;
  error?: string;
}

export const deleteAuthUser = https.onCall<DeleteUserData, DeleteUserResponse>(async (request) => {
  // Verify caller is authenticated and admin
  if (!request.auth) {
    throw new https.HttpsError("unauthenticated", "User must be authenticated");
  }

  try {
    // Get caller's user record
    const caller = await admin.auth().getUser(request.auth.uid);
    const callerClaims = caller.customClaims || {};

    if (!callerClaims.admin) {
      throw new https.HttpsError('permission-denied', 'Caller must be an admin');
    }

    const { uid } = request.data;
    if (!uid) {
      throw new https.HttpsError('invalid-argument', 'User ID is required');
    }

    // Delete the user's auth account
    await admin.auth().deleteUser(uid);

    return { success: true };
  } catch (error) {
    console.error('Error deleting user:', error);
    throw new https.HttpsError(
      'internal',
      error instanceof Error ? error.message : 'Failed to delete user'
    );
  }
});
import { getAuth } from "firebase-admin/auth";
import { getFirestore } from "firebase-admin/firestore";

interface CreateUserData {
  email: string;
  password: string;
  name: string;
  role: UserRole;
  staffCode?: string;
  regionId?: string;
}

interface CreateUserResponse {
  uid: string;
}

export const createUser = https.onCall<CreateUserData, CreateUserResponse>(async (request) => {
  // Verify caller is authenticated and admin
  if (!request.auth) {
    throw new https.HttpsError("unauthenticated", "User must be authenticated");
  }

  try {
    // Get both auth and Firestore instances
    const auth = getAuth();
    const db = getFirestore();
    
    // Get caller's user record
    const caller = await auth.getUser(request.auth.uid);
    let isAdmin = caller.customClaims?.admin === true;
    
    if (!isAdmin) {
      // Check Firestore role as fallback
      const callerDoc = await db.collection('users')
        .doc(request.auth.uid)
        .get();

      isAdmin = callerDoc.exists && callerDoc.data()?.role === 'admin';
    }

    if (!isAdmin) {
      console.error('Permission denied - not admin:', {
        uid: request.auth.uid,
        claims: caller.customClaims,
      });
      throw new https.HttpsError('permission-denied', 'Caller must be an admin');
    }

    const data = request.data;
    
    // Validate input data
    if (!data.email || !data.password || !data.name || !data.role) {
      console.error('Invalid input data:', { data });
      throw new https.HttpsError('invalid-argument', 'Missing required fields');
    }

    // Validate region for regional managers
    if (data.role === "regional" && !data.regionId) {
      throw new https.HttpsError('invalid-argument', 'Region ID is required for regional managers');
    }

    // Verify region exists for regional managers
    if (data.role === "regional") {
      const regionDoc = await db
        .collection("regions")
        .doc(data.regionId)
        .get();
        
      if (!regionDoc.exists) {
        throw new https.HttpsError('invalid-argument', 'Invalid region ID');
      }
    }

    // Create user in Firebase Auth
    const userRecord = await auth.createUser({
      email: data.email?.toLowerCase().trim() || '',
      password: data.password,
      emailVerified: true,
      displayName: data.name
    });
    
    // Set custom claims
    await auth.setCustomUserClaims(userRecord.uid, {
      role: data.role,
      admin: data.role === "admin",
      timestamp: Date.now()
    });
    
    // Create user profile in Firestore
    await db.collection("users").doc(userRecord.uid).set({
      email: data.email?.toLowerCase().trim() || '',
      name: data.name,
      role: data.role,
      staffCode: data.staffCode,
      regionId: data.regionId,
      approved: true,
      createdAt: admin.firestore.FieldValue.serverTimestamp()
    });

    return { uid: userRecord.uid };
  } catch (error: any) {
    console.error("Error creating user:", {
      error,
      email: request.data.email,
      role: request.data.role,
      regionId: request.data.regionId
    });
    
    if (error.code === 'auth/email-already-exists') {
      throw new https.HttpsError('already-exists', 'Email already exists');
    }
    
    throw new https.HttpsError('internal', error.message || 'Failed to create user');
  }
});