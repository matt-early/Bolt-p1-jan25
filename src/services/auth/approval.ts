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
import { getNetworkStatus } from '../firebase/network';
import { logOperation } from '../firebase/logging';
import { verifyAdminPermissions } from './admin/permissions';
import { retry } from '../firebase/retry';

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
    const currentUser = auth.currentUser;
    const { isOnline } = getNetworkStatus();
    let hasPermission = false;
    
    if (!isOnline) {
      throw new Error('No network connection available');
    }

    if (!currentUser) {
      logOperation('approveAuthRequest', 'error', 'Not authenticated');
      throw new Error('You must be signed in to perform this action');
    }
    
    // Try multiple times to verify admin permissions
    for (let attempt = 0; attempt < 3; attempt++) {
      hasPermission = await verifyAdminPermissions();
      if (hasPermission) {
        break;
      }
      
      // Wait before retrying
      if (attempt < 2) {
        await new Promise(resolve => setTimeout(resolve, 1000 * (attempt + 1)));
      }
    }

    if (!hasPermission) { 
      logOperation('approveAuthRequest', 'error', 'Admin permissions required');
      throw new Error('You do not have permission to approve requests');
    }

    logOperation('approveAuthRequest', 'permissions-verified');

    const db = getDb();

    // Validate request exists and is pending
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

    // Start batch operation
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
        logOperation('approveAuthRequest', 'user-created', { userId });
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
    const userProfileData = {
      email: normalizedEmail,
      name: userData.name.trim(),
      role: userData.role,
      admin: userData.role === 'admin', // Add admin flag to profile
      approved: true,
      staffCode: userData.staffCode?.trim() || '',
      storeIds: userData.storeIds || [],
      primaryStoreId: userData.primaryStoreId,
      approved: true, 
      createdAt: serverTimestamp(),
      lastLoginAt: null,
      updatedAt: serverTimestamp()
    };
    
    batch.set(userRef, userProfileData);
    logOperation('approveAuthRequest', 'profile-created');
    
    // Set admin custom claims immediately if needed
    if (userData.role === 'admin') {
      try {
        const functions = getFunctions();
        const setCustomClaims = httpsCallable(functions, 'setCustomClaims');
        await setCustomClaims({
          uid: userId,
          claims: {
            admin: true,
            role: 'admin',
            timestamp: Date.now()
          }
        });
        logOperation('approveAuthRequest', 'admin-claims-set');
        
        // Force token refresh after setting claims
        const auth = getAuth();
        if (auth.currentUser) {
          await auth.currentUser.getIdToken(true);
        }

      } catch (error) {
        logOperation('approveAuthRequest', 'error', 'Failed to set admin claims');
        throw error;
      }
    }

    logOperation('approveAuthRequest', 'user-profile-created');

    // Create salesperson profile for team members
    if (userData.role === 'team_member') {
      const salespersonRef = doc(db, 'salespeople', userId);
      logOperation('approveAuthRequest', 'creating-team-member-profile');
      batch.set(salespersonRef, {
        email: normalizedEmail,
        name: userData.name.trim(),
        role: 'team_member',
        staffCode: userData.staffCode?.trim(),
        storeIds: userData.storeIds,
        primaryStoreId: userData.primaryStoreId,
        approved: true,
        createdAt: new Date().toISOString(),
        updatedAt: serverTimestamp()
      });
    }

    // Update request status
    logOperation('approveAuthRequest', 'updating-request-status');
    batch.update(requestRef, {
      status: 'approved',
      reviewedBy: reviewerId,
      reviewedAt: serverTimestamp()
    });
    
    // Commit all changes
    logOperation('approveAuthRequest', 'committing-batch');
    logOperation('approveAuthRequest', 'committing-changes');
    try {
      await retry(async () => {
        // Verify admin permissions again before commit
        const hasPermission = await verifyAdminPermissions();
        if (!hasPermission) {
          throw new Error('Admin permissions required for this operation');
        }
        await batch.commit();
      }, {
        operation: 'approveAuthRequest.commitBatch',
        maxAttempts: 5,
        initialDelay: 1000,
        waitForNetwork: true
      });
      
      logOperation('approveAuthRequest', 'success');
    } catch (error) {
      logOperation('approveAuthRequest', 'error', {
        message: 'Failed to commit batch',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
      throw error;
    }
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