import { addDoc, serverTimestamp } from 'firebase/firestore';
import { getCollection } from '../firebase/collections';
import { UserProfile } from '../../types/auth';
import { logOperation } from '../firebase/logging';
import { validateTeamMemberData } from './validation';
import { TEAM_MEMBER_ERROR_MESSAGES } from './errors';
import { getAuth } from 'firebase/auth';

export const createTeamMember = async (data: Omit<UserProfile, 'id'>): Promise<string> => {
  try {
    // Check authentication
    const auth = getAuth();
    if (!auth.currentUser) {
      throw new Error(TEAM_MEMBER_ERROR_MESSAGES.NOT_AUTHENTICATED);
    }

    // Validate input data
    const validation = validateTeamMemberData(data);
    if (!validation.isValid) {
      throw new Error(`${TEAM_MEMBER_ERROR_MESSAGES.INVALID_DATA}: ${validation.errors.join(', ')}`);
    }

    // Get collection reference
    const salesRef = getCollection('SALESPEOPLE');
    if (!salesRef) {
      throw new Error(TEAM_MEMBER_ERROR_MESSAGES.COLLECTION_ERROR);
    }

    // Prepare document data
    const docData = {
      name: data.name.trim(),
      email: data.email.trim().toLowerCase(),
      staffCode: data.staffCode.trim(),
      storeIds: data.storeIds,
      primaryStoreId: data.primaryStoreId,
      role: 'team_member',
      approved: true,
      createdAt: serverTimestamp(),
      createdBy: auth.currentUser.uid
    };

    // Create document
    const docRef = await addDoc(salesRef, docData);
    logOperation('createTeamMember', 'success', { id: docRef.id });
    return docRef.id;
  } catch (error) {
    const message = error instanceof Error ? error.message : TEAM_MEMBER_ERROR_MESSAGES.CREATE_ERROR;
    logOperation('createTeamMember', 'error', { error: message });
    throw new Error(message);
  }
};