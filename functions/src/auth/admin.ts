import { https } from "firebase-functions/v2";
import * as admin from "firebase-admin";
import cors from 'cors';
import { logOperation } from "../utils/logging";
import type { UserRole } from "../types/auth";

const corsHandler = cors({
  origin: true,
  credentials: true,
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
});
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
  // Handle CORS
  await new Promise((resolve) => corsHandler(request.raw, request.raw.res!, resolve));

  // Handle preflight requests
  if (request.raw.method === 'OPTIONS') {
    request.raw.res!.status(204).send('');
    return;
  }

  if (request.raw.method !== 'POST') {
    request.raw.res!.status(405).send('Method Not Allowed');
    return;
  }

  // Verify caller is authenticated and admin
  if (!request.auth) {
    throw new https.HttpsError("unauthenticated", "User must be authenticated");
  }

  try {
    // Get caller's user record
    const caller = await admin.auth().getUser(request.auth.uid);
    const callerClaims = caller.customClaims || {};
    const callerDoc = await admin.firestore().collection('users').doc(request.auth.uid).get();
    const callerData = callerDoc.data();

    // Check admin status through multiple methods
    const isAdmin = callerClaims.admin === true || 
                   callerData?.role === 'admin' ||
                   callerData?.email === process.env.VITE_ADMIN_EMAIL;

    if (!isAdmin) {
      throw new https.HttpsError('permission-denied', 'Caller must be an admin');
    }

    const data = request.data;
    
    // Validate region for regional managers
    if (data.role === "regional" && !data.regionId) {
      throw new https.HttpsError('invalid-argument', 'Region ID is required for regional managers');
    }

    // Create user in Firebase Auth
    const userRecord = await admin.auth().createUser({
      email: data.email.toLowerCase().trim(),
      password: data.password,
      emailVerified: true,
      displayName: data.name
    });

    // Set custom claims
    await admin.auth().setCustomUserClaims(userRecord.uid, {
      role: data.role,
      admin: data.role === "admin",
      timestamp: Date.now()
    });

    // Create user profile in Firestore
    await admin.firestore().collection("users").doc(userRecord.uid).set({
      email: data.email.toLowerCase().trim(),
      name: data.name,
      role: data.role,
      admin: data.role === "admin",
      staffCode: data.staffCode,
      regionId: data.regionId,
      approved: true,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      createdBy: request.auth.uid
    });

    logOperation('createUser', 'success', { uid: userRecord.uid });
    return { uid: userRecord.uid };
  } catch (error) {
    logOperation('createUser', 'error', error);
    throw new https.HttpsError(
      'internal',
      error instanceof Error ? error.message : 'Failed to create user'
    );
  }
});