import { 
  doc,
  collection,
  getDoc,
  writeBatch,
  serverTimestamp
} from 'firebase/firestore';
import { 
  fetchSignInMethodsForEmail,
  createUserWithEmailAndPassword
} from 'firebase/auth';
import { FirebaseError } from 'firebase/app';
import { getAuth, getDb } from '../firebase/db';
import { UserProfile } from '../../types/auth';
import { logOperation } from '../firebase/logging';
import { getCollection, COLLECTION_NAMES } from '../firebase/collections';
import { checkUserRecords } from './checks';
import { verifyAdminPermissions } from './admin/permissions';

interface ApprovalResult {
  success: boolean;
  userId?: string;
  error?: string;
  existingUser?: {
    auth: boolean;
    users: boolean;
    sales: boolean;
    uid?: string;
  };
}

interface UserExistenceCheck {
  exists: boolean;
  details: {
    auth: boolean;
    authUid?: string;
    users: boolean;
    sales: boolean;
  };
}

const checkAuthAccount = async (email: string): Promise<{ exists: boolean; uid: string | null }> => {
  try {
    const auth = getAuth();
    const normalizedEmail = email.toLowerCase().trim();
    
    // Check if email exists in auth system
    try {
      const methods = await fetchSignInMethodsForEmail(auth, normalizedEmail);      
      const exists = methods.length > 0;
      logOperation('checkAuthAccount', exists ? 'exists' : 'not-exists');
      
      // If no auth account exists, return early
      if (!exists) {
        return { exists: false, uid: null };
      }
    } catch (error) {
      // Handle permission errors gracefully
      if (error instanceof FirebaseError && error.code === 'auth/invalid-api-key') {
        logOperation('checkAuthAccount', 'warning', 'Invalid API key');
        return { exists: false, uid: null };
      }
      throw error;
    }

    // Email exists in auth, try to get UID from Firestore records
    try {
      const records = await checkUserRecords(normalizedEmail);
      if (records.uid) {
        logOperation('checkAuthAccount', 'exists', { uid: records.uid });
        return { exists: true, uid: records.uid };
      }
      
      // Auth exists but no records found
      logOperation('checkAuthAccount', 'exists-no-uid');
      return { exists: true, uid: null };
    } catch (error: any) {
      // Handle permission errors gracefully
      if (error.code === 'permission-denied') {
        logOperation('checkAuthAccount', 'warning', 'Permission denied checking records');
        return { exists: true, uid: null };
      }
      throw error;
    }
  } catch (error) {
    logOperation('checkAuthAccount', 'error', error);
    return { exists: false, uid: null };
  }
};

const checkExistingUser = async (email: string) => {
  try {
    const normalizedEmail = email.toLowerCase().trim();

    // Check Firebase Auth and user records in parallel
    const authResult = await checkAuthAccount(normalizedEmail);
    const records = await checkUserRecords(normalizedEmail);

    logOperation('checkExistingUser', 'check', {
      email: normalizedEmail,
      hasAuthAccount: authResult.exists,
      authUid: authResult.uid,
      hasUserRecord: records.users,
      hasSalesRecord: records.sales
    });

    const result: UserExistenceCheck = {
      exists: authResult.exists || records.users || records.sales,
      details: {
        auth: authResult.exists,
        authUid: authResult.uid || undefined,
        users: records.users,
        sales: records.sales
      }
    };

    return result;
  } catch (error) {
    logOperation('checkExistingUser', 'error', error);
    return {
      exists: false,
      details: { 
        auth: false,
        authUid: undefined,
        users: false,
        sales: false
      }
    };
  }
};

const getExistingUserError = (checkResult: UserExistenceCheck): string | null => {
  if (!checkResult.exists) return null;
  if (checkResult.details.users && checkResult.details.sales) {
    return 'This account already exists. Please check User Management for account status.';
  }

  // Has auth but no records - can proceed with record creation
  if (checkResult.details.auth && !checkResult.details.users && !checkResult.details.sales) {
    return 'Authentication account exists. Click Continue to create required profiles.';
  }

  // Has partial records - system inconsistency
  if (checkResult.details.users || checkResult.details.sales) {
    return 'Incomplete account records found. Please check User Management or contact administrator.';
  }

  return 'This email is already registered. Please use a different email address.';
};

const createUserAccount = async (email: string, password: string, existingUid: string | null = null) => {
  try {
    const auth = getAuth();
    if (!auth) {
      throw new Error('Auth not initialized');
    }

    const normalizedEmail = email.toLowerCase().trim();
    
    // If we have an existing UID, return that user
    if (existingUid) {
      logOperation('createUserAccount', 'using-existing-uid', { uid: existingUid });
      return {
        user: {
          uid: existingUid,
          email: normalizedEmail,
          emailVerified: true
        }
      };
    }
    
    // Create new user if no existing auth account
    try {
      logOperation('createUserAccount', 'creating-new-user', { email: normalizedEmail });
      const userCredential = await createUserWithEmailAndPassword(auth, normalizedEmail, password);
      logOperation('createUserAccount', 'created-new-user', { uid: userCredential.user.uid });
      return { user: userCredential.user };
    } catch (error) {
      logOperation('createUserAccount', 'error-creating-user', { error });
      if (error instanceof FirebaseError) {
        if (error.code === 'auth/email-already-in-use') {
          // Try to get existing user record
          try {
            const methods = await fetchSignInMethodsForEmail(auth, normalizedEmail);
            if (methods.length > 0) {
              // Get UID from Firestore records
              const records = await checkUserRecords(normalizedEmail);
              if (records.uid) {
                logOperation('createUserAccount', 'found-existing-uid', { uid: records.uid });
                return { 
                  user: { 
                    uid: records.uid, 
                    email: normalizedEmail,
                    emailVerified: true
                  } 
                };
              }
            }
          } catch (lookupError) {
            logOperation('createUserAccount', 'error', 'Failed to lookup existing user');
          }
          
          // If we get here, we couldn't find or create the user
          throw new Error('Failed to create or find user account');
        }
      }
      throw error;
    }
  } catch (error) {
    const errorDetails = {
      operation: 'createUserAccount',
      email: email,
      existingUid: existingUid,
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined
    };
    logOperation('createUserAccount', 'error', errorDetails);
    throw error;
  }
};

export const approveAuthRequest = async (
  requestId: string,
  reviewerId: string,
  userData: Omit<UserProfile, 'id' | 'approved' | 'createdAt'> & { forceContinue?: boolean }
): Promise<ApprovalResult> => {
  const normalizedEmail = userData.email?.toLowerCase().trim();
  logOperation('approveAuthRequest', 'start', { 
    requestId,
    email: normalizedEmail,
    forceContinue: userData.forceContinue 
  });

  try {
    // Verify admin permissions first
    const hasPermission = await verifyAdminPermissions();
    if (!hasPermission) {
      logOperation('approveAuthRequest', 'error', 'Permission denied');
      throw new Error('You do not have permission to approve requests');
    }

    const auth = getAuth();
    const db = getDb();

    if (!normalizedEmail) {
      logOperation('approveAuthRequest', 'error', 'Missing email');
      throw new Error('Email address is required');
    }

    if (!auth.currentUser) {
      logOperation('approveAuthRequest', 'error', 'Not authenticated');
      throw new Error('Not authenticated');
    }

    // Check if email already exists
    if (!userData.forceContinue) {
      const existingUser = await checkExistingUser(normalizedEmail);
      const errorMessage = getExistingUserError(existingUser);

      if (errorMessage) {
        logOperation('approveAuthRequest', 'existing-user', {
          email: normalizedEmail,
          details: existingUser.details
        });
        return {
          success: false,
          existingUser: existingUser.details,
          error: errorMessage
        };
      }
    }

    // Get the auth request
    const requestRef = doc(db, 'authRequests', requestId);
    const requestDoc = await getDoc(requestRef);
    if (!requestDoc.exists()) {
      logOperation('approveAuthRequest', 'error', 'Request not found');
      throw new Error('Authentication request not found');
    }
    
    // Check if request is already processed
    const requestStatus = requestDoc.data().status;
    if (requestStatus === 'approved' || requestStatus === 'rejected') {
      logOperation('approveAuthRequest', 'error', 'Request already processed');
      throw new Error('This request has already been processed');
    }

    // Double check the email hasn't been taken while processing
    const finalCheck = await checkExistingUser(normalizedEmail);
    if (finalCheck.exists) {
      const { auth: hasAuth, users, sales, authUid: existingUid } = finalCheck.details;
      
      // Allow continuation with existing auth account if no profiles exist
      if (hasAuth && !users && !sales && userData.forceContinue) {
        logOperation('approveAuthRequest', 'using-existing-auth-final', {
          uid: existingUid
        });
      } else if (!userData.forceContinue) {
        logOperation('approveAuthRequest', 'existing-user-final', {
          email: normalizedEmail,
          details: finalCheck.details
        });
        return {
          success: false,
          existingUser: finalCheck.details,
          error: users || sales
            ? 'This account already exists. Please check User Management for account status.'
            : hasAuth
              ? 'Authentication account exists. Click Continue to create required profiles.'
              : 'This email is already registered. Please use a different email address.'
        };
      }
    }

    let userId: string;

    try {
      logOperation('approveAuthRequest', 'creating-user');
      const { user } = await createUserAccount(
        normalizedEmail,
        requestDoc.data().password,
        finalCheck.details?.authUid || null
      );
      userId = user.uid;
      if (!userId) {
        throw new Error('Failed to get valid user ID');
      }
      logOperation('approveAuthRequest', 'user-created', { 
        userId,
        isNew: !finalCheck.details?.authUid
      });
    } catch (error) {
      logOperation('approveAuthRequest', 'error', error);
      
      if (error instanceof FirebaseError) {
        if (error.code === 'auth/email-already-in-use') {
          // Check if we can proceed with record creation
          const records = await checkUserRecords(normalizedEmail);
          if (records.uid && !records.users && !records.sales) {
            return {
              success: false,
              existingUser: {
                auth: true,
                users: false,
                sales: false
              },
              uid: records.uid,
              error: 'This email already has an authentication account. Click Continue to create the necessary profiles.'
            };
          }
        }
        return {
          success: false,
          error: error.code === 'auth/email-already-in-use' 
            ? 'This email is already registered. Please use a different email address.'
            : error.message || 'Failed to create user account'
        };
      }
      throw error;
    }

    // Start batch write
    const batch = writeBatch(db);

    logOperation('approveAuthRequest', 'creating-profiles');

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
    logOperation('approveAuthRequest', 'success', { userId });
    
    // Return success with user status
    return { 
      success: true, 
      userId
    };

  } catch (error) {
    const errorDetails = {
      operation: 'approveAuthRequest',
      email: normalizedEmail,
      requestId,
      error: error instanceof Error ? error.message : 'Unknown error',
      code: error instanceof FirebaseError ? error.code : undefined,
      stack: error instanceof Error ? error.stack : undefined
    };
    logOperation('approveAuthRequest', 'error', errorDetails);

    if (error instanceof FirebaseError) {
      switch (error.code) {
        case 'auth/email-already-in-use':
          return {
            success: false, 
            error: 'This email is already registered with another account. Please use a different email address.'
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