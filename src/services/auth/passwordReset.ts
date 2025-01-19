import { sendPasswordResetEmail as firebaseSendPasswordReset } from 'firebase/auth';
import { auth } from '../../config/firebase';
import { logOperation } from '../firebase/logging';
import { getAuthErrorMessage } from './errors';

export const sendPasswordResetEmail = async (email: string): Promise<void> => {
  try {
    logOperation('sendPasswordResetEmail', 'start', { email });
    await firebaseSendPasswordReset(auth, email);
    logOperation('sendPasswordResetEmail', 'success');
  } catch (error: any) {
    const authError = getAuthErrorMessage(error.code, error.message);
    logOperation('sendPasswordResetEmail', 'error', authError);
    throw new Error(authError.message);
  }
};