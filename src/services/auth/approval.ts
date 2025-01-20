import { 
  doc,
  getDoc,
  writeBatch,
  serverTimestamp,
  collection,
  query,
  where,
  getDocs
} from 'firebase/firestore';
import { 
  createUserWithEmailAndPassword,
  fetchSignInMethodsForEmail
} from 'firebase/auth';
import { FirebaseError } from 'firebase/app';
import { getAuth, getDb } from '../firebase/db';
import { UserProfile } from '../../types/auth';
import { logOperation } from '../firebase/logging';
import { verifyAdminPermissions } from './admin/permissions';

interface ApprovalResult {
  success: boolean;
  userId?: string;
  error?: string;
  existingUser?: {
    auth: boolean;
    users: boolean;
    sales: boolean;
  };
}

export const approveAuthRequest = async (
  requestId: string,
  reviewerId: string,
  userData: Omit<UserProfile, 'id' | 'approved' | 'createdAt'>
): Promise<ApprovalResult> => {
  const normalizedEmail = userData.email?.toLowerCase().trim();
  logOperation('approveAuthRequest', 'start', { requestId, email: normalizedEmail });

  try {
    // Get fresh auth instance
    const auth = getAuth();
    if (!auth.currentUser) {
      throw new Error('User must be authenticated');
    }

    // Force token refresh before checking permissions
    await retry(
      () => auth.currentUser!.getIdToken(true),
      {
        maxAttempts: 3,
        initialDelay: 1000,
        operation: 'approveAuthRequest.refreshToken'
      }
    );

    // Verify admin permissions first
    const hasPermission = await verifyAdminPermissions();
    if (!hasPermission) {
      logOperation('approveAuthRequest', 'error', 'Permission denied');
      throw new Error('You do not have permission to approve requests');
    }

    const db = getDb();

    // Validate inputs
    if (!normalizedEmail) {
      logOperation('approveAuthRequest', 'error', 'Missing email');
      throw new Error('Email address is required');
    }

    // Get the auth request
    const requestRef = doc(db, 'authRequests', requestId);
    const requestDoc = await getDoc(requestRef);
    
    if (!requestDoc.exists()) {
      logOperation('approveAuthRequest', 'error', 'Request not found');
      throw new Error('Authentication request not found');
    }

    const requestData = requestDoc.data();
    
    // Check if request is already processed
    const requestStatus = requestData.status;
    if (requestStatus === 'approved' || requestStatus === 'rejected') {
      logOperation('approveAuthRequest', 'error', 'Request already processed');
      throw new FirebaseError('failed-precondition', 'This request has already been processed');
    }

    let userId: string;
    let isNewUser = false;

    // Create new user account
    try {
      logOperation('approveAuthRequest', 'creating-user');
      
      try {
        // Try to create new user
        const { user } = await createUserWithEmailAndPassword(
          auth,
          normalizedEmail,
          requestData.password
        );
        userId = user.uid;
        isNewUser = true;
      } catch (error) {
        if (error instanceof FirebaseError && error.code === 'auth/email-already-in-use') {
          // Check if we have existing profiles
          const userDocs = await getDocs(
            query(collection(db, 'users'), where('email', '==', normalizedEmail))
          );
          
          if (!userDocs.empty) {
            return {
              success: false,
              error: 'This email already has an active account'
            };
          }
          
          // No profiles exist - proceed with existing auth account
          const methods = await fetchSignInMethodsForEmail(auth, normalizedEmail);
          if (methods.length > 0) {
            return {
              success: false,
              existingUser: {
                auth: true,
                users: false,
                sales: false
              }
            };
          }
        }
        throw error;
      }
      
      if (!userId) {
        throw new Error('Failed to get valid user ID');
      }
      
      logOperation('approveAuthRequest', 'user-created', { userId });
    } catch (error) {
      logOperation('approveAuthRequest', 'error', error);
      throw error;
    }

    // Start batch write
    const batch = writeBatch(db);

    // Create user profile
    const userRef = doc(db, 'users', userId);
    batch.set(userRef, {
      email: normalizedEmail,
      name: userData.name.trim(),
      role: userData.role,
      staffCode: userData.staffCode?.trim(),
      storeIds: userData.storeIds,
      primaryStoreId: userData.primaryStoreId,
      approved: true,
      createdAt: new Date().toISOString(),
      lastLoginAt: null
    });

    // Create salesperson profile for team members
    if (userData.role === 'team_member') {
      const salespersonRef = doc(db, 'salespeople', userId);
      batch.set(salespersonRef, {
        email: normalizedEmail,
        name: userData.name.trim(),
        role: userData.role,
        staffCode: userData.staffCode?.trim(),
        storeIds: userData.storeIds,
        primaryStoreId: userData.primaryStoreId,
        approved: true,
        createdAt: serverTimestamp()
      });
    }

    // Update request status
    batch.update(requestRef, {
      status: 'approved',
      reviewedBy: reviewerId,
      reviewedAt: serverTimestamp()
    });

    // Commit all changes
    logOperation('approveAuthRequest', 'committing-changes');
    await batch.commit();
    
    logOperation('approveAuthRequest', 'success', { 
      userId,
      isNewUser 
    });

    return { 
      success: true,
      userId
    };
  } catch (error) {
    logOperation('approveAuthRequest', 'error', error);

    if (error instanceof FirebaseError) {
      switch (error.code) {
        case 'auth/email-already-in-use':
          return {
            success: false,
            error: 'This email is already registered with another account'
          };
        case 'auth/invalid-email':
          return {
            success: false,
            error: 'Invalid email address format'
          };
        case 'permission-denied':
          return {
            success: false,
            error: 'You do not have permission to approve requests'
          };
        default:
          return {
            success: false,
            error: error.message || 'Failed to approve request'
          };
      }
    }

    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to approve request'
    };
  }
};